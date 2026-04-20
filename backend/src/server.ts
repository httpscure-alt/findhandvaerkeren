import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import companyRoutes from './routes/companyRoutes';
import savedListingRoutes from './routes/savedListingRoutes';
import inquiryRoutes from './routes/inquiryRoutes';
import categoryRoutes from './routes/categoryRoutes';
import locationRoutes from './routes/locationRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import onboardingRoutes from './routes/onboardingRoutes';
import userRoutes from './routes/userRoutes';
import businessRoutes from './routes/businessRoutes';
import adminRoutes from './routes/adminRoutes';
import stripeRoutes from './routes/stripeRoutes';
import contactRoutes from './routes/contactRoutes';
import uploadRoutes from './routes/uploadRoutes';
import gdprRoutes from './routes/gdprRoutes';
import recentSearchRoutes from './routes/recentSearchRoutes';
import jobRoutes from './routes/jobRoutes';
import growthRoutes from './routes/growthRoutes';
import notificationRoutes from './routes/notificationRoutes';
import blogRoutes from './routes/blogRoutes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import { prisma } from './prisma/client';
import path from 'path';
import morgan from 'morgan';
import { logger } from './config/logger';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import helmet from 'helmet';

dotenv.config();

// Required environment variables validation
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NODE_ENV',
  'RESEND_API_KEY',
  'FROM_EMAIL'
];

const missingEnvVars = REQUIRED_ENV_VARS.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Critical Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// JWT Secret strength validation
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32 && process.env.NODE_ENV === 'production') {
  logger.error('Critical Error: JWT_SECRET must be at least 32 characters long in production.');
  process.exit(1);
}


// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
  logger.info('Sentry initialized');
}

const app = express();
const PORT = process.env.PORT || 4000;

// Fast Health Check (Bypass CORS/Security)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});


// Middleware
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed list
    const isAllowed = allowedOrigins.some(ao => origin.includes(ao.trim()));
    
    // Special check for our specific domains (Super Permissive for launch)
    const isOwnDomain = origin.includes('findha') || 
                       origin.includes('findhå') || 
                       origin.includes('xn--findhndvrkeren') ||
                       origin.includes('vercel.app') ||
                       origin.includes('onrender.com');
    
    if (isAllowed || isOwnDomain || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      logger.warn('CORS Rejected for origin:', origin);
      // Don't throw a generic error which causes a 500, return a 403-style response
      callback(new Error(`CORS Not Allowed for ${origin}`));
    }
  },
  credentials: true,
}));

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
      imgSrc: ["'self'", "data:", "https://*.stripe.com", "https://*.cloudinary.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://*.cloudinary.com"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Morgan Logger
const morganFormat = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => {
      const logObject = {
        method: message.split(' ')[0],
        url: message.split(' ')[1],
        status: message.split(' ')[2],
        responseTime: message.split(' ')[3],
      };
      logger.http(JSON.stringify(logObject));
    },
  },
}));

// Apply global rate limiting (skip in development)
if (process.env.NODE_ENV !== 'development') {
  app.use('/api/', apiLimiter);
}

// Stripe webhook endpoint needs raw body for signature verification
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// JSON parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(path.join(process.cwd(), uploadDir)));

// Detailed Health Check with Database
app.get('/api/health-db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Health check failed: database unreachable');
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/saved', savedListingRoutes);
app.use('/api/saved-listings', savedListingRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/gdpr', gdprRoutes);
app.use('/api/recent-searches', recentSearchRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/growth', growthRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/blog', blogRoutes);

// Sentry Error Handler (must be before custom error handler)
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Custom Error Handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

// Process-level error handlers
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', reason);
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(reason);
  }
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error);
  }
  // Give time for logging/Sentry to flush, then exit
  setTimeout(() => process.exit(1), 1000);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

app.listen(Number(PORT), '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
