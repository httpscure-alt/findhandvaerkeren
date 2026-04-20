import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { selectCompaniesForJobRequest } from '../services/leadMatching';


// Consumer: Create a new Job Request
export const createJobRequest = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId; // From authMiddleware (optional now)
        const { title, description, category, postalCode, budget, images, guestName, guestEmail, guestPhone } = req.body;

        // Normalize category: UI may submit slug (e.g. "tømrer") while companies store name (e.g. "Tømrer")
        const rawCategory = String(category || '').trim();
        const categoryRow = rawCategory
            ? await prisma.category.findFirst({
                where: {
                    OR: [{ slug: rawCategory }, { name: rawCategory }],
                },
                select: { name: true },
            })
            : null;
        const normalizedCategory = categoryRow?.name || rawCategory;

        const jobRequest = await prisma.jobRequest.create({
            data: {
                consumerId: userId || null,
                guestName,
                guestEmail,
                guestPhone,
                title,
                description,
                category: normalizedCategory,
                postalCode,
                budget,
                images: images || [],
                status: 'open',
            },
        });

        const selectedCompanies = await selectCompaniesForJobRequest({
            category: normalizedCategory,
            postalCode,
            min: 3,
            max: 5,
        });

        // Create LeadMatches (idempotent due to @@unique(jobRequestId, companyId))
        await prisma.leadMatch.createMany({
            data: selectedCompanies.map((company) => ({
                jobRequestId: jobRequest.id,
                companyId: company.id,
                status: 'pending',
            })),
            skipDuplicates: true,
        });

        const matches = await prisma.leadMatch.findMany({
            where: { jobRequestId: jobRequest.id },
            select: { id: true },
        });

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

        const priceNumber =
            price === null || price === undefined || price === ''
                ? null
                : Number.isFinite(Number(price))
                    ? Number(price)
                    : null;

        const quote = await prisma.quote.create({
            data: {
                matchId,
                price: priceNumber,
                message: String(message || ''),
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
