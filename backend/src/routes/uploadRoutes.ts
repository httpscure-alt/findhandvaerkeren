import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  logoUpload,
  bannerUpload,
  documentUpload,
  uploadLogo,
  uploadBanner,
  uploadDocument,
  uploadImage,
} from '../controllers/uploadController';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

// Cloudinary safety check
router.use((req, res, next) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    res.status(500).json({ error: 'Cloudinary API keys are missing from the server environment. Please configure them to enable file uploads.' });
    return;
  }
  next();
});

// Logo upload (partner only)
router.post('/logo', requireRole('PARTNER'), logoUpload.single('file'), uploadLogo);

// Banner upload (partner only)
router.post('/banner', requireRole('PARTNER'), bannerUpload.single('file'), uploadBanner);

// Document upload (partner only)
router.post('/document', requireRole('PARTNER'), documentUpload.single('file'), uploadDocument);

// Generic image upload (partner only) - reuse banner storage for high Quality
router.post('/image', requireRole('PARTNER'), bannerUpload.single('file'), uploadImage);

export default router;





