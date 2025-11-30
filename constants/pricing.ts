/**
 * Pricing Constants
 * 
 * Centralized pricing configuration for Partner Plans.
 * All pricing displays across the application should use these constants.
 */

export const PARTNER_PLAN_PRICING = {
  MONTHLY: 49, // $49/month
  ANNUAL: 470.40, // $470.40/year (20% discount: 49 * 12 * 0.8)
  DISCOUNT_PERCENTAGE: 20, // 20% discount for annual billing
} as const;

export const PARTNER_PLAN_FEATURES = {
  PRO: [
    'Priority Search Ranking',
    'Verified Badge',
    'Searchable in 3 Categories',
    'Direct Lead Messaging',
    'Custom Profile Header',
  ],
  ELITE: [
    'Top of Category Placement',
    'Unlimited Categories',
    'Video Profile Header',
    'Dedicated Success Manager',
    'API Access',
  ],
} as const;

export const BILLING_CYCLES = {
  MONTHLY: 'monthly',
  ANNUAL: 'annual',
} as const;

/**
 * Calculate annual price from monthly price with discount
 */
export const calculateAnnualPrice = (monthlyPrice: number): number => {
  return Math.round(monthlyPrice * 12 * (1 - PARTNER_PLAN_PRICING.DISCOUNT_PERCENTAGE / 100));
};

/**
 * Format price for display
 */
export const formatPrice = (
  monthlyPrice: number,
  billingCycle: 'monthly' | 'annual',
  lang: 'en' | 'da' = 'en'
): { price: string; period: string; billing: string } => {
  const price = billingCycle === 'monthly' 
    ? monthlyPrice 
    : calculateAnnualPrice(monthlyPrice);
  
  const period = billingCycle === 'monthly'
    ? (lang === 'da' ? '/måned' : '/month')
    : (lang === 'da' ? '/år' : '/year');
  
  const billing = billingCycle === 'monthly'
    ? (lang === 'da' ? 'Faktureret månedligt' : 'Billed monthly')
    : (lang === 'da' ? 'Faktureret årligt (20% RABAT)' : 'Billed yearly (20% OFF)');
  
  return {
    price: `$${price}`,
    period,
    billing,
  };
};
