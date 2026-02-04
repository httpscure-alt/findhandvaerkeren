import { Router } from 'express';
import { register, login, getMe, verifyOtp, resendOtp, logout, updateProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, verifyOtpSchema } from '../validations/authValidation';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), verifyOtp);
router.post('/resend-otp', authLimiter, resendOtp);
router.post('/logout', logout);
router.put('/profile', authenticate, updateProfile);
router.get('/me', authenticate, getMe);

export default router;
