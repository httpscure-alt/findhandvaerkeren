/**
 * Creates Stripe Products + recurring Prices for Advero marketing tiers (DKK/month).
 *
 * Usage (from backend/):
 *   npx tsx scripts/stripeSeedProducts.ts
 *
 * Requires STRIPE_SECRET_KEY in .env (test or live — matches Dashboard mode).
 * Prints .env lines to paste into backend host + Vercel (if needed).
 */

import path from 'path';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_VERSION = '2023-10-16' as const;

/** DKK/month — keep in sync with constants/marketingPricing.ts */
const MARKETING = {
  SEO_BASIC: 299,
  SEO_STANDARD: 599,
  SEO_PRO: 999,
  ADS_BASIC: 499,
  ADS_STANDARD: 999,
  ADS_PRO: 2999,
  GROWTH_BUNDLE: 4500,
} as const;

function dkkToMinorUnits(kr: number): number {
  return Math.round(kr * 100);
}

async function main() {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) {
    console.error('Missing STRIPE_SECRET_KEY in backend/.env');
    process.exit(1);
  }

  const stripe = new Stripe(secret, { apiVersion: API_VERSION });
  const currency = 'dkk';

  const out: Record<string, string> = {};

  const mkPrice = async (
    productId: string,
    envKey: string,
    unitAmount: number,
    recurring: Stripe.PriceCreateParams.Recurring,
    nickname?: string
  ) => {
    const price = await stripe.prices.create({
      product: productId,
      currency,
      unit_amount: unitAmount,
      recurring,
      nickname,
      metadata: { advero_env_key: envKey },
    });
    out[envKey] = price.id;
    console.log(`  ${envKey}=${price.id}  (${unitAmount / 100} DKK/mo)`);
  };

  console.log('\n--- Advero — Google Ads (Starter / Growth / Pro) ---\n');

  const adsProduct = await stripe.products.create({
    name: 'Advero — Google Ads',
    description: 'Google Ads management — monthly subscription (ad spend billed by Google)',
    metadata: { app: 'advero', kind: 'marketing_ads' },
  });

  await mkPrice(
    adsProduct.id,
    'STRIPE_PRICE_ADS_BASIC',
    dkkToMinorUnits(MARKETING.ADS_BASIC),
    { interval: 'month' },
    'Google Ads Starter'
  );
  await mkPrice(
    adsProduct.id,
    'STRIPE_PRICE_ADS_STANDARD',
    dkkToMinorUnits(MARKETING.ADS_STANDARD),
    { interval: 'month' },
    'Google Ads Growth'
  );
  await mkPrice(
    adsProduct.id,
    'STRIPE_PRICE_ADS_PRO',
    dkkToMinorUnits(MARKETING.ADS_PRO),
    { interval: 'month' },
    'Google Ads Pro'
  );

  console.log('\n--- Advero — SEO (Starter / Growth / Pro) ---\n');

  const seoProduct = await stripe.products.create({
    name: 'Advero — SEO',
    description: 'SEO management — monthly subscription',
    metadata: { app: 'advero', kind: 'marketing_seo' },
  });

  await mkPrice(
    seoProduct.id,
    'STRIPE_PRICE_SEO_BASIC',
    dkkToMinorUnits(MARKETING.SEO_BASIC),
    { interval: 'month' },
    'SEO Starter'
  );
  await mkPrice(
    seoProduct.id,
    'STRIPE_PRICE_SEO_STANDARD',
    dkkToMinorUnits(MARKETING.SEO_STANDARD),
    { interval: 'month' },
    'SEO Growth'
  );
  await mkPrice(
    seoProduct.id,
    'STRIPE_PRICE_SEO_PRO',
    dkkToMinorUnits(MARKETING.SEO_PRO),
    { interval: 'month' },
    'SEO Pro'
  );

  console.log('\n--- Advero — Growth+ bundle ---\n');

  const growthProduct = await stripe.products.create({
    name: 'Advero — Growth+',
    description: 'SEO Growth + Google Ads Growth + AI Visibility Search',
    metadata: { app: 'advero', kind: 'marketing_growth_bundle' },
  });

  await mkPrice(
    growthProduct.id,
    'STRIPE_PRICE_GROWTH_BUNDLE',
    dkkToMinorUnits(MARKETING.GROWTH_BUNDLE),
    { interval: 'month' },
    'Growth+ bundle'
  );

  console.log('\n--- Copy into backend/.env (and API host env) ---\n');
  const keys = [
    'STRIPE_PRICE_ADS_BASIC',
    'STRIPE_PRICE_ADS_STANDARD',
    'STRIPE_PRICE_ADS_PRO',
    'STRIPE_PRICE_SEO_BASIC',
    'STRIPE_PRICE_SEO_STANDARD',
    'STRIPE_PRICE_SEO_PRO',
    'STRIPE_PRICE_GROWTH_BUNDLE',
  ];
  for (const k of keys) {
    console.log(`${k}=${out[k]}`);
  }

  console.log(
    `\nDone. Mode: ${secret.startsWith('sk_live') ? 'LIVE' : 'TEST'}. ` +
      'Point Stripe webhook to /api/stripe/webhook and set STRIPE_WEBHOOK_SECRET.'
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
