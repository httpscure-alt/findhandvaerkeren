import { GoogleAdsApi } from 'google-ads-api';
import { prisma } from '../../prisma/client';
import { isAdveroPrismaReady } from '../../prisma/client';
import { logger } from '../../config/logger';
import { parseSetupState } from '../../lib/workspaceSetup';
import {
  getGoogleRedirectUri,
  signGoogleOAuthState,
  type GoogleOAuthState,
} from '../../lib/googleOAuth';
import type {
  GoogleAdsAccountOption,
  GoogleAdsCache,
  GoogleAdsCampaignRow,
  GoogleAdsSnapshot,
} from '../../lib/googleAdsTypes';

function formatDkkFromMicros(micros: number): string {
  const dkk = micros / 1_000_000;
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    maximumFractionDigits: 0,
  }).format(dkk);
}

function cacheToSnapshot(
  cache: GoogleAdsCache,
  source: GoogleAdsSnapshot['source'],
  pendingAccountSelection?: boolean
): GoogleAdsSnapshot {
  if (!cache.connected && !pendingAccountSelection) {
    return { connected: false, source: 'unavailable' };
  }
  return {
    connected: Boolean(cache.connected),
    customerId: cache.customerId,
    customerName: cache.customerName,
    impressions: cache.impressions,
    clicks: cache.clicks,
    conversions: cache.conversions,
    costDkk: cache.costMicros != null ? formatDkkFromMicros(cache.costMicros) : undefined,
    campaigns: cache.campaigns,
    syncedAt: cache.syncedAt,
    source,
    pendingAccountSelection,
  };
}

function isGoogleAdsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_ADS_DEVELOPER_TOKEN
  );
}

function createAdsClient() {
  return new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
  });
}

function customerClient(refreshToken: string, customerId: string) {
  const api = createAdsClient();
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.replace(/\D/g, '');
  return api.Customer({
    customer_id: customerId.replace(/\D/g, ''),
    refresh_token: refreshToken,
    ...(loginCustomerId ? { login_customer_id: loginCustomerId } : {}),
  });
}

export async function getGoogleAdsSnapshot(workspaceId?: string | null): Promise<GoogleAdsSnapshot> {
  if (!workspaceId || !isAdveroPrismaReady()) {
    return { connected: false, source: 'unavailable' };
  }

  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) return { connected: false, source: 'unavailable' };

  const setup = parseSetupState(ws.setupState);
  const cache = (setup.googleAdsCache as GoogleAdsCache) || {};
  const hasToken = Boolean(setup.googleAdsRefreshToken);
  const pending = hasToken && !setup.googleAdsCustomerId;

  if (pending) {
    return { connected: false, source: 'unavailable', pendingAccountSelection: true };
  }

  const source: GoogleAdsSnapshot['source'] =
    cache.connected && hasToken && cache.syncedAt ? 'google' : cache.connected ? 'demo' : 'unavailable';

  return cacheToSnapshot(cache, source);
}

export async function listGoogleAdsAccounts(workspaceId: string): Promise<GoogleAdsAccountOption[]> {
  if (!isGoogleAdsConfigured()) {
    throw new Error('Google Ads API is not configured (missing developer token or OAuth credentials)');
  }

  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) throw new Error('Workspace not found');

  const setup = parseSetupState(ws.setupState);
  const refreshToken = setup.googleAdsRefreshToken as string | undefined;
  if (!refreshToken) throw new Error('Google Ads not connected');

  const api = createAdsClient();
  const customers = await api.listAccessibleCustomers(refreshToken);
  const resourceNames = customers.resource_names || [];

  const options: GoogleAdsAccountOption[] = [];

  for (const resource of resourceNames.slice(0, 25)) {
    const customerId = resource.replace('customers/', '');
    try {
      const customer = customerClient(refreshToken, customerId);
      const [row] = await customer.query(`
        SELECT
          customer.id,
          customer.descriptive_name,
          customer.manager
        FROM customer
        LIMIT 1
      `);
      const c = row?.customer;
      options.push({
        customerId,
        descriptiveName: c?.descriptive_name || `Account ${customerId}`,
        manager: Boolean(c?.manager),
      });
    } catch (err) {
      logger.warn('Skipped inaccessible Google Ads customer', { customerId, error: (err as Error).message });
    }
  }

  return options.filter((o) => !o.manager);
}

export async function selectGoogleAdsCustomer(
  workspaceId: string,
  customerId: string
): Promise<GoogleAdsSnapshot> {
  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) throw new Error('Workspace not found');

  const setup = parseSetupState(ws.setupState);
  const cleanId = customerId.replace(/\D/g, '');
  await prisma.adveroWorkspace.update({
    where: { id: workspaceId },
    data: {
      setupState: {
        ...setup,
        googleAdsCustomerId: cleanId,
        ads: true,
      },
    },
  });

  return syncGoogleAdsForWorkspace(workspaceId);
}

