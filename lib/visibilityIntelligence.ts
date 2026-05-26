/**
 * Canonical visibility intelligence — single source for audit → dashboard → reports.
 * Backend builds this server-side; frontend consumes via GET /api/advero/dashboard.
 */
import type { Language } from '../types';
import type { AuditInterpretation } from './auditInterpretation';
import { buildAuditInterpretation } from './auditInterpretation';
import type { AuditScores, GrowthGoal, IndustryCategory, PlanRecommendation } from './recommendPlan';
import { recommendPlan } from './recommendPlan';
import type { VisibilityAuditResult } from './mockAnalyzeVisibility';

export type PriorityLevel = 'high' | 'medium' | 'low';

export interface VisibilityScores {
  overall: number;
  search: number;
  local: number;
  ai: number;
  web: number;
  delta: string;
}

export interface PriorityRecommendation {
  title: string;
  body: string;
  priority: string;
  priorityKey: PriorityLevel;
  cta: string;
  ctaHref: string;
  businessImpact: string;
}

export interface VisibilityIntelligence {
  version: 1;
  source: 'audit' | 'demo';
  auditId?: string;
  companyName?: string;
  engine?: 'toprank' | 'mock';
  scores: VisibilityScores;
  weakestChannel: keyof AuditScores;
  priority: PriorityRecommendation;
  interpretation: AuditInterpretation;
  recommendation: PlanRecommendation;
  reportNarrative: string;
  opportunities: string[];
  history: { label: string; score: number }[];
  leads: {
    estimatedMonthly: number;
    deltaLabel: string;
    stats: { label: string; value: string }[];
    trendPoints: number[];
  };
  workspaceHealth: { label: string; status: string; tone: 'ok' | 'active' | 'neutral' }[];
  connectedFlow: { key: string; label: string; detail: string; href?: string }[];
}

export interface SearchConsoleSnapshot {
  connected: boolean;
  siteUrl?: string;
  impressions?: number;
  clicks?: number;
  ctr?: string;
  avgPosition?: string;
  topQueries?: { query: string; clicks: number }[];
  syncedAt?: string;
  source: 'google' | 'unavailable' | 'demo';
}

export interface GoogleAdsCampaignRow {
  name: string;
  clicks: number;
  impressions: number;
  costMicros: number;
  conversions: number;
}

export interface GoogleAdsSnapshot {
  connected: boolean;
  customerId?: string;
  customerName?: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  costDkk?: string;
  campaigns?: GoogleAdsCampaignRow[];
  syncedAt?: string;
  source: 'google' | 'unavailable' | 'demo';
  pendingAccountSelection?: boolean;
}

export type BuildIntelligenceInput = {
  lang: Language;
  audit: VisibilityAuditResult | null;
  searchConsole?: SearchConsoleSnapshot | null;
};

function weakestChannel(scores: AuditScores): keyof AuditScores {
  return (['search', 'local', 'ai', 'web'] as const).reduce((a, b) =>
    scores[a] <= scores[b] ? a : b
  );
}

function scoreStatus(score: number, isDa: boolean): { status: string; trend: 'up' | 'flat' | 'down' } {
  if (score >= 72) return { status: isDa ? 'Stigende' : 'Growing', trend: 'up' };
  if (score >= 58) return { status: isDa ? 'Stabil' : 'Stable', trend: 'flat' };
  return { status: isDa ? 'Forbedres' : 'Improving', trend: 'up' };
}

function buildHistory(scores: AuditScores, overall: number, isDa: boolean) {
  const months = isDa
    ? ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']
    : ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const base = Math.max(42, overall - 22);
  const step = (overall - base) / 5;
  return months.map((label, i) => ({
    label,
    score: Math.round(base + step * i + (scores.local % 3)),
  }));
}

