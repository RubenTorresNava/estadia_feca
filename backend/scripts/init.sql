-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tipos ENUM
CREATE TYPE estado_orden AS ENUM ('pendiente', 'pagada', 'cancelado');

-- Tablas Base
CREATE TABLE inventario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    categoria VARCHAR(50) DEFAULT 'General',
    imagen_url VARCHAR(255),
    destacado BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE administradores (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orden_venta (
    id SERIAL PRIMARY KEY,
    folio_referencia VARCHAR(20) UNIQUE,
    nombre_alumno VARCHAR(100) NOT NULL,
    matricula VARCHAR(20) NOT NULL,
    correo VARCHAR(100),
    total_pago DECIMAL(10, 2) DEFAULT 0,
    estado estado_orden DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    administrador_id INT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Triggers (Lógica de Inventario)
CREATE OR REPLACE FUNCTION fn_procesar_inventario() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE inventario SET stock_actual = stock_actual - NEW.cantidad WHERE id = NEW.producto_id;
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_stock_insert AFTER INSERT ON detalle_orden FOR EACH ROW EXECUTE FUNCTION fn_procesar_inventario();

CREATE OR REPLACE FUNCTION fn_cambio_estado_orden() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'pagada' AND OLD.estado = 'pendiente' THEN
        INSERT INTO historial_contable (orden_id, accion, monto) VALUES (NEW.id, 'VENTA_CONFIRMADA', NEW.total_pago);
    ELSIF NEW.estado = 'cancelado' AND OLD.estado = 'pendiente' THEN
        UPDATE inventario i SET stock_actual = i.stock_actual + det.cantidad
        FROM detalle_orden det WHERE det.producto_id = i.id AND det.orden_id = NEW.id;
        INSERT INTO historial_contable (orden_id, accion, monto) VALUES (NEW.id, 'ORDEN_CANCELADA', NEW.total_pago);
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_estado_orden AFTER UPDATE ON orden_venta FOR EACH ROW EXECUTE FUNCTION fn_cambio_estado_orden();

-- Vistas
CREATE VIEW vista_tienda_publica AS SELECT id, nombre, descripcion, precio, imagen_url, categoria, CASE WHEN stock_actual > 0 THEN 'Disponible' ELSE 'Agotado' END AS disponibilidad FROM inventario WHERE activo = true;
CREATE VIEW vista_resumen_contable AS SELECT COUNT(id) AS total_ordenes_pagadas, SUM(total_pago) AS ingresos_totales FROM orden_venta WHERE estado = 'pagada';
CREATE VIEW vista_stock_critico AS
SELECT id, nombre, stock_actual FROM inventario WHERE stock_actual < 10 AND activo = true;

-- Datos Semilla (Seeders)
INSERT INTO administradores (usuario, password, nombre) VALUES ('admin_root', crypt('1234', gen_salt('bf')));

INSERT INTO inventario (nombre, descripcion, precio, stock_actual, categoria, destacado) VALUES
('Sudadera FECA L', 'Guinda oficial', 450.00, 20, 'Ropa', true),
('Termo UJED', 'Acero inoxidable', 250.00, 10, 'Accesorios', false),
('Cuaderno', 'Pasta dura', 60.00, 50, 'Papelería', false);

-- 1. Inserción de Órdenes de Prueba
-- Creamos una orden que ya esté pagada (para ver el historial contable)
INSERT INTO orden_venta (folio_referencia, nombre_alumno, matricula, correo, total_pago, estado, fecha_creacion) 
VALUES 
('FECA-001', 'Ruben Torres', '2024001', 'ruben@ujed.mx', 510.00, 'pagada', NOW() - INTERVAL '2 days'),
('FECA-002', 'Andrea Mint', '2024002', 'andrea@ujed.mx', 450.00, 'pendiente', NOW() - INTERVAL '25 hours'),
('FECA-003', 'Alumno Prueba', '2024003', 'test@ujed.mx', 60.00, 'pendiente', NOW());

-- 2. Inserción de Detalles (Esto disparará el trigger de resta de stock)
-- Orden 1: Sudadera (450) + Cuaderno (60) = 510
INSERT INTO detalle_orden (orden_id, producto_id, cantidad, precio_unitario) VALUES 
(1, 1, 1, 450.00),
(1, 3, 1, 60.00);

-- Orden 2: Sudadera (450)
INSERT INTO detalle_orden (orden_id, producto_id, cantidad, precio_unitario) VALUES 
(2, 1, 1, 450.00);

-- Orden 3: Cuaderno (60)
INSERT INTO detalle_orden (orden_id, producto_id, cantidad, precio_unitario) VALUES 
(3, 3, 1, 60.00);

-- 3. Registro Manual en Historial para la orden pagada 
-- (Normalmente lo hace el trigger, pero lo reforzamos en el init para auditoría)
INSERT INTO historial_contable (orden_id, accion, monto, fecha) 
VALUES (1, 'VENTA_CONFIRMADA', 510.00, NOW() - INTERVAL '2 days');