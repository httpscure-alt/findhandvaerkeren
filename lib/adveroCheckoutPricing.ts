import { parseMarketingTierId, type MarketingTierId } from '../constants/marketingPricing';

export type CheckoutLineItem = {
  serviceType: 'seo' | 'ads';
  tierId: MarketingTierId;
};

export const COMBINED_DISCOUNT_PERCENT = 5;

export type CombinedCheckoutPricing = {
  items: CheckoutLineItem[];
  subtotalKr: number;
  discountKr: number;
  totalKr: number;
  discountPercent: number;
  isCombined: boolean;
};

export function calculateCombinedCheckoutPricing(
  wantSeo: boolean,
  seoTier: string | null,
  wantAds: boolean,
  adsTier: string | null
): CombinedCheckoutPricing {
  const items: CheckoutLineItem[] = [];
  let subtotalKr = 0;

  if (wantSeo && seoTier) {
    const parsed = parseMarketingTierId(seoTier);
    if (parsed) {
      items.push({ serviceType: 'seo', tierId: seoTier });
      subtotalKr += parsed.price;
    }
  }
  if (wantAds && adsTier) {
    const parsed = parseMarketingTierId(adsTier);
    if (parsed) {
      items.push({ serviceType: 'ads', tierId: adsTier });
      subtotalKr += parsed.price;
    }
  }

  const isCombined = items.length >= 2;
  const discountPercent = isCombined ? COMBINED_DISCOUNT_PERCENT : 0;
  const discountKr = isCombined ? Math.round(subtotalKr * (discountPercent / 100)) : 0;
  const totalKr = subtotalKr - discountKr;

  return {
    items,
    subtotalKr,
    discountKr,
    totalKr,
    discountPercent,
    isCombined,
  };
}
