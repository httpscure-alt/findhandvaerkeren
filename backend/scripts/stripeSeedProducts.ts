/**
 * Creates Stripe Products + recurring Prices to match backend/src/config/stripePlans.ts
 * and frontend constants (constants/pricing.ts, constants/marketingPricing.ts).
 *
 * Usage (from backend/):
 *   npx tsx scripts/stripeSeedProducts.ts
 *
 * Requires STRIPE_SECRET_KEY in .env (test or live — matches Dashboard mode).
 * Prints .env lines to paste into backend/.env and Vercel.
 */

import path from 'path';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_VERSION = '2023-10-16' as const;

/** DKK amounts in smallest unit (øre). Keep in sync with constants/pricing.ts */
const PARTNER_BASIC_MONTHLY_DKK = 500;
const PARTNER_GOLD_MONTHLY_DKK = 1000;
const ANNUAL_DISCOUNT = 0.2; // 20% — matches PARTNER_PLAN_PRICING.ANNUAL_DISCOUNT_PERCENTAGE

/** Marketing DKK/month (whole kroner). Keep in sync with constants/marketingPricing.ts */
const MARKETING = {
  ADS_BASIC: 1000,
  ADS_STANDARD: 2000,
  ADS_PRO: 5000,
  SEO_BASIC: 1500,
  SEO_STANDARD: 3000,
  SEO_PRO: 5000,
} as const;

function dkkToMinorUnits(kr: number): number {
  return Math.round(kr * 100);
}

function annualFromMonthlyMonthlyKr(monthlyKr: number): number {
  return Math.round(monthlyKr * 12 * (1 - ANNUAL_DISCOUNT));
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
    recurring: Stripe.PriceCreateParams.Recurring
  ) => {
    const price = await stripe.prices.create({
      product: productId,
      currency,
      unit_amount: unitAmount,
      recurring,
      metadata: { fh_env_key: envKey },
    });
    out[envKey] = price.id;
    console.log(`  ${envKey}=${price.id}`);
  };

  console.log('\n--- Partner plans ---\n');

  const partnerBasic = await stripe.products.create({
    name: 'Findhåndværkeren — Partner Basic (listing)',
    description: 'Business listing — Basic tier (monthly / annual)',
    metadata: { app: 'findhandvaerkeren', kind: 'partner_basic' },
  });

  await mkPrice(
    partnerBasic.id,
    'STRIPE_PRICE_BASIC_MONTHLY',
    dkkToMinorUnits(PARTNER_BASIC_MONTHLY_DKK),
    { interval: 'month' }
  );
  await mkPrice(
    partnerBasic.id,
    'STRIPE_PRICE_BASIC_ANNUAL',
    dkkToMinorUnits(annualFromMonthlyMonthlyKr(PARTNER_BASIC_MONTHLY_DKK)),
    { interval: 'year' }
  );

  const partnerGold = await stripe.products.create({
    name: 'Findhåndværkeren — Partner Gold (listing)',
    description: 'Business listing — Gold tier (monthly / annual)',
    metadata: { app: 'findhandvaerkeren', kind: 'partner_gold' },
  });

  await mkPrice(
    partnerGold.id,
    'STRIPE_PRICE_GOLD_MONTHLY',
    dkkToMinorUnits(PARTNER_GOLD_MONTHLY_DKK),
    { interval: 'month' }
  );
  await mkPrice(
    partnerGold.id,
    'STRIPE_PRICE_GOLD_ANNUAL',
    dkkToMinorUnits(annualFromMonthlyMonthlyKr(PARTNER_GOLD_MONTHLY_DKK)),
    { interval: 'year' }
  );

  console.log('\n--- Google Ads (monthly) ---\n');

  const adsProduct = await stripe.products.create({
    name: 'Findhåndværkeren — Google Ads',
    description: 'Marketing — Google Ads subscription (monthly)',
    metadata: { app: 'findhandvaerkeren', kind: 'marketing_ads' },
  });

  await mkPrice(adsProduct.id, 'STRIPE_PRICE_ADS_BASIC', dkkToMinorUnits(MARKETING.ADS_BASIC), {
    interval: 'month',
  });
  await mkPrice(
    adsProduct.id,
    'STRIPE_PRICE_ADS_STANDARD',
    dkkToMinorUnits(MARKETING.ADS_STANDARD),
    { interval: 'month' }
  );
  await mkPrice(adsProduct.id, 'STRIPE_PRICE_ADS_PRO', dkkToMinorUnits(MARKETING.ADS_PRO), {
    interval: 'month',
  });

  console.log('\n--- SEO (monthly) ---\n');

  const seoProduct = await stripe.products.create({
    name: 'Findhåndværkeren — SEO',
    description: 'Marketing — SEO subscription (monthly)',
    metadata: { app: 'findhandvaerkeren', kind: 'marketing_seo' },
  });

  await mkPrice(seoProduct.id, 'STRIPE_PRICE_SEO_BASIC', dkkToMinorUnits(MARKETING.SEO_BASIC), {
    interval: 'month',
  });
  await mkPrice(
    seoProduct.id,
    'STRIPE_PRICE_SEO_STANDARD',
    dkkToMinorUnits(MARKETING.SEO_STANDARD),
    { interval: 'month' }
  );
  await mkPrice(seoProduct.id, 'STRIPE_PRICE_SEO_PRO', dkkToMinorUnits(MARKETING.SEO_PRO), {
    interval: 'month',
  });

  console.log('\n--- Copy into backend/.env (and API host env) ---\n');
  const keys = [
    'STRIPE_PRICE_BASIC_MONTHLY',
    'STRIPE_PRICE_BASIC_ANNUAL',
    'STRIPE_PRICE_GOLD_MONTHLY',
    'STRIPE_PRICE_GOLD_ANNUAL',
    'STRIPE_PRICE_ADS_BASIC',
    'STRIPE_PRICE_ADS_STANDARD',
    'STRIPE_PRICE_ADS_PRO',
    'STRIPE_PRICE_SEO_BASIC',
    'STRIPE_PRICE_SEO_STANDARD',
    'STRIPE_PRICE_SEO_PRO',
  ];
  for (const k of keys) {
    console.log(`${k}=${out[k]}`);
  }

  console.log(
    `\nDone. Mode: ${secret.startsWith('sk_live') ? 'LIVE' : 'TEST'}. ` +
      'Add webhook endpoint for /api/stripe/webhook and set STRIPE_WEBHOOK_SECRET.'
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
