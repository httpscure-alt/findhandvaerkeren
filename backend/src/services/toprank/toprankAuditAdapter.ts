import type { CreateAuditPayload } from '../visibilityAuditService';
import { fetchTopRankAudit, isTopRankEnabled } from './toprankClient';
import type { TopRankAuditResponse, TopRankNormalizedResult } from './toprankTypes';

function clamp(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Map TopRank score keys → Advero audit channels (edit when TopRank schema is known). */
function mapScores(raw: TopRankAuditResponse['scores'] = {}): TopRankNormalizedResult['scores'] {
  const search = raw.search ?? raw.organic ?? 0;
  const local = raw.local ?? raw.maps ?? 0;
  const ai = raw.ai ?? raw.llm ?? 0;
  const web = raw.web ?? raw.organic ?? search;
  return {
    search: clamp(search),
    local: clamp(local),
    ai: clamp(ai),
    web: clamp(web),
  };
}

export async function analyzeWithTopRank(
  payload: CreateAuditPayload,
  auditId: string
): Promise<TopRankNormalizedResult | null> {
  if (!isTopRankEnabled()) return null;

  const raw = await fetchTopRankAudit({
    companyName: payload.companyName,
    websiteUrl: payload.websiteUrl,
    serviceArea: payload.serviceArea,
    industry: payload.industry,
    growthGoal: payload.growthGoal,
    externalId: auditId,
  });

  if (!raw || raw.status === 'failed') return null;
  if (raw.status === 'pending') {
    // Future: poll TOPRANK_AUDIT_STATUS_PATH — for now fall back to mock in service layer
    return null;
  }

  const scores = mapScores(raw.scores);
  const topRecommendation =
    raw.topInsight ||
    raw.insights?.[0] ||
    'Review channel scores and follow the recommended plan in your preview report.';

  return {
    scores,
    overallScore: raw.overallScore,
    delta: raw.delta,
    topRecommendation,
    raw,
  };
}
