import { Router } from 'express';
import { protect, requireRole } from '../middlewares/auth';
import { listProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController';

const router = Router();
router.use(protect);
router.get('/', listProducts);
router.post('/', requireRole('admin'), createProduct);
router.put('/:id', requireRole('admin'), updateProduct);
router.delete('/:id', requireRole('admin'), deleteProduct);

export default router;