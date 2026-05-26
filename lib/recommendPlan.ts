/**
 * Deterministic plan recommendation from audit channel scores.
 * Industry + goal only nudge ties — package id never comes from LLM.
 */

export type ChannelKey = 'search' | 'local' | 'ai' | 'web';

export type GrowthGoal = 'leads_now' | 'long_term' | 'both';

/** Broad categories — works for any industry, not trade-specific. */
export type IndustryCategory =
  | 'local_services'
  | 'professional_services'
  | 'retail_ecommerce'
  | 'hospitality'
  | 'health_wellness'
  | 'other'
  | 'unknown';

export type ServiceLine = 'seo' | 'ads' | 'growth';

export type MarketingTierId =
  | 'seo_basic'
  | 'seo_standard'
  | 'seo_pro'
  | 'ads_basic'
  | 'ads_standard'
  | 'ads_pro';

export interface AuditScores {
  search: number;
  local: number;
  ai: number;
  web: number;
}

export interface RecommendPlanInput {
  scores: AuditScores;
  goal?: GrowthGoal;
  industry?: IndustryCategory;
  auditId?: string;
}

export interface PlanRecommendation {
  primaryService: ServiceLine;
  primaryTierId: MarketingTierId;
  secondaryService?: ServiceLine;
  secondaryTierId?: MarketingTierId;
  wantAds: boolean;
  wantSeo: boolean;
  weakestChannel: ChannelKey;
  overallScore: number;
  headlineDa: string;
  headlineEn: string;
  reasonDa: string;
  reasonEn: string;
  ctaPath: string;
}

const CHANNEL_LABELS: Record<ChannelKey, { da: string; en: string }> = {
  search: { da: 'Søg', en: 'Search' },
  local: { da: 'Lokal', en: 'Local' },
  ai: { da: 'AI', en: 'AI' },
  web: { da: 'Web', en: 'Web' },
};

const TIER_LABELS: Record<MarketingTierId, { da: string; en: string }> = {
  seo_basic: { da: 'SEO Starter', en: 'SEO Starter' },
  seo_standard: { da: 'SEO Growth', en: 'SEO Growth' },
  seo_pro: { da: 'SEO Pro', en: 'SEO Pro' },
  ads_basic: { da: 'Google Ads Starter', en: 'Google Ads Starter' },
  ads_standard: { da: 'Google Ads Growth', en: 'Google Ads Growth' },
  ads_pro: { da: 'Google Ads Pro', en: 'Google Ads Pro' },
};

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeScores(scores: AuditScores): AuditScores {
  return {
    search: clampScore(scores.search),
    local: clampScore(scores.local),
    ai: clampScore(scores.ai),
    web: clampScore(scores.web),
  };
}

function overallScore(scores: AuditScores): number {
  return Math.round((scores.search + scores.local + scores.ai + scores.web) / 4);
}

function weakestChannel(scores: AuditScores): ChannelKey {
  const entries: [ChannelKey, number][] = [
    ['search', scores.search],
    ['local', scores.local],
    ['ai', scores.ai],
    ['web', scores.web],
  ];
  entries.sort((a, b) => a[1] - b[1]);
  return entries[0][0];
}

function countBelow(scores: AuditScores, threshold: number): number {
  return (['search', 'local', 'ai', 'web'] as ChannelKey[]).filter((k) => scores[k] < threshold).length;
}

/** SEO-oriented channels vs ads-oriented signals. */
function channelSeoWeight(channel: ChannelKey): number {
  if (channel === 'search' || channel === 'local' || channel === 'web' || channel === 'ai') return 1;
  return 0.5;
}

function tierFromSeverity(severity: number, service: 'seo' | 'ads'): MarketingTierId {
  const prefix = service === 'seo' ? 'seo' : 'ads';
  if (severity >= 70) return `${prefix}_basic` as MarketingTierId;
  if (severity >= 55) return `${prefix}_standard` as MarketingTierId;
  return `${prefix}_pro` as MarketingTierId;
}

