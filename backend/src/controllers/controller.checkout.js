import OrdenVenta from '../models/model.ordenventa.js';
import Producto from '../models/model.producto.js';
import DetalleOrden from '../models/model.detalleorden.js';
import sequelize from '../services/service.connection.js';

export const checkout = async (req, res) => {
    const { nombre_alumno, matricula, correo, carrito } = req.body;

    if (!carrito || carrito.length === 0) {
        return res.status(400).json({ error: "El carrito está vacío" });
    }

    const t = await sequelize.transaction();

    try {
        let totalAcumulado = 0;
        const detallesParaInsertar = [];

        for (const item of carrito) {
            const producto = await Producto.findByPk(item.id);

            if (!producto) {
                throw new Error(`El producto con ID ${item.id} no existe`);
            }

            if (!producto.validarDisponibilidad(item.cantidad)) {
                throw new Error(`Stock insuficiente para: ${producto.nombre}`);
            }

            totalAcumulado += producto.precio * item.cantidad;
            detallesParaInsertar.push({
                producto_id: producto.id,
                cantidad: item.cantidad,
                precio_unitario: producto.precio
            });
        }

        const nuevaOrden = await OrdenVenta.create({
            nombre_alumno,
            matricula,
            correo,
            total_pago: totalAcumulado,
            estado: 'pendiente'
        }, { transaction: t });

        const mapeoDetalles = detallesParaInsertar.map(d => ({ ...d, orden_id: nuevaOrden.id }));
        await DetalleOrden.bulkCreate(mapeoDetalles, { transaction: t });

        await t.commit();

        res.status(201).json({ msg: "Pedido generado", folio: nuevaOrden.folio_referencia });

    } catch (error) {
        if (t) await t.rollback();
        res.status(400).json({ error: error.message });
    }
};