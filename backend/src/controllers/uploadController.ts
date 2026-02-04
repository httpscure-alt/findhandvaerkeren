import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { logoStorage, bannerStorage, documentStorage } from '../utils/cloudinary';

const prisma = new PrismaClient();

// Create multer instances for different types
export const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB for logo
});

export const bannerUpload = multer({
  storage: bannerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for banner
});

export const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for documents
});

// Upload logo
export const uploadLogo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Verify user has a company
    const company = await prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Update company with new logo URL (file.path is the Cloudinary URL)
    const logoUrl = file.path;
    const updated = await prisma.company.update({
      where: { id: company.id },
      data: { logoUrl },
    });

    res.json({
      logoUrl: updated.logoUrl,
      message: 'Logo uploaded successfully',
    });
  } catch (error) {
    throw new AppError('Failed to upload logo', 500);
  }
};

// Upload banner
export const uploadBanner = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Verify user has a company
    const company = await prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Update company with new banner URL
    const bannerUrl = file.path;
    const updated = await prisma.company.update({
      where: { id: company.id },
      data: { bannerUrl },
    });

    res.json({
      bannerUrl: updated.bannerUrl,
      message: 'Banner uploaded successfully',
    });
  } catch (error) {
    throw new AppError('Failed to upload banner', 500);
  }
};

// Upload permit document
export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Verify user has a company
    const company = await prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Create permit document record (Prisma model name is PermitDocument)
    const documentUrl = file.path;
    const permitDocument = await (prisma as any).permitDocument.create({
      data: {
        companyId: company.id,
        fileName: file.originalname,
        fileUrl: documentUrl,
        fileType: path.extname(file.originalname).slice(1),
        fileSize: file.size,
      },
    });

    // Update company permitDocuments array
    const updatedDocuments = [...(company.permitDocuments || []), documentUrl];
    await prisma.company.update({
      where: { id: company.id },
      data: { permitDocuments: updatedDocuments },
    });

    res.json({
      document: permitDocument,
      message: 'Document uploaded successfully',
    });
  } catch (error) {
    throw new AppError('Failed to upload document', 500);
  }
};





