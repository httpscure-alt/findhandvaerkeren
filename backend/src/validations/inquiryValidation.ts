import { z } from 'zod';

export const createInquirySchema = z.object({
    body: z.object({
        companyId: z.string().uuid('Invalid company ID'),
        message: z.string().min(10, 'Message must be at least 10 characters'),
    }),
});

export const replyToInquirySchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid inquiry ID'),
    }),
    body: z.object({
        replyMessage: z.string().min(10, 'Reply message must be at least 10 characters'),
    }),
});
