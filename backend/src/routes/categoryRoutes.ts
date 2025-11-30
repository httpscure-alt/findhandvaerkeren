import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, requireRole('ADMIN'), createCategory);
router.put('/:id', authenticate, requireRole('ADMIN'), updateCategory);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteCategory);

export default router;
