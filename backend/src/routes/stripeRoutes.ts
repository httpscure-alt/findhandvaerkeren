import express from 'express';
import { createCheckoutSession, handleWebhook, getSessionDetails, createPortalSession, getTransactions, cancelSubscription, updateSubscription, verifyStripeConfig } from '../controllers/stripeController';
import { authenticate, requireRole, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Webhook endpoint - raw body is already handled in server.ts middleware
// This route just needs to call the handler
router.post('/webhook', handleWebhook);

// Get session details - public endpoint (no auth required for checking payment status)
router.get('/session-details', getSessionDetails);

// Create billing portal session - requires authentication and PARTNER role
router.get('/portal', authenticate, requireRole('PARTNER'), createPortalSession);
router.post('/create-portal-session', authenticate, requireRole('PARTNER'), createPortalSession);

// Subscription management
router.post('/subscription/cancel', authenticate, requireRole('PARTNER'), cancelSubscription);
router.put('/subscription/update', authenticate, requireRole('PARTNER'), updateSubscription);

// Get all transactions - requires authentication and ADMIN role
router.get('/transactions', authenticate, requireAdmin, getTransactions);

// Verify config - requires authentication and ADMIN role
router.get('/verify-config', authenticate, requireAdmin, verifyStripeConfig);

// Checkout session creation - requires authentication and PARTNER role
// In development, allow test mode without strict auth
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

if (isDevelopment) {
  // Development mode: try auth, but allow test mode
  router.post(
    '/create-checkout-session',
    async (req, res, next) => {
      // Try to authenticate, but don't fail if it's a mock token
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token && !token.startsWith('mock-token-')) {
        // Real token - use normal auth
        return authenticate(req as any, res, next);
      }
      // Mock token or no token - allow through for testing
      (req as any).userId = 'test-user-id';
      (req as any).userRole = 'PARTNER';
      next();
    },
    createCheckoutSession
  );
} else {
  // Production: strict auth required
  router.post(
    '/create-checkout-session',
    authenticate,
    requireRole('PARTNER'),
    createCheckoutSession
  );
}

export default router;


