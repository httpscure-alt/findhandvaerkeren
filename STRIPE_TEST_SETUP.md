so# 🧪 Stripe Test Mode Setup Guide

This guide will help you set up Stripe **test mode** so you can test the full payment flow with Stripe's test environment.

## Prerequisites

1. **Stripe Account** - Sign up at https://stripe.com (free)
2. **Stripe Dashboard Access** - Log in to https://dashboard.stripe.com/test

---

## Step 1: Get Your Stripe Test API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`) - Not needed for backend
   - **Secret key** (starts with `sk_test_...`) - **This is what you need!**

3. Click **"Reveal test key"** to see your secret key
4. Copy the secret key (it looks like: `sk_test_51AbC123...`)

---

## Step 2: Create Test Products & Prices in Stripe

### Option A: Create Products via Stripe Dashboard (Recommended)

1. Go to https://dashboard.stripe.com/test/products
2. Click **"+ Add product"**

#### Create Monthly Premium Plan:
- **Name:** Premium Plan (Monthly)
- **Description:** Premium monthly subscription
- **Pricing model:** Recurring
- **Price:** $49.00 (or your price)
- **Billing period:** Monthly
- Click **"Save product"**
- **Copy the Price ID** (starts with `price_...`)

#### Create Annual Premium Plan:
- **Name:** Premium Plan (Annual)
- **Description:** Premium annual subscription
- **Pricing model:** Recurring
- **Price:** $470.40 (or your price - typically 20% discount)
- **Billing period:** Yearly
- Click **"Save product"**
- **Copy the Price ID** (starts with `price_...`)

### Option B: Create via Stripe CLI (Advanced)

```bash
# Install Stripe CLI if not installed
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Create monthly price
stripe prices create \
  --currency usd \
  --unit-amount 4900 \
  --recurring interval=month \
  --product-name "Premium Plan (Monthly)" \
  --product-description "Premium monthly subscription"

# Create annual price
stripe prices create \
  --currency usd \
  --unit-amount 47040 \
  --recurring interval=year \
  --product-name "Premium Plan (Annual)" \
  --product-description "Premium annual subscription"
```

---

## Step 3: Set Up Webhook (For Testing)

### Option A: Stripe CLI (Recommended for Local Testing)

1. **Install Stripe CLI:**
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local backend:**
   ```bash
   stripe listen --forward-to localhost:4000/api/stripe/webhook
   ```

4. **Copy the webhook signing secret** (starts with `whsec_...`)
   - This will be displayed in the terminal output
   - Example: `whsec_xxxxxxxxxxxxxxxxxxxxx`

### Option B: Stripe Dashboard (For Production/Staging)

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **"+ Add endpoint"**
3. **Endpoint URL:** `https://your-backend-url.com/api/stripe/webhook`
4. **Events to send:** Select these events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. **Copy the Signing secret** (starts with `whsec_...`)

---

## Step 4: Update Backend Environment Variables

Edit `backend/.env` file and add:

```env
# Stripe Test Mode Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Stripe Price IDs (from Step 2)
STRIPE_PRICE_MONTHLY=price_YOUR_MONTHLY_PRICE_ID
STRIPE_PRICE_ANNUAL=price_YOUR_ANNUAL_PRICE_ID

# Optional: Tier-specific prices (if you have Standard/Premium/Elite tiers)
# STRIPE_PRICE_STANDARD_MONTHLY=price_...
# STRIPE_PRICE_STANDARD_ANNUAL=price_...
# STRIPE_PRICE_PREMIUM_MONTHLY=price_...
# STRIPE_PRICE_PREMIUM_ANNUAL=price_...
# STRIPE_PRICE_ELITE_MONTHLY=price_...
# STRIPE_PRICE_ELITE_ANNUAL=price_...

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000
```