/** Industry nudge: adjust service preference when scores are close (within 8 pts). */
function industryServiceBias(
  industry: IndustryCategory,
  scores: AuditScores,
  goal: GrowthGoal
): ServiceLine | null {
  const min = Math.min(scores.search, scores.local, scores.ai, scores.web);
  const close = (v: number) => v <= min + 8;

  if (goal === 'leads_now' && scores.search >= min - 5) return 'ads';

  switch (industry) {
    case 'local_services':
    case 'hospitality':
      if (close(scores.local) && scores.local <= scores.search + 8) return 'seo';
      break;
    case 'retail_ecommerce':
      if (close(scores.web) && goal !== 'long_term') return 'ads';
      if (close(scores.web)) return 'seo';
      break;
    case 'professional_services':
    case 'health_wellness':
      if (close(scores.search)) return 'seo';
      break;
    default:
      break;
  }
  return null;
}

function pickPrimaryService(
  scores: AuditScores,
  weakest: ChannelKey,
  goal: GrowthGoal,
  industry: IndustryCategory
): ServiceLine {
  const weakCount = countBelow(scores, 65);
  if (weakCount >= 3) return 'growth';

  const industryBias = industryServiceBias(industry, scores, goal);
  if (industryBias) return industryBias;

  if (goal === 'leads_now') {
    if (scores.search >= 72 && scores.local >= 68) return 'ads';
    if (weakest === 'local' || weakest === 'search') return 'seo';
    return 'ads';
  }

  if (goal === 'long_term') {
    return 'seo';
  }

  // both
  if (weakest === 'web' || weakest === 'search' || weakest === 'local' || weakest === 'ai') {
    if (scores.search < 60 && scores.local < 60) return 'growth';
    return 'seo';
  }
  return 'seo';
}

function severityForService(scores: AuditScores, service: ServiceLine): number {
  if (service === 'ads') {
    return Math.min(scores.search, scores.local);
  }
  if (service === 'growth') {
    return overallScore(scores);
  }
  const seoChannels: ChannelKey[] = ['search', 'local', 'web', 'ai'];
  const vals = seoChannels.map((k) => scores[k]);
  const weighted = seoChannels.map((k) => scores[k] * channelSeoWeight(k));
  return Math.round(weighted.reduce((a, b) => a + b, 0) / vals.length);
}

export function buildGetStartedPath(
  rec: Pick<PlanRecommendation, 'wantAds' | 'wantSeo' | 'primaryTierId' | 'secondaryTierId'>,
  opts?: { from?: string; goal?: GrowthGoal; industry?: IndustryCategory; auditId?: string; step?: number }
): string {
  const params = new URLSearchParams();
  if (rec.wantSeo && rec.primaryTierId.startsWith('seo')) params.set('seo', rec.primaryTierId);
  else if (rec.wantSeo && rec.secondaryTierId?.startsWith('seo')) params.set('seo', rec.secondaryTierId);
  if (rec.wantAds && rec.primaryTierId.startsWith('ads')) params.set('ads', rec.primaryTierId);
  else if (rec.wantAds && rec.secondaryTierId?.startsWith('ads')) params.set('ads', rec.secondaryTierId);
  if (opts?.goal) params.set('goal', opts.goal);
  if (opts?.industry && opts.industry !== 'unknown') params.set('industry', opts.industry);
  if (opts?.from) params.set('from', opts.from);
  if (opts?.auditId) params.set('auditId', opts.auditId);
  if (opts?.step) params.set('step', String(opts.step));
  const q = params.toString();
  return `/advero/get-started${q ? `?${q}` : ''}`;
}

