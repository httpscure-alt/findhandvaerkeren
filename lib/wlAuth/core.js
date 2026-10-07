/**
 * White-label portal auth, shared by Vercel middleware (edge) and the Vite dev server (Node).
 * Uses only Web Crypto + Fetch API globals so it runs unchanged in both.
 *
 * Env:
 *   WL_SESSION_SECRET  random string used to sign session cookies
 *   WL_USERS           JSON: { "<brand>": { "email": "...", "salt": "<b64url>", "hash": "<b64url>" } }
 */

export const WL_BRANDS = ['juicebox', 'skipjack', 'suitmedia', 'artdigital'];
export const WL_PORTAL_SECTIONS = ['', 'login', 'dashboard', 'operations', 'clients', 'audits', 'reports', 'recommendations'];

const SESSION_TTL_SECONDS = 12 * 60 * 60;
const PBKDF2_ITERATIONS = 60_000;
const FAILED_LOGIN_DELAY_MS = 600;
const MAX_BODY_BYTES = 4_096;

const enc = new TextEncoder();

function b64url(bytes) {
  let s = '';
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(s) {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

export async function hashPassword(password, saltB64) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromB64url(saltB64), iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  return b64url(bits);
}

export function newSalt() {
  return b64url(crypto.getRandomValues(new Uint8Array(16)));
}

function readConfig(env) {
  const secret = env.WL_SESSION_SECRET;
  const users = env.WL_USERS ? JSON.parse(env.WL_USERS) : null;
  if (!secret || secret.length < 32 || !users) throw new Error('White-label auth is not configured');
  return { secret, users };
}

const cookieName = (brand) => `wl_s_${brand}`;

function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

function cookieAttrs(request, maxAge) {
  const { protocol, hostname } = new URL(request.url);
  const local = protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1');
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${local ? '' : '; Secure'}`;
}

async function createSession(brand, secret) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const body = `${brand}.${exp}`;
  return `${body}.${await hmac(secret, body)}`;
}

/** @returns {Promise<'valid' | 'expired' | 'missing' | 'invalid'>} */
async function sessionState(request, brand, secret) {
  const token = readCookie(request, cookieName(brand));
  if (!token) return 'missing';
  const [tBrand, tExp, sig] = token.split('.');
  if (tBrand !== brand || !/^\d+$/.test(tExp || '') || !sig) return 'invalid';
  if (!safeEqual(sig, await hmac(secret, `${tBrand}.${tExp}`))) return 'invalid';
  return Number(tExp) > Math.floor(Date.now() / 1000) ? 'valid' : 'expired';
}

const json = (status, body, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
  });

const redirect = (location) => new Response(null, { status: 302, headers: { location, 'cache-control': 'no-store' } });

async function readJsonBody(request) {
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) return null;
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return null;
  try {
    const body = JSON.parse(text);
    return body && typeof body === 'object' ? body : null;
  } catch {
    return null;
  }
}

async function login(request, config) {
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' }, { allow: 'POST' });
  const body = await readJsonBody(request);
  if (!body) return json(400, { error: 'bad_request' });
  const brand = String(body.brand || '');
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!WL_BRANDS.includes(brand)) return json(400, { error: 'unknown_portal' });
  if (!email || !password) return json(400, { error: 'missing_credentials' });

  const user = config.users[brand];
  const computed = await hashPassword(password, user?.salt || 'AAAAAAAAAAAAAAAAAAAAAA');
  const ok = !!user && safeEqual(email, String(user.email).toLowerCase()) && safeEqual(computed, user.hash);
  if (!ok) {
    await new Promise((r) => setTimeout(r, FAILED_LOGIN_DELAY_MS));
    return json(401, { error: 'invalid_credentials' });
  }
  const token = await createSession(brand, config.secret);
  return json(200, { ok: true }, { 'set-cookie': `${cookieName(brand)}=${token}; ${cookieAttrs(request, SESSION_TTL_SECONDS)}` });
}

async function logout(request) {
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' }, { allow: 'POST' });
  const body = await readJsonBody(request);
  const brand = String(body?.brand || '');
  if (!WL_BRANDS.includes(brand)) return json(400, { error: 'unknown_portal' });
  return json(200, { ok: true }, { 'set-cookie': `${cookieName(brand)}=; ${cookieAttrs(request, 0)}` });
}

/**
 * Handles portal auth for a request.
 * @returns {Promise<Response | null>} a response to send, or null to let the request through.
 */
export async function handleWhitelabelAuth(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/wl/login' || path === '/api/wl/logout' || path === '/api/wl/session') {
    const config = readConfig(env);
    if (path === '/api/wl/login') return login(request, config);
    if (path === '/api/wl/logout') return logout(request);
    const brand = url.searchParams.get('brand') || '';
    if (!WL_BRANDS.includes(brand)) return json(400, { error: 'unknown_portal' });
    const state = await sessionState(request, brand, config.secret);
    return state === 'valid' ? json(200, { ok: true }) : json(401, { error: state });
  }

  const data = path.match(/^\/wl-data\/([a-z]+)\.json$/);
  if (data) {
    const config = readConfig(env);
    if (!WL_BRANDS.includes(data[1])) return json(404, { error: 'not_found' });
    const state = await sessionState(request, data[1], config.secret);
    return state === 'valid' ? null : json(401, { error: state });
  }

  const [, brand = '', section = ''] = path.split('/');
  if (!WL_BRANDS.includes(brand)) return null;
  const config = readConfig(env);
  const state = await sessionState(request, brand, config.secret);
  const isLogin = section === '' || section === 'login';

  if (isLogin) return state === 'valid' ? redirect(`/${brand}/dashboard`) : null;
  if (state === 'valid') return null;

  const next = encodeURIComponent(path + url.search);
  return redirect(`/${brand}?${state === 'expired' ? 'expired=1&' : ''}next=${next}`);
}
