import { Router } from 'express';
import { getRecommendPlan } from '../controllers/adveroRecommendController';
import { getAuditById, postClaimAudit, postCreateAudit } from '../controllers/adveroAuditController';
import { getAdveroDashboard } from '../controllers/adveroDashboardController';
import {
  getSearchConsoleStatus,
  postSearchConsoleConnectDemo,
  postSearchConsoleSync,
} from '../controllers/adveroSearchConsoleController';
import {
  getGoogleAdsAccounts,
  getGoogleOAuthCallback,
  getIntegrationsStatus,
  postGoogleAdsDisconnect,
  postGoogleAdsSelectAccount,
  postGoogleAdsSync,
  postSearchConsoleDisconnect,
} from '../controllers/adveroIntegrationsController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/recommend-plan', asyncHandler(getRecommendPlan));
router.get('/dashboard', optionalAuthenticate, asyncHandler(getAdveroDashboard));

/** Combined integrations status + OAuth URLs */
router.get('/integrations', authenticate, asyncHandler(getIntegrationsStatus));

/** Google OAuth callback (public — state is signed) */
router.get('/integrations/google/callback', asyncHandler(getGoogleOAuthCallback));

/** Search Console */
router.get('/integrations/search-console', authenticate, asyncHandler(getSearchConsoleStatus));
router.post('/integrations/search-console/sync', authenticate, asyncHandler(postSearchConsoleSync));
router.post('/integrations/search-console/disconnect', authenticate, asyncHandler(postSearchConsoleDisconnect));
router.post('/integrations/search-console/connect-demo', authenticate, asyncHandler(postSearchConsoleConnectDemo));

/** Google Ads */
router.get('/integrations/google-ads/accounts', authenticate, asyncHandler(getGoogleAdsAccounts));
router.post('/integrations/google-ads/select-account', authenticate, asyncHandler(postGoogleAdsSelectAccount));
router.post('/integrations/google-ads/sync', authenticate, asyncHandler(postGoogleAdsSync));
router.post('/integrations/google-ads/disconnect', authenticate, asyncHandler(postGoogleAdsDisconnect));

router.post('/audits', asyncHandler(postCreateAudit));
router.get('/audits/:id', asyncHandler(getAuditById));
router.post('/audits/:id/claim', authenticate, asyncHandler(postClaimAudit));

export default router;
