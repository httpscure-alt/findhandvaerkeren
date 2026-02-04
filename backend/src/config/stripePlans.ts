export type SubscriptionTier = 'Standard' | 'Premium' | 'Elite';
export type BillingCycle = 'monthly' | 'annual';

interface PlanDetails {
    tier: SubscriptionTier;
    billingCycle: BillingCycle;
}

/**
 * Mapping of Stripe Price IDs to internal tiers and billing cycles.
 * These should match the values in your .env file.
 */
const PRICE_MAP: Record<string, PlanDetails> = {
    [process.env.STRIPE_PRICE_STANDARD_MONTHLY || '']: { tier: 'Standard', billingCycle: 'monthly' },
    [process.env.STRIPE_PRICE_STANDARD_ANNUAL || '']: { tier: 'Standard', billingCycle: 'annual' },
    [process.env.STRIPE_PRICE_PREMIUM_MONTHLY || '']: { tier: 'Premium', billingCycle: 'monthly' },
    [process.env.STRIPE_PRICE_PREMIUM_ANNUAL || '']: { tier: 'Premium', billingCycle: 'annual' },
    [process.env.STRIPE_PRICE_ELITE_MONTHLY || '']: { tier: 'Elite', billingCycle: 'monthly' },
    [process.env.STRIPE_PRICE_ELITE_ANNUAL || '']: { tier: 'Elite', billingCycle: 'annual' },
    // Generic fallbacks for older configurations
    [process.env.STRIPE_PRICE_MONTHLY || '']: { tier: 'Premium', billingCycle: 'monthly' },
    [process.env.STRIPE_PRICE_ANNUAL || '']: { tier: 'Premium', billingCycle: 'annual' },
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
    return { tier: 'Premium', billingCycle: 'monthly' };
}

/**
 * Get only the tier from a Stripe Price ID
 */
export function getTierFromPriceId(priceId: string): SubscriptionTier {
    return getPlanDetails(priceId).tier;
}
