import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { getPlanDetails } from '../config/stripePlans';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

// Get Stripe secret key from environment
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe only if secret key is provided
let stripe: Stripe | null = null;
if (STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.trim() !== '') {
  try {
    stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  } catch (error) {
    // Stripe initialization failed - will be handled in individual endpoints
    stripe = null;
  }
}

/**
 * Helper function to check if Stripe is properly configured
 */
function isStripeConfigured(): boolean {
  return stripe !== null && STRIPE_SECRET_KEY !== undefined && STRIPE_SECRET_KEY.trim() !== '';
}

/**
 * Create Stripe Checkout Session
 * POST /api/stripe/create-checkout-session
 */
export const createCheckoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    logger.info('🔵 Creating Stripe checkout session...', {
      userId: req.userId,
      billingCycle: req.body.billingCycle,
      tier: req.body.tier
    });

    // Check if Stripe is configured
    if (!isStripeConfigured() || !stripe) {
      logger.error('❌ Stripe is not configured');
      res.status(500).json({ error: 'Stripe is not configured. Please check STRIPE_SECRET_KEY in environment variables.' });
      return;
    }

    logger.info('✅ Stripe is configured');

    const userId = req.userId;
    const { billingCycle, tier } = req.body; // 'monthly' or 'annual', tier: 'Basic' | 'Gold'

    if (!billingCycle || (billingCycle !== 'monthly' && billingCycle !== 'annual')) {
      res.status(400).json({ error: 'Invalid billingCycle. Must be "monthly" or "annual"' });
      return;
    }

    // Default to Basic if tier not provided (for backward compatibility)
    const planTier = tier || 'Basic';

    // In development mode, allow test checkout without company
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    const isTestMode = isDevelopment && (!userId || userId === 'test-user-id' || (req.headers.authorization?.includes('mock-token-')));

    let company = null;
    let customerEmail = 'test@example.com';

    // Only try database if we have a real user ID and it's not test mode
    if (!isTestMode && userId) {
      try {
        // Try to get user's company
        company = await prisma.company.findUnique({
          where: { ownerId: userId },
          include: { owner: true }
        });

        if (company) {
          customerEmail = company.contactEmail || customerEmail;
        }
      } catch (dbError: any) {
        // Database error - allow test mode in development
        if (isDevelopment) {
          logger.warn('Database unavailable, using test mode for Stripe checkout');
          company = null; // Use test mode
          // Continue with test mode - don't throw
        } else {
          // In production, re-throw database errors
          throw dbError;
        }
      }
    } else {
      // Test mode - no database lookup needed
      logger.info('Using test mode for Stripe checkout (no real user/company)');
    }

    // In development/test mode, allow checkout without company
    if (!company && !isDevelopment) {
      res.status(404).json({ error: 'Company not found. Please complete onboarding first.' });
      return;
    }

    // Get price ID from environment based on tier and billing cycle
    // Support multiple tiers: Standard, Premium, Elite
    const tierKey = planTier.toUpperCase();
    const cycleKey = billingCycle.toUpperCase();

    // Try tier-specific price IDs first (e.g., STRIPE_PRICE_STANDARD_MONTHLY)
    let priceId = process.env[`STRIPE_PRICE_${tierKey}_${cycleKey}`];

    // Fallback to generic price IDs if tier-specific not found
    if (!priceId) {
      priceId = billingCycle === 'monthly'
        ? process.env.STRIPE_PRICE_MONTHLY
        : process.env.STRIPE_PRICE_ANNUAL;
    }

    // Ensure price ID has correct format (add "price_" prefix if missing)
    if (priceId && !priceId.startsWith('price_')) {
      priceId = `price_${priceId}`;
    }

    if (!priceId) {
      res.status(500).json({
        error: `Stripe price configuration missing for ${planTier} ${billingCycle}. Please set STRIPE_PRICE_${tierKey}_${cycleKey} or STRIPE_PRICE_${cycleKey} in environment variables.`
      });
      return;
    }

    // Get client URL from environment
    const clientUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Create checkout session
    logger.info('🔵 Creating Stripe session with price:', priceId);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      metadata: {
        userId: userId || 'test-user',
        companyId: company?.id || 'test-company',
        planType: 'Partner Plan',
        planTier: planTier,
        billingCycle: billingCycle,
        testMode: (!company).toString(),
      },
      success_url: `${clientUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/billing/cancel`,
      subscription_data: {
        trial_period_days: 90, // 3 months free trial
        default_tax_rates: process.env.STRIPE_TAX_RATE_ID ? [process.env.STRIPE_TAX_RATE_ID] : [],
        metadata: {
          userId: userId || 'test-user',
          companyId: company?.id || 'test-company',
          planType: 'Partner Plan',
          planTier: planTier,
          billingCycle: billingCycle,
        },
      },
    });

    logger.info('✅ Stripe checkout session created:', session.url);
    res.json({ url: session.url });
  } catch (error: any) {
    logger.error('❌ Stripe checkout error:', error.message, error);
    throw new AppError(error.message || 'Failed to create checkout session', 500);
  }
};

