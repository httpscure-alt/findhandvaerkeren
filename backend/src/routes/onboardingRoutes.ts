import { Router } from 'express';
import { 
  saveBasicInfo, 
  saveDescriptions, 
  saveImages, 
  saveVerification,
  completeOnboarding,
  getOnboardingStatus 
} from '../controllers/onboardingController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All routes require authentication and PARTNER role
router.use(authenticate);
router.use(requireRole('PARTNER'));

router.get('/status', getOnboardingStatus);
router.post('/step-1', saveBasicInfo);
router.post('/step-2', saveDescriptions);
router.post('/step-3', saveImages);
router.post('/step-4', saveVerification);
router.post('/complete', completeOnboarding);

export default router;







