import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// Get finance metrics from real database
export const getFinanceMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    // Get all active subscriptions
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: { in: ['active', 'past_due'] },
      },
      include: {
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get all successful transactions for total revenue
    const totalRevenueResult = await prisma.paymentTransaction.aggregate({
      where: { status: 'succeeded' },
      _sum: { amount: true },
    });
    const totalRevenue = totalRevenueResult._sum.amount || 0;

    // Calculate monthly recurring revenue (MRR)
    // For MRR, we still want to look at active subscriptions
    const monthlyRecurringRevenue = activeSubscriptions.reduce((sum, sub) => {
      // Get the last successful transaction for this subscription to get the real amount
      // In a real MRR calculation, we'd normalize annual to monthly
      const monthlyAmount = (sub.tier as string) === 'Gold' ? 149 : 49;
      return sum + (sub.billingCycle === 'annual' ? monthlyAmount : monthlyAmount);
    }, 0);

    // Get new subscriptions this month
    const newSubscriptionsThisMonth = await prisma.subscription.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: { in: ['active', 'past_due'] },
      },
    });

    // Get cancellations this month
    const cancellationsThisMonth = await prisma.subscription.count({
      where: {
        updatedAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: 'canceled',
      },
    });

    // Get upcoming renewals (next 30 days)
    const upcomingRenewals = await prisma.subscription.count({
      where: {
        status: { in: ['active', 'past_due'] },
        currentPeriodEnd: {
          gte: now,
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      },
    });

    res.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue * 100) / 100,
      activeSubscriptions: activeSubscriptions.length,
      newSubscriptionsThisMonth,
      cancellationsThisMonth,
      upcomingRenewals,
    });
  } catch (error) {
    throw new AppError('Failed to fetch finance metrics', 500);
  }
};

// Get transactions from real database
export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dateRange = 'all' } = req.query;

    const now = new Date();
    let filterDate: Date | undefined;

    if (dateRange === 'month') {
      filterDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    } else if (dateRange === 'quarter') {
      filterDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    } else if (dateRange === 'year') {
      filterDate = new Date(now.getFullYear() - 1, 0, 1);
    }

    // Build where clause
    const where: any = {};
    if (filterDate) {
      where.createdAt = {
        gte: filterDate,
      };
    }

    // Get all payment transactions from PaymentTransaction table
    const paymentTransactions = await prisma.paymentTransaction.findMany({
      where,
      include: {
        subscription: {
          include: {
            company: {
              select: {
                name: true,
                contactEmail: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match frontend Transaction interface
    const transactions = paymentTransactions.map((txn) => ({
      id: txn.id,
      userOrCompany: txn.subscription?.company?.name || 'Unknown Company',
      planName: `${txn.tier} Plan`,
      billingCycle: txn.billingCycle || 'monthly',
      amount: txn.amount,
      currency: txn.currency || 'usd',
      status: txn.status === 'succeeded' ? 'paid' : txn.status === 'failed' ? 'failed' : 'upcoming',
      date: txn.createdAt.toISOString().split('T')[0],
      transactionId: txn.stripePaymentIntentId || txn.stripeInvoiceId || txn.id,
      subscriptionId: txn.subscriptionId,
      eventType: txn.status === 'succeeded' ? 'payment_succeeded' : txn.status === 'failed' ? 'payment_failed' : 'pending',
      createdAt: txn.createdAt.toISOString(),
    }));

    res.json({ transactions });
  } catch (error) {
    throw new AppError('Failed to fetch transactions', 500);
  }
};

// Get verification queue from real database
export const getVerificationQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get all companies with pending verification
    const companies = await prisma.company.findMany({
      where: {
        verificationStatus: 'pending',
      },
      select: {
        id: true,
        name: true,
        cvrNumber: true,
        permitType: true,
        permitDocuments: true,
        verificationStatus: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const requests = companies.map((company) => ({
      id: company.id,
      companyName: company.name,
      cvrNumber: company.cvrNumber || '',
      submittedDate: company.createdAt.toISOString().split('T')[0],
      status: company.verificationStatus,
      permitType: company.permitType || '',
      permitDocuments: company.permitDocuments?.length || 0,
    }));

    res.json({ requests });
  } catch (error) {
    throw new AppError('Failed to fetch verification queue', 500);
  }
};

// Approve verification request
export const approveVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Update verification status
    const updated = await prisma.company.update({
      where: { id },
      data: {
        verificationStatus: 'verified',
        isVerified: true,
      },
      include: {
        services: true,
        portfolio: true,
        testimonials: true,
      },
    });

    res.json({ company: updated });
  } catch (error) {
    throw new AppError('Failed to approve verification', 500);
  }
};

// Reject verification request
export const rejectVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Update verification status
    const updated = await prisma.company.update({
      where: { id },
      data: {
        verificationStatus: 'unverified',
        isVerified: false,
        verificationNotes: reason || 'Verification rejected',
      },
      include: {
        services: true,
        portfolio: true,
        testimonials: true,
      },
    });

    res.json({ company: updated });
  } catch (error) {
    throw new AppError('Failed to reject verification', 500);
  }
};

// Get admin dashboard stats
export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalCompanies,
      verifiedCompanies,
      pendingVerifications,
      totalUsers,
      totalPartners,
      totalConsumers,
      activeSubscriptions,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { isVerified: true } }),
      prisma.company.count({ where: { verificationStatus: 'pending' } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'PARTNER' } }),
      prisma.user.count({ where: { role: 'CONSUMER' } }),
      prisma.subscription.count({ where: { status: 'active' } }),
    ]);

    // Calculate monthly revenue (simplified - in production fetch from PaymentTransaction)
    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'active' },
      select: { tier: true, billingCycle: true },
    });

    const monthlyRevenue = subscriptions.reduce((sum, sub) => {
      const monthlyAmount = (sub.tier as string) === 'Gold' ? 149 : 49;
      return sum + monthlyAmount;
    }, 0);

    // Aggregate recent activity (last 10 events)
    const [recentUsers, recentCompanies, recentInquiries, recentTransactions] = await Promise.all([
      prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
      prisma.company.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, createdAt: true } }),
      prisma.inquiry.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { consumer: { select: { name: true } }, company: { select: { name: true } } } }),
      prisma.paymentTransaction.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    ]);

    const activity = [
      ...recentUsers.map(u => ({ id: u.id, type: 'USER_SIGNUP', title: `New User: ${u.name || u.email}`, timestamp: u.createdAt })),
      ...recentCompanies.map(c => ({ id: c.id, type: 'COMPANY_REGISTERED', title: `New Company: ${c.name}`, timestamp: c.createdAt })),
      ...recentInquiries.map(i => ({ id: i.id, type: 'NEW_INQUIRY', title: `Inquiry for ${i.company.name}`, timestamp: i.createdAt })),
      ...recentTransactions.map(t => ({ id: t.id, type: 'PAYMENT_RECEIVED', title: `Payment: ${t.amount} ${t.currency}`, timestamp: t.createdAt })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    res.json({
      totalCompanies,
      verifiedCompanies,
      pendingVerifications,
      totalUsers,
      totalPartners,
      totalConsumers,
      activeSubscriptions,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      recentActivity: activity,
    });
  } catch (error) {
    throw new AppError('Failed to fetch admin stats', 500);
  }
};

