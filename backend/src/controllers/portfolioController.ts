import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// Get all portfolio items for a company
export const getCompanyPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    const portfolio = await prisma.portfolioItem.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ portfolio });
  } catch (error) {
    throw new AppError('Failed to fetch portfolio', 500);
  }
};

// Create a portfolio item for a company
export const createPortfolioItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;
    const userId = req.userId!;
    const { title, imageUrl, category } = req.body;

    // Verify company ownership
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    if (company.ownerId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        companyId,
        title,
        imageUrl,
        category,
      },
    });

    res.status(201).json({ portfolioItem });
  } catch (error) {
    throw new AppError('Failed to create portfolio item', 500);
  }
};

// Update a portfolio item
export const updatePortfolioItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId, portfolioId } = req.params;
    const userId = req.userId!;
    const { title, imageUrl, category } = req.body;

    // Verify company ownership
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    if (company.ownerId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Verify portfolio item belongs to company
    const portfolioItem = await prisma.portfolioItem.findFirst({
      where: {
        id: portfolioId,
        companyId,
      },
    });

    if (!portfolioItem) {
      res.status(404).json({ error: 'Portfolio item not found' });
      return;
    }

    const updated = await prisma.portfolioItem.update({
      where: { id: portfolioId },
      data: {
        title,
        imageUrl,
        category,
      },
    });

    res.json({ portfolioItem: updated });
  } catch (error) {
    throw new AppError('Failed to update portfolio item', 500);
  }
};

// Delete a portfolio item
export const deletePortfolioItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId, portfolioId } = req.params;
    const userId = req.userId!;

    // Verify company ownership
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    if (company.ownerId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Verify portfolio item belongs to company
    const portfolioItem = await prisma.portfolioItem.findFirst({
      where: {
        id: portfolioId,
        companyId,
      },
    });

    if (!portfolioItem) {
      res.status(404).json({ error: 'Portfolio item not found' });
      return;
    }

    await prisma.portfolioItem.delete({
      where: { id: portfolioId },
    });

    res.json({ message: 'Portfolio item deleted' });
  } catch (error) {
    throw new AppError('Failed to delete portfolio item', 500);
  }
};





