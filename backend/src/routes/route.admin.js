import express from 'express';
import * as adminController from '../controllers/controller.admin.js';
import * as authController from '../controllers/controller.auth.js';
import { verificarToken } from '../middleware/middleware.authMiddleware.js';


const router = express.Router();

router.post('/login', authController.login);
router.get('/', verificarToken, adminController.obtenerOrdenes);
router.put('/:id/pago-confirmado', verificarToken, adminController.confirmarPago);
router.post('/', verificarToken, adminController.agregarProducto);
router.put('/:id', verificarToken, adminController.actualizarProducto);

export default router;