/**
 * Handle Stripe Webhook Events
 * POST /api/stripe/webhook
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  if (!isStripeConfigured() || !stripe) {
    res.status(500).json({ error: 'Stripe is not configured' });
    return;
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    res.status(500).json({ error: 'Webhook secret not configured' });
    return;
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        // Unhandled event type - log but don't fail
        break;
    }

    res.json({ received: true });
  } catch (error: any) {
    throw new AppError('Webhook handler failed', 500);
  }
};

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!stripe) {
    return;
  }

  const metadata = session.metadata;
  if (!metadata || !metadata.companyId || metadata.companyId === 'test-company') {
    return;
  }

  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    return;
  }

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId = subscription.customer as string;

  // Get price ID from subscription
  const priceId = subscription.items.data[0]?.price?.id || '';
  const planDetails = getPlanDetails(priceId);

  // Determine billing cycle and tier from price ID (fallback to metadata)
  const billingCycle = planDetails.billingCycle || metadata.billingCycle || 'monthly';
  const tier = planDetails.tier || (metadata.planTier || metadata.tier || 'Basic') as 'Basic' | 'Gold';

  // Get existing subscription to track changes
  const existingSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  // Create or update subscription in database
  const updatedSubscription = await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscriptionId },
    update: {
      status: subscription.status === 'active' ? 'active' : 'inactive',
      tier: tier,
      stripeCustomerId: customerId,
      stripePriceId: priceId,
      billingCycle: billingCycle,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      companyId: metadata.companyId,
      tier: tier,
      status: subscription.status === 'active' ? 'active' : 'inactive',
      billingCycle: billingCycle,
      startDate: new Date(subscription.current_period_start * 1000),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  // Create subscription history record
  if (!existingSubscription) {
    await prisma.subscriptionHistory.create({
      data: {
        subscriptionId: updatedSubscription.id,
        action: 'created',
        newTier: tier,
        newStatus: subscription.status === 'active' ? 'active' : 'inactive',
        newBillingCycle: billingCycle,
      },
    });
  }

  // Also update company's pricing tier
  if (metadata.companyId && metadata.companyId !== 'test-company') {
    try {
      const company = await prisma.company.update({
        where: { id: metadata.companyId },
        data: { pricingTier: tier },
        include: { owner: true },
      });

      // Create payment transaction for initial payment
      await prisma.paymentTransaction.create({
        data: {
          subscriptionId: updatedSubscription.id,
          companyId: metadata.companyId,
          stripePaymentIntentId: session.payment_intent as string || null,
          stripeInvoiceId: null, // Checkout doesn't have invoice yet
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency || 'usd',
          status: 'succeeded',
          paymentMethod: 'card',
          billingCycle: billingCycle,
          tier: tier,
          description: `Initial subscription payment - ${tier} ${billingCycle}`,
        },
      });

      // Send payment success email
      if (company.owner?.email) {
        try {
          await sendPaymentSuccessEmail(company.owner.email, {
            companyName: company.name,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || 'usd',
            billingCycle: billingCycle,
            tier: tier,
          });

          // Send subscription activated email
          await sendSubscriptionActivatedEmail(company.owner.email, {
            companyName: company.name,
            tier: tier,
            billingCycle: billingCycle,
          });
        } catch (emailError) {
          logger.error(`Failed to send payment success email: ${emailError}`);
        }
      }
    } catch (error) {
      // Don't fail the webhook if company update fails
      logger.error(`Failed to update company after checkout: ${error}`);
    }
  }
}

/**
 * Get Stripe Checkout Session Details
 * GET /api/stripe/session-details?session_id=xxx
 */
