import { Router } from 'express';
import {
  trackEvent,
  getCompanyAnalytics,
  getPlatformAnalytics,
} from '../controllers/analyticsController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/track', trackEvent);
router.get('/platform', authenticate, requireAdmin, getPlatformAnalytics);
router.get('/company/:companyId', authenticate, getCompanyAnalytics);

export default router;
