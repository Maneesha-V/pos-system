import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { createOrder } from '../controllers/paymentController';

const router = Router();
router.post('/order', protect, createOrder);
export default router;