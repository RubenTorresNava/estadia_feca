import OrdenesRevision from '../models/views/view.ordenespendientes.js';
import { enviarNotificacionEstado } from '../services/service.email.js';
import sequelize from '../services/service.connection.js';
import Producto from '../models/model.producto.js';
import OrdenVenta from '../models/model.ordenventa.js';
import Usuario from '../models/model.usuario.js';


export const obtenerRevisiones = async (req, res) => {
    try {
        const revisiones = await OrdenesRevision.findAll({
            order: [['fecha_creacion', 'DESC']]
        });
        // Mapear para asegurar que comprobante_url esté presente y bien nombrado
        const revisionesConComprobante = revisiones.map(r => {
            // Si es instancia Sequelize, convertir a JSON plano
            const obj = r.toJSON ? r.toJSON() : r;
            return {
                ...obj,
                comprobante_url: obj.comprobante_url || null
            };
        });
        res.json(revisionesConComprobante);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const procesarPago = async (req, res) => {
    const { id } = req.params;
    const { decision, nota } = req.body;

    const estadosValidos = ['pagada', 'rechazado'];
    if (!decision || !estadosValidos.includes(decision)) {
        return res.status(400).json({ error: `Decisión inválida.` });
    }

    const t = await sequelize.transaction();

    try {
        const orden = await OrdenVenta.findByPk(id, { transaction: t });
        if (!orden) {
            await t.rollback();
            return res.status(404).json({ msg: "Orden no encontrada" });
        }

        await orden.update({ 
            estado: decision, 
            nota_admin: decision === 'rechazado' ? nota : null,
            fecha_pago: decision === 'pagada' ? new Date() : null
        }, { transaction: t });

        await t.commit(); 

        try {
            const alumno = await Usuario.findByPk(orden.usuario_id);
            if (alumno?.correo) {
                enviarNotificacionEstado(alumno.correo, alumno.nombre, orden.folio_referencia, decision, nota)
                    .catch(err => console.error("Error correo post-pago:", err));
            }
        } catch (errorCorreo) {
            console.error("Error al buscar datos para el correo:", errorCorreo.message);
        }

        return res.json({ msg: `La orden ha sido ${decision}` });

    } catch (error) {
        if (t && !t.finished) {
            await t.rollback();
        }
        console.error("Error en la transacción:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

export const agregarProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock_actual, categoria } = req.body;
        const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;
        
        const nuevoProducto = await Producto.create({
            nombre, descripcion, precio, stock_actual, categoria, imagen_url
        });

        res.status(201).json({ msg: "Producto agregado", producto: nuevoProducto });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findByPk(id);
        if (!producto) return res.status(404).json({ msg: "No encontrado" });

        const imagen_url = req.file ? `/uploads/${req.file.filename}` : producto.imagen_url;

        await producto.update({ ...req.body, imagen_url });
        res.json({ msg: "Actualizado", producto });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findByPk(id);
        if(!producto) return res.status(404).json({ msg: "No encontrado" });

        await producto.update({ activo: false });
        res.json({ msg: "Producto desactivado" });
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
};

export const alternarDestacado = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findByPk(id);
        
        if (!producto) {
            return res.status(404).json({ msg: "Producto no encontrado" });
        }

        producto.destacado = !producto.destacado;
        await producto.save();

        res.json({
            mensaje: `Producto ${producto.destacado ? 'destacado' : 'Quitado de destacados'} con éxito`,
            producto: {
                id: producto.id,
                nombre: producto.nombre,
                destacado: producto.destacado
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const obtenerHistorialOrdenes = async (req, res) => {
    try {   
        const ordenes = await OrdenVenta.findAll({
            order: [['fecha_creacion', 'DESC']],
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['nombre', 'matricula', 'correo']
                },
                {
                    association: 'detalles',
                    include: [
                        {
                            association: 'producto',
                            attributes: ['nombre', 'categoria', 'precio']
                        }
                    ]
                }
            ]
        });
        res.json(ordenes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const marcarComoListo = async (req, res) => {
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
        const orden = await OrdenVenta.findByPk(id, { transaction: t });
        
        if (!orden) {
            await t.rollback();
            return res.status(404).json({ msg: "Orden no encontrada" });
        }

        if (orden.estado !== 'pagada') {
            await t.rollback();
            return res.status(400).json({ 
                msg: "La orden aún no ha sido pagada o validada. No se puede marcar como lista." 
            });
        }

        await orden.update({ estado: 'listo' }, { transaction: t });
        
        await t.commit();

        try {
            const alumno = await Usuario.findByPk(orden.usuario_id);
            if (alumno?.correo) {
                enviarNotificacionEstado(
                    alumno.correo,
                    alumno.nombre,
                    orden.folio_referencia,
                    'listo'
                ).catch(err => console.error("Error al notificar pedido listo:", err));
            }
        } catch (errorPost) {
            console.error("Error al obtener datos del alumno para entrega:", errorPost);
        }

        return res.json({ 
            msg: "Orden lista para entrega. Se ha notificado al alumno." 
        });

    } catch (error) {
        if (t && !t.finished) await t.rollback();
        console.error("Error en marcarComoListo:", error.message);
        return res.status(500).json({ error: error.message });
    }
};