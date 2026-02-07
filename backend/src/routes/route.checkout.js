import express from 'express';
import { checkout } from '../controllers/controller.ordenventa/controller.checkout.js';

const router = express.Router();

router.post("/", checkout);

export default router;