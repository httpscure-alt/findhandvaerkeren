import { Router } from 'express';
import {
  trackEvent,
  getCompanyAnalytics,
} from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/track', trackEvent);
router.get('/company/:companyId', authenticate, getCompanyAnalytics);

export default router;
