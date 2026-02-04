import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// Get all services for a company
export const getCompanyServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    const services = await prisma.service.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ services });
  } catch (error) {
    throw new AppError('Failed to fetch services', 500);
  }
};

// Create a service for a company
export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;
    const userId = req.userId!;
    const { title, description } = req.body;

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

    const service = await prisma.service.create({
      data: {
        companyId,
        title,
        description,
      },
    });

    res.status(201).json({ service });
  } catch (error) {
    throw new AppError('Failed to create service', 500);
  }
};

// Update a service
export const updateService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId, serviceId } = req.params;
    const userId = req.userId!;
    const { title, description } = req.body;

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

    // Verify service belongs to company
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        companyId,
      },
    });

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: {
        title,
        description,
      },
    });

    res.json({ service: updated });
  } catch (error) {
    throw new AppError('Failed to update service', 500);
  }
};

// Delete a service
export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId, serviceId } = req.params;
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

    // Verify service belongs to company
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        companyId,
      },
    });

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });

    res.json({ message: 'Service deleted' });
  } catch (error) {
    throw new AppError('Failed to delete service', 500);
  }
};





