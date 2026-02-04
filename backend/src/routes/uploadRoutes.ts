import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  logoUpload,
  bannerUpload,
  documentUpload,
  uploadLogo,
  uploadBanner,
  uploadDocument,
} from '../controllers/uploadController';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

// Logo upload (partner only)
router.post('/logo', requireRole('PARTNER'), logoUpload.single('file'), uploadLogo);

// Banner upload (partner only)
router.post('/banner', requireRole('PARTNER'), bannerUpload.single('file'), uploadBanner);

// Document upload (partner only)
router.post('/document', requireRole('PARTNER'), documentUpload.single('file'), uploadDocument);

export default router;





