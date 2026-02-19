-- 1. CREACIÓN DE LA BASE DE DATOS (Ejecutar en postgres)
--DROP DATABASE IF EXISTS fecastore_db;
--CREATE DATABASE fecastore_db;
--\c fecastore;

-- 2. TIPOS ENUM
DO $$ BEGIN
    CREATE TYPE estado_orden AS ENUM ('pendiente', 'pagada', 'cancelada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
-- 3. TABLAS BASE
CREATE TABLE IF NOT EXISTS inventario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    imagen_url VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orden_venta (
    id SERIAL PRIMARY KEY,
    folio_referencia VARCHAR(20) UNIQUE,
    nombre_alumno VARCHAR(100) NOT NULL,
    matricula VARCHAR(20) NOT NULL,
    correo VARCHAR(100),
    total_pago DECIMAL(10, 2) DEFAULT 0,
    estado estado_orden DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detalle_orden (
    id SERIAL PRIMARY KEY,
    orden_id INT REFERENCES orden_venta(id) ON DELETE CASCADE,
    producto_id INT REFERENCES inventario(id),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS historial_contable (
    id SERIAL PRIMARY KEY,
    orden_id INT REFERENCES orden_venta(id),
    accion VARCHAR(50),
    monto DECIMAL(10, 2),
    administrador_id INT NULL, -- NULL si es por sistema (Cron)
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. LÓGICA DE TRIGGERS (Automatización de Stock)
CREATE OR REPLACE FUNCTION fn_procesar_inventario()
RETURNS TRIGGER AS $$
BEGIN
    -- Al crear detalle: Restar Stock
    IF (TG_OP = 'INSERT') THEN
        UPDATE inventario SET stock_actual = stock_actual - NEW.cantidad 
        WHERE id = NEW.producto_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_stock_insert
AFTER INSERT ON detalle_orden
FOR EACH ROW EXECUTE FUNCTION fn_procesar_inventario();

-- Trigger para Cambio de Estado (Pagada/Cancelada)
CREATE OR REPLACE FUNCTION fn_cambio_estado_orden()
RETURNS TRIGGER AS $$
BEGIN
    -- Si pasa a PAGADA: Registrar en contabilidad
    IF NEW.estado = 'pagada' AND OLD.estado = 'pendiente' THEN
        INSERT INTO historial_contable (orden_id, accion, monto, fecha)
        VALUES (NEW.id, 'VENTA_CONFIRMADA', NEW.total_pago, NOW());
        
    -- Si pasa a CANCELADA: Devolver Stock
    ELSIF NEW.estado = 'cancelada' AND OLD.estado = 'pendiente' THEN
        UPDATE inventario i
        SET stock_actual = i.stock_actual + det.cantidad
        FROM detalle_orden det
        WHERE det.producto_id = i.id AND det.orden_id = NEW.id;
        
        INSERT INTO historial_contable (orden_id, accion, monto, fecha)
        VALUES (NEW.id, 'ORDEN_CANCELADA', NEW.total_pago, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_estado_orden
AFTER UPDATE ON orden_venta
FOR EACH ROW EXECUTE FUNCTION fn_cambio_estado_orden();

-- 5. VISTAS DE REPORTES
CREATE OR REPLACE VIEW vista_ventas_completas AS 
SELECT 
    ov.folio_referencia, ov.nombre_alumno, i.nombre AS producto, 
    det.cantidad, det.precio_unitario, (det.cantidad * det.precio_unitario) AS subtotal, 
    ov.fecha_creacion, ov.estado 
FROM orden_venta ov 
JOIN detalle_orden det ON ov.id = det.orden_id 
JOIN inventario i ON det.producto_id = i.id;

CREATE OR REPLACE VIEW vista_ordenes_pendientes AS 
SELECT 
    ov.id AS orden_id, ov.folio_referencia, ov.nombre_alumno, ov.total_pago, ov.fecha_creacion,
    string_agg(i.nombre || ' (x' || det.cantidad || ')', ', ') AS resumen_productos
FROM orden_venta ov 
JOIN detalle_orden det ON ov.id = det.orden_id 
JOIN inventario i ON det.producto_id = i.id
WHERE ov.estado = 'pendiente'
GROUP BY ov.id, ov.folio_referencia, ov.nombre_alumno, ov.total_pago, ov.fecha_creacion;

CREATE OR REPLACE VIEW vista_resumen_contable AS
SELECT COUNT(id) AS total_ordenes_pagadas, SUM(total_pago) AS ingresos_totales
FROM orden_venta WHERE estado = 'pagada';

CREATE OR REPLACE VIEW vista_stock_critico AS
SELECT id, nombre, stock_actual FROM inventario WHERE stock_actual < 10 AND activo = true;

-- 6. DATOS DE PRUEBA (DATA SEEDING)
INSERT INTO inventario (nombre, descripcion, precio, stock_actual) VALUES
('Sudadera FECA L', 'Sudadera color guinda con logo bordado', 450.00, 25),
('Termo UJED 1L', 'Termo de acero inoxidable', 280.00, 15),
('Cuaderno Profesional', 'Pasta dura, 100 hojas rayas', 65.00, 50),
('Pluma Grabada', 'Tinta negra, estuche incluido', 120.00, 5); -- Este iniciará en stock crítico

INSERT INTO orden_venta (folio_referencia, nombre_alumno, matricula, correo, total_pago, estado, fecha_creacion) VALUES
('FECA-001', 'Juan Perez', '112233', 'juan@ujed.mx', 450.00, 'pagada', NOW() - INTERVAL '2 days'),
('FECA-002', 'Maria Lopez', '445566', 'maria@ujed.mx', 120.00, 'pendiente', NOW() - INTERVAL '25 hours'), -- Candidata al Cron
('FECA-003', 'Carlos Diaz', '778899', 'carlos@ujed.mx', 65.00, 'pendiente', NOW());

INSERT INTO detalle_orden (orden_id, producto_id, cantidad, precio_unitario) VALUES
(1, 1, 1, 450.00),
(2, 4, 1, 120.00),
(3, 3, 1, 65.00);