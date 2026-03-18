import express from 'express';
import * as adminController from '../controllers/controller.admin.js';
import * as authController from '../controllers/controller.auth.js';
import { alternarDestacado } from '../controllers/controller.producto.js';
import { verificarToken } from '../middleware/middleware.authMiddleware.js';
import { upload } from '../services/service.upload.js';



const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/obtenerOrdenes', adminController.obtenerOrdenes);
router.get('/obtenerProductos', adminController.obtenerProductos);
router.put('/:id/pago-confirmado', verificarToken, adminController.confirmarPago);
router.post('/agregarProducto', [upload.single('imagen')], adminController.agregarProducto);
router.put('/editarProducto/:id', [upload.single('imagen')], verificarToken, adminController.actualizarProducto);
router.patch('/destacarProducto/:id', verificarToken, alternarDestacado);
router.delete('/eliminarProducto/:id', verificarToken, adminController.eliminarProducto);

export default router;