function priorityFromWeakest(
  w: keyof AuditScores,
  isDa: boolean,
  rec: PlanRecommendation,
  auditId?: string
): PriorityRecommendation {
  const gs = rec.ctaPath.replace(/step=\d+/, 'step=1');
  const map: Record<
    keyof AuditScores,
    { titleDa: string; titleEn: string; bodyDa: string; bodyEn: string; impactDa: string; impactEn: string }
  > = {
    local: {
      titleDa: 'Udvid dækning på by- og ydelsessider',
      titleEn: 'Improve city- and service-specific landing page coverage',
      bodyDa: 'Svag lokal opdagelse — kunder i jeres område finder oftere konkurrenter først.',
      bodyEn: 'Weak local discoverability — customers in your area often find competitors first.',
      impactDa: 'Stærk lokal synlighed korrelerer med flere indgående henvendelser.',
      impactEn: 'Strong local visibility correlates with more inbound inquiries.',
    },
    search: {
      titleDa: 'Styrk synlighed på kerneservices',
      titleEn: 'Strengthen visibility on core services',
      bodyDa: 'Begrænset søge-synlighed på ydelsessider.',
      bodyEn: 'Limited search visibility on service pages.',
      impactDa: 'Bedre søge-tilstedeværelse understøtter kvalificerede leads.',
      impactEn: 'Stronger search presence supports qualified leads.',
    },
    ai: {
      titleDa: 'Gør indhold AI-klart',
      titleEn: 'Make content AI-ready',
      bodyDa: 'Sværere at opdage i samtale-baserede søgninger.',
      bodyEn: 'Harder to discover in conversational search.',
      impactDa: 'AI-læsbar struktur øger fremtidig synlighed.',
      impactEn: 'AI-readable structure increases future visibility.',
    },
    web: {
      titleDa: 'Forbedr website-fundament',
      titleEn: 'Improve website foundation',
      bodyDa: 'Tekniske signaler bør styrkes for bedre konvertering.',
      bodyEn: 'Technical signals should improve for better conversion.',
      impactDa: 'Et sundt website forstærker alle synlighedsinitiativer.',
      impactEn: 'A healthy website amplifies all visibility initiatives.',
    },
  };
  const m = map[w];
  return {
    title: isDa ? m.titleDa : m.titleEn,
    body: isDa ? m.bodyDa : m.bodyEn,
    priority: isDa ? 'Høj prioritet' : 'High priority',
    priorityKey: 'high',
    cta: isDa ? 'Se anbefalet plan' : 'View recommended plan',
    ctaHref: `${gs}${auditId ? (gs.includes('?') ? '&' : '?') + `auditId=${auditId}` : ''}`,
    businessImpact: isDa ? m.impactDa : m.impactEn,
  };
}

