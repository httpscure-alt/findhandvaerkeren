import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { hashPassword } from '../utils/password';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { generateToken } from '../utils/jwt';


// Get consumer profile
export const getConsumerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        savedListings: {
          include: {
            company: true,
          },
        },
        sentInquiries: {
          include: {
            company: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    throw new AppError('Failed to get profile', 500);
  }
};

// Update consumer profile
export const updateConsumerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { firstName, lastName, name, location, avatarUrl } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        name: name || (firstName && lastName ? `${firstName} ${lastName}` : name),
        location,
        avatarUrl,
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        location: true,
        role: true,
      },
    });

    res.json({ user });
  } catch (error) {
    throw new AppError('Failed to update profile', 500);
  }
};

// Change password
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify current password
    const { comparePassword } = await import('../utils/password');
    const isValid = await comparePassword(currentPassword, user.password);

    if (!isValid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    throw new AppError('Failed to change password', 500);
  }
};

// Delete account (GDPR)
export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    throw new AppError('Failed to delete account', 500);
  }
};

// Upgrade to Partner
export const upgradeToPartner = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // Make sure they don't already have an active company to avoid unique constraint errors
    const existingCompany = await prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (existingCompany) {
      // Just upgrade the role and return it if company already exists
      const user = await prisma.user.update({
        where: { id: userId },
        data: { role: 'PARTNER' }
      });
      const token = generateToken(user.id, 'PARTNER');
      res.json({
        message: 'Account upgraded successfully',
        token,
        user: { ...user, role: 'PARTNER' }
      });
      return;
    }

    // Get user to use their data as defaults
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) throw new AppError('User not found', 404);

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'PARTNER' },
    });

    // Create a scaffold basic company
    await prisma.company.create({
      data: {
        ownerId: userId,
        name: updatedUser.name || 'Min Virksomhed', // Default dummy name if none provided
        description: '',
        shortDescription: '',
        category: 'other', // Default category
        location: updatedUser.location || '',
        contactEmail: updatedUser.email,
        companyCreated: true, // We created the scaffolding
        profileCompleted: false, // Let them fix it in onboarding
        onboardingCompleted: false
      }
    });

    // Generate new token reflecting PARTNER role
    const token = generateToken(updatedUser.id, 'PARTNER');

    res.json({
      message: 'Account upgraded successfully',
      token,
      user: { ...updatedUser, role: 'PARTNER' }
    });
  } catch (error) {
    console.error('Upgrade error:', error);
    throw new AppError('Failed to upgrade account', 500);
  }
};


