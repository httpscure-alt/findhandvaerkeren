/**
 * Marketing Services Pricing Constants
 * 
 * Centralized pricing configuration for SEO and Google Ads services.
 * All marketing service pricing displays should use these constants.
 */

export const MARKETING_PRICING = {
    // Google Ads Tiers
    ADS_BASIC: 1000,    // 1,000 DKK/month
    ADS_STANDARD: 2000, // 2,000 DKK/month
    ADS_PRO: 5000,      // 5,000 DKK/month

    // SEO Tiers
    SEO_BASIC: 1500,    // 1,500 DKK/month
    SEO_STANDARD: 3000, // 3,000 DKK/month
    SEO_PRO: 5000,      // 5,000 DKK/month
} as const;

export type MarketingServiceType = 'ads' | 'seo';
export type MarketingTier = 'basic' | 'standard' | 'pro';

export interface MarketingTierInfo {
    id: string;
    serviceType: MarketingServiceType;
    tier: MarketingTier;
    price: number;
    name: string;
}

/**
 * Get price for a marketing service tier
 */
export const getMarketingPrice = (
    serviceType: MarketingServiceType,
    tier: MarketingTier
): number => {
    const key = `${serviceType.toUpperCase()}_${tier.toUpperCase()}` as keyof typeof MARKETING_PRICING;
    return MARKETING_PRICING[key];
};

/**
 * Parse tier ID (e.g., 'ads_basic') into service type and tier
 */
export const parseMarketingTierId = (tierId: string): MarketingTierInfo | null => {
    const parts = tierId.split('_');
    if (parts.length !== 2) return null;

    const [serviceType, tier] = parts;

    if (serviceType !== 'ads' && serviceType !== 'seo') return null;
    if (tier !== 'basic' && tier !== 'standard' && tier !== 'pro') return null;

    const price = getMarketingPrice(serviceType as MarketingServiceType, tier as MarketingTier);

    return {
        id: tierId,
        serviceType: serviceType as MarketingServiceType,
        tier: tier as MarketingTier,
        price,
        name: `${serviceType.toUpperCase()} ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
    };
};

/**
 * Check if a tier ID is a marketing service
 */
export const isMarketingTier = (tierId: string): boolean => {
    return tierId.startsWith('ads_') || tierId.startsWith('seo_');
};
