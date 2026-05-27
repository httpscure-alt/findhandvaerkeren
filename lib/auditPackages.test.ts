import { describe, expect, it } from 'vitest';
import { recommendPlan } from './recommendPlan';
import {
  analyticsRecommendsSeo,
  buildResultsContinuePath,
  buildResultsGetStartedPath,
  recommendedPackageForResults,
  resultsPackageCopy,
} from './auditPackages';
import { wizardPatchFromAudit } from './getStartedAudit';
import type { VisibilityAuditResult } from './mockAnalyzeVisibility';

describe('auditPackages results defaults', () => {
  it('defaults to SEO Starter when analytics recommends ads only', () => {
    const rec = recommendPlan({
      scores: { search: 74, local: 72, ai: 68, web: 80 },
      goal: 'leads_now',
    });
    expect(rec.primaryService).toBe('ads');
    expect(analyticsRecommendsSeo(rec)).toBe(false);

    const pkg = recommendedPackageForResults(rec, 'audit-1');
    expect(pkg.id).toBe('starter');
    expect(pkg.ctaPath).toContain('seo=seo_basic');
    expect(pkg.ctaPath).not.toContain('ads_');

    const copy = resultsPackageCopy(rec, true);
    expect(copy.headline).toContain('SEO Starter');
  });

  it('follows analytics SEO tier when SEO is recommended', () => {
    const rec = recommendPlan({
      scores: { search: 78, local: 64, ai: 70, web: 85 },
      goal: 'long_term',
    });
    expect(rec.primaryService).toBe('seo');
    expect(analyticsRecommendsSeo(rec)).toBe(true);

    const pkg = recommendedPackageForResults(rec, 'audit-2');
    expect(pkg.ctaPath).toContain(`seo=${rec.primaryTierId}`);
    expect(analyticsRecommendsSeo(rec)).toBe(true);

    const copy = resultsPackageCopy(rec, false);
    expect(copy.headline).toBe(rec.headlineEn);

    const standardRec = recommendPlan({
      scores: { search: 50, local: 48, ai: 55, web: 60 },
      goal: 'long_term',
    });
    expect(standardRec.primaryTierId).toBe('seo_pro');
    const standardPkg = recommendedPackageForResults(standardRec, 'audit-2b');
    expect(standardPkg.id).toBe('seo');
    expect(standardPkg.ctaPath).toContain('seo=seo_pro');
  });

  it('follows SEO tier from growth recommendation (not forced Starter)', () => {
    const rec = recommendPlan({
      scores: { search: 58, local: 55, ai: 52, web: 60 },
      goal: 'both',
    });
    expect(rec.primaryService).toBe('growth');
    expect(rec.primaryTierId.startsWith('seo')).toBe(true);

    const pkg = recommendedPackageForResults(rec, 'audit-3');
    expect(pkg.ctaPath).toContain(`seo=${rec.primaryTierId}`);
    if (!rec.primaryTierId.includes('basic')) {
      expect(pkg.id).toBe('seo');
    }
  });

  it('buildResultsContinuePath uses analytics link when SEO recommended', () => {
    const rec = recommendPlan({
      scores: { search: 78, local: 64, ai: 70, web: 85 },
      goal: 'long_term',
    });
    expect(buildResultsContinuePath(rec, 'a')).toContain(`seo=${rec.primaryTierId}`);
  });

  it('wizardPatchFromAudit adds SEO Starter only when analytics has no SEO tier', () => {
    const audit = {
      id: 'a1',
      growthGoal: 'leads_now',
      industry: 'unknown',
      companyName: 'Test Co',
    } as VisibilityAuditResult;

    const adsRec = recommendPlan({
      scores: { search: 74, local: 72, ai: 68, web: 80 },
      goal: 'leads_now',
    });
    const adsPatch = wizardPatchFromAudit(audit, adsRec);
    expect(adsPatch.seoTier).toBe('seo_basic');
    expect(adsPatch.wantSeo).toBe(true);
    expect(adsPatch.wantAds).toBe(true);

    const seoRec = recommendPlan({
      scores: { search: 78, local: 64, ai: 70, web: 85 },
      goal: 'long_term',
    });
    const seoPatch = wizardPatchFromAudit(audit, seoRec);
    expect(seoPatch.seoTier).toBe(seoRec.primaryTierId);
    expect(seoPatch.wantAds).toBe(seoRec.wantAds);
  });
});
