
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Submit a new growth request
export const submitGrowthRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { services, details } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Find company owner by user ID
        const company = await prisma.company.findUnique({
            where: { ownerId: userId },
        });

        if (!company) {
            res.status(404).json({ error: 'Company not found' });
            return;
        }

        // Create a request for each service selected
        // For simplicity, we can create one request per service type or bundle them.
        // Based on the frontend, 'services' is an array ['seo'] or ['ads'].
        // We will create one request record per service type found in the array.

        const requests = [];

        for (const service of services) {
            const type = service.toUpperCase(); // SEO, ADS
            if (['SEO', 'ADS'].includes(type)) {
                const request = await prisma.growthRequest.create({
                    data: {
                        companyId: company.id,
                        type: type as 'SEO' | 'ADS',
                        details: details,
                        status: 'PENDING'
                    }
                });
                requests.push(request);
            }
        }

        // Create a notification for the user
        await prisma.notification.create({
            data: {
                userId: userId,
                title: 'Growth Request Submitted',
                message: `Your request for ${services.join(', ')} has been submitted successfully.`,
                type: 'success'
            }
        });

        res.status(201).json({ success: true, requests });
    } catch (error) {
        console.error('Error submitting growth request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all growth requests (Admin only)
export const getGrowthRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const requests = await prisma.growthRequest.findMany({
            include: {
                company: {
                    select: {
                        name: true,
                        contactEmail: true,
                        owner: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ requests });
    } catch (error) {
        console.error('Error fetching growth requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update growth request status (Admin only)
export const updateGrowthRequestStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const request = await prisma.growthRequest.update({
            where: { id },
            data: { status }
        });

        // Notify the company owner
        const company = await prisma.company.findUnique({
            where: { id: request.companyId }
        });

        if (company) {
            await prisma.notification.create({
                data: {
                    userId: company.ownerId,
                    title: 'Growth Request Update',
                    message: `Your ${request.type} request status has been updated to ${status}.`,
                    type: 'info'
                }
            });
        }

        res.json({ success: true, request });
    } catch (error) {
        console.error('Error updating growth request status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
