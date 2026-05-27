/**
 * Advero workspace feature flags — keep in sync with `/lib/workspaceEntitlements.ts`.
 */

export type WorkspaceEntitlementKey = 'seo' | 'ads' | 'aiVisibility';

export type ProductPackageId = 'starter' | 'seo' | 'sem' | 'ai_visibility' | 'growth_plus';

export interface WorkspaceEntitlements {
  seo: boolean;
  ads: boolean;
  aiVisibility: boolean;
  packageId: ProductPackageId | null;
  tierId: string | null;
  serviceLine: string | null;
}

export const PACKAGE_ENTITLEMENTS: Record<
  ProductPackageId,
  Pick<WorkspaceEntitlements, 'seo' | 'ads' | 'aiVisibility'>
> = {
  starter: { seo: true, ads: false, aiVisibility: false },
  seo: { seo: true, ads: false, aiVisibility: false },
  sem: { seo: false, ads: true, aiVisibility: false },
  ai_visibility: { seo: true, ads: false, aiVisibility: true },
  growth_plus: { seo: true, ads: true, aiVisibility: true },
};

const NO_ENTITLEMENTS: WorkspaceEntitlements = {
  seo: false,
  ads: false,
  aiVisibility: false,
  packageId: null,
  tierId: null,
  serviceLine: null,
};

export function entitlementsFromSubscription(
  tierId: string | null | undefined,
  serviceLine?: string | null
): WorkspaceEntitlements {
  const tier = (tierId || '').toLowerCase();
  const line = (serviceLine || '').toLowerCase();

  if (!tier && !line) return { ...NO_ENTITLEMENTS };

  if (tier === 'growth_bundle' || line === 'growth') {
    return {
      ...PACKAGE_ENTITLEMENTS.growth_plus,
      packageId: 'growth_plus',
      tierId: tierId ?? null,
      serviceLine: line || 'growth',
    };
  }

  if (tier.startsWith('ai_visibility') || line === 'ai_visibility' || line === 'ai') {
    return {
      ...PACKAGE_ENTITLEMENTS.ai_visibility,
      packageId: 'ai_visibility',
      tierId: tierId ?? null,
      serviceLine: line || 'ai_visibility',
    };
  }

  if (tier.startsWith('ads_') || line === 'ads') {
    return {
      ...PACKAGE_ENTITLEMENTS.sem,
      packageId: 'sem',
      tierId: tierId ?? null,
      serviceLine: line || 'ads',
    };
  }

  if (tier.startsWith('seo_') || line === 'seo') {
    const packageId: ProductPackageId = tier === 'seo_basic' ? 'starter' : 'seo';
    return {
      ...PACKAGE_ENTITLEMENTS[packageId],
      packageId,
      tierId: tierId ?? null,
      serviceLine: line || 'seo',
    };
  }

  return { ...NO_ENTITLEMENTS, tierId: tierId ?? null, serviceLine: line || null };
}

export function entitlementsFromSetupState(
  setupState: Record<string, unknown> | null | undefined
): WorkspaceEntitlements | null {
  if (!setupState || typeof setupState !== 'object') return null;
  const raw = setupState.entitlements;
  if (!raw || typeof raw !== 'object') return null;
  const e = raw as Record<string, unknown>;
  if (typeof e.seo !== 'boolean' && typeof e.ads !== 'boolean' && typeof e.aiVisibility !== 'boolean') {
    return null;
  }
  return {
    seo: Boolean(e.seo),
    ads: Boolean(e.ads),
    aiVisibility: Boolean(e.aiVisibility),
    packageId: (setupState.packageId as ProductPackageId) ?? null,
    tierId: (setupState.tierId as string) ?? null,
    serviceLine: null,
  };
}

export type SubscriptionItemRecord = {
  serviceType: 'seo' | 'ads';
  tierId: string;
};

export function entitlementsFromItems(items: SubscriptionItemRecord[]): WorkspaceEntitlements {
  let seo = false;
  let ads = false;
  for (const item of items) {
    if (item.serviceType === 'seo') seo = true;
    if (item.serviceType === 'ads') ads = true;
  }
  const packageId =
    seo && ads ? 'growth_plus' : seo ? 'seo' : ads ? 'sem' : null;
  return {
    seo,
    ads,
    aiVisibility: false,
    packageId,
    tierId: items.length === 1 ? items[0].tierId : items.length >= 2 ? 'combined' : null,
    serviceLine: items.length === 1 ? items[0].serviceType : null,
  };
}

export function resolveWorkspaceEntitlements(input: {
  tierId?: string | null;
  serviceLine?: string | null;
  setupState?: Record<string, unknown> | null;
}): WorkspaceEntitlements {
  const fromState = entitlementsFromSetupState(input.setupState);
  if (fromState) return fromState;

  const rawItems = input.setupState?.subscriptionItems;
  if (Array.isArray(rawItems) && rawItems.length > 0) {
    const items = rawItems
      .filter((x): x is SubscriptionItemRecord => {
        const o = x as Record<string, unknown>;
        return o?.serviceType === 'seo' || o?.serviceType === 'ads';
      })
      .map((x) => {
        const o = x as Record<string, unknown>;
        return {
          serviceType: o.serviceType as 'seo' | 'ads',
          tierId: String(o.tierId || ''),
        };
      });
    if (items.length > 0) return entitlementsFromItems(items);
  }

  return entitlementsFromSubscription(input.tierId, input.serviceLine);
}

export type DashboardNavModule = 'visibility' | 'aiVisibility' | 'campaigns';

export function isDashboardNavModuleEnabled(
  module: DashboardNavModule,
  entitlements: WorkspaceEntitlements
): boolean {
  switch (module) {
    case 'visibility':
      return entitlements.seo;
    case 'aiVisibility':
      return entitlements.aiVisibility;
    case 'campaigns':
      return entitlements.ads;
    default:
      return true;
  }
}

export function packageLabel(entitlements: WorkspaceEntitlements, lang: 'da' | 'en' = 'da'): string {
  const isDa = lang === 'da';
  if (!entitlements.packageId) return isDa ? 'Ingen aktiv plan' : 'No active plan';
  const labels: Record<ProductPackageId, { da: string; en: string }> = {
    starter: { da: 'SEO Starter', en: 'SEO Starter' },
    seo: { da: 'SEO', en: 'SEO' },
    sem: { da: 'Google Ads', en: 'Google Ads' },
    ai_visibility: { da: 'AI Visibility', en: 'AI Visibility' },
    growth_plus: { da: 'Growth+', en: 'Growth+' },
  };
  const row = labels[entitlements.packageId];
  return isDa ? row.da : row.en;
}
