
import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  submitGrowthRequest,
  getGrowthRequests,
  updateGrowthRequestStatus,
  getCompanyGrowthDashboard,
  getCompanyCampaigns,
  upsertCompanyCampaign,
} from '../controllers/growthController';

const router = express.Router();

// Partner routes
router.post('/request', authenticate, requireRole('PARTNER'), submitGrowthRequest);
router.get('/dashboard/:companyId', authenticate, getCompanyGrowthDashboard);
router.get('/campaigns/:companyId', authenticate, getCompanyCampaigns);

// Admin routes
router.get('/requests', authenticate, requireRole('ADMIN'), getGrowthRequests);
router.patch('/requests/:id/status', authenticate, requireRole('ADMIN'), updateGrowthRequestStatus);
router.put('/campaigns/:companyId', authenticate, requireRole('ADMIN'), upsertCompanyCampaign);

export default router;
