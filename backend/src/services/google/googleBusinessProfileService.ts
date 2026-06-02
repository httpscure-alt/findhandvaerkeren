import { prisma } from '../../prisma/client';
import { isAdveroPrismaReady } from '../../prisma/client';
import { parseSetupState } from '../../lib/workspaceSetup';
import { getGoogleRedirectUri, signGoogleOAuthState, type GoogleOAuthState } from '../../lib/googleOAuth';

export type GoogleBusinessProfileSnapshot = {
  connected: boolean;
  source: 'google' | 'unavailable' | 'demo';
  syncedAt?: string;
};

type GbpCache = { connected?: boolean; syncedAt?: string };

function cacheToSnapshot(cache: GbpCache, source: GoogleBusinessProfileSnapshot['source']): GoogleBusinessProfileSnapshot {
  if (!cache.connected) return { connected: false, source: 'unavailable' };
  return { connected: true, source, syncedAt: cache.syncedAt };
}

export async function getGoogleBusinessProfileSnapshot(
  workspaceId?: string | null
): Promise<GoogleBusinessProfileSnapshot> {
  if (!workspaceId || !isAdveroPrismaReady()) return { connected: false, source: 'unavailable' };
  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) return { connected: false, source: 'unavailable' };

  const setup = parseSetupState(ws.setupState);
  const cache = (setup.gbpCache as GbpCache) || {};
  const hasToken = Boolean(setup.gbpRefreshToken);
  const source: GoogleBusinessProfileSnapshot['source'] =
    cache.connected && hasToken && cache.syncedAt ? 'google' : cache.connected ? 'demo' : 'unavailable';
  return cacheToSnapshot(cache, source);
}

export async function syncGoogleBusinessProfileForWorkspace(
  workspaceId: string
): Promise<GoogleBusinessProfileSnapshot> {
  if (!isAdveroPrismaReady()) return { connected: false, source: 'unavailable' };
  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) return { connected: false, source: 'unavailable' };

  const setup = parseSetupState(ws.setupState);
  if (!setup.gbpRefreshToken) return { connected: false, source: 'unavailable' };

  // Keep this intentionally lightweight for now: we store the refresh token and mark connected.
  // Actual GBP API reads/writes will be implemented once we define the exact ops workflows.
  const cache: GbpCache = { connected: true, syncedAt: new Date().toISOString() };
  await prisma.adveroWorkspace.update({
    where: { id: workspaceId },
    data: {
      setupState: {
        ...setup,
        gbp: true,
        gbpCache: cache,
      },
    },
  });
  return cacheToSnapshot(cache, 'google');
}

export function getGoogleBusinessProfileAuthUrl(state: GoogleOAuthState): string | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirect = getGoogleRedirectUri();
  if (!clientId || !redirect) return null;

  // GBP requires business.manage for account/location reads+writes.
  const scope = encodeURIComponent('https://www.googleapis.com/auth/business.manage');
  const signed = encodeURIComponent(signGoogleOAuthState(state));
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirect
  )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${signed}`;
}

export async function saveGbpRefreshToken(workspaceId: string, refreshToken: string): Promise<void> {
  if (!isAdveroPrismaReady()) return;
  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) throw new Error('Workspace not found');
  const setup = parseSetupState(ws.setupState);
  await prisma.adveroWorkspace.update({
    where: { id: workspaceId },
    data: {
      setupState: {
        ...setup,
        gbpRefreshToken: refreshToken,
        gbp: true,
      },
    },
  });
}

export async function disconnectGoogleBusinessProfile(workspaceId: string): Promise<void> {
  const ws = await prisma.adveroWorkspace.findUnique({ where: { id: workspaceId } });
  if (!ws) return;
  const setup = parseSetupState(ws.setupState);
  delete setup.gbpRefreshToken;
  delete setup.gbpCache;
  setup.gbp = false;
  await prisma.adveroWorkspace.update({ where: { id: workspaceId }, data: { setupState: setup as object } });
}

