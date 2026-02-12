import { translations } from '../translations';

/**
 * Pricing Constants
 * 
 * Centralized pricing configuration for Partner Plans.
 * All pricing displays across the application should use these constants.
 */

export const PARTNER_PLAN_PRICING = {
  BASIC_MONTHLY: 500, // 500 kr
  GOLD_MONTHLY: 1000, // 1000 kr
  ANNUAL_DISCOUNT_PERCENTAGE: 20,
  TRIAL_DAYS: 90, // 3 months
} as const;

/**
 * Get translated features for partner plans
 * Use translations.ts instead of hardcoded features
 */
export const getPartnerPlanFeatures = (lang: 'en' | 'da') => {
  return {
    BASIC: translations[lang].pricing.features.basic,
    GOLD: translations[lang].pricing.features.gold,
  };
};

export const BILLING_CYCLES = {
  MONTHLY: 'monthly',
  ANNUAL: 'annual',
} as const;

/**
 * Format price for display (Danish context)
 */
export const formatPrice = (
  monthlyPrice: number,
  billingCycle: 'monthly' | 'annual',
  lang: 'en' | 'da' = 'da'
): { price: string; period: string; billing: string; vat?: string } => {
  const isDanish = lang === 'da';
  const price = monthlyPrice;

  const period = isDanish ? 'kr./md.' : 'kr./mo.';
  const billing = isDanish
    ? 'Faktureres månedligt efter 3 mdr. gratis'
    : 'Billed monthly after 3 months free';
  const vatAmount = Math.round(monthlyPrice * 1.25);
  const vat = isDanish
    ? `alle priser er ex. moms (${vatAmount} kr. inkl. moms)`
    : `all prices ex. VAT (${vatAmount} kr. incl. VAT)`;

  return {
    price: `${price}`,
    period,
    billing,
    vat,
  };
};







