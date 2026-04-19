import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { adminLimiter } from '../middleware/rateLimiter';
import {
  getFinanceMetrics,
  getTransactions,
  getVerificationQueue,
  approveVerification,
  rejectVerification,
  getAdminStats,
  getAdminUsers,
  suspendUser,
  deleteUser,
  resetUserPassword,
  resetPartnerProfile,
  getUserDetails,
  getActivityLogs,
  createAdminUser,
  updateUserRole,
  getPlatformSettings,
  updatePlatformSettings,
  getAdminJobRequests,
  createManualBusiness,
} from '../controllers/adminController';

const router = express.Router();

// All admin routes require authentication and admin role (ADMIN or SUPERADMIN)
router.use(authenticate);
router.use(requireRole('ADMIN', 'SUPERADMIN'));
router.use(adminLimiter);

// Diagnostic Ping
router.get('/ping', (req, res) => res.json({ message: 'pong', role: (req as any).user?.role }));

// Manual Onboarding (Placed top-level to avoid parameter conflicts)
router.post('/onboard', createManualBusiness);

// Finance metrics
router.get('/metrics/revenue', getFinanceMetrics);

// Subscriptions metrics
router.get('/metrics/subscriptions', getFinanceMetrics);

// Transactions
router.get('/transactions', getTransactions);

// Verification queue
router.get('/verification-queue', getVerificationQueue);
router.post('/verification-queue/:id/approve', approveVerification);
router.post('/verification-queue/:id/reject', rejectVerification);

// Admin stats
router.get('/stats', getAdminStats);

// Users management
router.get('/users', getAdminUsers);
router.get('/users/:id', getUserDetails);
router.post('/users/:id/suspend', suspendUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/reset-password', resetUserPassword);
router.post('/users/:id/reset-profile', resetPartnerProfile);
router.patch('/users/:id/role', updateUserRole);

// Admin management (Super Admin)
router.post('/admins', createAdminUser);

// Activity logs
router.get('/activity-logs', getActivityLogs);

// Platform settings
router.get('/settings', getPlatformSettings);
router.put('/settings', updatePlatformSettings);

// Job requests (3 quotes feature)
router.get('/jobs', getAdminJobRequests);

export default router;