**Example:**
```env
STRIPE_SECRET_KEY=sk_test_51AbC123XyZ789...
STRIPE_WEBHOOK_SECRET=whsec_abc123def456...
STRIPE_PRICE_MONTHLY=price_1AbC123XyZ789...
STRIPE_PRICE_ANNUAL=price_1XyZ789AbC123...
FRONTEND_URL=http://localhost:3000
```

---

## Step 5: Restart Backend Server

After updating `.env`, restart your backend:

```bash
cd backend
# Stop the current server (Ctrl+C)
npm run dev
```

You should see:
```
🚀 Server running on port 4000
📡 Environment: development
```

---

## Step 6: Test the Payment Flow

1. **Start Stripe CLI webhook forwarding** (if using Option A):
   ```bash
   stripe listen --forward-to localhost:4000/api/stripe/webhook
   ```

2. **Start your frontend:**
   ```bash
   npm run dev
   ```

3. **Go through the payment flow:**
   - Sign up as a Partner
   - Complete onboarding
   - Go to Plan Review
   - Click "Continue to Payment"
   - You should be redirected to **Stripe Checkout** (test mode)

4. **Use Stripe Test Cards:**
   - **Success:** `4242 4242 4242 4242`
   - **Decline:** `4000 0000 0000 0002`
   - **3D Secure:** `4000 0025 0000 3155`
   - **Expiry:** Any future date (e.g., `12/25`)
   - **CVC:** Any 3 digits (e.g., `123`)
   - **ZIP:** Any 5 digits (e.g., `12345`)

5. **After payment:**
   - You'll be redirected to `/billing/success`
   - Check Stripe Dashboard → Payments to see the test payment
   - Check your backend logs for webhook events

---

## Step 7: Verify It's Working

### Check Backend Logs:
You should see:
```
Using test mode for Stripe checkout (no real user/company)
```

### Check Stripe Dashboard:
1. Go to https://dashboard.stripe.com/test/payments
2. You should see test payments appearing

### Check Webhooks:
If using Stripe CLI, you should see:
```
2024-01-XX XX:XX:XX   --> checkout.session.completed [evt_xxx]
2024-01-XX XX:XX:XX  <--  [200] POST http://localhost:4000/api/stripe/webhook
```

---

## Troubleshooting

### "Stripe is not configured" Error

**Check:**
1. Is `STRIPE_SECRET_KEY` in `backend/.env`?
2. Does it start with `sk_test_`?
3. Did you restart the backend after adding it?

### "Stripe price configuration missing" Error

**Check:**
1. Are `STRIPE_PRICE_MONTHLY` and `STRIPE_PRICE_ANNUAL` in `backend/.env`?
2. Do they start with `price_`?
3. Are they valid price IDs from your Stripe dashboard?

### Webhook Not Working

**Check:**
1. Is Stripe CLI running? (`stripe listen --forward-to localhost:4000/api/stripe/webhook`)
2. Is `STRIPE_WEBHOOK_SECRET` in `backend/.env`?
3. Does it match the secret from Stripe CLI output?

### Payment Redirects to Mock Mode

**Check:**
1. Is backend running and accessible?
2. Check browser console for API errors
3. Verify `VITE_API_URL` in frontend `.env.local` points to backend

---

## Test Cards Reference

| Card Number | Scenario |
|------------|----------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Card declined |
| `4000 0025 0000 3155` | 🔒 3D Secure required |
| `4000 0000 0000 9995` | ❌ Insufficient funds |

**All test cards:**
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **ZIP:** Any 5 digits

---

## Next Steps

Once test mode is working:
1. ✅ Test successful payments
2. ✅ Test failed payments
3. ✅ Test subscription cancellation
4. ✅ Test webhook events
5. ✅ Verify data in your database

When ready for production:
- Switch to **live mode** keys (starts with `sk_live_...`)
- Update price IDs to production prices
- Set up production webhook endpoint

---

**That's it! You're now using Stripe test mode! 🎉**

