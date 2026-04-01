export type SubscriptionTier = 'Basic' | 'Gold';
export type BillingCycle = 'monthly' | 'annual';
export type MarketingServiceType = 'ads' | 'seo';
export type MarketingTier = 'basic' | 'standard' | 'pro';

interface PlanDetails {
    tier: SubscriptionTier;
    billingCycle: BillingCycle;
}

interface MarketingPlanDetails {
    serviceType: MarketingServiceType;
    tier: MarketingTier;
}

/**
 * Mapping of Stripe Price IDs to internal tiers and billing cycles.
 * These should match the values in your .env file.
 */
const PRICE_MAP: Record<string, PlanDetails> = {
    [process.env.STRIPE_PRICE_BASIC_MONTHLY || '']: { tier: 'Basic', billingCycle: 'monthly' },
    [process.env.STRIPE_PRICE_BASIC_ANNUAL || '']: { tier: 'Basic', billingCycle: 'annual' },
    [process.env.STRIPE_PRICE_GOLD_MONTHLY || '']: { tier: 'Gold', billingCycle: 'monthly' },
    [process.env.STRIPE_PRICE_GOLD_ANNUAL || '']: { tier: 'Gold', billingCycle: 'annual' },
    // Generic fallbacks for older configurations
    [process.env.STRIPE_PRICE_MONTHLY || '']: { tier: 'Basic', billingCycle: 'monthly' },
    [process.env.STRIPE_PRICE_ANNUAL || '']: { tier: 'Basic', billingCycle: 'annual' },
};

/**
 * Mapping of Stripe Price IDs to marketing service tiers
 */
const MARKETING_PRICE_MAP: Record<string, MarketingPlanDetails> = {
    // Google Ads tiers
    [process.env.STRIPE_PRICE_ADS_BASIC || '']: { serviceType: 'ads', tier: 'basic' },
    [process.env.STRIPE_PRICE_ADS_STANDARD || '']: { serviceType: 'ads', tier: 'standard' },
    [process.env.STRIPE_PRICE_ADS_PRO || '']: { serviceType: 'ads', tier: 'pro' },
    // SEO tiers
    [process.env.STRIPE_PRICE_SEO_BASIC || '']: { serviceType: 'seo', tier: 'basic' },
    [process.env.STRIPE_PRICE_SEO_STANDARD || '']: { serviceType: 'seo', tier: 'standard' },
    [process.env.STRIPE_PRICE_SEO_PRO || '']: { serviceType: 'seo', tier: 'pro' },
};

/**
 * Get tier and billing cycle details from a Stripe Price ID
 */
export function getPlanDetails(priceId: string): PlanDetails {
    // Try exact match first
    if (PRICE_MAP[priceId]) {
        return PRICE_MAP[priceId];
    }

    // Fallback if priceId doesn't match exactly (e.g. if priceId has prefix/suffix)
    // or if env vars are not set during build time in some environments
    for (const [id, details] of Object.entries(PRICE_MAP)) {
        if (id && id !== '' && (priceId.includes(id) || id.includes(priceId))) {
            return details;
        }
    }

    // Default fallback
    return { tier: 'Basic', billingCycle: 'monthly' };
}

/**
 * Get only the tier from a Stripe Price ID
 */
export function getTierFromPriceId(priceId: string): SubscriptionTier {
    return getPlanDetails(priceId).tier;
}

/**
 * Get marketing service details from a Stripe Price ID
 */
export function getMarketingPlanDetails(priceId: string): MarketingPlanDetails | null {
    // Try exact match first
    if (MARKETING_PRICE_MAP[priceId]) {
        return MARKETING_PRICE_MAP[priceId];
    }

    // Fallback if priceId doesn't match exactly
    for (const [id, details] of Object.entries(MARKETING_PRICE_MAP)) {
        if (id && id !== '' && (priceId.includes(id) || id.includes(priceId))) {
            return details;
        }
    }

    return null;
}

/**
 * Check if a price ID is for a marketing service
 */
export function isMarketingPriceId(priceId: string): boolean {
    return getMarketingPlanDetails(priceId) !== null;
}

/**
 * Get price ID for a marketing service tier
 */
export function getMarketingPriceId(serviceType: MarketingServiceType, tier: MarketingTier): string | null {
    const key = `STRIPE_PRICE_${serviceType.toUpperCase()}_${tier.toUpperCase()}`;
    return process.env[key] || null;
}
