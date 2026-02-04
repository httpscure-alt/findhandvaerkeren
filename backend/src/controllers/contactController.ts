import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { logger } from '../config/logger';

const prisma = new PrismaClient();

/**
 * Handle contact form submission
 * POST /api/contact
 */
export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Store in database
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });

    logger.info(`Contact form submission stored: ${submission.id}`);

    // Return success response
    res.status(200).json({
      message: 'Thank you for your message. We will get back to you soon.',
      success: true,
      id: submission.id
    });
  } catch (error) {
    logger.error(`Contact form submission error: ${error}`);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
};






