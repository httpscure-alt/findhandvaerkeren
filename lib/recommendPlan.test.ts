import { describe, expect, it } from 'vitest';
import { recommendPlan, buildGetStartedPath } from './recommendPlan';

describe('recommendPlan', () => {
  it('recommends SEO when local is weakest and goal is long_term', () => {
    const rec = recommendPlan({
      scores: { search: 78, local: 64, ai: 70, web: 85 },
      goal: 'long_term',
    });
    expect(rec.primaryService).toBe('seo');
    expect(rec.primaryTierId.startsWith('seo')).toBe(true);
    expect(rec.weakestChannel).toBe('local');
  });

  it('recommends ads when goal is leads_now and search/local are decent', () => {
    const rec = recommendPlan({
      scores: { search: 74, local: 72, ai: 68, web: 80 },
      goal: 'leads_now',
    });
    expect(rec.primaryService).toBe('ads');
    expect(rec.primaryTierId.startsWith('ads')).toBe(true);
  });

  it('recommends growth when many channels are weak', () => {
    const rec = recommendPlan({
      scores: { search: 58, local: 55, ai: 52, web: 60 },
      goal: 'both',
    });
    expect(rec.primaryService).toBe('growth');
    expect(rec.wantSeo && rec.wantAds).toBe(true);
  });

  it('builds get-started deep link with tiers', () => {
    const rec = recommendPlan({
      scores: { search: 78, local: 71, ai: 64, web: 85 },
      goal: 'both',
    });
    expect(rec.ctaPath).toContain('/advero/get-started');
    expect(rec.ctaPath).toContain('from=report');
  });

  it('is deterministic for same inputs', () => {
    const input = { scores: { search: 72, local: 71, ai: 64, web: 85 }, goal: 'both' as const };
    const a = recommendPlan(input);
    const b = recommendPlan(input);
    expect(a.primaryTierId).toBe(b.primaryTierId);
    expect(a.primaryService).toBe(b.primaryService);
  });
});
