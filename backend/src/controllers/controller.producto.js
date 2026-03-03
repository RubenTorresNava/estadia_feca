import Producto from '../models/model.producto.js';
import { ProductosTienda } from '../models/views/view.producto.js'

export const obtenerProductos = async (req, res) => {
    try {
        const productos = await ProductosTienda.findAll({
            order: [['disponibilidad', 'ASC'], ['nombre', 'ASC']]
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const obtenerDestacados = async (req, res) => {
    try {
        const destacados = await ProductosDestacados.findAll({
            limit: 4 // Por ejemplo, solo los 4 más recientes o importantes
        });
        res.json(destacados);
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