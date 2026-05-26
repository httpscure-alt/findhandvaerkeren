import type { PlanRecommendation } from './recommendPlan';
import { buildGetStartedPath } from './recommendPlan';

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

/** One package for the free audit results page (no full pricing matrix). */
export function recommendedPackageForResults(
  rec: PlanRecommendation,
  auditId?: string
): PackageCard {
  const cards = buildPackageCards(rec, auditId);
  const flagged = cards.filter((c) => c.recommended);
  if (flagged.length === 1) return flagged[0];

  const byService: Record<string, PackageCardId> = {
    growth: 'growth',
    ads: 'ads',
    seo: rec.primaryTierId.includes('basic') ? 'starter' : 'seo',
  };
  const preferId = byService[rec.primaryService] ?? 'seo';
  return flagged.find((c) => c.id === preferId) ?? cards.find((c) => c.id === preferId) ?? cards[0];
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
