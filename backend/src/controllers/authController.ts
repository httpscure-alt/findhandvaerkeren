import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { emailService } from '../services/emailService';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import crypto from 'crypto';


// Helper to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, companyName, firstName, lastName, role = 'CONSUMER' } = req.body;

    // Use companyName as name if provided (for partners)
    const displayName = name || companyName || (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user (unverified)
    // Create user (unverified)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: displayName,
        firstName,
        lastName,
        role: role as 'CONSUMER' | 'PARTNER' | 'ADMIN',
        otpCode,
        otpExpiresAt,
        isVerified: false
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        location: true,
        isVerified: true
      },
    });

    // Send OTP email
    await emailService.sendOtpEmail(email, otpCode);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      userId: user.id,
      email: user.email,
      requiresVerification: true
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    // Graceful fallback removed - database schema must be up to date.

    res.status(500).json({
      error: 'Failed to register user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if ((user as any).isVerified) {
      res.status(200).json({ message: 'User already verified' });
      return;
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      res.status(400).json({ error: 'No verification pending' });
      return;
    }

    if (new Date() > user.otpExpiresAt) {
      res.status(400).json({ error: 'OTP expired' });
      return;
    }

    if (user.otpCode !== otp) {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    // Verify user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null
      }
    });

    // Generate token now that verified
    const token = generateToken(user.id, user.role);

    res.status(200).json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: true
      },
      token
    });

  } catch (error: any) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if ((user as any).isVerified) {
      res.status(400).json({ error: 'Already verified' });
      return;
    }

    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt }
    });

    // Use EmailService
    await emailService.sendOtpEmail(email, otpCode);

    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Log failed attempt for non-existent user
      await prisma.securityLog.create({
        data: {
          email,
          eventType: 'LOGIN_FAILURE',
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check if verified (optional: require verification before login)
    // if (!user.isVerified) {
    //   res.status(403).json({ error: 'Please verify your email first', requiresVerification: true });
    //   return;
    // }

    // Check password
    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      // Log failed attempt for existing user
      await prisma.securityLog.create({
        data: {
          userId: user.id,
          email,
          eventType: 'LOGIN_FAILURE',
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Log successful login
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        email,
        eventType: 'LOGIN_SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    // Generate token
    const token = generateToken(user.id, user.role);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        location: user.location,
        isVerified: user.isVerified
      },
      token,
    });
  } catch (error: any) {
    if (error.message?.includes('connect') || error.message?.includes('database') || error.code === 'P1001') {
      res.status(500).json({
        error: 'Database connection error. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
      return;
    }

    res.status(500).json({
      error: 'Failed to login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        location: true,
        isVerified: true,
        ownedCompany: {
          include: {
            services: true,
            portfolio: true,
            testimonials: true,
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
    throw new AppError('Failed to get user', 500);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Logged out successfully' });
};

export const getCurrentUser = getMe;

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const updates = req.body;

    // Remove sensitive fields
    delete updates.password;
    delete updates.role;
    delete updates.id;
    delete updates.isVerified;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        isVerified: true
      } as any
    });

    res.json({ user });
  } catch (error) {
    throw new AppError('Failed to update profile', 500);
  }
};

export const loginWithSupabase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accessToken, roleHint } = req.body || {};
    if (!accessToken || typeof accessToken !== 'string') {
      res.status(400).json({ error: 'accessToken is required' });
      return;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      res.status(500).json({ error: 'SUPABASE_URL is not configured' });
      return;
    }

    const issuer = `${supabaseUrl.replace(/\/+$/, '')}/auth/v1`;
    const jwksUrl = new URL(`${issuer}/.well-known/jwks.json`);
    const JWKS = createRemoteJWKSet(jwksUrl);

    const { payload } = await jwtVerify(accessToken, JWKS, {
      issuer,
      audience: 'authenticated',
    });

    const email = (payload as any).email as string | undefined;
    if (!email) {
      res.status(400).json({ error: 'Supabase token missing email' });
      return;
    }

    const displayName =
      ((payload as any).user_metadata?.full_name as string | undefined) ||
      ((payload as any).user_metadata?.name as string | undefined) ||
      null;

    const existing = await prisma.user.findUnique({ where: { email } });

    // If user exists, keep role; if not, use roleHint (default CONSUMER)
    const roleToUse: 'CONSUMER' | 'PARTNER' | 'ADMIN' =
      existing?.role ||
      (roleHint === 'PARTNER' ? 'PARTNER' : 'CONSUMER');

    const randomPassword = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const hashedPassword = await hashPassword(randomPassword);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: existing?.name || displayName,
        isVerified: true,
      },
      create: {
        email,
        password: hashedPassword,
        name: displayName,
        role: roleToUse,
        isVerified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        location: true,
        isVerified: true,
      },
    });

    const token = generateToken(user.id, user.role);
    res.json({ user, token });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid Supabase token', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'email is required' });
      return;
    }

    // Always respond success to avoid email enumeration.
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.json({ success: true });
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: expiresAt,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    await emailService.sendPasswordResetEmail(email, resetUrl);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to request password reset', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, token, newPassword } = req.body || {};
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'email is required' });
      return;
    }
    if (!token || typeof token !== 'string') {
      res.status(400).json({ error: 'token is required' });
      return;
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      res.status(400).json({ error: 'newPassword must be at least 6 characters' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordResetTokenHash || !user.passwordResetExpiresAt) {
      res.status(400).json({ error: 'Invalid or expired token' });
      return;
    }
    if (new Date() > user.passwordResetExpiresAt) {
      res.status(400).json({ error: 'Invalid or expired token' });
      return;
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    if (tokenHash !== user.passwordResetTokenHash) {
      res.status(400).json({ error: 'Invalid or expired token' });
      return;
    }

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      },
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reset password', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};
