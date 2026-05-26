import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        name: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        companyName: z.string().optional(),
        role: z.enum(['CONSUMER', 'PARTNER', 'ADMIN']).optional(),
        brand: z.enum(['advero']).optional(),
    }),
});

export const resendOtpSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        brand: z.enum(['advero']).optional(),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        brand: z.enum(['advero']).optional(),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        token: z.string().min(1),
        newPassword: z.string().min(6),
        brand: z.enum(['advero']).optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const verifyOtpSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        otp: z.string().length(6, 'OTP must be 6 digits'),
        brand: z.enum(['advero']).optional(),
    }),
});
