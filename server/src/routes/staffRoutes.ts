import { Router } from 'express';
import { protect, requireRole } from '../middlewares/auth';
import { listStaff, createStaff, updateStaff } from '../controllers/staffController';

const router = Router();
router.use(protect, requireRole('admin'));
router.get('/', listStaff);
router.post('/', createStaff);
router.put('/:id', updateStaff);

export default router;