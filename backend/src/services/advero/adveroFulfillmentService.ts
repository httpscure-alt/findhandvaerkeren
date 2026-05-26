import { prisma } from '../../prisma/client';
import { logger } from '../../config/logger';
import { emailService } from '../emailService';

const SITE_URL = (process.env.ADVERO_SITE_URL || process.env.FRONTEND_URL || 'https://advero.dk').replace(
  /\/$/,
  ''
);

/** Manual delivery checklist until autonomous SEO/Ads engine is live. */
export function manualFulfillmentTasks(serviceLine: string, lang: 'da' | 'en' = 'da'): string[] {
  const line = serviceLine.toLowerCase();
  const isDa = lang === 'da';

  if (line === 'seo') {
    return isDa
      ? [
          'Gennemgå audit + prioriter søgeord og lokale muligheder',
          'Forbind Search Console og Google Business Profile (eller få adgang fra kunden)',
          'On-page SEO: titler, meta, H-struktur og intern linking',
          'Teknisk gennemgang (indeksering, hastighed, mobil)',
          'Lokal synlighed / NAP og citations hvor relevant',
          'Opsæt månedlig rapportering til kunden i dashboard',
        ]
      : [
          'Review audit and prioritize keywords and local opportunities',
          'Connect Search Console and Google Business Profile (or obtain client access)',
          'On-page SEO: titles, meta, headings, and internal linking',
          'Technical review (indexing, speed, mobile)',
          'Local visibility / NAP and citations where relevant',
          'Configure monthly client reporting in the dashboard',
        ];
  }

  if (line === 'ads') {
    return isDa
      ? [
          'Gennemgå audit og konverteringsmål med kunden',
          'Opret/forbind Google Ads-konto og fakturering',
          'Kampagnestruktur, annoncegrupper og budstrategi',
          'Konverteringssporing (GA4 / tags)',
          'Launch + første optimering efter 7–14 dage',
        ]
      : [
          'Review audit and conversion goals with the client',
          'Create/connect Google Ads account and billing',
          'Campaign structure, ad groups, and bidding strategy',
          'Conversion tracking (GA4 / tags)',
          'Launch and first optimization after 7–14 days',
        ];
  }

  if (line === 'growth') {
    const seo = manualFulfillmentTasks('seo', lang);
    const ads = manualFulfillmentTasks('ads', lang);
    const seoLabel = isDa ? 'SEO-delen' : 'SEO workstream';
    const adsLabel = isDa ? 'Ads-delen' : 'Ads workstream';
    return [`[${seoLabel}]`, ...seo, `[${adsLabel}]`, ...ads];
  }

  return [];
}

export function opsEmailRecipients(): string[] {
  const raw = process.env.ADVERO_OPS_EMAIL || process.env.ADMIN_NOTIFY_EMAIL || 'admin@advero.dk';
  return raw
    .split(/[,;]/)
    .map((e) => e.trim())
    .filter(Boolean);
}

function weakestFromScores(scores: {
  search?: number | null;
  local?: number | null;
  ai?: number | null;
  web?: number | null;
}): string | null {
  const entries = [
    ['search', scores.search ?? 100],
    ['local', scores.local ?? 100],
    ['ai', scores.ai ?? 100],
    ['web', scores.web ?? 100],
  ] as const;
  return entries.reduce((a, b) => (a[1] <= b[1] ? a : b))[0];
}

