import type { AdveroAudit, AdveroAuditFinding, AdveroAuditStatus } from '@prisma/client';
import type { AuditInterpretation } from '../../lib/auditInterpretation';
import type { PlanRecommendation } from '../../lib/recommendPlan';
import type { PublicVisibilityAudit } from './adveroAuditTypes';

function statusToPublic(s: AdveroAuditStatus): PublicVisibilityAudit['status'] {
  switch (s) {
    case 'PENDING':
      return 'pending';
    case 'PROCESSING':
      return 'processing';
    case 'COMPLETE':
      return 'complete';
    case 'FAILED':
      return 'failed';
    default:
      return 'pending';
  }
}

function progressForStatus(s: AdveroAuditStatus, attempts: number): number {
  if (s === 'COMPLETE') return 100;
  if (s === 'FAILED') return 0;
  if (s === 'PROCESSING') return Math.min(90, 25 + attempts * 20);
  return 10;
}

export function mapAuditToPublic(
  row: AdveroAudit & { findings?: AdveroAuditFinding[] }
): PublicVisibilityAudit {
  const status = statusToPublic(row.status);
  const base: PublicVisibilityAudit = {
    id: row.id,
    status,
    companyName: row.companyName,
    websiteUrl: row.websiteUrl ?? undefined,
    serviceArea: row.serviceArea ?? undefined,
    industry: row.industry as PublicVisibilityAudit['industry'],
    growthGoal: row.growthGoal as PublicVisibilityAudit['growthGoal'],
    contactEmail: row.contactEmail ?? undefined,
    progress: progressForStatus(row.status, row.jobAttempts),
    errorMessage: row.errorMessage ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };

  if (status !== 'complete') {
    return base;
  }

  const recommendation = row.recommendationJson as PlanRecommendation | null;
  const interpretation = row.interpretationJson as AuditInterpretation | null;

  return {
    ...base,
    engine: (row.engine as 'toprank' | 'mock') ?? 'mock',
    scores: {
      search: row.scoreSearch ?? 0,
      local: row.scoreLocal ?? 0,
      ai: row.scoreAi ?? 0,
      web: row.scoreWeb ?? 0,
    },
    overallScore: row.overallScore ?? 0,
    delta: row.delta ?? undefined,
    topRecommendation: row.topRecommendation ?? undefined,
    recommendation: recommendation ?? undefined,
    interpretation: interpretation ?? undefined,
  };
}