export const getSessionDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isStripeConfigured() || !stripe) {
      res.status(500).json({ error: 'Stripe is not configured' });
      return;
    }

    const { session_id } = req.query;

    if (!session_id || typeof session_id !== 'string') {
      res.status(400).json({ error: 'session_id is required' });
      return;
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'customer'],
    });

    // Extract relevant information
    const billingCycle = session.metadata?.billingCycle || 'monthly';
    const planType = session.metadata?.planType || 'Partner Plan';
    const amountTotal = session.amount_total ? session.amount_total / 100 : 0; // Convert from cents
    const currency = session.currency?.toUpperCase() || 'USD';
    const customerEmail = session.customer_email || session.customer_details?.email || '';

    // Get subscription details if available
    let subscription = null;
    if (session.subscription) {
      if (typeof session.subscription === 'string') {
        subscription = await stripe.subscriptions.retrieve(session.subscription);
      } else {
        subscription = session.subscription;
      }
    }

    res.json({
      session: {
        id: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        billingCycle,
        planType,
        amountTotal,
        currency,
        customerEmail,
        createdAt: new Date(session.created * 1000).toISOString(),
      },
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      } : null,
    });
  } catch (error: any) {
    if (error.type === 'StripeInvalidRequestError') {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    throw new AppError('Failed to retrieve session details', 500);
  }
};

/**
 * Handle invoice.payment_succeeded event
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId || !stripe) {
    return;
  }

  // Get subscription details from Stripe to get price ID
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price?.id || '';
  const planDetails = getPlanDetails(priceId);

  // Get subscription from database
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!dbSubscription) {
    return;
  }

  // Update subscription status
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: 'active',
    },
  });

  // Create payment transaction record
  await prisma.paymentTransaction.create({
    data: {
      subscriptionId: dbSubscription.id,
      companyId: dbSubscription.companyId,
      stripePaymentIntentId: invoice.payment_intent as string || null,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency || 'usd',
      status: 'succeeded',
      paymentMethod: (invoice as any).payment_settings?.payment_method_types?.[0] || null,
      billingCycle: planDetails.billingCycle || dbSubscription.billingCycle,
      tier: planDetails.tier || dbSubscription.tier,
      description: invoice.description || null,
    },
  });

  // Create subscription history
  await prisma.subscriptionHistory.create({
    data: {
      subscriptionId: dbSubscription.id,
      action: 'renewed',
      previousStatus: 'past_due',
      newStatus: 'active',
    },
  });
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!dbSubscription) {
    return;
  }

  const previousTier = dbSubscription.tier;
  const previousStatus = dbSubscription.status;
  const previousBillingCycle = dbSubscription.billingCycle;

  // Get new tier/cycle from price ID
  const priceId = subscription.items.data[0]?.price?.id || '';
  const planDetails = getPlanDetails(priceId);

  // Get new values, preferring price ID mapping
  const newTier = planDetails.tier || subscription.metadata?.planTier || subscription.metadata?.tier || previousTier;
  const newStatus = subscription.status === 'active' ? 'active' : 'inactive';
  const newBillingCycle = planDetails.billingCycle || subscription.metadata?.billingCycle || previousBillingCycle;

  // Update subscription
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: newStatus,
      tier: newTier as 'Basic' | 'Gold',
      stripePriceId: priceId,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  // Create history if there were changes
  if (previousTier !== newTier || previousStatus !== newStatus || previousBillingCycle !== newBillingCycle) {
    await prisma.subscriptionHistory.create({
      data: {
        subscriptionId: dbSubscription.id,
        action: previousTier !== newTier ? 'tier_changed' : 'updated',
        previousTier: previousTier !== newTier ? previousTier : undefined,
        newTier: previousTier !== newTier ? (newTier as 'Basic' | 'Gold') : undefined,
        previousStatus: previousStatus !== newStatus ? previousStatus : undefined,
        newStatus: previousStatus !== newStatus ? newStatus : undefined,
        previousBillingCycle: previousBillingCycle !== newBillingCycle ? previousBillingCycle : undefined,
        newBillingCycle: previousBillingCycle !== newBillingCycle ? newBillingCycle : undefined,
      },
    });
  }
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!dbSubscription) {
    return;
  }

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: 'canceled',
      endDate: new Date(),
    },
  });

  // Create subscription history
  await prisma.subscriptionHistory.create({
    data: {
      subscriptionId: dbSubscription.id,
      action: 'canceled',
      previousStatus: dbSubscription.status,
      newStatus: 'canceled',
      reason: 'Subscription canceled via Stripe',
    },
  });
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) {
    return;
  }

  // Get subscription from database
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
    include: { company: { include: { owner: true } } },
  });

  if (!dbSubscription) {
    return;
  }

  // Update subscription status
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: 'past_due',
    },
  });

  // Create payment transaction record for failed payment
  await prisma.paymentTransaction.create({
    data: {
      subscriptionId: dbSubscription.id,
      companyId: dbSubscription.companyId,
      stripePaymentIntentId: invoice.payment_intent as string || null,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_due / 100, // Convert from cents
      currency: invoice.currency || 'usd',
      status: 'failed',
      paymentMethod: (invoice as any).payment_settings?.payment_method_types?.[0] || null,
      billingCycle: dbSubscription.billingCycle,
      tier: dbSubscription.tier,
      description: invoice.description || 'Payment failed',
      metadata: {
        failureReason: (invoice as any).last_payment_error?.message || 'Unknown error',
        attemptCount: invoice.attempt_count || 1,
      },
    },
  });

  // Create subscription history
  await prisma.subscriptionHistory.create({
    data: {
      subscriptionId: dbSubscription.id,
      action: 'payment_failed',
      previousStatus: 'active',
      newStatus: 'past_due',
      reason: (invoice as any).last_payment_error?.message || 'Payment failed',
    },
  });

  // Send email notification (if email service is configured)
  if (dbSubscription.company?.owner?.email) {
    try {
      await sendPaymentFailedEmail(
        dbSubscription.company.owner.email,
        {
          companyName: dbSubscription.company.name,
          amount: invoice.amount_due / 100,
          currency: invoice.currency || 'usd',
          failureReason: (invoice as any).last_payment_error?.message || 'Unknown error',
          invoiceUrl: invoice.hosted_invoice_url || undefined,
        }
      );
    } catch (emailError) {
      // Log email error but don't fail webhook
      logger.error(`Failed to send payment failed email: ${emailError}`);
    }
  }
}

/**
 * Create Stripe Billing Portal Session
 * GET /api/stripe/create-portal-session
 */
