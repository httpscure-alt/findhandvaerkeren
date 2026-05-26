import { google } from 'googleapis';
import { prisma } from '../../prisma/client';
import { isAdveroPrismaReady } from '../../prisma/client';
import type { SearchConsoleSnapshot } from '../../lib/visibilityIntelligence';
import { logger } from '../../config/logger';
import { parseSetupState } from '../../lib/workspaceSetup';
import {
  getGoogleRedirectUri,
  refreshGoogleAccessToken,
  signGoogleOAuthState,
  type GoogleOAuthState,
} from '../../lib/googleOAuth';

type GscCache = {
  connected?: boolean;
  siteUrl?: string;
  impressions?: number;
  clicks?: number;
  ctr?: string;
  avgPosition?: string;
  topQueries?: { query: string; clicks: number }[];
  syncedAt?: string;
};

function cacheToSnapshot(cache: GscCache, source: SearchConsoleSnapshot['source']): SearchConsoleSnapshot {
  if (!cache.connected) {
    return { connected: false, source: 'unavailable', siteUrl: cache.siteUrl };
  }
  return {
    connected: true,
    siteUrl: cache.siteUrl,
    impressions: cache.impressions,
    clicks: cache.clicks,
    ctr: cache.ctr,
    avgPosition: cache.avgPosition,
    topQueries: cache.topQueries,
    syncedAt: cache.syncedAt,
    source,
  };
}

/** Read cached GSC metrics from workspace.setupState. */
export async function getSearchConsoleSnapshot(
  workspaceId?: string | null
): Promise<SearchConsoleSnapshot> {
  if (!workspaceId || !isAdveroPrismaReady()) {
    return { connected: false, source: 'unavailable' };
  }

  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) return { connected: false, source: 'unavailable' };

  const setup = parseSetupState(ws.setupState);
  const gsc = (setup.gscCache as GscCache) || {};
  const hasToken = Boolean(setup.gscRefreshToken);
  const source: SearchConsoleSnapshot['source'] =
    gsc.connected && hasToken && gsc.syncedAt ? 'google' : gsc.connected ? 'demo' : 'unavailable';

  return cacheToSnapshot(gsc, source);
}

async function getGscAccessToken(setup: Record<string, unknown>): Promise<string | null> {
  const refresh = setup.gscRefreshToken as string | undefined;
  if (!refresh) return null;
  const refreshed = await refreshGoogleAccessToken(refresh);
  return refreshed.access_token;
}

async function pickSiteUrl(
  accessToken: string,
  preferred?: string | null
): Promise<string | null> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const webmasters = google.webmasters({ version: 'v3', auth });
  const sites = await webmasters.sites.list();
  const entries = sites.data.siteEntry || [];
  const verified = entries.filter((s) => s.permissionLevel && s.permissionLevel !== 'siteUnverifiedUser');

  if (preferred) {
    const match = verified.find((s) => s.siteUrl === preferred);
    if (match?.siteUrl) return match.siteUrl;
  }

  const domain = verified.find((s) => s.siteUrl?.startsWith('sc-domain:'));
  if (domain?.siteUrl) return domain.siteUrl;

  return verified[0]?.siteUrl || entries[0]?.siteUrl || null;
}

async function fetchGscAnalytics(
  accessToken: string,
  siteUrl: string
): Promise<Omit<GscCache, 'connected'>> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 28);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const [siteRes, queryRes] = await Promise.all([
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: fmt(start),
        endDate: fmt(end),
        dimensions: [],
        rowLimit: 1,
      },
    }),
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: fmt(start),
        endDate: fmt(end),
        dimensions: ['query'],
        rowLimit: 8,
      },
    }),
  ]);

  const row = siteRes.data.rows?.[0];
  const clicks = Math.round(row?.clicks ?? 0);
  const impressions = Math.round(row?.impressions ?? 0);
  const ctrPct = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : '0.0';
  const position = row?.position != null ? Number(row.position).toFixed(1) : undefined;

  const topQueries =
    queryRes.data.rows?.map((r) => ({
      query: r.keys?.[0] || '(unknown)',
      clicks: Math.round(r.clicks ?? 0),
    })) ?? [];

  return {
    siteUrl,
    impressions,
    clicks,
    ctr: `${ctrPct}%`,
    avgPosition: position,
    topQueries,
    syncedAt: new Date().toISOString(),
  };
}

