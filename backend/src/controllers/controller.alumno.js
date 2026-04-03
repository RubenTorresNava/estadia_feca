import MisPedidos from '../models/views/view.pedidosalumn.js';
import { enviarNotificacionEstado } from '../services/service.email.js';
import Usuario from '../models/model.usuario.js';
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

        try {
            const alumno = await Usuario.findByPk(usuario_id);
            if (alumno && alumno.correo) {
                enviarNotificacionEstado(
                    alumno.correo,
                    alumno.nombre,
                    orden.folio_referencia,
                    'en_revision',
                ).catch(err => console.error("Error enviando correo de comprobante:", err));
            }
        } catch (errorCorreo) {
            console.error("Error al recuperar datos del alumno para el correo:", errorCorreo);
        }

        res.json({ 
            msg: "Comprobante subido con éxito. Tu pedido está en revisión.",
            url: orden.comprobante_url 
        });

    } catch (error) {
        console.error("Error en enviarComprobante:", error.message);
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
        console.error("Error en obtenerMisPedidos:", error.message, req.usuario);
    }
};

export const checkout = async (req, res) => {
    const { carrito } = req.body;
    const usuario_id = req.usuario.id; 

    if (!carrito || carrito.length === 0) return res.status(400).json({ error: "El carrito está vacío" });

    const t = await sequelize.transaction();

    try {
        let totalAcumulado = 0;
        const detallesParaInsertar = [];

        for (const item of carrito) {
            const producto = await Producto.findByPk(item.id, { transaction: t });

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

        const alumno = await Usuario.findByPk(usuario_id);
        if (alumno?.correo) {
            enviarNotificacionEstado(
                alumno.correo, 
                alumno.nombre, 
                nuevaOrden.folio_referencia, 
                'pendiente', 
                totalAcumulado.toFixed(2)
            ).catch(err => console.error("Error envío correo checkout:", err));
        }

        return res.status(201).json({ 
            msg: "Pedido generado exitosamente", 
            folio: nuevaOrden.folio_referencia 
        });

    } catch (error) {

        if (t && !t.finished) {
            await t.rollback();
        }

        console.error("VENTA FALLIDA - Deshaciendo cambios:", error.message);
        
        return res.status(400).json({ error: error.message });
    }
};