export async function syncGoogleAdsForWorkspace(workspaceId: string): Promise<GoogleAdsSnapshot> {
  if (!isAdveroPrismaReady()) {
    return { connected: false, source: 'unavailable' };
  }

  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) return { connected: false, source: 'unavailable' };

  const setup = parseSetupState(ws.setupState);
  const refreshToken = setup.googleAdsRefreshToken as string | undefined;
  const customerId = setup.googleAdsCustomerId as string | undefined;

  if (!refreshToken) {
    return { connected: false, source: 'unavailable' };
  }

  if (!customerId) {
    return { connected: false, source: 'unavailable', pendingAccountSelection: true };
  }

  if (!isGoogleAdsConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      const cache = demoGoogleAdsCache(ws.companyName, customerId);
      await prisma.adveroWorkspace.update({
        where: { id: workspaceId },
        data: {
          setupState: { ...setup, googleAdsCache: cache, ads: true },
        },
      });
      return cacheToSnapshot(cache, 'demo');
    }
    throw new Error('Google Ads API is not configured');
  }

  try {
    const customer = customerClient(refreshToken, customerId);

    const [nameRow] = await customer.query(`
      SELECT customer.descriptive_name
      FROM customer
      LIMIT 1
    `);

    const rows = await customer.query(`
      SELECT
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM campaign
      WHERE segments.date DURING LAST_30_DAYS
        AND campaign.status != 'REMOVED'
    `);

    let impressions = 0;
    let clicks = 0;
    let costMicros = 0;
    let conversions = 0;
    const byCampaign = new Map<string, GoogleAdsCampaignRow>();

    for (const row of rows) {
      const name = row.campaign?.name || 'Campaign';
      const imp = Number(row.metrics?.impressions ?? 0);
      const clk = Number(row.metrics?.clicks ?? 0);
      const cost = Number(row.metrics?.cost_micros ?? 0);
      const conv = Number(row.metrics?.conversions ?? 0);

      impressions += imp;
      clicks += clk;
      costMicros += cost;
      conversions += conv;

      const prev = byCampaign.get(name) || {
        name,
        impressions: 0,
        clicks: 0,
        costMicros: 0,
        conversions: 0,
      };
      prev.impressions += imp;
      prev.clicks += clk;
      prev.costMicros += cost;
      prev.conversions += conv;
      byCampaign.set(name, prev);
    }

    const cache: GoogleAdsCache = {
      connected: true,
      customerId,
      customerName: nameRow?.customer?.descriptive_name || ws.companyName,
      impressions,
      clicks,
      costMicros,
      conversions: Math.round(conversions * 10) / 10,
      campaigns: [...byCampaign.values()].sort((a, b) => b.clicks - a.clicks).slice(0, 12),
      syncedAt: new Date().toISOString(),
    };

    await prisma.adveroWorkspace.update({
      where: { id: workspaceId },
      data: {
        setupState: {
          ...setup,
          ads: true,
          googleAdsCache: cache,
        },
      },
    });

    return cacheToSnapshot(cache, 'google');
  } catch (err) {
    logger.error('Google Ads sync failed', { workspaceId, error: (err as Error).message });
    const existing = (setup.googleAdsCache as GoogleAdsCache) || {};
    if (existing.connected) {
      return cacheToSnapshot(existing, 'demo');
    }
    throw err;
  }
}

export function demoGoogleAdsCache(companyName: string, customerId: string): GoogleAdsCache {
  const seed = companyName.length * 11;
  const clicks = 14 + (seed % 12);
  const impressions = clicks * (9 + (seed % 4));
  return {
    connected: true,
    customerId,
    customerName: companyName,
    impressions,
    clicks,
    costMicros: (1200 + (seed % 800)) * 1_000_000,
    conversions: 3 + (seed % 5),
    campaigns: [
      { name: 'Local search', clicks: Math.floor(clicks * 0.55), impressions: Math.floor(impressions * 0.5), costMicros: 650_000_000, conversions: 2 },
      { name: 'Brand', clicks: Math.ceil(clicks * 0.45), impressions: Math.ceil(impressions * 0.5), costMicros: 420_000_000, conversions: 1 },
    ],
    syncedAt: new Date().toISOString(),
  };
}

export function getGoogleAdsAuthUrl(state: GoogleOAuthState): string | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirect = getGoogleRedirectUri();
  if (!clientId || !redirect) return null;

  const scope = encodeURIComponent('https://www.googleapis.com/auth/adwords');
  const signed = encodeURIComponent(signGoogleOAuthState(state));
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${signed}`;
}

export async function saveGoogleAdsRefreshToken(workspaceId: string, refreshToken: string): Promise<void> {
  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) throw new Error('Workspace not found');

  const setup = parseSetupState(ws.setupState);
  await prisma.adveroWorkspace.update({
    where: { id: workspaceId },
    data: {
      setupState: {
        ...setup,
        googleAdsRefreshToken: refreshToken,
        googleAdsCustomerId: undefined,
        googleAdsCache: undefined,
        ads: false,
      },
    },
  });
}

export async function disconnectGoogleAds(workspaceId: string): Promise<void> {
  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) return;
  const setup = parseSetupState(ws.setupState);
  delete setup.googleAdsRefreshToken;
  delete setup.googleAdsCustomerId;
  delete setup.googleAdsCache;
  setup.ads = false;
  await prisma.adveroWorkspace.update({
    where: { id: workspaceId },
    data: { setupState: setup as object },
  });
}
