import { Router } from 'express';
import { register, login, getMe, verifyOtp, resendOtp, logout, updateProfile, loginWithSupabase, forgotPassword, resetPassword } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validations/authValidation';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), verifyOtp);
router.post('/resend-otp', authLimiter, validate(resendOtpSchema), resendOtp);
router.post('/logout', logout);
router.post('/supabase', authLimiter, loginWithSupabase);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);
router.put('/profile', authenticate, updateProfile);
router.get('/me', authenticate, getMe);

export default router;
