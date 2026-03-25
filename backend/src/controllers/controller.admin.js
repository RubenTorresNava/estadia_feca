import OrdenVenta from '../models/model.ordenventa.js';
import Producto from '../models/model.producto.js';
import OrdenesRevision from '../models/views/view.ordenespendientes.js';
import sequelize from '../services/service.connection.js';

export const obtenerRevisiones = async (req, res) => {
    try {
        const revisiones = await OrdenesRevision.findAll({
            order: [['fecha_creacion', 'DESC']]
        });
        res.json(revisiones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const procesarPago = async (req, res) => {
    const { id } = req.params;
    const { decision, nota } = req.body;
    const adminId = req.usuario.id; 

    const t = await sequelize.transaction();

    try {
        const orden = await OrdenVenta.findByPk(id);
        if (!orden) return res.status(404).json({ msg: "Orden no encontrada" });

        await orden.update({ 
            estado: decision, 
            nota_admin: decision === 'rechazado' ? nota : null,
            fecha_pago: decision === 'pagada' ? new Date() : null
        }, { transaction: t });

        await t.commit();
        res.json({ msg: `La orden ha sido ${decision === 'pagada' ? 'aprobada' : 'rechazada'}` });

    } catch (error) {
        if (t) await t.rollback();
        res.status(500).json({ error: error.message });
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