
import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { AuthRequest } from '../middleware/auth';
import { GrowthCampaignStatus } from '@prisma/client';

const isBypassEmail = (email?: string | null) => (email || '').toLowerCase() === 'httpscure@gmail.com';

async function ensureCompanyAccess(req: Request, companyId: string) {
  const userId = (req as any).userId as string | undefined;
  const userRole = (req as any).userRole as string | undefined;
  if (!userId) return { ok: false as const, status: 401, error: 'Unauthorized' };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true },
  });
  if (!user) return { ok: false as const, status: 401, error: 'Unauthorized' };

  if (user.role === 'ADMIN' || userRole === 'ADMIN') return { ok: true as const, user };

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, ownerId: true },
  });
  if (!company) return { ok: false as const, status: 404, error: 'Company not found' };

  if (company.ownerId !== userId) return { ok: false as const, status: 403, error: 'Not authorized' };

  return { ok: true as const, user };
}

async function hasGrowthAccess(companyId: string, userEmail?: string | null) {
  if (isBypassEmail(userEmail)) return true;
  const active = await prisma.marketingSubscription.findFirst({
    where: {
      companyId,
      status: { in: ['active', 'past_due'] },
      serviceType: { in: ['seo', 'ads'] },
    },
    select: { id: true },
  });
  return !!active;
}


// Submit a new growth request
export const submitGrowthRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { services, details } = req.body;
        const userId = (req as AuthRequest).userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Find company owner by user ID
        const company = await prisma.company.findUnique({
            where: { ownerId: userId },
        });

        if (!company) {
            res.status(404).json({ error: 'Company not found' });
            return;
        }

        // Create a request for each service selected
        // For simplicity, we can create one request per service type or bundle them.
        // Based on the frontend, 'services' is an array ['seo'] or ['ads'].
        // We will create one request record per service type found in the array.

        const requests = [];

        for (const service of services) {
            const type = service.toUpperCase(); // SEO, ADS
            if (['SEO', 'ADS'].includes(type)) {
                const request = await prisma.growthRequest.create({
                    data: {
                        companyId: company.id,
                        type: type as 'SEO' | 'ADS',
                        details: details,
                        status: 'PENDING'
                    }
                });
                requests.push(request);
            }
        }

        // Create a notification for the user
        await prisma.notification.create({
            data: {
                userId: userId,
                title: 'Growth Request Submitted',
                message: `Your request for ${services.join(', ')} has been submitted successfully.`,
                type: 'success'
            }
        });

        res.status(201).json({ success: true, requests });
    } catch (error) {
        console.error('Error submitting growth request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all growth requests (Admin only)
export const getGrowthRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const requests = await prisma.growthRequest.findMany({
            include: {
                company: {
                    select: {
                        name: true,
                        contactEmail: true,
                        owner: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ requests });
    } catch (error) {
        console.error('Error fetching growth requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update growth request status (Admin only)
export const updateGrowthRequestStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const request = await prisma.growthRequest.update({
            where: { id },
            data: { status }
        });

        // Notify the company owner
        const company = await prisma.company.findUnique({
            where: { id: request.companyId }
        });

        if (company) {
            await prisma.notification.create({
                data: {
                    userId: company.ownerId,
                    title: 'Growth Request Update',
                    message: `Your ${request.type} request status has been updated to ${status}.`,
                    type: 'info'
                }
            });
        }

        res.json({ success: true, request });
    } catch (error) {
        console.error('Error updating growth request status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getCompanyGrowthDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;
    const access = await ensureCompanyAccess(req, companyId);
    if (!access.ok) {
      res.status(access.status).json({ error: access.error });
      return;
    }

    const allowed = await hasGrowthAccess(companyId, access.user.email);
    if (!allowed) {
      res.json({ hasAccess: false });
      return;
    }

    const [campaigns, metrics, logs] = await Promise.all([
      prisma.growthCampaign.findMany({
        where: { companyId, type: { in: ['SEO', 'ADS'] } as any },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.growthPerformanceMetrics.findMany({
        where: { companyId, type: { in: ['SEO', 'ADS'] } as any },
      }),
      prisma.growthOptimizationLog.findMany({
        where: { companyId, type: { in: ['SEO', 'ADS'] } as any },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    res.json({ hasAccess: true, campaigns, metrics, logs });
  } catch (error) {
    console.error('Error fetching growth dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCompanyCampaigns = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;
    const access = await ensureCompanyAccess(req, companyId);
    if (!access.ok) {
      res.status(access.status).json({ error: access.error });
      return;
    }

    const allowed = await hasGrowthAccess(companyId, access.user.email);
    if (!allowed) {
      res.json({ hasAccess: false, campaigns: [] });
      return;
    }

    const campaigns = await prisma.growthCampaign.findMany({
      where: { companyId, type: { in: ['SEO', 'ADS'] } as any },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ hasAccess: true, campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const upsertCompanyCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;
    const userId = (req as any).userId as string | undefined;
    const { type, status, notes } = req.body as { type: 'SEO' | 'ADS'; status: string; notes?: string };

    if (!type || (type !== 'SEO' && type !== 'ADS')) {
      res.status(400).json({ error: 'type must be SEO or ADS' });
      return;
    }
    if (!status) {
      res.status(400).json({ error: 'status is required' });
      return;
    }

    const allowedStatuses = new Set<GrowthCampaignStatus>([
      'NOT_STARTED',
      'SETUP',
      'RUNNING',
      'OPTIMIZING',
      'PAUSED',
    ]);
    if (!allowedStatuses.has(status as GrowthCampaignStatus)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const updated = await prisma.growthCampaign.upsert({
      where: { companyId_type: { companyId, type } },
      update: { status: status as GrowthCampaignStatus, notes: notes || null, updatedById: userId || null },
      create: { companyId, type, status: status as GrowthCampaignStatus, notes: notes || null, updatedById: userId || null },
    });

    res.json({ campaign: updated });
  } catch (error) {
    console.error('Error upserting campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
