import type { AdveroDashboardApiPayload } from './adveroDashboardApi';
import { mockAnalyzeVisibility } from './mockAnalyzeVisibility';
import { recommendPlan } from './recommendPlan';
import { buildVisibilityIntelligence } from './visibilityIntelligence';
import {
  entitlementsFromSubscription,
  packageLabel,
  type ProductPackageId,
  type WorkspaceEntitlements,
} from './workspaceEntitlements';

export type DashboardPreviewModeId = 'none' | 'starter' | 'seo' | 'sem' | 'ai_visibility' | 'growth';

export type DashboardPreviewMode = {
  id: DashboardPreviewModeId;
  labelDa: string;
  labelEn: string;
  tierId: string | null;
  serviceLine: string | null;
};

export const DASHBOARD_PREVIEW_MODES: DashboardPreviewMode[] = [
  { id: 'none', labelDa: 'Ingen abonnement', labelEn: 'No subscription', tierId: null, serviceLine: null },
  { id: 'starter', labelDa: 'SEO Starter', labelEn: 'SEO Starter', tierId: 'seo_basic', serviceLine: 'seo' },
  { id: 'seo', labelDa: 'SEO Growth', labelEn: 'SEO Growth', tierId: 'seo_standard', serviceLine: 'seo' },
  { id: 'sem', labelDa: 'Google Ads', labelEn: 'Google Ads', tierId: 'ads_standard', serviceLine: 'ads' },
  {
    id: 'ai_visibility',
    labelDa: 'AI Visibility',
    labelEn: 'AI Visibility',
    tierId: 'ai_visibility_basic',
    serviceLine: 'ai_visibility',
  },
  { id: 'growth', labelDa: 'Growth+', labelEn: 'Growth+', tierId: 'growth_bundle', serviceLine: 'growth' },
];

function demoAudit(mode: DashboardPreviewModeId) {
  const audit = mockAnalyzeVisibility(
    {
      companyName: 'Nordic Demo ApS',
      websiteUrl: 'https://nordic-demo.dk',
      industry: 'local_services',
      growthGoal: 'both',
      contactEmail: 'kunde@nordic-demo.dk',
    },
    'preview-audit-demo'
  );
  audit.status = 'complete';

  if (mode === 'growth') {
    const scores = { search: 58, local: 55, ai: 52, web: 60 };
    audit.scores = scores;
    audit.overallScore = 56;
    audit.recommendation = recommendPlan({
      scores,
      goal: 'both',
      industry: 'local_services',
      auditId: audit.id,
    });
  }

  if (mode === 'sem') {
    const scores = { search: 74, local: 72, ai: 68, web: 80 };
    audit.scores = scores;
    audit.overallScore = 74;
    audit.recommendation = recommendPlan({
      scores,
      goal: 'leads_now',
      industry: 'local_services',
      auditId: audit.id,
    });
  }

  return audit;
}

function fulfillmentCopy(
  line: string,
  isDa: boolean
): NonNullable<AdveroDashboardApiPayload['manualFulfillment']> {
  const serviceName =
    line === 'seo'
      ? { da: 'SEO', en: 'SEO' }
      : line === 'ads'
        ? { da: 'Google Ads', en: 'Google Ads' }
        : { da: 'Growth+ (SEO + Ads)', en: 'Growth+ (SEO + Ads)' };
  return {
    status: 'PENDING',
    serviceLine: line,
    titleDa: `Vi starter jeres ${serviceName.da}`,
    titleEn: `We're getting your ${serviceName.en} started`,
    bodyDa:
      line === 'seo'
        ? 'Tak for jeres abonnement. Vi gennemgår jeres audit og sætter SEO-arbejdet i gang.'
        : line === 'ads'
          ? 'Tak for jeres abonnement. Vi opsætter Google Ads og kampagner.'
          : 'Tak for jeres abonnement. Vi sætter SEO og Google Ads i gang.',
    bodyEn:
      line === 'seo'
        ? 'Thank you for subscribing. We are starting your SEO work from the audit.'
        : line === 'ads'
          ? 'Thank you for subscribing. We are setting up Google Ads.'
          : 'Thank you for subscribing. We are getting SEO and Google Ads underway.',
  };
}

