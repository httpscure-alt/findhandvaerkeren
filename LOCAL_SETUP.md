# 🚀 Local Development Setup Guide

Complete guide to run Findhåndværkeren locally with Stripe integration.

## Prerequisites

- **Node.js 18+** (check with `node --version`)
- **PostgreSQL Database** (Supabase, Neon, or local PostgreSQL)
- **npm** or **yarn**
- **Stripe CLI** (for webhook testing - optional but recommended)

## Step 1: Install Stripe CLI (for Webhook Testing)

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

Login to Stripe:
```bash
stripe login
```

## Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment Variables

Your `.env` file should already exist. Verify it has:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/findhandvaerkeren?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:3000"

# Stripe (TEST MODE)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."  # Get from Stripe CLI (see Step 2.4)
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_ANNUAL="price_..."
STRIPE_PRODUCT_ID="prod_..."

# Optional
GEMINI_API_KEY=""  # For AI search
```

### 2.3 Setup Database

Generate Prisma client:
```bash
npm run db:generate
```

Push schema to database:
```bash
npm run db:push
```

Or run migrations:
```bash
npm run db:migrate
```

(Optional) Seed database:
```bash
npm run db:seed
```

### 2.4 Setup Stripe Webhooks (Local Testing)

In a **separate terminal**, start Stripe webhook forwarding:

```bash
stripe listen --forward-to localhost:5000/api/stripe/webhook
```

This will output a webhook signing secret like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copy this secret** and update `STRIPE_WEBHOOK_SECRET` in your `backend/.env` file.

### 2.5 Start Backend Server

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

You should see:
```
🚀 Server running on port 5000
📡 Environment: development
```

## Step 3: Frontend Setup

### 3.1 Install Dependencies

Open a **new terminal** and go to project root:

```bash
cd /Users/aldyprabowo/Documents/findhåndværkeren
npm install
```

### 3.2 Configure Environment Variables (Optional)

Create `.env.local` in the project root (if needed):

```env
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your-gemini-key  # Optional
```

### 3.3 Start Frontend Server

```bash
npm run dev
```

Frontend will run on `http://localhost:3000` (or the port Vite assigns)

## Step 4: Verify Everything Works

### 4.1 Check Backend Health

Open browser: `http://localhost:5000/health`

Should return:
```json
{"status":"ok","timestamp":"2024-..."}
```

### 4.2 Check Frontend

Open browser: `http://localhost:3000`

You should see the homepage.

### 4.3 Test Stripe Webhook

The Stripe CLI terminal should show:
```
2024-01-XX XX:XX:XX   --> checkout.session.completed [evt_xxx]
2024-01-XX XX:XX:XX  <--  [200] POST http://localhost:5000/api/stripe/webhook [evt_xxx]
```

## Quick Start Commands Summary

### Terminal 1: Stripe Webhooks
```bash
stripe listen --forward-to localhost:5000/api/stripe/webhook
```

### Terminal 2: Backend
```bash
cd backend
npm run dev
```

### Terminal 3: Frontend
```bash
cd /Users/aldyprabowo/Documents/findhåndværkeren
npm run dev
```

## Troubleshooting

### Backend won't start

1. **Check database connection:**
   ```bash
   cd backend
   npm run test:connection
   ```

2. **Verify .env file exists:**
   ```bash
   ls -la backend/.env
   ```

3. **Check if port 5000 is in use:**
   ```bash
   lsof -i :5000
   ```

### Frontend won't start

1. **Check if port 3000 is in use:**
   ```bash
   lsof -i :3000
   ```

2. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Stripe webhook not working

1. **Verify Stripe CLI is running:**
   ```bash
   stripe listen --forward-to localhost:5000/api/stripe/webhook
   ```

2. **Check webhook secret in .env matches Stripe CLI output**

3. **Verify backend is running on port 5000**

### Database connection errors

1. **Check DATABASE_URL in backend/.env**
2. **Verify database is accessible**
3. **Run Prisma generate:**
   ```bash
   cd backend
   npm run db:generate
   ```

## Testing the Payment Flow

1. **Sign up as Partner:**
   - Go to `/signup-select`
   - Choose "I'm a Business / Partner"
   - Complete registration

2. **Complete Onboarding:**
   - Fill out all 5 steps
   - You'll be redirected to Plan Review

3. **Test Stripe Checkout:**
   - Click "Continue to Payment"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC
   - Any ZIP code

4. **Verify Webhook:**
   - Check Stripe CLI terminal for webhook events
   - Check backend console for subscription creation logs

## Default Test Accounts (if seeded)

- **Admin**: `admin@findhandvaerkeren.dk` / `admin123`
- **Consumer**: `consumer@example.com` / `consumer123`
- **Partner**: `partner@nexussolutions.com` / `partner123`

## Useful Commands

### Backend
```bash
npm run dev          # Start dev server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to DB
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio (database GUI)
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Stripe CLI
```bash
stripe listen --forward-to localhost:5000/api/stripe/webhook
stripe trigger checkout.session.completed  # Test webhook manually
```

## Next Steps

- ✅ Backend running on `http://localhost:5000`
- ✅ Frontend running on `http://localhost:3000`
- ✅ Stripe webhooks forwarding
- ✅ Database connected
- 🎉 Ready to develop!

---

**Need help?** Check:
- `TROUBLESHOOTING.md`
- `backend/CONNECTION_TROUBLESHOOTING.md`
- `OFFLINE_MODE.md` (for offline development)







