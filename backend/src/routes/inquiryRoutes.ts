import { Router } from 'express';
import {
  getInquiries,
  createInquiry,
  updateInquiry,
  replyToInquiry,
} from '../controllers/inquiryController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createInquirySchema, replyToInquirySchema } from '../validations/inquiryValidation';

const router = Router();

router.use(authenticate);

router.get('/', getInquiries);
router.post('/', validate(createInquirySchema), createInquiry);
router.patch('/:id', updateInquiry);
router.post('/:id/reply', validate(replyToInquirySchema), replyToInquiry);

export default router;
