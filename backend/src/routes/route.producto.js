import express from 'express';
import * as productoController from '../controllers/controller.producto.js';

const router = express.Router();

router.get('/', productoController.obtenerProductos);

export default router;