export const createPortalSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isStripeConfigured() || !stripe) {
      res.status(500).json({ error: 'Stripe is not configured' });
      return;
    }

    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Get user's company and subscription
    const company = await prisma.company.findUnique({
      where: { ownerId: userId },
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    const subscription = company.subscriptions[0];
    if (!subscription || !subscription.stripeCustomerId) {
      res.status(404).json({ error: 'No active subscription found' });
      return;
    }

    // Get client URL from environment
    const clientUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${clientUrl}/dashboard/billing`,
    });

    res.json({ url: portalSession.url });
  } catch (error: any) {
    throw new AppError(error.message || 'Failed to create portal session', 500);
  }
};

/**
 * Send payment success email
 */
async function sendPaymentSuccessEmail(
  email: string,
  data: {
    companyName: string;
    amount: number;
    currency: string;
    billingCycle: string;
    tier: string;
  }
): Promise<void> {
  // TODO: Implement email service integration
  // For now, log the email that would be sent
  logger.info('Payment Success Email:', {
    to: email,
    subject: 'Payment Successful - Subscription Activated',
    data,
  });

  // Create email log entry
  await prisma.emailLog.create({
    data: {
      to: email,
      from: process.env.FROM_EMAIL || 'noreply@findhandvaerkeren.dk',
      subject: 'Payment Successful - Subscription Activated',
      template: 'payment_success',
      status: 'sent',
      metadata: data,
    },
  });
}

/**
 * Send payment failed email
 */
async function sendPaymentFailedEmail(
  email: string,
  data: {
    companyName: string;
    amount: number;
    currency: string;
    failureReason: string;
    invoiceUrl?: string;
  }
): Promise<void> {
  // TODO: Implement email service integration
  // For now, log the email that would be sent
  logger.info('Payment Failed Email:', {
    to: email,
    subject: 'Payment Failed - Action Required',
    data,
  });

  // Create email log entry
  await prisma.emailLog.create({
    data: {
      to: email,
      from: process.env.FROM_EMAIL || 'noreply@findhandvaerkeren.dk',
      subject: 'Payment Failed - Action Required',
      template: 'payment_failed',
      status: 'sent',
      metadata: data,
    },
  });
}

/**
 * Send subscription activated email
 */
async function sendSubscriptionActivatedEmail(
  email: string,
  data: {
    companyName: string;
    tier: string;
    billingCycle: string;
  }
): Promise<void> {
  // TODO: Implement email service integration
  logger.info('Subscription Activated Email:', {
    to: email,
    subject: 'Subscription Activated',
    data,
  });

  // Create email log entry
  await prisma.emailLog.create({
    data: {
      to: email,
      from: process.env.FROM_EMAIL || 'noreply@findhandvaerkeren.dk',
      subject: 'Subscription Activated',
      template: 'subscription_activated',
      status: 'sent',
      metadata: data,
    },
  });
}

/**
 * Get all transactions (Admin)
 * GET /api/stripe/transactions
 */
export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.userRole;
    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const { dateRange, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      if (dateRange === 'month') {
        where.createdAt = { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
      } else if (dateRange === 'quarter') {
        where.createdAt = { gte: new Date(now.getFullYear(), now.getMonth() - 3, 1) };
      } else if (dateRange === 'year') {
        where.createdAt = { gte: new Date(now.getFullYear(), 0, 1) };
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where,
        include: {
          subscription: {
            include: {
              company: {
                select: {
                  name: true,
                  owner: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.paymentTransaction.count({ where }),
    ]);

    // Map to frontend format
    const formattedTransactions = transactions.map((t: any) => ({
      id: t.id,
      userOrCompany: t.subscription?.company?.name || t.subscription?.company?.owner?.name || 'Unknown',
      planName: t.tier || 'Partner Plan',
      billingCycle: t.billingCycle || 'monthly',
      amount: t.amount,
      currency: t.currency,
      status: t.status,
      date: t.createdAt.toISOString(),
      transactionId: t.stripePaymentIntentId || t.stripeInvoiceId || 'manual',
    }));

    res.json({
      transactions: formattedTransactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    throw new AppError('Failed to fetch transactions', 500);
  }
};

/**
 * Cancel subscription (Set to cancel at end of period)
 * POST /api/stripe/subscription/cancel
 */
export const cancelSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isStripeConfigured() || !stripe) {
      res.status(500).json({ error: 'Stripe is not configured' });
      return;
    }

    const userId = req.userId;
    const company = await prisma.company.findUnique({
      where: { ownerId: userId },
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!company || !company.subscriptions[0]) {
      res.status(404).json({ error: 'Active subscription not found' });
      return;
    }

    const subscription = company.subscriptions[0];

    // Update Stripe
    if (subscription.stripeSubscriptionId) {
      const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

      // Calculate 1 month notice: Current period ends + 1 full period
      // This fulfills the requirement: "Rest of the month + next month"
      const currentPeriodEnd = stripeSub.current_period_end;

      // We set cancel_at to the end of the NEXT billing cycle
      // If the sub is monthly, we add approx 30 days to the current end
      // However, Stripe's recurring billing handles periods. We can just update the sub to cancel at the end of the next cycle.
      // A more precise way in Stripe is to calculate the seconds for one month.
      const secondsInMonth = 30 * 24 * 60 * 60;
      const cancellationDate = currentPeriodEnd + secondsInMonth;

      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at: cancellationDate,
      });
    }

    // Update DB
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true },
    });

    // Log history
    await prisma.subscriptionHistory.create({
      data: {
        subscriptionId: subscription.id,
        action: 'updated',
        newStatus: 'active',
        reason: 'Scheduled for cancellation at period end',
      },
    });

    res.json({ message: 'Subscription will be canceled at the end of the current period' });
  } catch (error: any) {
    throw new AppError(error.message || 'Failed to cancel subscription', 500);
  }
};

/**
 * Update subscription (Upgrade/Downgrade)
 * PUT /api/stripe/subscription/update
 */
export const updateSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isStripeConfigured() || !stripe) {
      res.status(500).json({ error: 'Stripe is not configured' });
      return;
    }

    const { tier, billingCycle } = req.body;
    if (!tier || !billingCycle) {
      res.status(400).json({ error: 'Tier and billing cycle are required' });
      return;
    }

    const userId = req.userId;
    const company = await prisma.company.findUnique({
      where: { ownerId: userId },
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!company || !company.subscriptions[0]) {
      res.status(404).json({ error: 'Active subscription not found' });
      return;
    }

    const subscription = company.subscriptions[0];

    // Determine new price ID
    const tierKey = tier.toUpperCase();
    const cycleKey = billingCycle.toUpperCase();
    let newPriceId = process.env[`STRIPE_PRICE_${tierKey}_${cycleKey}`];

    if (!newPriceId) {
      newPriceId = billingCycle === 'monthly' ? process.env.STRIPE_PRICE_MONTHLY : process.env.STRIPE_PRICE_ANNUAL;
    }

    if (!newPriceId) {
      res.status(500).json({ error: 'Price configuration missing for new plan' });
      return;
    }

    // Update Stripe subscription
    if (subscription.stripeSubscriptionId) {
      // Retrieve full subscription from Stripe to get items
      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [{
          id: stripeSubscription.items.data[0].id,
          price: newPriceId,
        }],
        proration_behavior: 'always_invoice',
        metadata: {
          planTier: tier,
          billingCycle: billingCycle,
        },
      });
    }

    res.json({ message: 'Subscription successfully updated' });
  } catch (error: any) {
    throw new AppError(error.message || 'Failed to update subscription', 500);
  }
};

/**
 * Verify Stripe Configuration (Admin only)
 * GET /api/stripe/verify-config
 */
export const verifyStripeConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    if (!isStripeConfigured() || !stripe) {
      res.status(500).json({
        status: 'error',
        message: 'Stripe is not configured in environment variables.',
        details: {
          hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
          hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
          hasPublishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY
        }
      });
      return;
    }

    const priceIds = [
      process.env.STRIPE_PRICE_STANDARD_MONTHLY,
      process.env.STRIPE_PRICE_STANDARD_ANNUAL,
      process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
      process.env.STRIPE_PRICE_PREMIUM_ANNUAL,
      process.env.STRIPE_PRICE_ELITE_MONTHLY,
      process.env.STRIPE_PRICE_ELITE_ANNUAL,
      process.env.STRIPE_PRICE_MONTHLY,
      process.env.STRIPE_PRICE_ANNUAL
    ].filter(id => !!id);

    const results: any[] = [];
    const errors: string[] = [];

    for (const priceId of priceIds) {
      try {
        const id = priceId!.startsWith('price_') ? priceId! : `price_${priceId}`;
        const price = await stripe.prices.retrieve(id);
        results.push({
          id,
          active: price.active,
          currency: price.currency,
          unitAmount: price.unit_amount ? price.unit_amount / 100 : 0,
          recurring: price.recurring?.interval,
          status: 'valid'
        });
      } catch (err: any) {
        results.push({
          id: priceId,
          status: 'invalid',
          error: err.message
        });
        errors.push(`Invalid Price ID: ${priceId} - ${err.message}`);
      }
    }

    // Verify webhook secret by trying to retrieve it (note: stripe API doesn't allow retrieving the secret directly for security, 
    // but we can check if we can list webhook endpoints)
    let webhookStatus = 'unknown';
    try {
      await stripe.webhookEndpoints.list({ limit: 1 });
      webhookStatus = 'valid_api_key';
    } catch (err: any) {
      webhookStatus = 'invalid_api_key';
    }

    res.json({
      status: errors.length === 0 ? 'success' : 'partial_error',
      stripeMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'live' : 'test',
      webhookStatus,
      prices: results,
      missingPrices: priceIds.length === 0 ? 'No prices configured in environment' : undefined
    });

  } catch (error: any) {
    logger.error('Stripe config verification failed', error);
    res.status(500).json({ error: 'Verification failed', details: error.message });
  }
};



