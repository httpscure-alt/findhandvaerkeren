import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { AuthRequest } from '../middleware/auth';


// Get business dashboard data
export const getBusinessDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const company = await prisma.company.findUnique({
      where: { ownerId: userId },
      include: {
        services: true,
        portfolio: true,
        testimonials: true,
        inquiries: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          include: {
            consumer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        subscriptions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        savedBy: {
          take: 5,
          include: {
            consumer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            savedBy: true,
            inquiries: true,
          },
        },
      },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    res.json({ company });
  } catch (error) {
    console.error('Get business dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard' });
  }
};

// Update company listing
export const updateCompanyListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const updateData = req.body;

    // Sanitize update data to prevent Prisma "invalid value" errors
    const allowedFields = [
      'name',
      'description',
      'shortDescription',
      'contactEmail',
      'website',
      'logoUrl',
      'bannerUrl',
      'category',
      'location',
      'phone',
      'cvrNumber',
      'vatNumber',
      'legalName',
      'businessAddress',
    ];

    const sanitizedData: any = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        // Map empty strings to null for optional fields in database
        sanitizedData[field] = updateData[field] === '' ? null : updateData[field];
      }
    }

    const company = await prisma.company.update({
      where: { ownerId: userId },
      data: sanitizedData,
      include: {
        services: true,
        portfolio: true,
        testimonials: true,
      },
    });

    res.json({ company });
  } catch (error: any) {
    console.error('Update company listing error:', error);
    res.status(500).json({ 
      error: 'Failed to update listing',
      details: error.message || 'Unknown validation error'
    });
  }
};

// Get analytics (placeholder)
export const getBusinessAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const company = await prisma.company.findUnique({
      where: { ownerId: userId },
      select: { id: true },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Get basic stats
    const [views, saves, inquiries] = await Promise.all([
      prisma.analytics.count({
        where: {
          companyId: company.id,
          eventType: 'profile_view',
        },
      }),
      prisma.savedListing.count({
        where: { companyId: company.id },
      }),
      prisma.inquiry.count({
        where: { companyId: company.id },
      }),
    ]);

    res.json({
      views,
      saves,
      inquiries,
      message: 'Analytics endpoint - full implementation pending',
    });
  } catch (error) {
    console.error('Get business analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
};

// Get subscription details
export const getSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const company = await prisma.company.findUnique({
      where: { ownerId: userId },
      select: { id: true },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Get active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        companyId: company.id,
        status: { in: ['active', 'past_due'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      // No subscription yet is a valid state for a newly onboarded partner.
      res.json({ subscription: null });
      return;
    }

    res.json({ subscription });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
};