/**
 * Sync Search Console metrics into workspace.setupState.gscCache.
 */
export async function syncSearchConsoleForWorkspace(workspaceId: string): Promise<SearchConsoleSnapshot> {
  if (!isAdveroPrismaReady()) {
    return { connected: false, source: 'unavailable' };
  }

  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) return { connected: false, source: 'unavailable' };

  const setup = parseSetupState(ws.setupState);
  const existingCache = (setup.gscCache as GscCache) || {};
  const refreshToken = setup.gscRefreshToken as string | undefined;

  let cache: GscCache;
  let source: SearchConsoleSnapshot['source'] = 'unavailable';

  if (refreshToken) {
    try {
      const accessToken = await getGscAccessToken(setup);
      if (!accessToken) throw new Error('No GSC access token');

      const siteUrl = await pickSiteUrl(accessToken, existingCache.siteUrl);
      if (!siteUrl) throw new Error('No Search Console property found for this Google account');

      const metrics = await fetchGscAnalytics(accessToken, siteUrl);
      cache = { connected: true, ...metrics };
      source = 'google';
    } catch (err) {
      logger.warn('GSC sync failed', { workspaceId, error: (err as Error).message });
      if (existingCache.connected) {
        cache = { ...existingCache, syncedAt: existingCache.syncedAt };
        source = 'demo';
      } else {
        throw err;
      }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    cache = demoGscCache(ws.companyName);
    source = 'demo';
  } else {
    return { connected: false, source: 'unavailable' };
  }

  await prisma.adveroWorkspace.update({
    where: { id: workspaceId },
    data: {
      setupState: {
        ...setup,
        gsc: true,
        gscCache: cache,
      },
    },
  });

  return cacheToSnapshot(cache, source);
}

export function demoGscCache(companyName: string): GscCache {
  const seed = companyName.length * 7;
  const clicks = 12 + (seed % 14);
  const impressions = clicks * (8 + (seed % 5));
  return {
    connected: true,
    siteUrl: 'sc-domain:example.dk',
    impressions,
    clicks,
    ctr: `${((clicks / impressions) * 100).toFixed(1)}%`,
    avgPosition: (14.2 - (seed % 40) / 10).toFixed(1),
    topQueries: [
      { query: `${companyName.split(' ')[0]} services`, clicks: Math.max(2, Math.floor(clicks * 0.3)) },
      { query: 'local provider near me', clicks: Math.max(1, Math.floor(clicks * 0.2)) },
    ],
    syncedAt: new Date().toISOString(),
  };
}

export function getGoogleSearchConsoleAuthUrl(state: GoogleOAuthState): string | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirect = getGoogleRedirectUri();
  if (!clientId || !redirect) return null;

  const scope = encodeURIComponent('https://www.googleapis.com/auth/webmasters.readonly');
  const signed = encodeURIComponent(signGoogleOAuthState(state));
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${signed}`;
}

export async function saveGscRefreshToken(
  workspaceId: string,
  refreshToken: string
): Promise<void> {
  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) throw new Error('Workspace not found');

  const setup = parseSetupState(ws.setupState);
  await prisma.adveroWorkspace.update({
    where: { id: workspaceId },
    data: {
      setupState: {
        ...setup,
        gscRefreshToken: refreshToken,
        gsc: true,
      },
    },
  });
}

export async function disconnectSearchConsole(workspaceId: string): Promise<void> {
  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) return;
  const setup = parseSetupState(ws.setupState);
  delete setup.gscRefreshToken;
  delete setup.gscCache;
  setup.gsc = false;
  await prisma.adveroWorkspace.update({
    where: { id: workspaceId },
    data: { setupState: setup as object },
  });
}
