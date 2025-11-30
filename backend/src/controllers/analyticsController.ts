import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const trackEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId, eventType, metadata } = req.body;

    await prisma.analytics.create({
      data: {
        companyId,
        eventType,
        metadata: metadata || {},
      },
    });

    res.status(201).json({ message: 'Event tracked' });
  } catch (error) {
    console.error('Track event error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
};

export const getCompanyAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;

    // Verify ownership or admin
    if (userRole !== 'ADMIN') {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company || company.ownerId !== userId) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [profileViews, websiteClicks, leads, searchAppearances] = await Promise.all([
      prisma.analytics.count({
        where: {
          companyId,
          eventType: 'PROFILE_VIEW',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.analytics.count({
        where: {
          companyId,
          eventType: 'WEBSITE_CLICK',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.analytics.count({
        where: {
          companyId,
          eventType: 'INQUIRY',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.analytics.count({
        where: {
          companyId,
          eventType: 'SEARCH_APPEARANCE',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    res.json({
      analytics: {
        profileViews,
        websiteClicks,
        leads,
        searchAppearances,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
