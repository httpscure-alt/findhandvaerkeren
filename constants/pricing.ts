/**
 * Pricing Constants
 * 
 * Centralized pricing configuration for Partner Plans.
 * All pricing displays across the application should use these constants.
 */

export const PARTNER_PLAN_PRICING = {
  MONTHLY: 500, // 500 kr
  GOLD_MONTHLY: 1500, // 1500 kr
  ANNUAL_DISCOUNT_PERCENTAGE: 20,
  TRIAL_DAYS: 90, // 3 months
} as const;

export const PARTNER_PLAN_FEATURES = {
  PRO: [
    'Prioriteret søgeresultat',
    'Verificeret badge',
    'Søgbar i 3 kategorier',
    '3 måneder gratis trial',
    'Profil med galleri',
  ],
  GOLD: [
    'Øverst i søgeresultater',
    'Guld profil highlight',
    'Ubegrænsede kategorier',
    'Større synlighed på forsiden',
    'Alt fra Partner Plan + mere',
  ],
} as const;

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







