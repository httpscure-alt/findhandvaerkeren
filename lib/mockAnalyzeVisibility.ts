import type { AuditScores, GrowthGoal, IndustryCategory } from './recommendPlan';
import { recommendPlan } from './recommendPlan';
import { buildAuditInterpretation, type AuditInterpretation } from './auditInterpretation';

export interface VisibilityAuditInput {
  companyName: string;
  websiteUrl?: string;
  serviceArea?: string;
  industry?: IndustryCategory;
  growthGoal?: GrowthGoal;
  contactEmail?: string;
}

export interface VisibilityAuditResult {
  id: string;
  companyName: string;
  contactEmail?: string;
  websiteUrl?: string;
  serviceArea?: string;
  industry: IndustryCategory;
  growthGoal: GrowthGoal;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  progress?: number;
  errorMessage?: string;
  scores: AuditScores;
  overallScore: number;
  delta: string;
  topRecommendation: string;
  recommendation: ReturnType<typeof recommendPlan>;
  engine?: 'toprank' | 'mock';
  interpretation?: AuditInterpretation;
  createdAt: string;
}

function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return Math.abs(h);
}

function normalizeUrl(url?: string): string {
  const u = (url || '').trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) return `https://${u}`;
  return u;
}

/** Deterministic mock analysis from business inputs (replace with real worker later). */
export function mockAnalyzeVisibility(input: VisibilityAuditInput, id?: string): VisibilityAuditResult {
  const seed = hashString(
    [input.companyName, normalizeUrl(input.websiteUrl), input.serviceArea || '', input.industry || ''].join('|')
  );
  const hasUrl = Boolean(normalizeUrl(input.websiteUrl));
  const urlPenalty = hasUrl ? 0 : 12;

  const scores: AuditScores = {
    search: Math.min(92, Math.max(38, 52 + (seed % 28) - urlPenalty)),
    local: Math.min(90, Math.max(35, 48 + ((seed * 3) % 32) - (input.serviceArea ? 0 : 10))),
    ai: Math.min(88, Math.max(32, 45 + ((seed * 7) % 36))),
    web: Math.min(94, Math.max(40, 58 + ((seed * 11) % 30) - (hasUrl ? 0 : 18))),
  };

  const industry = input.industry || 'unknown';
  const growthGoal = input.growthGoal || 'both';
  const auditId = id || `audit_${seed.toString(36)}_${Date.now().toString(36)}`;
  const recommendation = recommendPlan({ scores, goal: growthGoal, industry, auditId });

  const weakest =
    scores.local <= scores.search && scores.local <= scores.ai && scores.local <= scores.web
      ? 'local'
      : scores.ai <= scores.search && scores.ai <= scores.web
        ? 'ai'
        : scores.search <= scores.web
          ? 'search'
          : 'web';

  const topByChannel: Record<string, string> = {
    local: 'Styrk Google Business Profile og lokale servicesider.',
    search: 'Forbedr titler, meta og intern linking på jeres vigtigste sider.',
    ai: 'Tilføj struktureret FAQ og tydelig “om os” så AI kan citere jer.',
    web: 'Ret teknisk SEO, hastighed og tracking på jeres website.',
  };

  const overall = recommendation.overallScore;
  const delta = `+${Math.max(5, Math.min(18, 20 - Math.floor(overall / 6)))}`;

  return {
    id: auditId,
    companyName: input.companyName.trim(),
    contactEmail: input.contactEmail?.trim() || undefined,
    websiteUrl: normalizeUrl(input.websiteUrl) || undefined,
    serviceArea: input.serviceArea?.trim() || undefined,
    industry,
    growthGoal,
    status: 'complete' as const,
    scores,
    overallScore: overall,
    delta,
    topRecommendation: topByChannel[weakest],
    recommendation,
    engine: 'mock',
    interpretation: buildAuditInterpretation(scores, 'mock'),
    createdAt: new Date().toISOString(),
  };
}

export const AUDIT_SESSION_PREFIX = 'advero.audit.';

export function saveAuditToSession(audit: VisibilityAuditResult): void {
  try {
    sessionStorage.setItem(`${AUDIT_SESSION_PREFIX}${audit.id}`, JSON.stringify(audit));
    sessionStorage.setItem('advero.lastAuditId', audit.id);
  } catch {
    /* ignore */
  }
}

export function loadAuditFromSession(id: string): VisibilityAuditResult | null {
  try {
    const raw = sessionStorage.getItem(`${AUDIT_SESSION_PREFIX}${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as VisibilityAuditResult;
  } catch {
    return null;
  }
}
