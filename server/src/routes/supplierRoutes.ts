import { Router } from 'express';
import { protect, requireRole } from '../middlewares/auth';
import {
  listSuppliers, createSupplier, updateSupplier, deleteSupplier, purchase, paySupplier,
} from '../controllers/supplierController';

const router = Router();
router.use(protect, requireRole('admin'));
router.get('/', listSuppliers);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);
router.post('/:id/purchase', purchase);
router.post('/:id/pay', paySupplier);

export default router;