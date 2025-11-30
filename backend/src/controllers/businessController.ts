import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

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

    const company = await prisma.company.update({
      where: { ownerId: userId },
      data: updateData,
      include: {
        services: true,
        portfolio: true,
        testimonials: true,
      },
    });

    res.json({ company });
  } catch (error) {
    console.error('Update company listing error:', error);
    res.status(500).json({ error: 'Failed to update listing' });
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
