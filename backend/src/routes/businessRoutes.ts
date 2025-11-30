import { Router } from 'express';
import { 
  getBusinessDashboard, 
  updateCompanyListing,
  getBusinessAnalytics 
} from '../controllers/businessController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All routes require authentication and PARTNER role
router.use(authenticate);
router.use(requireRole('PARTNER'));

router.get('/dashboard', getBusinessDashboard);
router.put('/listing', updateCompanyListing);
router.get('/analytics', getBusinessAnalytics);

export default router;
