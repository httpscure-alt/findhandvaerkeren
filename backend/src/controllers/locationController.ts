import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' },
    });

    res.json({ locations });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};

export const createLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const location = await prisma.location.create({
      data: {
        name,
        slug,
      },
    });

    res.status(201).json({ location });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Location already exists' });
      return;
    }
    console.error('Create location error:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
};

export const updateLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const location = await prisma.location.update({
      where: { id },
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
      },
    });

    res.json({ location });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

export const deleteLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.location.delete({
      where: { id },
    });

    res.json({ message: 'Location deleted' });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
};
