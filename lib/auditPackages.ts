import type { MarketingTierId, PlanRecommendation } from './recommendPlan';
import { buildGetStartedPath, explainRecommendation } from './recommendPlan';

/** Fallback when analytics does not recommend any SEO tier. */
export const RESULTS_DEFAULT_SEO_TIER = 'seo_basic' as const;

/** SEO tier from analytics (primary or secondary), if any. */
export function seoTierFromRecommendation(rec: PlanRecommendation): MarketingTierId | null {
  if (rec.primaryTierId.startsWith('seo')) return rec.primaryTierId;
  if (rec.secondaryTierId?.startsWith('seo')) return rec.secondaryTierId;
  return null;
}

export function analyticsRecommendsSeo(rec: PlanRecommendation): boolean {
  return seoTierFromRecommendation(rec) !== null;
}

export type PackageCardId = 'starter' | 'seo' | 'ads' | 'growth';

export interface PackageCard {
  id: PackageCardId;
  nameDa: string;
  nameEn: string;
  descDa: string;
  descEn: string;
  recommended: boolean;
  ctaPath: string;
}

/** Deep link when analytics did not recommend SEO — offer SEO Starter as entry. */
export function buildResultsGetStartedPath(auditId?: string): string {
  return buildGetStartedPath(
    {
      wantSeo: true,
      wantAds: false,
      primaryTierId: RESULTS_DEFAULT_SEO_TIER,
      secondaryTierId: undefined,
    },
    { from: 'audit', auditId, step: 2 }
  );
}

/** Continue CTA: analytics path when SEO is recommended, else SEO Starter default. */
export function buildResultsContinuePath(rec: PlanRecommendation, auditId?: string): string {
  if (!analyticsRecommendsSeo(rec)) return buildResultsGetStartedPath(auditId);
  const gs = rec.ctaPath.replace(/step=\d+/, 'step=2');
  return gs.includes('step=') ? gs : `${gs}${gs.includes('?') ? '&' : '?'}step=2`;
}

/** Copy when we add SEO Starter because analytics did not recommend SEO. */
export function resultsSeoStarterFallbackCopy(isDa: boolean): { headline: string; reason: string } {
  return isDa
    ? {
        headline: 'Vi anbefaler SEO Starter',
        reason:
          'Analysen peger primært på Google Ads, men SEO Starter er et godt første skridt for organisk og lokal synlighed. I kan vælge andre planer, når I fortsætter.',
      }
    : {
        headline: 'We recommend SEO Starter',
        reason:
          'The analysis points mainly to Google Ads, but SEO Starter is a solid first step for organic and local visibility. You can choose other plans when you continue.',
      };
}

function defaultStarterPackageCard(auditId?: string): PackageCard {
  return {
    id: 'starter',
    nameDa: 'SEO Starter',
    nameEn: 'SEO Starter',
    descDa: 'Kom godt i gang med organisk og lokal synlighed — lav risiko, klar opgraderingssti.',
    descEn: 'Get started with organic and local visibility — low risk, clear path to upgrade.',
    recommended: true,
    ctaPath: buildResultsGetStartedPath(auditId),
  };
}

function packageCardForSeoTier(
  rec: PlanRecommendation,
  seoTier: MarketingTierId,
  auditId?: string
): PackageCard {
  const base = { from: 'audit', auditId, step: 2 as const };
  const isBasic = seoTier === 'seo_basic';
  const ctaPath = buildGetStartedPath(
    {
      wantSeo: true,
      wantAds: rec.wantAds,
      primaryTierId: rec.primaryTierId,
      secondaryTierId: rec.secondaryTierId,
    },
    base
  );

  if (isBasic) {
    return { ...defaultStarterPackageCard(auditId), ctaPath };
  }

  return {
    id: 'seo',
    nameDa: 'SEO',
    nameEn: 'SEO',
    descDa: 'Langsigtet organisk og lokal synlighed.',
    descEn: 'Long-term organic and local visibility.',
    recommended: true,
    ctaPath,
  };
}

