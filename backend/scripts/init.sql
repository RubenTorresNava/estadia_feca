-- 1. Extensiones y Limpieza
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DROP VIEW IF EXISTS vista_tienda_publica, vista_resumen_contable, vista_stock_critico;
DROP TABLE IF EXISTS plantillas_notificaciones, historial_contable, detalle_orden, orden_venta, inventario, usuarios CASCADE;
DROP TYPE IF EXISTS estado_orden, rol_usuario CASCADE;

-- 2. Tipos ENUM
CREATE TYPE rol_usuario AS ENUM ('alumno', 'admin', 'staff');
CREATE TYPE estado_orden AS ENUM ('pendiente', 'en_revision', 'pagada', 'rechazado', 'cancelado');

-- 3. Tabla de Usuarios (Unificada)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    matricula VARCHAR(20) UNIQUE, -- NULL para admins
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol rol_usuario DEFAULT 'alumno',
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Inventario
CREATE TABLE inventario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    categoria VARCHAR(50) DEFAULT 'General',
    imagen_url VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Órdenes de Venta (Con soporte para Comprobantes)
CREATE TABLE orden_venta (
    id SERIAL PRIMARY KEY,
    folio_referencia VARCHAR(20) UNIQUE,
    usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    total_pago DECIMAL(10, 2) DEFAULT 0,
    estado estado_orden DEFAULT 'pendiente',
    comprobante_url VARCHAR(255), -- Ruta de la captura de pantalla
    nota_admin TEXT,              -- Feedback en caso de rechazo
    fecha_pago TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Detalles y Contabilidad
CREATE TABLE detalle_orden (
    id SERIAL PRIMARY KEY,
    orden_id INT REFERENCES orden_venta(id) ON DELETE CASCADE,
    producto_id INT REFERENCES inventario(id),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL
);

CREATE TABLE historial_contable (
    id SERIAL PRIMARY KEY,
    orden_id INT REFERENCES orden_venta(id),
    accion VARCHAR(50),
    monto DECIMAL(10, 2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Plantillas de Notificación (Editables por el Admin)
CREATE TABLE plantillas_notificaciones (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL, 
    asunto VARCHAR(200) NOT NULL,
    cuerpo TEXT NOT NULL, 
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---
--- LÓGICA DE TRIGGERS
---

-- Trigger 1: Actualizar stock al insertar detalle
CREATE OR REPLACE FUNCTION fn_procesar_inventario() RETURNS TRIGGER AS $$
BEGIN
    UPDATE inventario SET stock_actual = stock_actual - NEW.cantidad 
    WHERE id = NEW.producto_id;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_stock AFTER INSERT ON detalle_orden 
FOR EACH ROW EXECUTE FUNCTION fn_procesar_inventario();

-- Trigger 2: Manejo de estados (Contabilidad y Devolución de Stock)
CREATE OR REPLACE FUNCTION fn_cambio_estado_orden() RETURNS TRIGGER AS $$
BEGIN
    -- Si se aprueba el pago
    IF NEW.estado = 'pagada' AND OLD.estado != 'pagada' THEN
        INSERT INTO historial_contable (orden_id, accion, monto) 
        VALUES (NEW.id, 'VENTA_CONFIRMADA', NEW.total_pago);
    
    -- Si se cancela o rechaza (devolver stock)
    ELSIF (NEW.estado = 'cancelado' OR NEW.estado = 'rechazado') AND (OLD.estado = 'pendiente' OR OLD.estado = 'en_revision') THEN
        UPDATE inventario i SET stock_actual = i.stock_actual + det.cantidad
        FROM detalle_orden det WHERE det.producto_id = i.id AND det.orden_id = NEW.id;
        
        INSERT INTO historial_contable (orden_id, accion, monto) 
        VALUES (NEW.id, 'ORDEN_ANULADA', 0);
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_estado_orden AFTER UPDATE ON orden_venta 
FOR EACH ROW EXECUTE FUNCTION fn_cambio_estado_orden();

-- 1. Vista para la Tienda (Frontend Público)
-- Solo muestra productos activos y con stock disponible
CREATE OR REPLACE VIEW vista_tienda_publica AS 
SELECT 
    id, 
    nombre, 
    descripcion, 
    precio, 
    imagen_url, 
    categoria, 
    stock_actual,
    CASE 
        WHEN stock_actual > 0 THEN 'Disponible' 
        ELSE 'Agotado' 
    END AS disponibilidad 
FROM inventario 
WHERE activo = true;

-- 2. Vista de Órdenes Detalladas (Panel de Admin)
-- Une la orden con los datos del usuario para facilitar la validación de pagos
CREATE OR REPLACE VIEW vista_revision_pagos AS
SELECT 
    ov.id AS orden_id,
    ov.folio_referencia,
    u.nombre AS nombre_alumno,
    u.matricula,
    u.correo,
    ov.total_pago,
    ov.estado,
    ov.comprobante_url,
    ov.fecha_creacion
FROM orden_venta ov
JOIN usuarios u ON ov.usuario_id = u.id
WHERE ov.estado IN ('pendiente', 'en_revision', 'rechazado');

-- 3. Vista Resumen Contable (Para el "Dashboard")
-- Calcula ingresos solo de lo que ya está marcado como 'pagada'
CREATE OR REPLACE VIEW vista_resumen_contable AS 
SELECT 
    COUNT(id) AS total_ordenes_pagadas, 
    COALESCE(SUM(total_pago), 0) AS ingresos_totales,
    (SELECT COUNT(*) FROM orden_venta WHERE estado = 'en_revision') AS pagos_pendientes_revisar
FROM orden_venta 
WHERE estado = 'pagada';

-- 4. Vista de Stock Crítico
-- Ayuda al cliente a saber qué productos están por agotarse (menos de 10 unidades)
CREATE OR REPLACE VIEW vista_stock_critico AS
SELECT 
    id, 
    nombre, 
    stock_actual,
    categoria
FROM inventario 
WHERE stock_actual < 10 AND activo = true;

CREATE OR REPLACE VIEW vista_mis_pedidos AS
SELECT 
    ov.id AS orden_id,
    ov.usuario_id,
    ov.folio_referencia,
    ov.total_pago,
    ov.estado,
    ov.comprobante_url,
    ov.nota_admin,
    ov.fecha_creacion,
    (SELECT STRING_AGG(i.nombre || ' (x' || det.cantidad || ')', ', ') 
     FROM detalle_orden det 
     JOIN inventario i ON det.producto_id = i.id 
     WHERE det.orden_id = ov.id) AS resumen_productos
FROM orden_venta ov;

---
--- DATOS INICIALES (Seeds)
---

-- 1. Usuarios (Password de ejemplo: 'password123' - asumiendo que el hash es genérico)
-- Nota: En producción, estos passwords deben ser hashes de bcrypt.
INSERT INTO usuarios (matricula, nombre, correo, password, rol) VALUES 
(NULL, 'Admin Feca', 'admin@feca.edu', '$2b$10$K6Px8mB1R.Xp/N.mE6yGNeS7J2K1V8l.y6Q5W4E3r2t1y0u9i8o7p', 'admin'),
('20240001', 'Ruben Garcia', 'ruben.garcia@universidad.edu', '$2b$10$K6Px8mB1R.Xp/N.mE6yGNeS7J2K1V8l.y6Q5W4E3r2t1y0u9i8o7p', 'alumno');

-- 2. Inventario (Productos de la tienda universitaria)
INSERT INTO inventario (nombre, descripcion, precio, stock_actual, categoria, imagen_url) VALUES 
('Sudadera Oficial FECA', 'Sudadera color marino con logo bordado', 450.00, 50, 'Ropa', '/uploads/sudadera.jpg'),
('Termo Metálico 500ml', 'Mantiene bebidas frías o calientes por 12h', 180.50, 100, 'Accesorios', '/uploads/termo.jpg'),
('Libreta de Apuntes A5', '100 hojas rayadas con espiral', 45.00, 200, 'Papelería', '/uploads/libreta.jpg'),
('USB 64GB Logo UV', 'Memoria flash de alta velocidad', 120.00, 30, 'Electrónica', '/uploads/usb.jpg');

-- 3. Órdenes de Venta (Simulando una orden pendiente de Ruben)
INSERT INTO orden_venta (folio_referencia, usuario_id, total_pago, estado, comprobante_url) VALUES 
('ORD-2026-001', 2, 675.50, 'pendiente', NULL);

-- 4. Detalles de la Orden (Relacionados a la orden anterior)
-- 1 Sudadera (450) + 1 Termo (180.50) + 1 Libreta (45) = 675.50
INSERT INTO detalle_orden (orden_id, producto_id, cantidad, precio_unitario) VALUES 
(1, 1, 1, 450.00),
(1, 2, 1, 180.50),
(1, 3, 1, 45.00);

-- 5. Historial Contable (Registro inicial de la creación)
INSERT INTO historial_contable (orden_id, accion, monto) VALUES 
(1, 'CREACION_ORDEN', 675.50);

-- 6. Plantillas de Notificación
INSERT INTO plantillas_notificaciones (slug, asunto, cuerpo) VALUES 
('bienvenida', '¡Bienvenido a FecaStore!', 'Hola {{nombre}}, gracias por registrarte en la tienda oficial.'),
('pago_aprobado', 'Tu pago ha sido aprobado', 'Felicidades {{nombre}}, tu pedido {{folio}} ya puede ser recogido.'),
('pago_rechazado', 'Problema con tu comprobante', 'Hola {{nombre}}, tu comprobante fue rechazado por la siguiente razón: {{nota_admin}}');