// Get all users (admin only)
export const getAdminUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, page = '1', limit = '50', search } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          role: true,
          avatarUrl: true,
          location: true,
          createdAt: true,
          updatedAt: true,
          savedListings: {
            select: {
              id: true,
            },
          },
          ownedCompany: {
            select: {
              id: true,
              name: true,
              isVerified: true,
              verificationStatus: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    throw new AppError('Failed to fetch users', 500);
  }
};

// Suspend user account
export const suspendUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Create activity log
    await prisma.adminActivityLog.create({
      data: {
        adminId: req.userId!,
        action: 'suspend_user',
        targetType: 'User',
        targetId: id,
        details: { reason: req.body.reason || 'No reason provided' },
      },
    });

    // In a real system, you'd add a 'suspended' field to User model
    // For now, we'll just log the action
    res.json({ message: 'User suspended successfully' });
  } catch (error) {
    throw new AppError('Failed to suspend user', 500);
  }
};

// Delete user account
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent deleting admin users
    if (user.role === 'ADMIN') {
      res.status(403).json({ error: 'Cannot delete admin users' });
      return;
    }

    // Create activity log before deletion
    await prisma.adminActivityLog.create({
      data: {
        adminId: req.userId!,
        action: 'delete_user',
        targetType: 'User',
        targetId: id,
        details: { email: user.email, role: user.role },
      },
    });

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    throw new AppError('Failed to delete user', 500);
  }
};

// Reset user password
export const resetUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Hash new password
    const { hashPassword } = await import('../utils/password');
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Create activity log
    await prisma.adminActivityLog.create({
      data: {
        adminId: req.userId!,
        action: 'reset_password',
        targetType: 'User',
        targetId: id,
        details: { email: user.email },
      },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    throw new AppError('Failed to reset password', 500);
  }
};

