import express from 'express';
import * as adminController from '../controllers/controller.admin.js';
import * as authController from '../controllers/controller.auth.js';
import { alternarDestacado } from '../controllers/controller.producto.js';
import { verificarToken } from '../middleware/middleware.authMiddleware.js';
import { upload } from '../services/service.upload.js';



const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/', verificarToken, adminController.obtenerOrdenes);
router.put('/:id/pago-confirmado', verificarToken, adminController.confirmarPago);
router.post('/', [upload.single('imagen')], adminController.agregarProducto);
router.put('/:id', verificarToken, adminController.actualizarProducto);
router.patch('/destacar/:id', verificarToken, alternarDestacado);

export default router;
