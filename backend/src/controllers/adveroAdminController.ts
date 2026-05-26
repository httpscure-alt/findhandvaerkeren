import { Response } from 'express';
import { prisma } from '../prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

function parsePage(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? '25'), 10) || 25));
  return { page, limit, skip: (page - 1) * limit };
}

export const getAdveroAdminOverview = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      workspaces,
      workspacesWithUser,
      audits,
      auditsPending,
      auditsProcessing,
      auditsComplete,
      auditsFailed,
      activeSubscriptions,
      pendingFulfillment,
      fulfillmentsInProgress,
      totalUsers,
      adminUsers,
      recentAudits,
      recentWorkspaces,
    ] = await Promise.all([
      prisma.adveroWorkspace.count(),
      prisma.adveroWorkspace.count({ where: { userId: { not: null } } }),
      prisma.adveroAudit.count(),
      prisma.adveroAudit.count({ where: { status: 'PENDING' } }),
      prisma.adveroAudit.count({ where: { status: 'PROCESSING' } }),
      prisma.adveroAudit.count({ where: { status: 'COMPLETE' } }),
      prisma.adveroAudit.count({ where: { status: 'FAILED' } }),
      prisma.adveroSubscription.count({ where: { status: 'active' } }),
      prisma.adveroFulfillment.count({ where: { status: 'PENDING' } }),
      prisma.adveroFulfillment.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.adveroAudit.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          companyName: true,
          status: true,
          overallScore: true,
          contactEmail: true,
          createdAt: true,
        },
      }),
      prisma.adveroWorkspace.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          companyName: true,
          contactEmail: true,
          initializedAt: true,
          createdAt: true,
          user: { select: { email: true } },
          _count: { select: { audits: true, subscriptions: true } },
        },
      }),
    ]);

    res.json({
      workspaces,
      workspacesWithUser,
      audits,
      auditsPending,
      auditsProcessing,
      auditsComplete,
      auditsFailed,
      activeSubscriptions,
      pendingFulfillment,
      fulfillmentsInProgress,
      totalUsers,
      adminUsers,
      recentAudits,
      recentWorkspaces,
    });
  } catch {
    throw new AppError('Failed to load Advero overview', 500);
  }
};

export const listAdveroWorkspaces = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = parsePage(req.query as Record<string, unknown>);
    const search = String(req.query.search ?? '').trim();

    const where = search
      ? {
          OR: [
            { companyName: { contains: search, mode: 'insensitive' as const } },
            { contactEmail: { contains: search, mode: 'insensitive' as const } },
            { user: { email: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.adveroWorkspace.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          companyName: true,
          contactEmail: true,
          initializedAt: true,
          createdAt: true,
          user: { select: { id: true, email: true, name: true } },
          _count: { select: { audits: true, subscriptions: true } },
          subscriptions: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { tierId: true, status: true, serviceLine: true },
          },
        },
      }),
      prisma.adveroWorkspace.count({ where }),
    ]);

    res.json({
      workspaces: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    throw new AppError('Failed to list workspaces', 500);
  }
};

export const listAdveroAudits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = parsePage(req.query as Record<string, unknown>);
    const search = String(req.query.search ?? '').trim();
    const status = String(req.query.status ?? '').trim();

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
        { websiteUrl: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.adveroAudit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          companyName: true,
          websiteUrl: true,
          contactEmail: true,
          status: true,
          overallScore: true,
          industry: true,
          createdAt: true,
          processedAt: true,
          workspace: { select: { id: true, companyName: true } },
        },
      }),
      prisma.adveroAudit.count({ where }),
    ]);

    res.json({
      audits: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    throw new AppError('Failed to list audits', 500);
  }
};

export const listAdveroSubscriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = parsePage(req.query as Record<string, unknown>);
    const status = String(req.query.status ?? '').trim();

    const where = status ? { status } : {};

    const [items, total] = await Promise.all([
      prisma.adveroSubscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          tierId: true,
          serviceLine: true,
          status: true,
          billingCycle: true,
          currentPeriodEnd: true,
          stripeCustomerId: true,
          createdAt: true,
          workspace: {
            select: {
              id: true,
              companyName: true,
              contactEmail: true,
              user: { select: { email: true } },
            },
          },
        },
      }),
      prisma.adveroSubscription.count({ where }),
    ]);

    res.json({
      subscriptions: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    throw new AppError('Failed to list subscriptions', 500);
  }
};

export const listAdveroFulfillment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = parsePage(req.query as Record<string, unknown>);
    const status = String(req.query.status ?? '').trim();
    const serviceLine = String(req.query.serviceLine ?? '').trim();

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (serviceLine) where.serviceLine = serviceLine;

    const [items, total] = await Promise.all([
      prisma.adveroFulfillment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          serviceLine: true,
          tierId: true,
          companyName: true,
          contactEmail: true,
          userEmail: true,
          websiteUrl: true,
          overallScore: true,
          weakestChannel: true,
          planHeadline: true,
          notes: true,
          auditId: true,
          workspaceId: true,
          stripeSubscriptionId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.adveroFulfillment.count({ where }),
    ]);

    res.json({
      fulfillments: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    throw new AppError('Failed to list fulfillment queue', 500);
  }
};

export const updateAdveroFulfillment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id ?? '').trim();
    if (!id) {
      throw new AppError('Missing fulfillment id', 400);
    }

    const { status, notes } = req.body as { status?: string; notes?: string };
    const data: { status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'; notes?: string | null } = {};

    if (status !== undefined) {
      const allowed = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      if (!allowed.includes(status)) {
        throw new AppError('Invalid status', 400);
      }
      data.status = status as typeof data.status;
    }
    if (notes !== undefined) {
      data.notes = notes === '' ? null : String(notes);
    }

    if (!Object.keys(data).length) {
      throw new AppError('No fields to update', 400);
    }

    const updated = await prisma.adveroFulfillment.update({
      where: { id },
      data,
      select: {
        id: true,
        status: true,
        notes: true,
        updatedAt: true,
      },
    });

    res.json({ fulfillment: updated });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Failed to update fulfillment', 500);
  }
};
