import express from 'express';
import * as administradorRoute from '../controllers/controller.administrador/controller.administrador.js';

const router = express.Router();

router.post("/", administradorRoute.loginAdministrador);

export default router;