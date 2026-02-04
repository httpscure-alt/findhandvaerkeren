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
        companyCreated: true,
        profileCompleted: false,
        onboardingCompleted: false,
      },
    });

    res.json({ company, step: 1 });
  } catch (error) {
    throw new AppError('Failed to save basic info', 500);
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
    throw new AppError('Failed to save descriptions', 500);
  }
};

// Step 3: Upload Images (logo and banner are optional)
export const saveImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { logoUrl, bannerUrl, gallery } = req.body;

    const company = await prisma.company.update({
      where: { ownerId: userId },
      data: {
        // Logo and banner are optional - save even if empty
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
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
    throw new AppError('Failed to save images', 500);
  }
};

// Step 4: Business Verification
export const saveVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const {
      cvrNumber,
      vatNumber,
      legalName,
      businessAddress,
      cvrLookupUrl,
      permitType,
      permitIssuer,
      permitNumber,
      permitDocuments,
      requestVerification
    } = req.body;

    // Set verification status based on request
    // Testimonials creation temporarily disabled until we finalise moderation rules.
    const verificationStatus = requestVerification ? 'pending' : 'unverified';

    const company = await prisma.company.update({
      where: { ownerId: userId },
      data: {
        cvrNumber: cvrNumber || null,
        vatNumber: vatNumber || null,
        legalName: legalName || null,
        businessAddress: businessAddress || null,
        cvrLookupUrl: cvrLookupUrl || null,
        permitType: permitType || null,
        permitIssuer: permitIssuer || null,
        permitNumber: permitNumber || null,
        permitDocuments: permitDocuments || [],
        verificationStatus: verificationStatus,
        // Only set isVerified to true if status is verified (admin action)
        isVerified: verificationStatus === ('verified' as any),
      },
    });

    res.json({ company, step: 4 });
  } catch (error) {
    throw new AppError('Failed to save verification info', 500);
  }
};

// Step 5: Complete Onboarding
export const completeOnboarding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // Mark onboarding as completed
    const company = await prisma.company.update({
      where: { ownerId: userId },
      data: {
        profileCompleted: true,
        onboardingCompleted: true,
      },
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
      step: 5,
      completed: true,
      profileCompleted: true,
      onboardingCompleted: true,
      message: 'Onboarding completed successfully'
    });
  } catch (error) {
    throw new AppError('Failed to complete onboarding', 500);
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
      res.json({ step: 0, hasCompany: false, onboardingCompleted: false });
      return;
    }

    // If profile is completed, return that status
    if (company.profileCompleted && company.onboardingCompleted) {
      res.json({
        step: 5,
        hasCompany: true,
        companyCreated: company.companyCreated,
        profileCompleted: true,
        onboardingCompleted: true,
        company
      });
      return;
    }

    // Determine current step based on completion
    let step = 1;
    if (company.shortDescription && company.description) step = 2;
    if (company.logoUrl || company.bannerUrl) step = 3;
    if (company.cvrNumber || company.permitType) step = 4; // Step 4 is verification

    res.json({
      step,
      hasCompany: true,
      companyCreated: company.companyCreated,
      profileCompleted: company.profileCompleted || false,
      onboardingCompleted: company.onboardingCompleted || false,
      company
    });
  } catch (error) {
    throw new AppError('Failed to get onboarding status', 500);
  }
};


