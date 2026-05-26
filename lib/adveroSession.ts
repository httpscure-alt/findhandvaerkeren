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

export function adveroLoginPath(next: string = ADVERO_DASHBOARD_PATH): string {
  return `/advero/login?next=${encodeURIComponent(next)}`;
}
