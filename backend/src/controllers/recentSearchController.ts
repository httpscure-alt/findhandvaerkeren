import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// Get user's recent searches
export const getRecentSearches = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;

        const recentSearches = await prisma.recentSearch.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        res.json({ recentSearches });
    } catch (error) {
        throw new AppError('Failed to fetch recent searches', 500);
    }
};

// Save a recent search
export const saveRecentSearch = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const { query } = req.body;

        if (!query || query.trim() === '') {
            res.status(400).json({ error: 'Search query is required' });
            return;
        }

        // Check if same query already exists for user
        const existingSearch = await prisma.recentSearch.findFirst({
            where: {
                userId,
                query: query.trim(),
            },
        });

        if (existingSearch) {
            // Update timestamp
            await prisma.recentSearch.update({
                where: { id: existingSearch.id },
                data: { createdAt: new Date() },
            });
            res.status(200).json({ message: 'Search updated' });
        } else {
            // Create new search
            const recentSearch = await prisma.recentSearch.create({
                data: {
                    userId,
                    query: query.trim(),
                },
            });

            // Maintain only last 10 searches (cleanup old ones)
            const searchesCount = await prisma.recentSearch.count({
                where: { userId },
            });

            if (searchesCount > 10) {
                const oldestSearches = await prisma.recentSearch.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'asc' },
                    take: searchesCount - 10,
                });

                const idsToDelete = oldestSearches.map((s) => s.id);
                await prisma.recentSearch.deleteMany({
                    where: { id: { in: idsToDelete } },
                });
            }

            res.status(201).json({ recentSearch });
        }
    } catch (error) {
        throw new AppError('Failed to save recent search', 500);
    }
};

// Clear all recent searches
export const clearRecentSearches = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;

        await prisma.recentSearch.deleteMany({
            where: { userId },
        });

        res.json({ message: 'Recent searches cleared' });
    } catch (error) {
        throw new AppError('Failed to clear recent searches', 500);
    }
};
