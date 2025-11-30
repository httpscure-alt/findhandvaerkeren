import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

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
    console.error('Get consumer profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
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
    console.error('Update consumer profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
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
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
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
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
