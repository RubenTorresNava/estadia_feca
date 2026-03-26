
import { ProductosTienda } from '../models/views/view.producto.js'
import { Op } from 'sequelize';
import sequelize from '../services/service.connection.js';

export const obtenerProductosDestacados = async (req, res) => {
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


// Nuevo: obtener productos activos directamente de la tabla Producto
import Producto from '../models/model.producto.js';

export const obtenerCatalogo = async (req, res) => {
    try {
        const { cat } = req.query;
        let where = { activo: true };
        if (cat) {
            where.categoria = cat;
        }
        const productos = await Producto.findAll({
            where,
            order: [['nombre', 'ASC']]
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const obtenerCategoriasDisponibles = async (req, res) => {
    try {
        const categorias = await ProductosTienda.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('categoria')), 'categoria']],
            order: [['categoria', 'ASC']]
        });

        res.jason(categorias.map(c => c.categoria));

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}