import { RESULTS_DEFAULT_SEO_TIER, seoTierFromRecommendation } from './auditPackages';
import type { GrowthGoal, IndustryCategory, PlanRecommendation } from './recommendPlan';
import { recommendPlan } from './recommendPlan';
import {
  loadAuditFromSession,
  saveAuditToSession,
  type VisibilityAuditResult,
} from './mockAnalyzeVisibility';
import { ADVERO_LAST_AUDIT_ID } from './adveroJourney';

export type GetStartedWizardPatch = {
  fromReport: boolean;
  growthGoal: GrowthGoal;
  industry: IndustryCategory;
  wantAds: boolean;
  wantSeo: boolean;
  adsTier: string | null;
  seoTier: string | null;
  billingName?: string;
  auditId?: string;
};

export function resolveGetStartedAuditId(urlAuditId: string | null): string | null {
  if (urlAuditId?.trim()) return urlAuditId.trim();
  try {
    return sessionStorage.getItem(ADVERO_LAST_AUDIT_ID);
  } catch {
    return null;
  }
}

export function recommendationForAudit(audit: VisibilityAuditResult): PlanRecommendation {
  return (
    audit.recommendation ??
    recommendPlan({
      scores: audit.scores,
      goal: audit.growthGoal,
      industry: audit.industry,
      auditId: audit.id,
    })
  );
}

/** Map audit + plan recommendation → get-started wizard selections. */
export function wizardPatchFromAudit(
  audit: VisibilityAuditResult,
  rec: PlanRecommendation
): GetStartedWizardPatch {
  const adsTier =
    rec.wantAds && rec.primaryTierId.startsWith('ads')
      ? rec.primaryTierId
      : rec.wantAds && rec.secondaryTierId?.startsWith('ads')
        ? rec.secondaryTierId
        : rec.wantAds
          ? 'ads_standard'
          : null;

  const seoFromRec = seoTierFromRecommendation(rec);
  const seoTier = seoFromRec ?? RESULTS_DEFAULT_SEO_TIER;
  const wantSeo = rec.wantSeo || !seoFromRec;

  return {
    fromReport: true,
    growthGoal: audit.growthGoal,
    industry: audit.industry,
    wantAds: rec.wantAds,
    wantSeo,
    adsTier,
    seoTier,
    billingName: audit.companyName,
    auditId: audit.id,
  };
}

export async function fetchAuditForGetStarted(
  auditId: string,
  fetcher: (id: string) => Promise<{ audit: VisibilityAuditResult }>
): Promise<VisibilityAuditResult | null> {
  const cached = loadAuditFromSession(auditId);
  if (cached?.status === 'complete' && cached.scores) return cached;

  try {
    const { audit } = await fetcher(auditId);
    if (audit?.status === 'complete' && audit.scores) {
      saveAuditToSession(audit);
      return audit;
    }
  } catch {
    /* fall through */
  }
  return cached;
}
