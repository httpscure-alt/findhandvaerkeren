import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getInquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const userRole = req.userRole!;
    const { type = 'sent' } = req.query;

    let where: any = {};

    if (userRole === 'CONSUMER') {
      where.consumerId = userId;
    } else if (userRole === 'PARTNER') {
      where.company = { ownerId: userId };
    }

    const inquiries = await prisma.inquiry.findMany({
      where,
      include: {
        consumer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ inquiries });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
};

export const createInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { companyId, message } = req.body;

    const inquiry = await prisma.inquiry.create({
      data: {
        consumerId: userId,
        companyId,
        message,
      },
      include: {
        consumer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    res.status(201).json({ inquiry });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({ error: 'Failed to create inquiry' });
  }
};

export const updateInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { status },
      include: {
        consumer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    res.json({ inquiry });
  } catch (error) {
    console.error('Update inquiry error:', error);
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
};
