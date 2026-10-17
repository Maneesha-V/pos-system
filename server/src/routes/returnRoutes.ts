import { Router } from 'express';
import { protect, requireRole } from '../middlewares/auth';
import { lookupBill, listReturns, createReturn } from '../controllers/returnController';

const router = Router();
router.use(protect, requireRole('admin'));
router.get('/', listReturns);
router.get('/lookup/:billNo', lookupBill);
router.post('/', createReturn);

export default router;