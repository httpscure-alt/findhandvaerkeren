/**
 * @deprecated Prefer `api.getAdveroDashboard()` → `payload.intelligence` (canonical).
 * Thin client fallback when API unavailable.
 */
import type { Language } from '../types';
import type { AdveroDashboardApiPayload } from './adveroDashboardApi';
import { buildVisibilityIntelligence, type VisibilityIntelligence } from './visibilityIntelligence';
import {
  loadAuditFromSession,
  type VisibilityAuditResult,
} from './mockAnalyzeVisibility';
import {
  getSetupChecklist,
  setupProgressCounts,
  type SetupChecklistItem,
} from './adveroSetupProgress';

const SNAPSHOT_KEY = 'advero.lastAuditSnapshot';

export type { VisibilityIntelligence, SearchConsoleSnapshot, PriorityRecommendation } from './visibilityIntelligence';

export type DashboardIntelligence = VisibilityIntelligence & {
  hasAudit: boolean;
  setup: {
    items: SetupChecklistItem[];
    done: number;
    total: number;
    showChecklist: boolean;
  };
  growthUpsell: { body: string; cta: string; href: string } | null;
  visibilityCategories: {
    name: string;
    status: string;
    trend: 'up' | 'flat' | 'down';
    insight: string;
    businessImpact: string;
  }[];
  aiSection: {
    headline: string;
    opportunityValue: string;
    businessImpact: string;
    readinessLabel: string;
    suggestions: string[];
  };
  metrics: {
    key: string;
    label: string;
    value: string;
    suffix: string;
    delta: string;
    businessImpact: string;
    tone: 'sky' | 'violet' | 'emerald' | 'indigo';
    highlight?: boolean;
  }[];
  actionsFromAudit: {
    title: string;
    body: string;
    priority: string;
    priorityKey: 'high' | 'medium' | 'low';
    cta: string;
    ctaHref: string;
  }[];
};

export function persistAuditSnapshot(audit: VisibilityAuditResult): void {
  try {
    sessionStorage.setItem('advero.lastAuditId', audit.id);
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(audit));
  } catch {
    /* ignore */
  }
}

export function getLastDashboardAudit(): VisibilityAuditResult | null {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (raw) return JSON.parse(raw) as VisibilityAuditResult;
  } catch {
    /* ignore */
  }
  try {
    const id = sessionStorage.getItem('advero.lastAuditId');
    if (id) return loadAuditFromSession(id);
  } catch {
    /* ignore */
  }
  return null;
}

