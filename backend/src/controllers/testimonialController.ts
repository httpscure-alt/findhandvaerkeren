import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// Get all testimonials for a company
export const getCompanyTestimonials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    const testimonials = await prisma.testimonial.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ testimonials });
  } catch (error) {
    throw new AppError('Failed to fetch testimonials', 500);
  }
};

// Create a testimonial for a company
export const createTestimonial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;
    const { author, role, company, content, rating } = req.body;

    // Verify company exists
    const companyRecord = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!companyRecord) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Only company owner or admin can create testimonials
    if (companyRecord.ownerId !== userId && userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        companyId,
        author,
        role,
        company,
        content,
        rating: Math.min(Math.max(rating, 1), 5), // Clamp rating between 1-5
      },
    });

    res.status(201).json({ testimonial });
  } catch (error) {
    throw new AppError('Failed to create testimonial', 500);
  }
};

// Update a testimonial
export const updateTestimonial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId, testimonialId } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;
    const { author, role, company, content, rating } = req.body;

    // Verify company exists
    const companyRecord = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!companyRecord) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Only company owner or admin can update testimonials
    if (companyRecord.ownerId !== userId && userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Verify testimonial belongs to company
    const testimonial = await prisma.testimonial.findFirst({
      where: {
        id: testimonialId,
        companyId,
      },
    });

    if (!testimonial) {
      res.status(404).json({ error: 'Testimonial not found' });
      return;
    }

    const updated = await prisma.testimonial.update({
      where: { id: testimonialId },
      data: {
        author,
        role,
        company,
        content,
        rating: rating ? Math.min(Math.max(rating, 1), 5) : undefined,
      },
    });

    res.json({ testimonial: updated });
  } catch (error) {
    throw new AppError('Failed to update testimonial', 500);
  }
};

// Delete a testimonial
export const deleteTestimonial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId, testimonialId } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;

    // Verify company exists
    const companyRecord = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!companyRecord) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Only company owner or admin can delete testimonials
    if (companyRecord.ownerId !== userId && userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Verify testimonial belongs to company
    const testimonial = await prisma.testimonial.findFirst({
      where: {
        id: testimonialId,
        companyId,
      },
    });

    if (!testimonial) {
      res.status(404).json({ error: 'Testimonial not found' });
      return;
    }

    await prisma.testimonial.delete({
      where: { id: testimonialId },
    });

    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    throw new AppError('Failed to delete testimonial', 500);
  }
};





