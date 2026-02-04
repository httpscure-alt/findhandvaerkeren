import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { emailService } from '../services/emailService';

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
    } else if (userRole === 'ADMIN') {
      // Admin sees everything
      where = {};
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
            owner: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    // Send email notification to company owner
    if (inquiry.company.owner?.email) {
      await emailService.sendInquiryEmail(
        inquiry.company.owner.email,
        inquiry.company.name,
        message
      );
    }

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

// Reply to an inquiry (updates status to RESPONDED)
export const replyToInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;
    const { replyMessage } = req.body;

    // Get the inquiry
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!inquiry) {
      res.status(404).json({ error: 'Inquiry not found' });
      return;
    }

    // Verify the user is the company owner (partner) replying to this inquiry
    if (userRole !== 'PARTNER' || inquiry.company.ownerId !== userId) {
      res.status(403).json({ error: 'Not authorized to reply to this inquiry' });
      return;
    }

    // Update inquiry status to RESPONDED
    // Note: For Phase 1, we're storing the reply in the message field
    // In a future phase, we'd create a proper threading system
    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        status: 'RESPONDED',
        message: `${inquiry.message}\n\n--- REPLY ---\n${replyMessage}`,
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

    res.json({ inquiry: updated });
  } catch (error) {
    console.error('Reply to inquiry error:', error);
    res.status(500).json({ error: 'Failed to reply to inquiry' });
  }
};
