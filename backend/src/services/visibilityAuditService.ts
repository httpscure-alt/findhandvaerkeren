import crypto from 'crypto';
import type { GrowthGoal, IndustryCategory } from '../lib/recommendPlan';
import { recommendPlan } from '../lib/recommendPlan';
import { analyzeWithTopRank } from './toprank/toprankAuditAdapter';
import { buildAuditInterpretation, type AuditInterpretation } from '../lib/auditInterpretation';

export interface CreateAuditPayload {
  companyName: string;
  websiteUrl?: string;
  serviceArea?: string;
  industry?: IndustryCategory;
  growthGoal?: GrowthGoal;
  contactEmail?: string;
}

export type AuditEngine = 'toprank' | 'mock';

export interface StoredVisibilityAudit {
  id: string;
  companyName: string;
  websiteUrl?: string;
  serviceArea?: string;
  industry: IndustryCategory;
  growthGoal: GrowthGoal;
  contactEmail?: string;
  status: 'complete';
  engine: AuditEngine;
  scores: { search: number; local: number; ai: number; web: number };
  overallScore: number;
  delta: string;
  topRecommendation: string;
  recommendation: ReturnType<typeof recommendPlan>;
  interpretation: AuditInterpretation;
  createdAt: string;
}

const store = new Map<string, StoredVisibilityAudit>();

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

function weakestInsight(
  scores: { search: number; local: number; ai: number; web: number },
  override?: string
): string {
  if (override?.trim()) return override.trim();
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
  return topByChannel[weakest];
}

function runMockAnalysis(payload: CreateAuditPayload, id: string): StoredVisibilityAudit {
  const seed = hashString(
    [payload.companyName, normalizeUrl(payload.websiteUrl), payload.serviceArea || '', payload.industry || ''].join('|')
  );
  const hasUrl = Boolean(normalizeUrl(payload.websiteUrl));
  const urlPenalty = hasUrl ? 0 : 12;

  const scores = {
    search: Math.min(92, Math.max(38, 52 + (seed % 28) - urlPenalty)),
    local: Math.min(90, Math.max(35, 48 + ((seed * 3) % 32) - (payload.serviceArea ? 0 : 10))),
    ai: Math.min(88, Math.max(32, 45 + ((seed * 7) % 36))),
    web: Math.min(94, Math.max(40, 58 + ((seed * 11) % 30) - (hasUrl ? 0 : 18))),
  };

  return finalizeAudit(payload, id, scores, 'mock', undefined);
}

function finalizeAudit(
  payload: CreateAuditPayload,
  id: string,
  scores: { search: number; local: number; ai: number; web: number },
  engine: AuditEngine,
  topRank?: { overallScore?: number; delta?: string; topRecommendation?: string }
): StoredVisibilityAudit {
  const industry = payload.industry || 'unknown';
  const growthGoal = payload.growthGoal || 'both';
  const recommendation = recommendPlan({ scores, goal: growthGoal, industry, auditId: id });

  const overall = topRank?.overallScore ?? recommendation.overallScore;
  const delta =
    topRank?.delta ??
    `+${Math.max(5, Math.min(18, 20 - Math.floor(overall / 6)))}`;

  return {
    id,
    companyName: payload.companyName.trim(),
    websiteUrl: normalizeUrl(payload.websiteUrl) || undefined,
    serviceArea: payload.serviceArea?.trim() || undefined,
    industry,
    growthGoal,
    contactEmail: payload.contactEmail?.trim() || undefined,
    status: 'complete',
    engine,
    scores,
    overallScore: overall,
    delta,
    topRecommendation: weakestInsight(scores, topRank?.topRecommendation),
    recommendation,
    interpretation: buildAuditInterpretation(scores, engine),
    createdAt: new Date().toISOString(),
  };
}

export async function createVisibilityAudit(payload: CreateAuditPayload): Promise<StoredVisibilityAudit> {
  const id = crypto.randomUUID();

  const topRank = await analyzeWithTopRank(payload, id);
  const audit = topRank
    ? finalizeAudit(payload, id, topRank.scores, 'toprank', {
        overallScore: topRank.overallScore,
        delta: topRank.delta,
        topRecommendation: topRank.topRecommendation,
      })
    : runMockAnalysis(payload, id);

  store.set(id, audit);
  return audit;
}

export function getVisibilityAudit(id: string): StoredVisibilityAudit | null {
  return store.get(id) || null;
}