/** One package for the free audit results page (no full pricing matrix). */
export function recommendedPackageForResults(
  rec: PlanRecommendation,
  auditId?: string
): PackageCard {
  const seoTier = seoTierFromRecommendation(rec);
  if (!seoTier) return defaultStarterPackageCard(auditId);

  if (rec.primaryService === 'growth' || rec.primaryService === 'seo') {
    return packageCardForSeoTier(rec, seoTier, auditId);
  }

  if (rec.primaryService === 'ads' && seoTier) {
    return packageCardForSeoTier(rec, seoTier, auditId);
  }

  const cards = buildPackageCards(rec, auditId);
  const flagged = cards.filter((c) => c.recommended);
  if (flagged.length === 1) return flagged[0];

  const preferId: PackageCardId = seoTier.includes('basic') ? 'starter' : 'seo';
  return flagged.find((c) => c.id === preferId) ?? cards.find((c) => c.id === preferId) ?? cards[0];
}

export function resultsPackageCopy(
  rec: PlanRecommendation,
  isDa: boolean
): { headline: string; reason: string } {
  if (!analyticsRecommendsSeo(rec)) return resultsSeoStarterFallbackCopy(isDa);
  return explainRecommendation(rec, isDa ? 'da' : 'en');
}

/** Display packages for results screen — recommendation highlighted. */
export function buildPackageCards(rec: PlanRecommendation, auditId?: string): PackageCard[] {
  const base = { from: 'audit', auditId, step: 2 as const };
  const isRecSeo = rec.primaryService === 'seo' || rec.primaryService === 'growth';
  const isRecAds = rec.primaryService === 'ads' || rec.primaryService === 'growth';
  const isRecGrowth = rec.primaryService === 'growth';

  return [
    {
      id: 'starter',
      nameDa: 'Starter',
      nameEn: 'Starter',
      descDa: 'Kom godt i gang med én kanal og rolig optimering.',
      descEn: 'Get started with one channel and steady optimization.',
      recommended: !isRecGrowth && rec.primaryTierId.includes('basic'),
      ctaPath: buildGetStartedPath(
        { wantSeo: true, wantAds: false, primaryTierId: 'seo_basic', secondaryTierId: undefined },
        base
      ),
    },
    {
      id: 'seo',
      nameDa: 'SEO',
      nameEn: 'SEO',
      descDa: 'Langsigtet organisk og lokal synlighed.',
      descEn: 'Long-term organic and local visibility.',
      recommended: isRecSeo && !isRecGrowth,
      ctaPath: buildGetStartedPath(
        {
          wantSeo: true,
          wantAds: Boolean(rec.wantAds && rec.secondaryService === 'ads'),
          primaryTierId: rec.wantSeo ? rec.primaryTierId : 'seo_standard',
          secondaryTierId: rec.secondaryTierId,
        },
        base
      ),
    },
    {
      id: 'ads',
      nameDa: 'Google Ads',
      nameEn: 'Google Ads',
      descDa: 'Synlighed og henvendelser med det samme.',
      descEn: 'Visibility and inquiries right away.',
      recommended: isRecAds && !isRecGrowth,
      ctaPath: buildGetStartedPath(
        {
          wantAds: true,
          wantSeo: Boolean(rec.wantSeo && rec.secondaryService === 'seo'),
          primaryTierId: rec.wantAds ? rec.primaryTierId : 'ads_standard',
          secondaryTierId: rec.secondaryTierId,
        },
        base
      ),
    },
    {
      id: 'growth',
      nameDa: 'Growth+',
      nameEn: 'Growth+',
      descDa: 'SEO + Google Ads + AI-synlighed i én plan.',
      descEn: 'SEO + Google Ads + AI visibility in one plan.',
      recommended: isRecGrowth,
      ctaPath: buildGetStartedPath(rec, base),
    },
  ];
}
