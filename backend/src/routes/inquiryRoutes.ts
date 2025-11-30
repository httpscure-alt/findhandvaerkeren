import { Router } from 'express';
import {
  getInquiries,
  createInquiry,
  updateInquiry,
} from '../controllers/inquiryController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getInquiries);
router.post('/', createInquiry);
router.patch('/:id', updateInquiry);

export default router;
