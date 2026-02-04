import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getSavedListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const savedListings = await prisma.savedListing.findMany({
      where: { consumerId: userId },
      include: {
        company: {
          include: {
            services: true,
            portfolio: true,
            testimonials: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ savedListings });
  } catch (error) {
    throw new AppError('Failed to fetch saved listings', 500);
  }
};

export const saveListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { companyId } = req.body;

    const savedListing = await prisma.savedListing.create({
      data: {
        consumerId: userId,
        companyId,
      },
      include: {
        company: {
          include: {
            services: true,
            portfolio: true,
            testimonials: true,
          },
        },
      },
    });

    res.status(201).json({ savedListing });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Listing already saved' });
      return;
    }
    throw new AppError('Failed to save listing', 500);
  }
};

export const unsaveListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { companyId } = req.params;

    await prisma.savedListing.deleteMany({
      where: {
        consumerId: userId,
        companyId,
      },
    });

    res.json({ message: 'Listing unsaved' });
  } catch (error) {
    throw new AppError('Failed to unsave listing', 500);
  }
};
