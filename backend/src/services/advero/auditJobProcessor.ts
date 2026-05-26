import type { AdveroAudit } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { logger } from '../../config/logger';
import { recommendPlan } from '../../lib/recommendPlan';
import type { GrowthGoal, IndustryCategory } from '../../lib/recommendPlan';
import { analyzeWithTopRank } from '../toprank/toprankAuditAdapter';
import type { CreateAuditPayload } from './adveroAuditTypes';
import { buildInterpretationLayer } from './adveroInterpretationService';

function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return Math.abs(h);
}

function normalizeUrl(url?: string | null): string {
  const u = (url || '').trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) return `https://${u}`;
  return u;
}

function mockScores(payload: CreateAuditPayload) {
  const seed = hashString(
    [payload.companyName, normalizeUrl(payload.websiteUrl), payload.serviceArea || '', payload.industry || ''].join('|')
  );
  const hasUrl = Boolean(normalizeUrl(payload.websiteUrl));
  const urlPenalty = hasUrl ? 0 : 12;
  return {
    search: Math.min(92, Math.max(38, 52 + (seed % 28) - urlPenalty)),
    local: Math.min(90, Math.max(35, 48 + ((seed * 3) % 32) - (payload.serviceArea ? 0 : 10))),
    ai: Math.min(88, Math.max(32, 45 + ((seed * 7) % 36))),
    web: Math.min(94, Math.max(40, 58 + ((seed * 11) % 30) - (hasUrl ? 0 : 18))),
  };
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

function rowToPayload(row: AdveroAudit): CreateAuditPayload {
  return {
    companyName: row.companyName,
    websiteUrl: row.websiteUrl ?? undefined,
    serviceArea: row.serviceArea ?? undefined,
    industry: row.industry as IndustryCategory,
    growthGoal: row.growthGoal as GrowthGoal,
    contactEmail: row.contactEmail ?? undefined,
  };
}

const MAX_ATTEMPTS = 3;

export async function processAuditJob(auditId: string): Promise<void> {
  const row = await prisma.adveroAudit.findUnique({ where: { id: auditId } });
  if (!row || row.status === 'COMPLETE') return;

  if (row.status === 'FAILED' && row.jobAttempts >= MAX_ATTEMPTS) return;

  await prisma.adveroAudit.update({
    where: { id: auditId },
    data: {
      status: 'PROCESSING',
      jobAttempts: { increment: 1 },
    },
  });

  const payload = rowToPayload(row);

  try {
    const topRank = await analyzeWithTopRank(payload, auditId);
    const engine = topRank ? 'toprank' : 'mock';
    const scores = topRank?.scores ?? mockScores(payload);
    const industry = payload.industry || 'unknown';
    const growthGoal = payload.growthGoal || 'both';
    const recommendation = recommendPlan({ scores, goal: growthGoal, industry, auditId });
    const overall = topRank?.overallScore ?? recommendation.overallScore;
    const delta =
      topRank?.delta ?? `+${Math.max(5, Math.min(18, 20 - Math.floor(overall / 6)))}`;
    const interpretation = await buildInterpretationLayer(scores, engine, payload.companyName);

    await prisma.adveroAuditFinding.deleteMany({ where: { auditId } });
    await prisma.adveroAuditFinding.createMany({
      data: interpretation.engineChecks.map((c, i) => ({
        auditId,
        checkId: c.id,
        labelDa: c.labelDa,
        labelEn: c.labelEn,
        statusDa: c.statusDa,
        statusEn: c.statusEn,
        ok: c.ok,
        sortOrder: i,
      })),
    });

    await prisma.adveroAudit.update({
      where: { id: auditId },
      data: {
        status: 'COMPLETE',
        engine,
        scoreSearch: scores.search,
        scoreLocal: scores.local,
        scoreAi: scores.ai,
        scoreWeb: scores.web,
        overallScore: overall,
        delta,
        topRecommendation: weakestInsight(scores, topRank?.topRecommendation),
        recommendationJson: recommendation as object,
        interpretationJson: interpretation as object,
        processedAt: new Date(),
        errorMessage: null,
      },
    });

    if (row.workspaceId) {
      await prisma.adveroActivityEvent.create({
        data: {
          workspaceId: row.workspaceId,
          type: 'audit_complete',
          titleDa: 'Synlighedsaudit fuldført',
          titleEn: 'Visibility audit completed',
          metadata: { auditId, overall },
        },
      });
    }

    logger.info('Advero audit job complete', { auditId, engine, overall });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Audit processing failed';
    const attempts = row.jobAttempts + 1;
    await prisma.adveroAudit.update({
      where: { id: auditId },
      data: {
        status: attempts >= MAX_ATTEMPTS ? 'FAILED' : 'PENDING',
        errorMessage: message,
      },
    });
    logger.error('Advero audit job failed', { auditId, message });
    throw err;
  }
}
