import express from 'express';
import { checkout } from '../controllers/controller.checkout.js';

const router = express.Router();

router.post("/", checkout);

export default router;