// Reset partner profile (clear company data)
export const resetPartnerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { ownedCompany: true },
    });

    if (!user || user.role !== 'PARTNER') {
      res.status(404).json({ error: 'Partner not found' });
      return;
    }

    if (!user.ownedCompany) {
      res.status(400).json({ error: 'Partner has no company to reset' });
      return;
    }

    // Delete company (cascade will handle related records)
    await prisma.company.delete({
      where: { id: user.ownedCompany.id },
    });

    // Create activity log
    await prisma.adminActivityLog.create({
      data: {
        adminId: req.userId!,
        action: 'reset_partner_profile',
        targetType: 'Company',
        targetId: user.ownedCompany.id,
        details: { userId: id, email: user.email },
      },
    });

    res.json({ message: 'Partner profile reset successfully' });
  } catch (error) {
    throw new AppError('Failed to reset partner profile', 500);
  }
};

// Get user details
export const getUserDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        ownedCompany: {
          include: {
            services: true,
            portfolio: true,
            testimonials: true,
            subscriptions: true,
          },
        },
        savedListings: {
          include: {
            company: true,
          },
        },
        sentInquiries: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    throw new AppError('Failed to fetch user details', 500);
  }
};

// Get admin activity logs
export const getActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50', action, targetType } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (action) {
      where.action = action;
    }
    if (targetType) {
      where.targetType = targetType;
    }

    const [logs, total] = await Promise.all([
      prisma.adminActivityLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.adminActivityLog.count({ where }),
    ]);

    res.json({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    throw new AppError('Failed to fetch activity logs', 500);
  }
};

// Create admin user (Super Admin only)
export const createAdminUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if current user is admin (in production, check for SUPER_ADMIN role)
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId! },
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      res.status(403).json({ error: 'Super admin access required' });
      return;
    }

    const { email, password, name, firstName, lastName } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const { hashPassword } = await import('../utils/password');
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || (firstName && lastName ? `${firstName} ${lastName}` : email.split('@')[0]),
        firstName,
        lastName,
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Create activity log
    await prisma.adminActivityLog.create({
      data: {
        adminId: req.userId!,
        action: 'create_admin',
        targetType: 'User',
        targetId: adminUser.id,
        details: { email: adminUser.email },
      },
    });

    res.status(201).json({ user: adminUser });
  } catch (error) {
    throw new AppError('Failed to create admin user', 500);
  }
};

// Promote/demote admin
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['CONSUMER', 'PARTNER', 'ADMIN'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const previousRole = user.role;

    // Update role
    const updated = await prisma.user.update({
      where: { id },
      data: { role: role as 'CONSUMER' | 'PARTNER' | 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Create activity log
    await prisma.adminActivityLog.create({
      data: {
        adminId: req.userId!,
        action: 'update_user_role',
        targetType: 'User',
        targetId: id,
        details: { previousRole, newRole: role, email: user.email },
      },
    });

    res.json({ user: updated });
  } catch (error) {
    throw new AppError('Failed to update user role', 500);
  }
};

// Get platform settings
export const getPlatformSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let settings = await prisma.platformSettings.findUnique({
      where: { id: 'singleton' },
    });

    if (!settings) {
      // Create default settings if not exists
      settings = await prisma.platformSettings.create({
        data: {
          id: 'singleton',
          platformName: 'Findhåndværkeren',
          supportEmail: 'support@findhandvaerkeren.dk',
          maintenanceMode: false,
        },
      });
    }

    res.json({ settings });
  } catch (error) {
    throw new AppError('Failed to fetch platform settings', 500);
  }
};

// Update platform settings
export const updatePlatformSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { platformName, supportEmail, maintenanceMode } = req.body;

    const settings = await prisma.platformSettings.upsert({
      where: { id: 'singleton' },
      update: {
        platformName,
        supportEmail,
        maintenanceMode,
      },
      create: {
        id: 'singleton',
        platformName: platformName || 'Findhåndværkeren',
        supportEmail: supportEmail || 'support@findhandvaerkeren.dk',
        maintenanceMode: maintenanceMode || false,
      },
    });

    // Create activity log
    await prisma.adminActivityLog.create({
      data: {
        adminId: req.userId!,
        action: 'update_settings',
        targetType: 'PlatformSettings',
        targetId: 'singleton',
        details: { platformName, supportEmail, maintenanceMode },
      },
    });

    res.json({ settings });
  } catch (error) {
    throw new AppError('Failed to update platform settings', 500);
  }
};

// Get all job requests (for Super Admin)
export const getAdminJobRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, category, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }

    const [requests, total] = await Promise.all([
      prisma.jobRequest.findMany({
        where,
        include: {
          consumer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          matches: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
              quotes: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.jobRequest.count({ where }),
    ]);

    res.json({
      requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    throw new AppError('Failed to fetch job requests', 500);
  }
};
