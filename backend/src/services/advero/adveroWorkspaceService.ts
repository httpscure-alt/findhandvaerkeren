import { prisma, isAdveroPrismaReady } from '../../prisma/client';
import type { SearchConsoleSnapshot, VisibilityIntelligence } from '../../lib/visibilityIntelligence';
import type { GoogleAdsSnapshot } from '../../lib/googleAdsTypes';
import { getGoogleAdsSnapshot } from '../google/googleAdsService';
import { sanitizeSetupStateForClient } from '../../lib/workspaceSetup';
import type { PublicVisibilityAudit } from './adveroAuditTypes';
import { getVisibilityAuditById } from './adveroAuditService';
import { mapAuditToPublic as mapRow } from './adveroAuditMapper';
import { buildCanonicalIntelligence } from './adveroIntelligenceService';

export interface AdveroDashboardPayload {
  workspace: {
    id: string;
    companyName: string;
    setupState: Record<string, unknown>;
    initializedAt: string | null;
  } | null;
  latestAudit: PublicVisibilityAudit | null;
  intelligence: VisibilityIntelligence;
  searchConsole: SearchConsoleSnapshot;
  googleAds: GoogleAdsSnapshot;
  activity: { type: string; titleDa: string; titleEn: string; createdAt: string }[];
  subscription: {
    tierId: string;
    serviceLine: string;
    status: string;
  } | null;
}

export async function getOrCreateWorkspaceForUser(
  userId: string,
  companyName: string,
  contactEmail?: string
) {
  const existing = await prisma.adveroWorkspace.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.adveroWorkspace.create({
    data: {
      userId,
      companyName,
      contactEmail: contactEmail ?? null,
      setupState: {
        auditComplete: false,
        dashboardInit: true,
        gbp: false,
        ads: false,
        gsc: false,
        analytics: false,
      },
      initializedAt: new Date(),
    },
  });
}

export async function initializeWorkspaceAfterPayment(opts: {
  userId: string;
  companyName: string;
  contactEmail?: string;
  tierId: string;
  serviceLine: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId?: string;
  billingCycle?: string;
  currentPeriodEnd?: Date;
  auditId?: string;
}): Promise<string> {
  const workspace = await getOrCreateWorkspaceForUser(
    opts.userId,
    opts.companyName,
    opts.contactEmail
  );

  await prisma.adveroSubscription.upsert({
    where: { stripeSubscriptionId: opts.stripeSubscriptionId },
    create: {
      workspaceId: workspace.id,
      tierId: opts.tierId,
      serviceLine: opts.serviceLine,
      status: 'active',
      stripeCustomerId: opts.stripeCustomerId,
      stripeSubscriptionId: opts.stripeSubscriptionId,
      stripePriceId: opts.stripePriceId,
      billingCycle: opts.billingCycle,
      currentPeriodEnd: opts.currentPeriodEnd,
    },
    update: {
      tierId: opts.tierId,
      serviceLine: opts.serviceLine,
      status: 'active',
      currentPeriodEnd: opts.currentPeriodEnd,
    },
  });

  await prisma.adveroWorkspace.update({
    where: { id: workspace.id },
    data: {
      setupState: {
        auditComplete: true,
        dashboardInit: true,
        paid: true,
        tierId: opts.tierId,
      },
      initializedAt: workspace.initializedAt ?? new Date(),
    },
  });

  if (opts.auditId) {
    await prisma.adveroAudit.update({
      where: { id: opts.auditId },
      data: { workspaceId: workspace.id, userId: opts.userId },
    });
  }

  await prisma.adveroActivityEvent.create({
    data: {
      workspaceId: workspace.id,
      type: 'subscription_active',
      titleDa: 'Abonnement aktiveret',
      titleEn: 'Subscription activated',
      metadata: { tierId: opts.tierId },
    },
  });

  return workspace.id;
}

export async function buildDashboardPayload(
  userId?: string,
  auditId?: string,
  lang: 'da' | 'en' = 'da'
): Promise<AdveroDashboardPayload> {
  if (!isAdveroPrismaReady()) {
    const audit = auditId ? await getVisibilityAuditById(auditId) : null;
    const { intelligence, searchConsole } = await buildCanonicalIntelligence(lang, audit, null);
    return {
      workspace: null,
      latestAudit: audit,
      intelligence,
      searchConsole,
      googleAds: { connected: false, source: 'unavailable' },
      activity: [],
      subscription: null,
    };
  }

  let workspace = userId
    ? await prisma.adveroWorkspace.findUnique({
        where: { userId },
        include: {
          subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
          activityEvents: { orderBy: { createdAt: 'desc' }, take: 12 },
          audits: { where: { status: 'COMPLETE' }, orderBy: { processedAt: 'desc' }, take: 1 },
        },
      })
    : null;

  let latestAudit: PublicVisibilityAudit | null = null;

  if (auditId) {
    latestAudit = await getVisibilityAuditById(auditId);
  } else if (workspace?.audits[0]) {
    latestAudit = mapRow({ ...workspace.audits[0], findings: [] });
  } else if (userId) {
    const last = await prisma.adveroAudit.findFirst({
      where: { userId, status: 'COMPLETE' },
      orderBy: { processedAt: 'desc' },
      include: { findings: true },
    });
    if (last) latestAudit = mapRow(last);
  }

  if (!latestAudit && !workspace) {
    const guestAudit = auditId ? await getVisibilityAuditById(auditId) : null;
    latestAudit = guestAudit;
  }

  const sub = workspace?.subscriptions[0];
  const { intelligence, searchConsole } = await buildCanonicalIntelligence(
    lang,
    latestAudit,
    workspace?.id
  );
  const googleAds = workspace?.id
    ? await getGoogleAdsSnapshot(workspace.id)
    : { connected: false, source: 'unavailable' as const };

  return {
    workspace: workspace
      ? {
          id: workspace.id,
          companyName: workspace.companyName,
          setupState: sanitizeSetupStateForClient(workspace.setupState),
          initializedAt: workspace.initializedAt?.toISOString() ?? null,
        }
      : null,
    latestAudit,
    intelligence,
    searchConsole,
    googleAds,
    activity:
      workspace?.activityEvents.map((e) => ({
        type: e.type,
        titleDa: e.titleDa,
        titleEn: e.titleEn,
        createdAt: e.createdAt.toISOString(),
      })) ?? [],
    subscription: sub
      ? { tierId: sub.tierId, serviceLine: sub.serviceLine, status: sub.status }
      : null,
  };
}
