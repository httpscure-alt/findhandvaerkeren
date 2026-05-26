import type { AuditInterpretation } from '../../lib/auditInterpretation';
import type { AuditScores, PlanRecommendation } from '../../lib/recommendPlan';
import type { AuditEngine } from '../visibilityAuditService';
import { logger } from '../../config/logger';
import {
  kimiChatCompletion,
  llmInterpretationEnabled,
  parseJsonFromLlm,
} from './moonshotKimiClient';

export type AuditLlmContext = {
  companyName: string;
  websiteUrl?: string;
  serviceArea?: string;
  industry?: string;
  growthGoal?: string;
  scores: AuditScores;
  engine: AuditEngine;
  overallScore: number;
  recommendation: PlanRecommendation;
  topRecommendation?: string;
};

type LlmAuditPayload = {
  executiveSummaryDa: string;
  executiveSummaryEn: string;
  opportunitiesDa: string[];
  opportunitiesEn: string[];
  headlineDa?: string;
  headlineEn?: string;
  reasonDa?: string;
  reasonEn?: string;
};

const SYSTEM_PROMPT = `You are Advero's visibility strategist for Danish SMBs.
You receive structured audit scores and a pre-selected subscription plan (already chosen by rules — do not change plan IDs or tiers).
Write clear, professional copy. No em dashes. No hype. No markdown.
CRITICAL: Fields ending in "Da" must be entirely in Danish. Fields ending in "En" must be entirely in English. Never mix languages inside one field.
Respond with ONLY valid JSON matching the schema given.`;

function buildUserPrompt(ctx: AuditLlmContext): string {
  const rec = ctx.recommendation;
  return JSON.stringify(
    {
      task: 'Write audit interpretation and polish recommendation headlines/reasons.',
      company: {
        name: ctx.companyName,
        website: ctx.websiteUrl || null,
        serviceArea: ctx.serviceArea || null,
        industry: ctx.industry || 'unknown',
        growthGoal: ctx.growthGoal || 'both',
      },
      engine: ctx.engine,
      scores: ctx.scores,
      overallScore: ctx.overallScore,
      topInsight: ctx.topRecommendation || null,
      lockedPlan: {
        primaryService: rec.primaryService,
        primaryTierId: rec.primaryTierId,
        secondaryService: rec.secondaryService ?? null,
        secondaryTierId: rec.secondaryTierId ?? null,
        weakestChannel: rec.weakestChannel,
      },
      templateHeadlineDa: rec.headlineDa,
      templateReasonDa: rec.reasonDa,
      requiredJsonSchema: {
        executiveSummaryDa: 'string, 2-3 sentences',
        executiveSummaryEn: 'string, 2-3 sentences',
        opportunitiesDa: 'array of exactly 4 short bullets',
        opportunitiesEn: 'array of exactly 4 short bullets',
        headlineDa: 'string, one line, must match locked plan',
        headlineEn: 'string, one line',
        reasonDa: 'string, 2-3 sentences referencing scores and goal',
        reasonEn: 'string, 2-3 sentences',
      },
    },
    null,
    2
  );
}

function normalizeOpportunities(list: unknown, fallback: string[]): string[] {
  if (!Array.isArray(list)) return fallback;
  const items = list.map((x) => String(x).trim()).filter(Boolean);
  if (items.length < 4) {
    return [...items, ...fallback].slice(0, 4);
  }
  return items.slice(0, 4);
}

export async function generateAuditLlmCopy(
  ctx: AuditLlmContext,
  templateInterpretation: AuditInterpretation
): Promise<{ interpretation: AuditInterpretation; recommendation: PlanRecommendation } | null> {
  if (!llmInterpretationEnabled()) return null;

  const raw = await kimiChatCompletion(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(ctx) },
    ],
    { maxTokens: 1400, temperature: 0.35 }
  );

  if (!raw) return null;

  const parsed = parseJsonFromLlm<LlmAuditPayload>(raw);
  if (!parsed?.executiveSummaryDa || !parsed.executiveSummaryEn) {
    logger.warn('Kimi audit JSON parse failed or incomplete');
    return null;
  }

  const interpretation: AuditInterpretation = {
    ...templateInterpretation,
    executiveSummaryDa: parsed.executiveSummaryDa.trim(),
    executiveSummaryEn: parsed.executiveSummaryEn.trim(),
    opportunitiesDa: normalizeOpportunities(
      parsed.opportunitiesDa,
      templateInterpretation.opportunitiesDa
    ),
    opportunitiesEn: normalizeOpportunities(
      parsed.opportunitiesEn,
      templateInterpretation.opportunitiesEn
    ),
  };

  const recommendation: PlanRecommendation = {
    ...ctx.recommendation,
    headlineDa: parsed.headlineDa?.trim() || ctx.recommendation.headlineDa,
    headlineEn: parsed.headlineEn?.trim() || ctx.recommendation.headlineEn,
    reasonDa: parsed.reasonDa?.trim() || ctx.recommendation.reasonDa,
    reasonEn: parsed.reasonEn?.trim() || ctx.recommendation.reasonEn,
  };

  logger.info('Kimi audit copy generated', {
    companyName: ctx.companyName,
    model: process.env.MOONSHOT_MODEL || 'kimi-k2.6',
  });

  return { interpretation, recommendation };
}
