import { Router } from "express";
import { verificarToken } from "../middleware/middleware.authMiddleware.js";
import * as alumnoController from '../controllers/controller.alumno.js';
import { upload } from "../services/service.upload.js";

const router = Router();

router.post('/comprobante/:id', [verificarToken], upload.single('comprobante'), alumnoController.enviarComprobante);
router.get('/pedidos', [verificarToken], alumnoController.obtenerMisPedidos);
router.post('/checkout', [verificarToken], alumnoController.checkout);

export default router;