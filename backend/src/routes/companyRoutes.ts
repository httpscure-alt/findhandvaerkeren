import { Router } from 'express';
import {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  verifyCompany,
} from '../controllers/companyController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, companyValidation } from '../utils/validation';

const router = Router();

router.get('/', getCompanies);
router.get('/:id', getCompany);
router.post('/', authenticate, requireRole('PARTNER'), validate(companyValidation), createCompany);
router.put('/:id', authenticate, validate(companyValidation), updateCompany);
router.delete('/:id', authenticate, deleteCompany);
router.patch('/:id/verify', authenticate, requireRole('ADMIN'), verifyCompany);

export default router;
