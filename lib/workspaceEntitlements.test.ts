import { describe, expect, it } from 'vitest';
import {
  PACKAGE_ENTITLEMENTS,
  entitlementsFromSubscription,
  isDashboardNavModuleEnabled,
} from './workspaceEntitlements';

describe('workspaceEntitlements', () => {
  it('maps SEO Starter to starter package flags', () => {
    const e = entitlementsFromSubscription('seo_basic', 'seo');
    expect(e).toMatchObject(PACKAGE_ENTITLEMENTS.starter);
    expect(e.packageId).toBe('starter');
  });

  it('maps Google Ads to SEM flags', () => {
    const e = entitlementsFromSubscription('ads_standard', 'ads');
    expect(e).toMatchObject(PACKAGE_ENTITLEMENTS.sem);
    expect(isDashboardNavModuleEnabled('campaigns', e)).toBe(true);
    expect(isDashboardNavModuleEnabled('visibility', e)).toBe(false);
  });

  it('maps Growth+ bundle to all flags', () => {
    const e = entitlementsFromSubscription('growth_bundle', 'growth');
    expect(e).toMatchObject(PACKAGE_ENTITLEMENTS.growth_plus);
    expect(isDashboardNavModuleEnabled('visibility', e)).toBe(true);
    expect(isDashboardNavModuleEnabled('campaigns', e)).toBe(true);
    expect(isDashboardNavModuleEnabled('aiVisibility', e)).toBe(true);
  });

  it('maps future AI Visibility tier', () => {
    const e = entitlementsFromSubscription('ai_visibility_basic', 'ai_visibility');
    expect(e).toMatchObject(PACKAGE_ENTITLEMENTS.ai_visibility);
    expect(isDashboardNavModuleEnabled('aiVisibility', e)).toBe(true);
    expect(isDashboardNavModuleEnabled('visibility', e)).toBe(true);
  });
});
