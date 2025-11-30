import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { getFinanceMetrics, getTransactions, getVerificationQueue } from '../controllers/adminController';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('ADMIN'));

// Finance metrics
router.get('/metrics/revenue', getFinanceMetrics);

// Subscriptions metrics
router.get('/metrics/subscriptions', getFinanceMetrics);

// Transactions
router.get('/transactions', getTransactions);

// Verification queue
router.get('/verification-queue', getVerificationQueue);

export default router;
