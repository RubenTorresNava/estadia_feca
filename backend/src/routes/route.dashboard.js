import express from 'express';
import { obtenerResumenVenta } from '../controllers/controller.dashboard.js';

const router = express.Router();

router.get('/', obtenerResumenVenta);

export default router;