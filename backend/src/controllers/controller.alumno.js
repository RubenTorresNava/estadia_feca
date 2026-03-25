import MisPedidos from '../models/views/view.pedidosalumn.js';
import OrdenVenta from '../models/model.ordenventa.js';
import Producto from '../models/model.producto.js';
import DetalleOrden from '../models/model.detalleorden.js';
import sequelize from '../services/service.connection.js';

export const enviarComprobante = async (req, res) => {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    try {
        if (!req.file) {
            return res.status(400).json({ msg: "Debe subir una imagen del comprobante" });
        }

        const orden = await OrdenVenta.findOne({ 
            where: { id, usuario_id } 
        });

        if (!orden) {
            return res.status(404).json({ msg: "Orden no encontrada o no te pertenece" });
        }

        await orden.update({
            comprobante_url: `/uploads/comprobantes/${req.file.filename}`,
            estado: 'en_revision'
        });

        res.json({ 
            msg: "Comprobante subido con éxito. Tu pedido está en revisión.",
            url: orden.comprobante_url 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const obtenerMisPedidos = async (req, res) => {
    try {
        const usuario_id = req.usuario.id; 

        const pedidos = await MisPedidos.findAll({
            where: { usuario_id },
            order: [['fecha_creacion', 'DESC']]
        });

        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const checkout = async (req, res) => {
    const { carrito } = req.body;
    const usuario_id = req.usuario.id; 

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

            totalAcumulado += parseFloat(producto.precio) * item.cantidad;
            
            detallesParaInsertar.push({
                producto_id: producto.id,
                cantidad: item.cantidad,
                precio_unitario: producto.precio
            });
        }

        const nuevaOrden = await OrdenVenta.create({
            usuario_id,
            total_pago: totalAcumulado,
            estado: 'pendiente'
        }, { transaction: t });

        const mapeoDetalles = detallesParaInsertar.map(d => ({ 
            ...d, 
            orden_id: nuevaOrden.id 
        }));
        
        await DetalleOrden.bulkCreate(mapeoDetalles, { transaction: t });

        await t.commit();

        res.status(201).json({ 
            msg: "Pedido generado exitosamente", 
            orden_id: nuevaOrden.id,
            folio: nuevaOrden.folio_referencia,
            total: totalAcumulado
        });

    } catch (error) {
        if (t) await t.rollback();
        res.status(400).json({ error: error.message });
    }
};
