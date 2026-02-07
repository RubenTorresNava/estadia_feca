import OrdenVenta from '../../models/model.ordenventa.js';
import Producto from '../../models/model.producto.js';
import Venta from '../../models/model.venta.js';
import sequelize from '../../services/service.connection.js';

export const checkout = async (req, res) => {
    const { nombre_alumno, matricula, correo, carrito } = req.body;
    
    // Iniciamos la transacción para asegurar integridad
    const t = await sequelize.transaction();

    try {
        let totalAcumulado = 0;
        const detallesParaInsertar = [];

        // 1. Validar stock y calcular total real
        for (const item of carrito) {
            const producto = await Producto.findByPk(item.id);
            
            if (!producto || !producto.validarDisponibilidad(item.cantidad)) {
                throw new Error(`Stock insuficiente para: ${producto?.nombre || 'Producto desconocido'}`);
            }

            const subtotal = producto.precio * item.cantidad;
            totalAcumulado += subtotal;

            detallesParaInsertar.push({
                producto_id: producto.id,
                cantidad: item.cantidad,
                precio_unitario: producto.precio
            });
        }

        // 2. Crear la Orden de Venta
        const nuevaOrden = await OrdenVenta.create({
            nombre_alumno,
            matricula,
            correo,
            total_pago: totalAcumulado,
            estado: 'PENDIENTE'
        }, { transaction: t });

        // 3. Registrar los detalles (Venta)
        // Usamos el método estático registrarDetalle que definiste
        const detallesConOrden = detallesParaInsertar.map(d => ({ 
            ...d, 
            orden_id: nuevaOrden.id 
        }));
        
        await Venta.bulkCreate(detallesConOrden, { transaction: t });

        // 4. Si llegamos aquí, todo salió bien. Guardamos en la DB.
        await t.commit();

        // Los Triggers de tu Postgres ya restaron el stock automáticamente aquí
        res.status(201).json({
            msg: "Pedido generado exitosamente",
            folio: nuevaOrden.folio_referencia,
            total: totalAcumulado
        });

    } catch (error) {
        // Si algo falló, revertimos todo (no se crea orden ni se resta stock)
        await t.rollback();
        res.status(400).json({ error: error.message });
    }
};