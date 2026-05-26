/**
 * Marketing Services Pricing — single source of truth (DKK/month, excl. ad spend).
 * Keep in sync with `backend/scripts/stripeSeedProducts.ts` and `public/site/home.html`.
 */

export const MARKETING_PRICING = {
    // Google Ads — Starter / Growth / Pro
    ADS_BASIC: 499,
    ADS_STANDARD: 999,
    ADS_PRO: 2999,

    // SEO — Starter / Growth / Pro
    SEO_BASIC: 299,
    SEO_STANDARD: 599,
    SEO_PRO: 999,

    /** SEO Growth + Google Ads Growth + AI visibility */
    GROWTH_BUNDLE: 4500,
} as const;

export type MarketingServiceType = 'ads' | 'seo';
export type MarketingTier = 'basic' | 'standard' | 'pro';

export type MarketingTierId =
    | 'seo_basic'
    | 'seo_standard'
    | 'seo_pro'
    | 'ads_basic'
    | 'ads_standard'
    | 'ads_pro'
    | 'growth_bundle';

const TIER_ID_TO_PRICE_KEY: Record<MarketingTierId, keyof typeof MARKETING_PRICING> = {
    seo_basic: 'SEO_BASIC',
    seo_standard: 'SEO_STANDARD',
    seo_pro: 'SEO_PRO',
    ads_basic: 'ADS_BASIC',
    ads_standard: 'ADS_STANDARD',
    ads_pro: 'ADS_PRO',
    growth_bundle: 'GROWTH_BUNDLE',
};

/** Display names aligned with marketing site (Starter / Growth / Pro). */
export const MARKETING_TIER_LEVEL_NAMES = {
    basic: { da: 'Starter', en: 'Starter' },
    standard: { da: 'Growth', en: 'Growth' },
    pro: { da: 'Pro', en: 'Pro' },
} as const;

export interface MarketingTierInfo {
    id: string;
    serviceType: MarketingServiceType | 'growth';
    tier: MarketingTier | 'bundle';
    price: number;
    name: string;
}

export function getMarketingTierPrice(tierId: MarketingTierId): number {
    return MARKETING_PRICING[TIER_ID_TO_PRICE_KEY[tierId]];
}

export function formatMarketingPrice(
    amountKr: number,
    lang: 'da' | 'en' = 'da'
): string {
    if (lang === 'en') {
        return `${new Intl.NumberFormat('en-DK', { maximumFractionDigits: 0 }).format(amountKr)} DKK/mo`;
    }
    return `${new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 }).format(amountKr)} kr./md.`;
}

/**
 * Get price for a marketing service tier (legacy key: ads + basic → ADS_BASIC).
 */
export const getMarketingPrice = (
    serviceType: MarketingServiceType,
    tier: MarketingTier
): number => {
    const key = `${serviceType.toUpperCase()}_${tier.toUpperCase()}` as keyof typeof MARKETING_PRICING;
    return MARKETING_PRICING[key];
};

/**
 * Parse tier ID (e.g. 'ads_basic', 'growth_bundle') into service type and price.
 */
export const parseMarketingTierId = (tierId: string): MarketingTierInfo | null => {
    if (tierId === 'growth_bundle') {
        return {
            id: tierId,
            serviceType: 'growth',
            tier: 'bundle',
            price: MARKETING_PRICING.GROWTH_BUNDLE,
            name: 'Growth+',
        };
    }

    const parts = tierId.split('_');
    if (parts.length !== 2) return null;

    const [serviceType, tier] = parts;

    if (serviceType !== 'ads' && serviceType !== 'seo') return null;
    if (tier !== 'basic' && tier !== 'standard' && tier !== 'pro') return null;

    const price = getMarketingPrice(serviceType as MarketingServiceType, tier as MarketingTier);
    const level = MARKETING_TIER_LEVEL_NAMES[tier as MarketingTier];

    return {
        id: tierId,
        serviceType: serviceType as MarketingServiceType,
        tier: tier as MarketingTier,
        price,
        name: `${serviceType === 'seo' ? 'SEO' : 'Google Ads'} ${level.en}`,
    };
};

export const isMarketingTier = (tierId: string): boolean => {
    return (
        tierId === 'growth_bundle' ||
        tierId.startsWith('ads_') ||
        tierId.startsWith('seo_')
    );
};
