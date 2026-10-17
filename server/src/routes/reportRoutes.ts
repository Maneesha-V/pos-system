import { Router } from 'express';
import { protect, requireRole } from '../middlewares/auth';
import { summary, listLedger, addExpense } from '../controllers/reportController';

const router = Router();
router.use(protect, requireRole('admin'));
router.get('/summary', summary);
router.get('/ledger', listLedger);
router.post('/expenses', addExpense);

export default router;