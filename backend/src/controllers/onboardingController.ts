import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Step 1: Basic Info
export const saveBasicInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { name, category, location, contactEmail, website, phone } = req.body;

    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (existingCompany) {
      res.status(400).json({ error: 'Company already exists for this user' });
      return;
    }

    // Create company with basic info
    const company = await prisma.company.create({
      data: {
        name,
        category,
        location,
        contactEmail,
        website,
        shortDescription: '',
        description: '',
        ownerId: userId,
      },
    });

    res.json({ company, step: 1 });
  } catch (error) {
    console.error('Save basic info error:', error);
    res.status(500).json({ error: 'Failed to save basic info' });
  }
};

// Step 2: Descriptions
export const saveDescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { shortDescription, description } = req.body;

    const company = await prisma.company.update({
      where: { ownerId: userId },
      data: {
        shortDescription,
        description,
      },
    });

    res.json({ company, step: 2 });
  } catch (error) {
    console.error('Save descriptions error:', error);
    res.status(500).json({ error: 'Failed to save descriptions' });
  }
};

// Step 3: Upload Images
export const saveImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { logoUrl, bannerUrl, gallery } = req.body;

    const company = await prisma.company.update({
      where: { ownerId: userId },
      data: {
        logoUrl,
        bannerUrl,
      },
    });

    // Handle gallery images (portfolio items)
    if (gallery && Array.isArray(gallery)) {
      // Delete existing portfolio items
      await prisma.portfolioItem.deleteMany({
        where: { companyId: company.id },
      });

      // Create new portfolio items
      await prisma.portfolioItem.createMany({
        data: gallery.map((item: { imageUrl: string; title: string; category: string }) => ({
          companyId: company.id,
          imageUrl: item.imageUrl,
          title: item.title,
          category: item.category || 'General',
        })),
      });
    }

    const updatedCompany = await prisma.company.findUnique({
      where: { id: company.id },
      include: {
        portfolio: true,
      },
    });

    res.json({ company: updatedCompany, step: 3 });
  } catch (error) {
    console.error('Save images error:', error);
    res.status(500).json({ error: 'Failed to save images' });
  }
};

// Step 4: Complete Onboarding
export const completeOnboarding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const company = await prisma.company.findUnique({
      where: { ownerId: userId },
      include: {
        services: true,
        portfolio: true,
        testimonials: true,
      },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    res.json({ 
      company,
      step: 4,
      completed: true,
      message: 'Onboarding completed successfully'
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
};

// Get onboarding status
export const getOnboardingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const company = await prisma.company.findUnique({
      where: { ownerId: userId },
      include: {
        portfolio: true,
      },
    });

    if (!company) {
      res.json({ step: 0, hasCompany: false });
      return;
    }

    // Determine current step
    let step = 1;
    if (company.shortDescription && company.description) step = 2;
    if (company.logoUrl || company.bannerUrl) step = 3;
    if (company.portfolio && company.portfolio.length > 0) step = 4;

    res.json({ step, hasCompany: true, company });
  } catch (error) {
    console.error('Get onboarding status error:', error);
    res.status(500).json({ error: 'Failed to get onboarding status' });
  }
};