export function recommendPlan(input: RecommendPlanInput): PlanRecommendation {
  const scores = normalizeScores(input.scores);
  const goal: GrowthGoal = input.goal || 'both';
  const industry: IndustryCategory = input.industry || 'unknown';
  const weakest = weakestChannel(scores);
  const overall = overallScore(scores);

  let primaryService = pickPrimaryService(scores, weakest, goal, industry);
  let wantSeo = primaryService === 'seo' || primaryService === 'growth';
  let wantAds = primaryService === 'ads' || primaryService === 'growth';

  let primaryTierId: MarketingTierId;
  let secondaryTierId: MarketingTierId | undefined;
  let secondaryService: ServiceLine | undefined;

  if (primaryService === 'growth') {
    const seoTier = tierFromSeverity(severityForService(scores, 'seo'), 'seo');
    const adsTier = tierFromSeverity(severityForService(scores, 'ads'), 'ads');
    primaryTierId = seoTier;
    secondaryTierId = adsTier;
    secondaryService = 'ads';
    wantSeo = true;
    wantAds = true;
  } else if (primaryService === 'seo') {
    primaryTierId = tierFromSeverity(severityForService(scores, 'seo'), 'seo');
    if (goal === 'both' && scores.search >= 65 && scores.local < 62) {
      secondaryService = 'ads';
      secondaryTierId = tierFromSeverity(severityForService(scores, 'ads'), 'ads');
      wantAds = true;
    }
  } else {
    primaryTierId = tierFromSeverity(severityForService(scores, 'ads'), 'ads');
    if (goal === 'both' && scores.local < 65) {
      secondaryService = 'seo';
      secondaryTierId = tierFromSeverity(severityForService(scores, 'seo'), 'seo');
      wantSeo = true;
    }
  }

  const ch = CHANNEL_LABELS[weakest];
  const tierLabel = TIER_LABELS[primaryTierId];

  const headlineDa =
    primaryService === 'growth'
      ? 'Vi anbefaler SEO + Google Ads (Growth+)'
      : `Vi anbefaler ${tierLabel.da}`;
  const headlineEn =
    primaryService === 'growth'
      ? 'We recommend SEO + Google Ads (Growth+)'
      : `We recommend ${tierLabel.en}`;

  const reasonDa =
    primaryService === 'growth'
      ? `Jeres samlede score er ${overall}/100, og flere kanaler trænger til arbejde. ${ch.da} (${scores[weakest]}) er svagest — en kombineret plan giver både langsigtet SEO og hurtigere leads.`
      : `Baseret på jeres audit er ${ch.da} (${scores[weakest]}) jeres største gap. ${tierLabel.da} matcher jeres nuværende niveau og jeres mål om ${goal === 'leads_now' ? 'flere henvendelser nu' : goal === 'long_term' ? 'langsigtet synlighed' : 'både vækst og leads'}.`;

  const reasonEn =
    primaryService === 'growth'
      ? `Your overall score is ${overall}/100 and multiple channels need work. ${ch.en} (${scores[weakest]}) is weakest — combined SEO and Ads covers long-term visibility and faster leads.`
      : `Based on your audit, ${ch.en} (${scores[weakest]}) is your biggest gap. ${tierLabel.en} fits your level and your goal of ${goal === 'leads_now' ? 'more leads now' : goal === 'long_term' ? 'long-term visibility' : 'growth and leads'}.`;

  const rec: PlanRecommendation = {
    primaryService,
    primaryTierId,
    secondaryService,
    secondaryTierId,
    wantAds,
    wantSeo,
    weakestChannel: weakest,
    overallScore: overall,
    headlineDa,
    headlineEn,
    reasonDa,
    reasonEn,
    ctaPath: '',
  };

  rec.ctaPath = buildGetStartedPath(rec, {
    from: 'report',
    goal,
    industry,
    auditId: input.auditId,
    step: 1,
  });

  return rec;
}

/** Template copy only — safe default at launch. LLM can replace text later, not tier ids. */
export function explainRecommendation(
  rec: PlanRecommendation,
  lang: 'da' | 'en' = 'da'
): { headline: string; reason: string } {
  return lang === 'da'
    ? { headline: rec.headlineDa, reason: rec.reasonDa }
    : { headline: rec.headlineEn, reason: rec.reasonEn };
}
