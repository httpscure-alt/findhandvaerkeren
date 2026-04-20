import express from 'express';
import { createCheckoutSession, handleWebhook, getSessionDetails, createPortalSession, getTransactions, cancelSubscription, updateSubscription, verifyStripeConfig } from '../controllers/stripeController';
import { authenticate, requireRole, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// Webhook endpoint - raw body is already handled in server.ts middleware
router.post('/webhook', asyncHandler(handleWebhook));

// Get session details - public endpoint (no auth required for checking payment status)
router.get('/session-details', asyncHandler(getSessionDetails));

// Create billing portal session - requires authentication and PARTNER role
router.get('/portal', authenticate, asyncHandler(createPortalSession));
router.post('/create-portal-session', authenticate, asyncHandler(createPortalSession));

// Subscription management
router.post('/subscription/cancel', authenticate, requireRole('PARTNER'), asyncHandler(cancelSubscription));
router.put('/subscription/update', authenticate, requireRole('PARTNER'), asyncHandler(updateSubscription));

// Get all transactions - requires authentication and ADMIN role
router.get('/transactions', authenticate, requireAdmin, asyncHandler(getTransactions));

// Verify config - requires authentication and ADMIN role
router.get('/verify-config', authenticate, requireAdmin, asyncHandler(verifyStripeConfig));

// Checkout session creation - requires authentication and PARTNER role
router.post(
  '/create-checkout-session',
  authenticate,
  asyncHandler(createCheckoutSession)
);

export default router;
