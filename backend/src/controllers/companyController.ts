import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      location,
      verifiedOnly,
      search,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (category && category !== 'All') {
      where.category = category;
    }

    if (location && location !== 'All') {
      where.location = location;
    }

    if (verifiedOnly === 'true') {
      // Use verificationStatus === 'verified' for verified filter (Danish verification requirements)
      where.OR = [
        { verificationStatus: 'verified' },
        { isVerified: true },
      ];
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { shortDescription: { contains: search as string, mode: 'insensitive' } },
        { tags: { has: search as string } },
      ];
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          services: true,
          portfolio: true,
          testimonials: true,
          subscriptions: true,
        },
        skip,
        take: limitNum,
        orderBy: {
          [sortBy as string]: sortOrder as 'asc' | 'desc',
        },
      }),
      prisma.company.count({ where }),
    ]);

    res.json({
      companies,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    // Log the actual error for debugging
    console.error('Error fetching companies:', error);

    // If it's a database connection error, return empty array instead of failing
    // This allows the app to work in mock mode
    if (error.code === 'P1001' || error.message?.includes('Can\'t reach database') || error.message?.includes('database')) {
      console.warn('Database unavailable, returning empty companies array');
      res.json({
        companies: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });
      return;
    }

    throw new AppError(error.message || 'Failed to fetch companies', 500);
  }
};

export const getCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        services: true,
        portfolio: true,
        testimonials: true,
      },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    res.json({ company });
  } catch (error) {
    throw new AppError('Failed to fetch company', 500);
  }
};

export const createCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const companyData = req.body;

    // Check if user already has a company
    const existingCompany = await prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (existingCompany) {
      res.status(400).json({ error: 'User already has a company' });
      return;
    }

    const company = await prisma.company.create({
      data: {
        ...companyData,
        ownerId: userId,
      },
      include: {
        services: true,
        portfolio: true,
        testimonials: true,
      },
    });

    res.status(201).json({ company });
  } catch (error) {
    throw new AppError('Failed to create company', 500);
  }
};

export const updateCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;
    const updateData = req.body;

    // Check ownership or admin
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    if (company.ownerId !== userId && userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Auto-create location if updated
    if (updateData.location) {
      const locName = updateData.location;
      const slug = locName.toLowerCase().trim().replace(/[\s\W-]+/g, '-');
      await prisma.location.upsert({
        where: { name: locName },
        update: {},
        create: {
          name: locName,
          slug: slug || 'location-' + Date.now(),
        },
      }).catch(err => console.warn('Failed to auto-create location:', err.message));
    }

    const updated = await prisma.company.update({
      where: { id },
      data: updateData,
      include: {
        services: true,
        portfolio: true,
        testimonials: true,
      },
    });

    res.json({ company: updated });
  } catch (error) {
    throw new AppError('Failed to update company', 500);
  }
};

export const deleteCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;

    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    if (company.ownerId !== userId && userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.company.delete({
      where: { id },
    });

    res.json({ message: 'Company deleted' });
  } catch (error) {
    throw new AppError('Failed to delete company', 500);
  }
};

export const verifyCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.userRole!;

    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { isVerified } = req.body;

    const company = await prisma.company.update({
      where: { id },
      data: { isVerified },
      include: {
        services: true,
        portfolio: true,
        testimonials: true,
      },
    });

    res.json({ company });
  } catch (error) {
    throw new AppError('Failed to verify company', 500);
  }
};

// Growth / Performance Metrics Stubs
export const getPerformanceMetrics = async (req: Request, res: Response): Promise<void> => {
  // Stub: Return mock metrics
  res.json({
    metrics: {
      impressions: 1250,
      clicks: 85,
      conversions: 12,
      trend: [10, 15, 12, 18, 20, 25, 22]
    }
  });
};

export const updatePerformanceMetrics = async (req: Request, res: Response): Promise<void> => {
  // Stub: Return success
  res.json({ success: true });
};

export const addOptimizationLog = async (req: Request, res: Response): Promise<void> => {
  // Stub: Return success
  res.json({ success: true });
};
