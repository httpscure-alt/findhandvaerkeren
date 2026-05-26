import { buildAuditInterpretation, type AuditInterpretation } from '../../lib/auditInterpretation';
import type { AuditScores } from '../../lib/recommendPlan';
import type { AuditEngine } from '../visibilityAuditService';
import { logger } from '../../config/logger';

/**
 * P1: optional LLM layer on structured findings.
 * Today: deterministic interpretation; set OPENAI_API_KEY + ADVERO_LLM_INTERPRETATION=true to extend.
 */
export async function buildInterpretationLayer(
  scores: AuditScores,
  engine: AuditEngine,
  companyName: string
): Promise<AuditInterpretation> {
  const base = buildAuditInterpretation(scores, engine);

  if (process.env.ADVERO_LLM_INTERPRETATION !== 'true' || !process.env.OPENAI_API_KEY) {
    return base;
  }

  try {
    // Placeholder for OpenAI/Claude — keep tier selection rule-based elsewhere
    logger.info('LLM interpretation requested; using template layer until prompt wired', { companyName });
    return base;
  } catch (err) {
    logger.warn('LLM interpretation failed, using template', err);
    return base;
  }
}
