import crypto from 'crypto';
import { isAdveroPrismaReady, prisma } from '../../prisma/client';
import { createVisibilityAudit as createVisibilityAuditLegacy, getVisibilityAudit as getVisibilityAuditLegacy } from '../visibilityAuditService';
import type { StoredVisibilityAudit } from '../visibilityAuditService';
import { emailService } from '../emailService';
import { logger } from '../../config/logger';
import type { CreateAuditPayload, PublicVisibilityAudit } from './adveroAuditTypes';
import { mapAuditToPublic } from './adveroAuditMapper';
import { processAuditJob } from './auditJobProcessor';

const USE_ASYNC = process.env.ADVERO_ASYNC_AUDITS !== 'false';

function legacyFromStored(a: StoredVisibilityAudit): PublicVisibilityAudit {
  return {
    id: a.id,
    status: 'complete',
    companyName: a.companyName,
    websiteUrl: a.websiteUrl,
    serviceArea: a.serviceArea,
    industry: a.industry,
    growthGoal: a.growthGoal,
    contactEmail: a.contactEmail,
    engine: a.engine,
    scores: a.scores,
    overallScore: a.overallScore,
    delta: a.delta,
    topRecommendation: a.topRecommendation,
    recommendation: a.recommendation,
    interpretation: a.interpretation,
    createdAt: a.createdAt,
  };
}

export async function enqueueVisibilityAudit(payload: CreateAuditPayload): Promise<PublicVisibilityAudit> {
  if (!isAdveroPrismaReady()) {
    logger.warn('Advero DB not ready — using in-memory audit fallback');
    const stored = await createVisibilityAuditLegacy(payload);
    return legacyFromStored(stored);
  }

  const id = crypto.randomUUID();
  const industry = payload.industry || 'unknown';
  const growthGoal = payload.growthGoal || 'both';

  const row = await prisma.adveroAudit.create({
    data: {
      id,
      status: USE_ASYNC ? 'PENDING' : 'PROCESSING',
      companyName: payload.companyName.trim(),
      websiteUrl: payload.websiteUrl?.trim() || null,
      serviceArea: payload.serviceArea?.trim() || null,
      industry,
      growthGoal,
      contactEmail: payload.contactEmail?.trim() || null,
    },
  });

  if (!USE_ASYNC) {
    await processAuditJob(id);
    const done = await prisma.adveroAudit.findUnique({
      where: { id },
      include: { findings: true },
    });
    if (done) {
      const audit = mapAuditToPublic(done);
      await maybeSendAuditEmail(audit, payload);
      return audit;
    }
  } else {
    // Immediate inline process in dev when worker disabled
    if (process.env.ADVERO_AUDIT_INLINE === 'true') {
      processAuditJob(id).catch((e) => logger.error('Inline audit failed', e));
    }
  }

  return mapAuditToPublic(row);
}

export async function getVisibilityAuditById(id: string): Promise<PublicVisibilityAudit | null> {
  if (!isAdveroPrismaReady()) {
    const legacy = getVisibilityAuditLegacy(id);
    return legacy ? legacyFromStored(legacy) : null;
  }

  const row = await prisma.adveroAudit.findUnique({
    where: { id },
    include: { findings: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!row) return null;
  return mapAuditToPublic(row);
}

export async function claimAuditForUser(auditId: string, userId: string): Promise<void> {
  const audit = await prisma.adveroAudit.findUnique({ where: { id: auditId } });
  if (!audit) return;

  await prisma.adveroAudit.update({
    where: { id: auditId },
    data: { userId },
  });

  let workspace = await prisma.adveroWorkspace.findUnique({ where: { userId } });
  if (!workspace) {
    workspace = await prisma.adveroWorkspace.create({
      data: {
        userId,
        companyName: audit.companyName,
        contactEmail: audit.contactEmail,
        setupState: { auditComplete: true },
        initializedAt: new Date(),
      },
    });
    await prisma.adveroActivityEvent.create({
      data: {
        workspaceId: workspace.id,
        type: 'workspace_init',
        titleDa: 'Dashboard initialiseret',
        titleEn: 'Dashboard initialized',
      },
    });
  }

  await prisma.adveroAudit.update({
    where: { id: auditId },
    data: { workspaceId: workspace.id },
  });
}

async function maybeSendAuditEmail(
  audit: PublicVisibilityAudit,
  payload: CreateAuditPayload
): Promise<void> {
  if (audit.status !== 'complete' || !audit.scores) return;
  const email = payload.contactEmail?.trim();
  if (!email || !email.includes('@')) return;

  const site = (process.env.ADVERO_SITE_URL || process.env.FRONTEND_URL || 'http://localhost:5174').replace(
    /\/$/,
    ''
  );

  emailService
    .sendAuditReportPreviewEmail(
      email,
      {
        email,
        name: audit.companyName,
        score: audit.overallScore ?? 0,
        delta: audit.delta ?? '',
        channels: [
          { k: 'Søg', v: audit.scores.search },
          { k: 'Lokal', v: audit.scores.local },
          { k: 'AI', v: audit.scores.ai },
          { k: 'Web', v: audit.scores.web },
        ],
        recommendation: audit.topRecommendation ?? '',
        reportUrl: `${site}/advero/audit/results?id=${audit.id}`,
      },
      { goal: audit.growthGoal, industry: audit.industry }
    )
    .catch((err) => logger.warn('Preview audit email failed', err));
}

/** Called by worker when job completes */
export async function onAuditJobComplete(auditId: string): Promise<void> {
  const audit = await getVisibilityAuditById(auditId);
  if (!audit || audit.status !== 'complete') return;
  const row = await prisma.adveroAudit.findUnique({ where: { id: auditId } });
  if (!row) return;
  await maybeSendAuditEmail(audit, rowToPayload(row));
}

function rowToPayload(row: {
  companyName: string;
  websiteUrl: string | null;
  serviceArea: string | null;
  industry: string;
  growthGoal: string;
  contactEmail: string | null;
}): CreateAuditPayload {
  return {
    companyName: row.companyName,
    websiteUrl: row.websiteUrl ?? undefined,
    serviceArea: row.serviceArea ?? undefined,
    industry: row.industry as CreateAuditPayload['industry'],
    growthGoal: row.growthGoal as CreateAuditPayload['growthGoal'],
    contactEmail: row.contactEmail ?? undefined,
  };
}