function intelToLegacyDashboard(
  intel: VisibilityIntelligence,
  lang: Language,
  apiPayload?: AdveroDashboardApiPayload | null
): DashboardIntelligence {
  const isDa = lang === 'da';
  const setupItems = getSetupChecklist();
  const setupCounts = setupProgressCounts(setupItems);
  const rec = intel.recommendation;

  const searchSt =
    intel.scores.search >= 72
      ? { status: isDa ? 'Stigende' : 'Growing', trend: 'up' as const }
      : intel.scores.search >= 58
        ? { status: isDa ? 'Stabil' : 'Stable', trend: 'flat' as const }
        : { status: isDa ? 'Forbedres' : 'Improving', trend: 'up' as const };

  return {
    ...intel,
    hasAudit: intel.source === 'audit',
    setup: {
      items: setupItems,
      done: setupCounts.done,
      total: setupCounts.total,
      showChecklist: setupCounts.requiredDone < setupCounts.requiredTotal,
    },
    growthUpsell:
      rec.primaryService !== 'growth'
        ? {
            body: isDa
              ? 'Overvej Growth+ for kombineret SEO, Ads og AI-synlighed.'
              : 'Consider Growth+ for combined SEO, Ads, and AI visibility.',
            cta: isDa ? 'Udforsk Growth+' : 'Explore Growth+',
            href: `/advero/get-started?from=dashboard&step=1&auditId=${intel.auditId || ''}`,
          }
        : null,
    metrics: [
      {
        key: 'score',
        label: isDa ? 'Synlighedsscore' : 'Visibility score',
        value: String(intel.scores.overall),
        suffix: '/ 100',
        delta: intel.scores.delta,
        businessImpact: intel.priority.businessImpact,
        tone: 'sky',
      },
      {
        key: 'leads',
        label: isDa ? 'Leads / henvendelser' : 'Leads / inquiries',
        value: String(intel.leads.estimatedMonthly),
        suffix: isDa ? 'estimat' : 'estimate',
        delta: intel.leads.deltaLabel,
        businessImpact: isDa
          ? 'Koblet til synlighed og Search Console-data.'
          : 'Tied to visibility and Search Console data.',
        tone: 'violet',
      },
      {
        key: 'search',
        label: isDa ? 'Søge-tilstedeværelse' : 'Search presence',
        value: String(intel.scores.search),
        suffix: '/ 100',
        delta: searchSt.status,
        businessImpact: isDa
          ? 'Påvirker hvor ofte kunder finder jer i søgning.'
          : 'Affects how often customers find you in search.',
        tone: 'emerald',
      },
      {
        key: 'ai',
        label: isDa ? 'AI-synlighed' : 'AI visibility',
        value: String(intel.scores.ai),
        suffix: '/ 100',
        delta: isDa ? intel.interpretation.aiReadinessLabelDa : intel.interpretation.aiReadinessLabelEn,
        businessImpact: isDa
          ? 'Samtale-søgning kræver tydelig struktur.'
          : 'Conversational search needs clear structure.',
        tone: 'indigo',
        highlight: true,
      },
    ],
    visibilityCategories: [
      {
        name: isDa ? 'Søge-synlighed' : 'Search visibility',
        ...searchSt,
        insight: `${intel.scores.search}/100`,
        businessImpact: isDa ? 'Søgekanal' : 'Search channel',
      },
      {
        name: isDa ? 'Lokal opdagelse' : 'Local discovery',
        status: intel.scores.local >= 58 ? searchSt.status : isDa ? 'Forbedres' : 'Improving',
        trend: 'up',
        insight: `${intel.scores.local}/100`,
        businessImpact: isDa ? 'Lokal kanal' : 'Local channel',
      },
      {
        name: isDa ? 'AI-synlighed' : 'AI visibility',
        status: isDa ? intel.interpretation.aiReadinessLabelDa : intel.interpretation.aiReadinessLabelEn,
        trend: 'up',
        insight: `${intel.scores.ai}/100`,
        businessImpact: isDa ? 'AI-kanal' : 'AI channel',
      },
      {
        name: 'Web',
        status: `${intel.scores.web}/100`,
        trend: 'flat',
        insight: isDa ? 'Website-score' : 'Website score',
        businessImpact: isDa ? 'Konvertering' : 'Conversion',
      },
    ],
    aiSection: {
      headline: isDa
        ? `${intel.companyName || 'Jeres virksomhed'} — AI-overvågning`
        : `${intel.companyName || 'Your business'} — AI monitoring`,
      opportunityValue: String(intel.scores.ai),
      businessImpact: isDa
        ? intel.interpretation.aiReadinessLabelDa
        : intel.interpretation.aiReadinessLabelEn,
      readinessLabel: isDa ? intel.interpretation.aiReadinessLabelDa : intel.interpretation.aiReadinessLabelEn,
      suggestions: intel.opportunities.slice(0, 3),
    },
    actionsFromAudit: intel.opportunities.map((body, i) => ({
      title: body.slice(0, 48),
      body,
      priority: i === 0 ? (isDa ? 'Høj' : 'High') : isDa ? 'Medium' : 'Medium',
      priorityKey: i === 0 ? 'high' : 'medium',
      cta: isDa ? 'Se plan' : 'View plan',
      ctaHref: rec.ctaPath.replace(/step=\d+/, 'step=1'),
    })),
  };
}

export function buildDashboardIntelligence(
  lang: Language,
  apiPayload?: AdveroDashboardApiPayload | null
): DashboardIntelligence {
  if (apiPayload?.intelligence) {
    return intelToLegacyDashboard(apiPayload.intelligence, lang, apiPayload);
  }

  const audit = getLastDashboardAudit();
  const intel = buildVisibilityIntelligence({ lang, audit, searchConsole: null });
  return intelToLegacyDashboard(intel, lang, apiPayload);
}

export function buildReportsPageNarrative(lang: Language, apiPayload?: AdveroDashboardApiPayload | null) {
  const intel = buildDashboardIntelligence(lang, apiPayload);
  return {
    narrative: intel.reportNarrative,
    hasAudit: intel.hasAudit,
    auditId: intel.auditId ?? null,
    monthProgress: intel.hasAudit
      ? lang === 'da'
        ? `Synlighedsscore ${intel.scores.overall}/100 · ${intel.priority.title}`
        : `Visibility score ${intel.scores.overall}/100 · ${intel.priority.title}`
      : lang === 'da'
        ? 'Ingen audit endnu.'
        : 'No audit yet.',
  };
}
