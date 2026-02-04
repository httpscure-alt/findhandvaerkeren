import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * Export user data (GDPR Right to Data Portability)
 * GET /api/gdpr/export-data
 */
export const exportUserData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Get all user data
    const user: any = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedCompany: {
          include: {
            services: true,
            portfolio: true,
            testimonials: true,
            subscriptions: {
              include: {
                paymentTransactions: true,
                subscriptionHistory: true,
              },
            },
            analytics: true,
            permitDocuments: true,
          },
        },
        savedListings: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                category: true,
                location: true,
              },
            },
          },
        },
        sentInquiries: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      } as any,
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Format data for export
    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        location: user.location,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      company: user.ownedCompany ? {
        id: user.ownedCompany.id,
        name: user.ownedCompany.name,
        description: user.ownedCompany.description,
        category: user.ownedCompany.category,
        location: user.ownedCompany.location,
        contactEmail: user.ownedCompany.contactEmail,
        website: user.ownedCompany.website,
        services: user.ownedCompany.services,
        portfolio: user.ownedCompany.portfolio,
        testimonials: user.ownedCompany.testimonials,
        subscriptions: user.ownedCompany.subscriptions.map((sub: any) => ({
          id: sub.id,
          tier: sub.tier,
          status: sub.status,
          billingCycle: sub.billingCycle,
          startDate: sub.startDate,
          endDate: sub.endDate,
          createdAt: sub.createdAt,
        })),
        paymentTransactions: user.ownedCompany.subscriptions.flatMap((sub: any) =>
          sub.paymentTransactions.map((txn: any) => ({
            id: txn.id,
            amount: txn.amount,
            currency: txn.currency,
            status: txn.status,
            createdAt: txn.createdAt,
          }))
        ),
      } : null,
      savedListings: user.savedListings.map((saved: any) => ({
        companyId: saved.companyId,
        companyName: saved.company?.name,
        savedAt: saved.createdAt,
      })),
      inquiries: user.sentInquiries.map((inquiry: any) => ({
        id: inquiry.id,
        companyId: inquiry.companyId,
        companyName: inquiry.company?.name,
        message: inquiry.message,
        createdAt: inquiry.createdAt,
      })),
      exportedAt: new Date().toISOString(),
    };

    // Create activity log
    await prisma.adminActivityLog.create({
      data: {
        adminId: userId,
        action: 'export_data',
        targetType: 'User',
        targetId: userId,
        details: { email: user.email },
      },
    });

    res.json({ data: exportData });
  } catch (error) {
    throw new AppError('Failed to export user data', 500);
  }
};

/**
 * Delete user account (GDPR Right to Erasure)
 * DELETE /api/gdpr/delete-account
 */
export const deleteUserAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedCompany: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent deleting admin users
    if (user.role === 'ADMIN') {
      res.status(403).json({ error: 'Admin accounts cannot be deleted via this endpoint' });
      return;
    }

    // Create activity log before deletion
    await prisma.adminActivityLog.create({
      data: {
        adminId: userId,
        action: 'delete_account_gdpr',
        targetType: 'User',
        targetId: userId,
        details: {
          email: user.email,
          role: user.role,
          reason: 'GDPR Right to Erasure',
        },
      },
    });

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      message: 'Account deleted successfully',
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw new AppError('Failed to delete account', 500);
  }
};





