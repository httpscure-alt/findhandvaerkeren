import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { prisma, isAdveroPrismaReady } from '../prisma/client';
import {
  exchangeGoogleAuthCode,
  getGoogleRedirectUri,
  verifyGoogleOAuthState,
} from '../lib/googleOAuth';
import {
  disconnectSearchConsole,
  getGoogleSearchConsoleAuthUrl,
  getSearchConsoleSnapshot,
  saveGscRefreshToken,
  syncSearchConsoleForWorkspace,
} from '../services/google/searchConsoleService';
import {
  disconnectGoogleAds,
  getGoogleAdsAuthUrl,
  getGoogleAdsSnapshot,
  listGoogleAdsAccounts,
  saveGoogleAdsRefreshToken,
  selectGoogleAdsCustomer,
  syncGoogleAdsForWorkspace,
} from '../services/google/googleAdsService';

async function requireWorkspace(userId: string) {
  if (!isAdveroPrismaReady()) throw new AppError('Database not ready', 503);
  const ws = await prisma.adveroWorkspace.findUnique({ where: { userId } });
  if (!ws) throw new AppError('Workspace not found — complete an audit or subscribe first', 404);
  return ws;
}

function clientSiteUrl(): string {
  return (
    process.env.ADVERO_SITE_URL ||
    process.env.FRONTEND_URL ||
    'http://localhost:5174'
  ).replace(/\/$/, '');
}

export const getIntegrationsStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) throw new AppError('Unauthorized', 401);
  const ws = await requireWorkspace(userId);

  const oauthState = { workspaceId: ws.id, userId };
  const gscAuthUrl = getGoogleSearchConsoleAuthUrl({ ...oauthState, provider: 'gsc' });
  const adsAuthUrl = getGoogleAdsAuthUrl({ ...oauthState, provider: 'ads' });

  const [searchConsole, googleAds] = await Promise.all([
    getSearchConsoleSnapshot(ws.id),
    getGoogleAdsSnapshot(ws.id),
  ]);

  res.json({
    searchConsole,
    googleAds,
    authUrls: {
      gsc: gscAuthUrl,
      ads: adsAuthUrl,
    },
    configured: {
      googleOAuth: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      googleAdsApi: Boolean(process.env.GOOGLE_ADS_DEVELOPER_TOKEN),
    },
  });
};

export const getSearchConsoleStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) throw new AppError('Unauthorized', 401);
  const ws = await requireWorkspace(userId);
  const snapshot = await getSearchConsoleSnapshot(ws.id);
  const authUrl = getGoogleSearchConsoleAuthUrl({ provider: 'gsc', workspaceId: ws.id, userId });
  res.json({ snapshot, authUrl });
};

export const postSearchConsoleSync = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) throw new AppError('Unauthorized', 401);
  const ws = await requireWorkspace(userId);
  const snapshot = await syncSearchConsoleForWorkspace(ws.id);
  res.json({ snapshot });
};

export const postSearchConsoleConnectDemo = async (req: AuthRequest, res: Response): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    throw new AppError('Demo connect is disabled in production', 403);
  }
  const userId = req.userId;
  if (!userId) throw new AppError('Unauthorized', 401);
  const ws = await requireWorkspace(userId);
  const snapshot = await syncSearchConsoleForWorkspace(ws.id);
  res.json({ snapshot, mode: 'demo' });
};

export const postSearchConsoleDisconnect = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) throw new AppError('Unauthorized', 401);
  const ws = await requireWorkspace(userId);
  await disconnectSearchConsole(ws.id);
  res.json({ ok: true });
};

export const getGoogleAdsAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) throw new AppError('Unauthorized', 401);
  const ws = await requireWorkspace(userId);
  const accounts = await listGoogleAdsAccounts(ws.id);
  res.json({ accounts });
};

export const postGoogleAdsSelectAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) throw new AppError('Unauthorized', 401);
  const ws = await requireWorkspace(userId);
  const customerId = typeof req.body?.customerId === 'string' ? req.body.customerId : '';
  if (!customerId) throw new AppError('customerId is required', 400);
  const snapshot = await selectGoogleAdsCustomer(ws.id, customerId);
  res.json({ snapshot });
};

export const postGoogleAdsSync = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) throw new AppError('Unauthorized', 401);
  const ws = await requireWorkspace(userId);
  const snapshot = await syncGoogleAdsForWorkspace(ws.id);
  res.json({ snapshot });
};

export const postGoogleAdsDisconnect = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) throw new AppError('Unauthorized', 401);
  const ws = await requireWorkspace(userId);
  await disconnectGoogleAds(ws.id);
  res.json({ ok: true });
};

/** OAuth callback — Google redirects here (no JWT; state is HMAC-signed). */
export const getGoogleOAuthCallback = async (req: AuthRequest, res: Response): Promise<void> => {
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const stateRaw = typeof req.query.state === 'string' ? req.query.state : '';
  const oauthError = typeof req.query.error === 'string' ? req.query.error : '';

  const settingsPath = `${clientSiteUrl()}/advero/dashboard/settings`;

  if (oauthError) {
    res.redirect(`${settingsPath}?integration=error&message=${encodeURIComponent(oauthError)}`);
    return;
  }

  if (!code || !stateRaw) {
    res.redirect(`${settingsPath}?integration=error&message=missing_code`);
    return;
  }

  const state = verifyGoogleOAuthState(stateRaw);
  if (!state) {
    res.redirect(`${settingsPath}?integration=error&message=invalid_state`);
    return;
  }

  const redirectUri = getGoogleRedirectUri();
  if (!redirectUri) {
    res.redirect(`${settingsPath}?integration=error&message=redirect_not_configured`);
    return;
  }

  try {
    const tokens = await exchangeGoogleAuthCode(code, redirectUri);
    if (!tokens.refresh_token) {
      res.redirect(
        `${settingsPath}?integration=error&message=${encodeURIComponent('no_refresh_token')}`
      );
      return;
    }

    if (state.provider === 'gsc') {
      await saveGscRefreshToken(state.workspaceId, tokens.refresh_token);
      await syncSearchConsoleForWorkspace(state.workspaceId).catch(() => undefined);
      res.redirect(`${settingsPath}?integration=gsc&status=connected`);
      return;
    }

    if (state.provider === 'ads') {
      await saveGoogleAdsRefreshToken(state.workspaceId, tokens.refresh_token);
      res.redirect(`${settingsPath}?integration=ads&status=select_account`);
      return;
    }

    res.redirect(`${settingsPath}?integration=error&message=unknown_provider`);
  } catch (err) {
    const msg = encodeURIComponent((err as Error).message || 'oauth_failed');
    res.redirect(`${settingsPath}?integration=error&message=${msg}`);
  }
};
