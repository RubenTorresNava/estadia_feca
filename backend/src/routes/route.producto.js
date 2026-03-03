import express from 'express';
import * as productoController from '../controllers/controller.producto.js';

const router = express.Router();

router.get('/destacados', productoController.obtenerProductosDestacados);
router.get('/', productoController.obtenerCatalogo);
router.get('/categorias', productoController.obtenerCategoriasDisponibles);

export default router;