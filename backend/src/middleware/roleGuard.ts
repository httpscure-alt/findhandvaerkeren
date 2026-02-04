import { Request, Response, NextFunction } from 'express';

/**
 * Role-based access control middleware
 * Checks if the authenticated user has the required role(s)
 */
export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // @ts-ignore - user is added by auth middleware
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Ownership verification middleware
 * Ensures the user owns the resource they're trying to access/modify
 */
export const requireOwnership = (resourceType: 'company' | 'inquiry') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // @ts-ignore
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Admin can access everything
        if (user.role === 'ADMIN') {
            return next();
        }

        const resourceId = req.params.companyId || req.params.id;

        if (!resourceId) {
            return res.status(400).json({ error: 'Resource ID required' });
        }

        try {
            if (resourceType === 'company') {
                const { PrismaClient } = await import('@prisma/client');
                const prisma = new PrismaClient();

                const company = await prisma.company.findUnique({
                    where: { id: resourceId },
                    select: { ownerId: true }
                });

                await prisma.$disconnect();

                if (!company) {
                    return res.status(404).json({ error: 'Company not found' });
                }

                if (company.ownerId !== user.userId) {
                    return res.status(403).json({
                        error: 'Forbidden',
                        message: 'You do not own this resource'
                    });
                }
            }

            next();
        } catch (error) {
            console.error('Ownership check error:', error);
            return res.status(500).json({ error: 'Failed to verify ownership' });
        }
    };
};

/**
 * Admin-only middleware (shorthand for requireRole(['ADMIN']))
 */
export const requireAdmin = requireRole(['ADMIN']);

/**
 * Partner-only middleware (shorthand for requireRole(['PARTNER']))
 */
export const requirePartner = requireRole(['PARTNER', 'ADMIN']);

/**
 * Consumer or higher middleware
 */
export const requireConsumer = requireRole(['CONSUMER', 'PARTNER', 'ADMIN']);
