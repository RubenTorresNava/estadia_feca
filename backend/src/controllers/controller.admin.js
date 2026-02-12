import OrdenVenta from '../models/model.ordenventa.js';
import Producto from '../models/model.producto.js';
import sequelize from '../services/service.connection.js';

export const obtenerOrdenes = async (req, res) => {
    try {
        const ordenes = await OrdenVenta.findAll({
            order: [['fecha_creacion', 'DESC']]
        });
        res.json(ordenes);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las órdenes" });
    }
};

export const confirmarPago = async (req, res) => {
    const { id } = req.params;
    const administrador_id = req.administrador_id;

    const t = await sequelize.transaction();

    try {
        await sequelize.query(`SET LOCAL app.current_admin_id = '${administrador_id}'`, { transaction: t });

        await OrdenVenta.update(
            { estado: 'pagada' }, 
            { where: { id }, transaction: t }
        );

        await t.commit();
        res.json({ msg: "Pago confirmado y registrado con éxito" });

    } catch (error) {
        if (t) await t.rollback();
        console.error("Error en confirmarPago:", error);
        res.status(500).json({ error: error.message });
    }
};

export const agregarProducto = async (req, res) => {
    try {
        const { nombre, precio, stock_actual } = req.body;

        const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;
        
        const nuevoProducto = await Producto.create({
            nombre,
            precio,
            stock_actual,
            imagen_url
        });

        res.status(201).json({
            msg: "Producto agregado al inventario",
            producto: nuevoProducto
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock_actual, activo } = req.body;

    try {
        const producto = await Producto.findByPk(id);
        if (!producto) return res.status(404).json({ msg: "Producto no encontrado" });

        await producto.update({
            nombre,
            precio,
            stock_actual,
            activo
        });

        res.json({ msg: "Producto actualizado correctamente", producto });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};