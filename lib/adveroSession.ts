/** True when a client session exists in localStorage (avoids post-login route-guard race). */
export function hasStoredAdveroSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return Boolean(token && user);
  } catch {
    return false;
  }
}

export const ADVERO_DASHBOARD_PATH = '/advero/dashboard';
export const ADVERO_ADMIN_PATH = '/advero/admin';

export function safeAdveroNext(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}

type AdveroRole = 'CONSUMER' | 'PARTNER' | 'ADMIN';

export function isAdveroInternalAdmin(role?: string | null): boolean {
  return role === 'ADMIN' || role === 'SUPERADMIN';
}

export function getStoredAdveroUserRole(): AdveroRole | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const role = (JSON.parse(raw) as { role?: string }).role;
    return role === 'ADMIN' || role === 'PARTNER' || role === 'CONSUMER' ? role : null;
  } catch {
    return null;
  }
}

function isClientDashboardPath(path: string): boolean {
  return path === ADVERO_DASHBOARD_PATH || path.startsWith(`${ADVERO_DASHBOARD_PATH}/`);
}

/** Post-login destination: admins → internal dashboard unless `next` is a specific non-client path. */
export function resolveAdveroPostLoginPath(
  next: string | null,
  role?: AdveroRole | string | null
): string {
  const resolvedRole = role ?? getStoredAdveroUserRole();

  if (isAdveroInternalAdmin(resolvedRole)) {
    const explicit = safeAdveroNext(next);
    if (explicit && !isClientDashboardPath(explicit)) return explicit;
    return ADVERO_ADMIN_PATH;
  }

  const explicit = safeAdveroNext(next);
  if (explicit) return explicit;
  return ADVERO_DASHBOARD_PATH;
}

export function adveroLoginPath(next: string = ADVERO_DASHBOARD_PATH): string {
  return `/advero/login?next=${encodeURIComponent(next)}`;
}
