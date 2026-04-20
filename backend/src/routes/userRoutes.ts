import { Router } from 'express';
import { 
  getConsumerProfile, 
  updateConsumerProfile, 
  changePassword,
  deleteAccount,
  upgradeToPartner
} from '../controllers/userController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Consumer routes
router.get('/profile', requireRole('CONSUMER'), getConsumerProfile);
router.put('/profile', requireRole('CONSUMER'), updateConsumerProfile);
router.post('/change-password', changePassword);
router.delete('/account', deleteAccount);

// Upgrade to Partner
router.post('/upgrade-to-partner', requireRole('CONSUMER'), upgradeToPartner);

export default router;







