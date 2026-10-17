import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { createSale, listSales, getSale } from '../controllers/saleController';

const router = Router();
router.use(protect); 
router.post('/', createSale);
router.get('/', listSales);
router.get('/:id', getSale);

export default router;