import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

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
    console.error('Get saved listings error:', error);
    res.status(500).json({ error: 'Failed to fetch saved listings' });
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
    console.error('Save listing error:', error);
    res.status(500).json({ error: 'Failed to save listing' });
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
    console.error('Unsave listing error:', error);
    res.status(500).json({ error: 'Failed to unsave listing' });
  }
};