export function buildDashboardPreviewPayload(
  mode: DashboardPreviewModeId,
  lang: 'da' | 'en' = 'da'
): AdveroDashboardApiPayload {
  const meta = DASHBOARD_PREVIEW_MODES.find((m) => m.id === mode) ?? DASHBOARD_PREVIEW_MODES[0];
  const audit = demoAudit(mode);
  const intelligence = buildVisibilityIntelligence({
    lang,
    audit,
    context: 'client',
  });

  const entitlements: WorkspaceEntitlements = meta.tierId
    ? entitlementsFromSubscription(meta.tierId, meta.serviceLine)
    : entitlementsFromSubscription(null, null);

  const seoConnected = entitlements.seo;
  const adsConnected = entitlements.ads;

  const line = meta.serviceLine || 'seo';
  const manualFulfillment =
    mode === 'none' ? null : fulfillmentCopy(line === 'ai_visibility' ? 'seo' : line, lang === 'da');

  return {
    workspace: {
      id: 'preview-workspace',
      companyName: audit.companyName,
      setupState: {
        auditComplete: true,
        dashboardInit: true,
        paid: mode !== 'none',
        tierId: meta.tierId,
        packageId: entitlements.packageId,
        entitlements: {
          seo: entitlements.seo,
          ads: entitlements.ads,
          aiVisibility: entitlements.aiVisibility,
        },
      },
      initializedAt: new Date().toISOString(),
    },
    latestAudit: audit,
    intelligence,
    searchConsole: {
      connected: seoConnected,
      siteUrl: 'https://nordic-demo.dk/',
      impressions: 12400,
      clicks: 890,
      ctr: '7.2%',
      avgPosition: '14.3',
      topQueries: [
        { query: 'håndværker københavn', clicks: 120 },
        { query: 'malerfirma', clicks: 86 },
      ],
      syncedAt: new Date().toISOString(),
      source: seoConnected ? 'demo' : 'unavailable',
    },
    googleAds: {
      connected: adsConnected,
      customerName: 'Nordic Demo ApS',
      impressions: 45200,
      clicks: 1240,
      conversions: 38,
      costDkk: '18.450 kr.',
      campaigns: [
        { name: 'Brand — DK', clicks: 420, impressions: 8200, costMicros: 4_200_000_000, conversions: 12 },
        { name: 'Services — lokalt', clicks: 820, impressions: 28000, costMicros: 9_100_000_000, conversions: 26 },
      ],
      syncedAt: new Date().toISOString(),
      source: adsConnected ? 'demo' : 'unavailable',
    },
    activity: [
      {
        type: 'audit_complete',
        titleDa: 'Synlighedsanalyse fuldført',
        titleEn: 'Visibility audit completed',
        createdAt: new Date().toISOString(),
      },
      ...(mode !== 'none'
        ? [
            {
              type: 'subscription_active',
              titleDa: `${packageLabel(entitlements, 'da')} aktiveret`,
              titleEn: `${packageLabel(entitlements, 'en')} activated`,
              createdAt: new Date().toISOString(),
            },
          ]
        : []),
    ],
    subscription: meta.tierId
      ? { tierId: meta.tierId, serviceLine: meta.serviceLine || 'seo', status: 'active' }
      : null,
    entitlements,
    manualFulfillment,
  };
}

export function isDashboardPreviewModeId(value: string): value is DashboardPreviewModeId {
  return DASHBOARD_PREVIEW_MODES.some((m) => m.id === value);
}

export function previewModeLabel(mode: DashboardPreviewModeId, isDa: boolean): string {
  const row = DASHBOARD_PREVIEW_MODES.find((m) => m.id === mode);
  if (!row) return mode;
  return isDa ? row.labelDa : row.labelEn;
}

export function previewPackageId(mode: DashboardPreviewModeId): ProductPackageId | null {
  return buildDashboardPreviewPayload(mode).entitlements.packageId;
}
