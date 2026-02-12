
import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { submitGrowthRequest, getGrowthRequests, updateGrowthRequestStatus } from '../controllers/growthController';

const router = express.Router();

// Partner routes
router.post('/request', authenticate, requireRole('PARTNER'), submitGrowthRequest);

// Admin routes
router.get('/requests', authenticate, requireRole('ADMIN'), getGrowthRequests);
router.patch('/requests/:id/status', authenticate, requireRole('ADMIN'), updateGrowthRequestStatus);

export default router;
