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
      where.isVerified = true;
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
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
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
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
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
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Failed to create company' });
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
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Failed to update company' });
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
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Failed to delete company' });
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
    console.error('Verify company error:', error);
    res.status(500).json({ error: 'Failed to verify company' });
  }
};
