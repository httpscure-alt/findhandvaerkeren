# Stripe Production Setup Guide

To use the Stripe real integration in production, you must configure the following environment variables with your **Live** keys and Price IDs from the Stripe Dashboard.

## 1. API Keys
Go to **Developers > API Keys** in your Stripe Dashboard.
- `STRIPE_PUBLISHABLE_KEY`: Use the "Live publishable key" (starts with `pk_live_`).
- `STRIPE_SECRET_KEY`: Use the "Live secret key" (starts with `sk_live_`).

## 2. Webhook Secret
Go to **Developers > Webhooks**, add an endpoint pointing to `https://your-domain.com/api/stripe/webhook`, and select the following events:
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Then, copy the "Signing secret" (starts with `whsec_`) to:
- `STRIPE_WEBHOOK_SECRET`: `whsec_...`

## 3. Subscription Price IDs
Create Products and Prices in your Stripe Dashboard (**Product Catalog**). You need a price for each tier and billing cycle.

| Tier | Billing Cycle | Env Variable |
|------|---------------|--------------|
| Standard | Monthly | `STRIPE_PRICE_STANDARD_MONTHLY` |
| Standard | Annual | `STRIPE_PRICE_STANDARD_ANNUAL` |
| Premium | Monthly | `STRIPE_PRICE_PREMIUM_MONTHLY` |
| Premium | Annual | `STRIPE_PRICE_PREMIUM_ANNUAL` |
| Elite | Monthly | `STRIPE_PRICE_ELITE_MONTHLY` |
| Elite | Annual | `STRIPE_PRICE_ELITE_ANNUAL` |

> [!IMPORTANT]
> Ensure the "Price ID" (starts with `price_`) is correctly copied into your `.env` file. Do NOT use the Product ID.
