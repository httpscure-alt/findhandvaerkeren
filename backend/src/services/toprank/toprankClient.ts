import { logger } from '../../config/logger';
import type { TopRankAuditRequest, TopRankAuditResponse } from './toprankTypes';

const DEFAULT_TIMEOUT_MS = 45_000;

export function isTopRankEnabled(): boolean {
  const url = process.env.TOPRANK_API_URL?.trim();
  const enabled = process.env.TOPRANK_AUDIT_ENABLED !== 'false';
  return enabled && Boolean(url);
}

/**
 * Calls TopRank visibility audit API.
 * Set TOPRANK_API_URL (e.g. https://api.toprank.example) and TOPRANK_API_KEY in backend .env
 */
export async function fetchTopRankAudit(
  payload: TopRankAuditRequest
): Promise<TopRankAuditResponse | null> {
  const base = process.env.TOPRANK_API_URL?.replace(/\/$/, '');
  if (!base) return null;

  const path = process.env.TOPRANK_AUDIT_PATH || '/v1/visibility-audit';
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const apiKey = process.env.TOPRANK_API_KEY?.trim();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        ...(process.env.TOPRANK_API_HEADER
          ? { [process.env.TOPRANK_API_HEADER]: apiKey || '' }
          : {}),
      },
      body: JSON.stringify({
        company_name: payload.companyName,
        website_url: payload.websiteUrl,
        service_area: payload.serviceArea,
        industry: payload.industry,
        growth_goal: payload.growthGoal,
        external_id: payload.externalId,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      logger.warn('TopRank audit HTTP error', { status: res.status, body: text.slice(0, 500) });
      return null;
    }

    return (await res.json()) as TopRankAuditResponse;
  } catch (err: any) {
    logger.warn('TopRank audit request failed', { message: err?.message });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
