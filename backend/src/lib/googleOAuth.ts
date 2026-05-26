import crypto from 'crypto';

export type GoogleIntegrationProvider = 'gsc' | 'ads';

export interface GoogleOAuthState {
  provider: GoogleIntegrationProvider;
  workspaceId: string;
  userId: string;
}

function secret(): string {
  return process.env.JWT_SECRET || process.env.GOOGLE_OAUTH_STATE_SECRET || 'dev-oauth-state-secret';
}

export function signGoogleOAuthState(payload: GoogleOAuthState): string {
  const data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyGoogleOAuthState(state: string): GoogleOAuthState | null {
  const parts = state.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = crypto.createHmac('sha256', secret()).update(data).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as GoogleOAuthState;
    if (parsed.provider !== 'gsc' && parsed.provider !== 'ads') return null;
    if (!parsed.workspaceId || !parsed.userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function exchangeGoogleAuthCode(code: string, redirectUri: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required');
  }

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const json = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !json.access_token) {
    throw new Error(json.error_description || json.error || 'Google token exchange failed');
  }

  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expiry_date: json.expires_in ? Date.now() + json.expires_in * 1000 : undefined,
  };
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expiry_date?: number;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required');
  }

  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !json.access_token) {
    throw new Error(json.error_description || json.error || 'Google token refresh failed');
  }

  return {
    access_token: json.access_token,
    expiry_date: json.expires_in ? Date.now() + json.expires_in * 1000 : undefined,
  };
}

export function getGoogleRedirectUri(): string {
  return (
    process.env.GOOGLE_OAUTH_REDIRECT_URI ||
    process.env.GOOGLE_SEARCH_CONSOLE_REDIRECT_URI ||
    ''
  ).trim();
}