export function buildVisibilityIntelligence(input: BuildIntelligenceInput): VisibilityIntelligence {
  const isDa = input.lang === 'da';
  const audit = input.audit;
  const hasAudit = Boolean(audit?.scores && audit.status === 'complete');

  const scores: AuditScores = hasAudit
    ? audit!.scores!
    : { search: 78, local: 71, ai: 64, web: 85 };

  const overall = hasAudit ? audit!.overallScore! : 78;
  const w = weakestChannel(scores);
  const rec =
    (hasAudit && audit!.recommendation) ||
    recommendPlan({
      scores,
      goal: (audit?.growthGoal ?? 'both') as GrowthGoal,
      industry: (audit?.industry ?? 'unknown') as IndustryCategory,
      auditId: audit?.id,
    });
  const interp =
    (hasAudit && audit!.interpretation) ||
    buildAuditInterpretation(scores, audit?.engine ?? 'mock');

  const history = buildHistory(scores, overall, isDa);
  const gsc = input.searchConsole;
  const clicks = gsc?.connected && gsc.clicks != null ? gsc.clicks : Math.max(8, Math.round(overall / 4.2));

  const opportunities = (isDa ? interp.opportunitiesDa : interp.opportunitiesEn).slice(0, 4);

  const channelLabel = (ch: keyof AuditScores) =>
    isDa
      ? ({ search: 'søge', local: 'lokal', ai: 'AI', web: 'web' }[ch])
      : ({ search: 'search', local: 'local', ai: 'AI', web: 'web' }[ch]);

  return {
    version: 1,
    source: hasAudit ? 'audit' : 'demo',
    auditId: audit?.id,
    companyName: audit?.companyName,
    engine: audit?.engine,
    scores: {
      overall,
      search: scores.search,
      local: scores.local,
      ai: scores.ai,
      web: scores.web,
      delta: audit?.delta ?? (isDa ? '+12 denne måned' : '+12 this month'),
    },
    weakestChannel: w,
    priority: priorityFromWeakest(w, isDa, rec, audit?.id),
    interpretation: interp,
    recommendation: rec,
    reportNarrative: hasAudit
      ? isDa
        ? `Baseret på jeres audit (${overall}/100) er ${channelLabel(w)} det største løft. ${rec.headlineDa}`
        : `Based on your audit (${overall}/100), ${channelLabel(w)} is the biggest lift. ${rec.headlineEn}`
      : isDa
        ? 'Kør en gratis synlighedsaudit for personlige anbefalinger.'
        : 'Run a free visibility audit for personalized recommendations.',
    opportunities,
    history,
    leads: {
      estimatedMonthly: clicks,
      deltaLabel: gsc?.connected
        ? isDa
          ? 'Fra Search Console (28 dage)'
          : 'From Search Console (28 days)'
        : isDa
          ? 'Estimat fra synlighedsscore'
          : 'Estimated from visibility score',
      stats: [
        {
          label: isDa ? 'Henvendelser' : 'Inquiries',
          value: String(clicks),
        },
        {
          label: isDa ? 'Synlighed' : 'Visibility',
          value: `${overall}/100`,
        },
        {
          label: isDa ? 'Søg' : 'Search',
          value: gsc?.connected && gsc.impressions != null ? String(gsc.impressions) : `${scores.search}/100`,
        },
        {
          label: isDa ? 'Trend' : 'Trend',
          value: scoreStatus(overall, isDa).status,
        },
      ],
      trendPoints: history.map((h) => h.score),
    },
    workspaceHealth: [
      {
        label: isDa ? 'Synlighedsovervågning' : 'Visibility monitoring',
        status: hasAudit ? (isDa ? 'Aktiv' : 'Active') : isDa ? 'Afventer audit' : 'Awaiting audit',
        tone: hasAudit ? 'active' : 'neutral',
      },
      {
        label: isDa ? 'Search Console' : 'Search Console',
        status: gsc?.connected ? (isDa ? 'Forbundet' : 'Connected') : isDa ? 'Ikke forbundet' : 'Not connected',
        tone: gsc?.connected ? 'ok' : 'neutral',
      },
      {
        label: isDa ? 'Ugentlig scan' : 'Weekly scan',
        status: hasAudit ? (isDa ? 'Sund' : 'Healthy') : isDa ? 'Planlagt' : 'Scheduled',
        tone: hasAudit ? 'ok' : 'neutral',
      },
      {
        label: isDa ? 'Rapportering' : 'Reporting',
        status: isDa ? 'Planlagt månedligt' : 'Scheduled monthly',
        tone: 'ok',
      },
    ],
    connectedFlow: [
      {
        key: 'audit',
        label: isDa ? 'Synlighedsaudit' : 'Visibility audit',
        detail: audit?.companyName ?? (isDa ? 'Kør gratis audit' : 'Run free audit'),
        href: audit?.id ? `/advero/audit/results?id=${audit.id}` : '/advero/audit',
      },
      {
        key: 'finding',
        label: isDa ? 'Fund' : 'Finding',
        detail: isDa ? `Svag ${channelLabel(w)}` : `Weak ${channelLabel(w)}`,
      },
      {
        key: 'rec',
        label: isDa ? 'Anbefaling' : 'Recommendation',
        detail: opportunities[0] ?? rec.headlineDa,
        href: '/advero/dashboard#priority',
      },
      {
        key: 'campaigns',
        label: isDa ? 'Kampagner' : 'Campaigns',
        detail: isDa ? 'Lokal annoncemålretning' : 'Localized ad targeting',
        href: '/advero/dashboard/campaigns',
      },
    ],
  };
}
