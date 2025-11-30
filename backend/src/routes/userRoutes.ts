import { Router } from 'express';
import { 
  getConsumerProfile, 
  updateConsumerProfile, 
  changePassword,
  deleteAccount 
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

export default router;
