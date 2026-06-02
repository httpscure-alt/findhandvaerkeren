import { google } from 'googleapis';
import { prisma } from '../../prisma/client';
import { isAdveroPrismaReady } from '../../prisma/client';
import { logger } from '../../config/logger';
import { parseSetupState } from '../../lib/workspaceSetup';
import { getGoogleRedirectUri, refreshGoogleAccessToken, signGoogleOAuthState, type GoogleOAuthState } from '../../lib/googleOAuth';

export type GoogleAnalyticsSnapshot = {
  connected: boolean;
  source: 'google' | 'unavailable' | 'demo';
  accountName?: string;
  propertyName?: string;
  syncedAt?: string;
};

type Ga4Cache = {
  connected?: boolean;
  accountName?: string;
  propertyName?: string;
  syncedAt?: string;
};

function cacheToSnapshot(cache: Ga4Cache, source: GoogleAnalyticsSnapshot['source']): GoogleAnalyticsSnapshot {
  if (!cache.connected) return { connected: false, source: 'unavailable' };
  return {
    connected: true,
    source,
    accountName: cache.accountName,
    propertyName: cache.propertyName,
    syncedAt: cache.syncedAt,
  };
}

async function getGa4AccessToken(setup: Record<string, unknown>): Promise<string | null> {
  const refresh = setup.ga4RefreshToken as string | undefined;
  if (!refresh) return null;
  const refreshed = await refreshGoogleAccessToken(refresh);
  return refreshed.access_token;
}

export async function getGoogleAnalyticsSnapshot(workspaceId?: string | null): Promise<GoogleAnalyticsSnapshot> {
  if (!workspaceId || !isAdveroPrismaReady()) return { connected: false, source: 'unavailable' };
  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) return { connected: false, source: 'unavailable' };

  const setup = parseSetupState(ws.setupState);
  const cache = (setup.ga4Cache as Ga4Cache) || {};
  const hasToken = Boolean(setup.ga4RefreshToken);
  const source: GoogleAnalyticsSnapshot['source'] =
    cache.connected && hasToken && cache.syncedAt ? 'google' : cache.connected ? 'demo' : 'unavailable';
  return cacheToSnapshot(cache, source);
}

export async function syncGoogleAnalyticsForWorkspace(workspaceId: string): Promise<GoogleAnalyticsSnapshot> {
  if (!isAdveroPrismaReady()) return { connected: false, source: 'unavailable' };
  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) return { connected: false, source: 'unavailable' };

  const setup = parseSetupState(ws.setupState);
  const refreshToken = setup.ga4RefreshToken as string | undefined;
  if (!refreshToken) {
    return { connected: false, source: 'unavailable' };
  }

  try {
    const accessToken = await getGa4AccessToken(setup);
    if (!accessToken) throw new Error('No GA4 access token');
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    // Lightweight proof the token works: list account summaries
    const admin = google.analyticsadmin({ version: 'v1beta', auth });
    const res = await admin.accountSummaries.list({ pageSize: 5 });
    const first = res.data.accountSummaries?.[0];

    const cache: Ga4Cache = {
      connected: true,
      accountName: first?.displayName || 'Google Analytics',
      propertyName: first?.propertySummaries?.[0]?.displayName || undefined,
      syncedAt: new Date().toISOString(),
    };

    await prisma.adveroWorkspace.update({
      where: { id: workspaceId },
      data: {
        setupState: {
          ...setup,
          ga4: true,
          ga4Cache: cache,
        },
      },
    });

    return cacheToSnapshot(cache, 'google');
  } catch (err) {
    logger.warn('GA4 sync failed', { workspaceId, error: (err as Error).message });
    const existing = (setup.ga4Cache as Ga4Cache) || {};
    if (existing.connected) return cacheToSnapshot(existing, 'demo');
    throw err;
  }
}

export function getGoogleAnalyticsAuthUrl(state: GoogleOAuthState): string | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirect = getGoogleRedirectUri();
  if (!clientId || !redirect) return null;

  const scope = encodeURIComponent('https://www.googleapis.com/auth/analytics.readonly');
  const signed = encodeURIComponent(signGoogleOAuthState(state));
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirect
  )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${signed}`;
}

export async function saveGa4RefreshToken(workspaceId: string, refreshToken: string): Promise<void> {
  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) throw new Error('Workspace not found');
  const setup = parseSetupState(ws.setupState);
  await prisma.adveroWorkspace.update({
    where: { id: workspaceId },
    data: {
      setupState: {
        ...setup,
        ga4RefreshToken: refreshToken,
        ga4: true,
      },
    },
  });
}

export async function disconnectGoogleAnalytics(workspaceId: string): Promise<void> {
  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) return;
  const setup = parseSetupState(ws.setupState);
  delete setup.ga4RefreshToken;
  delete setup.ga4Cache;
  setup.ga4 = false;
  await prisma.adveroWorkspace.update({ where: { id: workspaceId }, data: { setupState: setup as object } });
}

