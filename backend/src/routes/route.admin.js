import express from 'express';
import * as adminController from '../controllers/controller.admin.js';
import { verificarToken, esAdmin } from '../middleware/middleware.authMiddleware.js';
import { upload } from '../services/service.upload.js';

const router = express.Router();

router.get('/revisiones', [verificarToken, esAdmin] , adminController.obtenerRevisiones);
router.get('/historial', [verificarToken, esAdmin], adminController.obtenerHistorialOrdenes);
router.put('/revisiones/:id', [verificarToken, esAdmin], adminController.procesarPago);
router.post('/agregar', [verificarToken, esAdmin], upload.single('imagen'), adminController.agregarProducto);
router.patch('/modificar/:id', [verificarToken, esAdmin], upload.single('imagen'), adminController.actualizarProducto);
router.delete('/eliminar/:id', [verificarToken, esAdmin], adminController.eliminarProducto);
router.patch('/destacado/:id', [verificarToken, esAdmin], adminController.alternarDestacado);

export default router;
