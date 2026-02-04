import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// Consumer: Create a new Job Request
export const createJobRequest = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId; // From authMiddleware (optional now)
        const { title, description, category, postalCode, budget, images, guestName, guestEmail, guestPhone } = req.body;

        const jobRequest = await prisma.jobRequest.create({
            data: {
                consumerId: userId || null,
                guestName,
                guestEmail,
                guestPhone,
                title,
                description,
                category,
                postalCode,
                budget,
                images: images || [],
                status: 'open',
            },
        });

        // Smart matching logic:
        // 1. Match by category
        // 2. Prioritize companies in same postal code area (first 2 digits)
        // 3. Randomize to give all companies fair chance
        // 4. Limit to 3 matches (for "3 quotes" feature)

        const postalPrefix = postalCode.substring(0, 2); // e.g., "21" from "2100"

        // Find all companies in same category
        const allMatchingCompanies = await prisma.company.findMany({
            where: {
                category: category,
            },
        });

        // Separate into local (same postal prefix) and non-local
        const localCompanies = allMatchingCompanies.filter(c =>
            c.location?.startsWith(postalPrefix)
        );
        const otherCompanies = allMatchingCompanies.filter(c =>
            !c.location?.startsWith(postalPrefix)
        );

        // Shuffle arrays for fair distribution
        const shuffleArray = (array: any[]) => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        };

        const shuffledLocal = shuffleArray(localCompanies);
        const shuffledOther = shuffleArray(otherCompanies);

        // Prioritize local, then fill with others, limit to 3
        const selectedCompanies = [
            ...shuffledLocal.slice(0, 2),  // Up to 2 local companies
            ...shuffledOther.slice(0, 3)   // Fill remaining with others
        ].slice(0, 3); // Final limit: 3 companies

        // Create LeadMatches
        const matches = await Promise.all(
            selectedCompanies.map(company =>
                prisma.leadMatch.create({
                    data: {
                        jobRequestId: jobRequest.id,
                        companyId: company.id,
                        status: 'pending'
                    }
                })
            )
        );

        res.status(201).json({
            message: 'Job request created',
            jobRequest,
            matchCount: matches.length
        });

    } catch (error) {
        console.error('Error creating job request:', error);
        res.status(500).json({ error: 'Failed to create job request' });
    }
};

// Consumer: Get my requests
export const getMyJobRequests = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const requests = await prisma.jobRequest.findMany({
            where: { consumerId: userId },
            include: {
                matches: {
                    include: {
                        company: {
                            select: { name: true, logoUrl: true, rating: true }
                        },
                        quotes: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ requests });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};

// Partner: Get Leads (Matches assigned to my company which are not yet accepted/rejected)
export const getPartnerLeads = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        // Find company owned by this user
        const company = await prisma.company.findUnique({
            where: { ownerId: userId }
        });

        if (!company) {
            res.status(404).json({ error: 'No company found for this user' });
            return;
        }

        const leads = await prisma.leadMatch.findMany({
            where: {
                companyId: company.id,
                // Show pending leads
            },
            include: {
                job: true, // Include job details
                quotes: true // Include any quote I sent
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ leads });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
};

// Partner: Submit a Quote
export const submitQuote = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { matchId } = req.params;
        const { price, message } = req.body;

        // Verify ownership of the match
        const match = await prisma.leadMatch.findUnique({
            where: { id: matchId },
            include: { company: true }
        });

        if (!match || match.company.ownerId !== userId) {
            res.status(403).json({ error: 'Unauthorized to quote on this lead' });
            return;
        }

        const quote = await prisma.quote.create({
            data: {
                matchId,
                price: parseFloat(price),
                message,
                status: 'sent'
            }
        });

        // Update match status
        await prisma.leadMatch.update({
            where: { id: matchId },
            data: { status: 'quoted' }
        });

        res.status(201).json({ message: 'Quote sent', quote });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit quote' });
    }
};
