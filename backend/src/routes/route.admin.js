import express from 'express';
import * as adminController from '../controllers/controller.admin.js';

const router = express.Router();

router.get('/', adminController.obtenerOrdenes);
router.put('/:id/pago-confirmado', adminController.confirmarPago);

export default router;
