/** Keys and helpers for Advero audit → checkout journey state in the browser. */

export const ADVERO_LAST_AUDIT_ID = 'advero.lastAuditId';
export const ADVERO_PAID_TIERS_KEY = 'advero.paidTiers';

export function markTierPaid(tierId: string): void {
  try {
    const raw = sessionStorage.getItem(ADVERO_PAID_TIERS_KEY);
    const set = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
    set.add(tierId);
    sessionStorage.setItem(ADVERO_PAID_TIERS_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

export function getPaidTiers(): Set<string> {
  try {
    const raw = sessionStorage.getItem(ADVERO_PAID_TIERS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/** Build query string for get-started, preserving plan selection through auth + Stripe. */
export function buildGetStartedQueryString(
  params: URLSearchParams,
  overrides?: { step?: number }
): string {
  const next = new URLSearchParams();
  for (const key of ['seo', 'ads', 'goal', 'industry', 'from', 'auditId'] as const) {
    const v = params.get(key);
    if (v) next.set(key, v);
  }
  if (overrides?.step) next.set('step', String(overrides.step));
  else {
    const step = params.get('step');
    if (step) next.set('step', step);
  }
  return next.toString();
}

export function getStartedPathWithQuery(queryString: string, step?: number): string {
  const p = new URLSearchParams(queryString);
  if (step) p.set('step', String(step));
  const q = p.toString();
  return `/advero/get-started${q ? `?${q}` : ''}`;
}
