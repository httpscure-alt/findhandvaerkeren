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
  /** Post-checkout onboarding status shown in the client dashboard. */
  manualFulfillment: {
    status: string;
    serviceLine: string;
    titleDa: string;
    titleEn: string;
    bodyDa: string;
    bodyEn: string;
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

  const subscription = await prisma.adveroSubscription.upsert({
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

  const { recordFulfillmentAfterPayment } = await import('./adveroFulfillmentService');
  await recordFulfillmentAfterPayment({
    workspaceId: workspace.id,
    subscriptionId: subscription.id,
    tierId: opts.tierId,
    serviceLine: opts.serviceLine,
    stripeSubscriptionId: opts.stripeSubscriptionId,
    stripeCustomerId: opts.stripeCustomerId,
    auditId: opts.auditId,
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
      manualFulfillment: null,
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
  let manualFulfillment: AdveroDashboardPayload['manualFulfillment'] = null;

  if (sub && workspace) {
    const line = sub.serviceLine.toLowerCase();
    if (['seo', 'ads', 'growth'].includes(line) && sub.status === 'active') {
      const fulfillment = await prisma.adveroFulfillment.findFirst({
        where: {
          workspaceId: workspace.id,
          subscriptionId: sub.id,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (fulfillment) {
        const serviceName =
          line === 'seo'
            ? { da: 'SEO', en: 'SEO' }
            : line === 'ads'
              ? { da: 'Google Ads', en: 'Google Ads' }
              : { da: 'Growth+ (SEO + Ads)', en: 'Growth+ (SEO + Ads)' };
        manualFulfillment = {
          status: fulfillment.status,
          serviceLine: line,
          titleDa: `Vi starter jeres ${serviceName.da}`,
          titleEn: `We're getting your ${serviceName.en} started`,
          bodyDa:
            line === 'seo'
              ? 'Tak for jeres abonnement. Vi gennemgår jeres audit og sætter SEO-arbejdet i gang. I kan følge status her i dashboardet.'
              : line === 'ads'
                ? 'Tak for jeres abonnement. Vi opsætter jeres Google Ads-konto og kampagner. I får besked her, når I kan forbinde kontoen i dashboardet.'
                : 'Tak for jeres abonnement. Vi sætter SEO og Google Ads i gang for jer. Status opdateres løbende her i dashboardet.',
          bodyEn:
            line === 'seo'
              ? 'Thank you for subscribing. We are reviewing your audit and starting your SEO work. You can follow progress here in your dashboard.'
              : line === 'ads'
                ? 'Thank you for subscribing. We are setting up your Google Ads account and campaigns. We will notify you here when you can connect your account in the dashboard.'
                : 'Thank you for subscribing. We are getting your SEO and Google Ads underway. Status updates will appear here in your dashboard.',
        };
      }
    }
  }

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
    manualFulfillment,
  };
}
