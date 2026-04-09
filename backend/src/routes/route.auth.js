import express, { Router } from 'express';
import * as authController from '../controllers/controller.auth.js';
import { verificarToken } from '../middleware/middleware.authMiddleware.js';

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/logout', authController.logout);
router.get('/me', verificarToken, authController.perfil);

export default router;