import { buildAuditInterpretation, type AuditInterpretation } from '../../lib/auditInterpretation';
import type { AuditScores, PlanRecommendation } from '../../lib/recommendPlan';
import type { AuditEngine } from '../visibilityAuditService';
import { logger } from '../../config/logger';
import { generateAuditLlmCopy, type AuditLlmContext } from '../llm/auditLlmService';
import { llmInterpretationEnabled } from '../llm/moonshotKimiClient';

export type InterpretationInput = {
  scores: AuditScores;
  engine: AuditEngine;
  companyName: string;
  websiteUrl?: string;
  serviceArea?: string;
  industry?: string;
  growthGoal?: string;
  overallScore: number;
  recommendation: PlanRecommendation;
  topRecommendation?: string;
};

export type InterpretationResult = {
  interpretation: AuditInterpretation;
  recommendation: PlanRecommendation;
};

/**
 * Template interpretation + optional Kimi K2.6 narrative (plan tiers stay rule-based).
 */
export async function buildInterpretationLayer(
  input: InterpretationInput
): Promise<InterpretationResult> {
  const base = buildAuditInterpretation(input.scores, input.engine);

  if (!llmInterpretationEnabled()) {
    return { interpretation: base, recommendation: input.recommendation };
  }

  try {
    const ctx: AuditLlmContext = {
      companyName: input.companyName,
      websiteUrl: input.websiteUrl,
      serviceArea: input.serviceArea,
      industry: input.industry,
      growthGoal: input.growthGoal,
      scores: input.scores,
      engine: input.engine,
      overallScore: input.overallScore,
      recommendation: input.recommendation,
      topRecommendation: input.topRecommendation,
    };

    const llm = await generateAuditLlmCopy(ctx, base);
    if (llm) return llm;
  } catch (err) {
    logger.warn('LLM interpretation failed, using template', err);
  }

  return { interpretation: base, recommendation: input.recommendation };
}