export async function createFulfillmentFromAdveroCheckout(opts: {
  workspaceId: string;
  subscriptionId: string;
  tierId: string;
  serviceLine: string;
  stripeSubscriptionId: string;
  stripeCustomerId?: string;
  auditId?: string;
}): Promise<{ id: string; created: boolean }> {
  const workspace = await prisma.adveroWorkspace.findUnique({
    where: { id: opts.workspaceId },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!workspace) {
    throw new Error('Workspace not found');
  }

  let audit = opts.auditId
    ? await prisma.adveroAudit.findUnique({ where: { id: opts.auditId } })
    : null;
  if (!audit) {
    audit = await prisma.adveroAudit.findFirst({
      where: { workspaceId: opts.workspaceId, status: 'COMPLETE' },
      orderBy: { processedAt: 'desc' },
    });
  }

  const recommendation = audit?.recommendationJson as { headlineDa?: string; headlineEn?: string } | null;
  const planHeadline = recommendation?.headlineDa || recommendation?.headlineEn || null;

  const existing = opts.stripeSubscriptionId
    ? await prisma.adveroFulfillment.findUnique({
        where: { stripeSubscriptionId: opts.stripeSubscriptionId },
      })
    : null;

  if (existing) {
    return { id: existing.id, created: false };
  }

  const fulfillment = await prisma.adveroFulfillment.create({
    data: {
      workspaceId: opts.workspaceId,
      subscriptionId: opts.subscriptionId,
      auditId: audit?.id,
      serviceLine: opts.serviceLine,
      tierId: opts.tierId,
      status: 'PENDING',
      companyName: workspace.companyName,
      contactEmail: workspace.contactEmail,
      userEmail: workspace.user?.email,
      websiteUrl: audit?.websiteUrl,
      overallScore: audit?.overallScore,
      weakestChannel: audit
        ? weakestFromScores({
            search: audit.scoreSearch,
            local: audit.scoreLocal,
            ai: audit.scoreAi,
            web: audit.scoreWeb,
          })
        : null,
      planHeadline,
      stripeSubscriptionId: opts.stripeSubscriptionId,
      stripeCustomerId: opts.stripeCustomerId,
    },
  });

  return { id: fulfillment.id, created: true };
}

export async function notifyOpsNewFulfillment(fulfillmentId: string): Promise<void> {
  const row = await prisma.adveroFulfillment.findUnique({ where: { id: fulfillmentId } });
  if (!row) return;

  const adminUrl = `${SITE_URL}/advero/admin/fulfillment`;
  const auditUrl = row.auditId
    ? `${SITE_URL}/advero/audit/results?id=${encodeURIComponent(row.auditId)}`
    : null;

  const serviceLabel =
    row.serviceLine === 'ads'
      ? 'Google Ads'
      : row.serviceLine === 'seo'
        ? 'SEO'
        : row.serviceLine === 'growth'
          ? 'Growth+ (SEO + Ads)'
          : row.serviceLine;

  const manualTasks = manualFulfillmentTasks(row.serviceLine, 'da');

  await emailService.sendOpsFulfillmentEmail(opsEmailRecipients(), {
    companyName: row.companyName,
    serviceLabel,
    tierId: row.tierId,
    contactEmail: row.contactEmail || row.userEmail || '—',
    userEmail: row.userEmail,
    websiteUrl: row.websiteUrl,
    overallScore: row.overallScore,
    weakestChannel: row.weakestChannel,
    planHeadline: row.planHeadline,
    adminUrl,
    auditUrl,
    fulfillmentId: row.id,
    manualTasks,
    deliveryMode: 'manual',
  });
}

export async function recordFulfillmentAfterPayment(opts: {
  workspaceId: string;
  subscriptionId: string;
  tierId: string;
  serviceLine: string;
  stripeSubscriptionId: string;
  stripeCustomerId?: string;
  auditId?: string;
}): Promise<void> {
  const line = opts.serviceLine.toLowerCase();
  if (!['ads', 'seo', 'growth'].includes(line)) {
    return;
  }

  try {
    const { id, created } = await createFulfillmentFromAdveroCheckout(opts);
    if (created) {
      await notifyOpsNewFulfillment(id);
      logger.info('Advero fulfillment created and ops notified', {
        fulfillmentId: id,
        serviceLine: line,
        tierId: opts.tierId,
      });
    }
  } catch (err) {
    logger.error('Failed to record Advero fulfillment', {
      error: (err as Error).message,
      workspaceId: opts.workspaceId,
    });
  }
}
