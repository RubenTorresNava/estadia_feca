import OrdenVenta from '../models/model.ordenventa.js';
import Producto from '../models/model.producto.js';
import Venta from '../models/model.venta.js';
import DetalleOrden from '../models/model.detalleorden.js';
import sequelize from '../services/service.connection.js';

export const checkout = async (req, res) => {
    console.log("1. Datos recibidos:", req.body); // Si esto no sale, el problema es la Ruta
    const { nombre_alumno, matricula, correo, carrito } = req.body;

    if (!carrito || carrito.length === 0) {
        return res.status(400).json({ error: "El carrito está vacío" });
    }

    const t = await sequelize.transaction();
    console.log("2. Transacción iniciada");

    try {
        let totalAcumulado = 0;
        const detallesParaInsertar = [];

        for (const item of carrito) {
            console.log(`3. Buscando producto ID: ${item.id}`);
            const producto = await Producto.findByPk(item.id);

            if (!producto) {
                console.error(`ERROR: El ID ${item.id} no existe en la DB`);
                throw new Error(`El producto con ID ${item.id} no existe`);
            }

            console.log(`4. Producto encontrado: ${producto.nombre}, Stock: ${producto.stock_actual}`);

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

        console.log("5. Creando OrdenVenta...");
        const nuevaOrden = await OrdenVenta.create({
            nombre_alumno,
            matricula,
            correo,
            total_pago: totalAcumulado,
            estado: 'pendiente'
        }, { transaction: t });

        console.log("6. Insertando DetalleOrden...");
        const mapeoDetalles = detallesParaInsertar.map(d => ({ ...d, orden_id: nuevaOrden.id }));
        await DetalleOrden.bulkCreate(mapeoDetalles, { transaction: t });

        await t.commit();
        console.log("7. ¡ÉXITO! Commit realizado.");

        res.status(201).json({ msg: "Pedido generado", folio: nuevaOrden.folio_referencia });

    } catch (error) {
        console.error("X. ERROR EN CHECKOUT:", error.message);
        if (t) await t.rollback();
        res.status(400).json({ error: error.message });
    }
};