# 🚀 Production Deployment Guide

Complete step-by-step guide to deploy Findhåndværkeren to production.

---

## 📋 Pre-Deployment Checklist

- [ ] All code is committed to Git
- [ ] All tests pass locally
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Stripe production keys obtained
- [ ] Domain name ready (optional)
- [ ] SSL certificates configured (auto with Vercel/Railway)

---

## 🗄️ Step 1: Database Setup (Supabase/Neon)

### Option A: Supabase (Recommended - You're already using it)

1. **Go to your Supabase project**: https://supabase.com/dashboard
2. **Get Production Connection String**:
   - Go to Settings → Database
   - Copy the connection string (use the **Connection Pooler** URL for production)
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true&sslmode=require`

3. **Run Migrations**:
   ```bash
   cd backend
   npm run db:generate
   npx prisma migrate deploy
   ```

### Option B: Neon (Alternative)

1. Go to [neon.tech](https://neon.tech) and create a project
2. Copy the connection string
3. Update `DATABASE_URL` in backend environment variables

---

## 🔧 Step 2: Backend Deployment (Railway)

### 2.1 Prepare Backend

1. **Build locally to test**:
   ```bash
   cd backend
   npm install
   npm run build
   ```

2. **Verify build works**:
   ```bash
   npm start
   # Should start without errors
   ```

### 2.2 Deploy to Railway

#### Option A: Via Railway Dashboard (Easiest)

1. **Go to [railway.app](https://railway.app)** and sign in
2. **Create New Project** → "Deploy from GitHub repo"
3. **Select your repository**
4. **Configure the service**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Watch Paths**: `backend/**`

5. **Add PostgreSQL Database**:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will auto-create `DATABASE_URL` environment variable

6. **Set Environment Variables** in Railway Dashboard:
   ```env
   # Database (auto-set by Railway if using Railway PostgreSQL)
   DATABASE_URL=postgresql://... (or use your Supabase URL)
   
   # Server
   NODE_ENV=production
   PORT=5000
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # CORS - IMPORTANT: Set to your frontend URL
   FRONTEND_URL=https://your-frontend.vercel.app
   
   # Stripe Production Keys
   STRIPE_SECRET_KEY=sk_live_... (from Stripe Dashboard)
   STRIPE_PUBLISHABLE_KEY=pk_live_... (from Stripe Dashboard)
   STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe Dashboard)
   STRIPE_PRICE_MONTHLY=price_... (Production price ID)
   STRIPE_PRICE_ANNUAL=price_... (Production price ID)
   
   # Optional
   GEMINI_API_KEY=your-gemini-key
   SENTRY_DSN=your-sentry-dsn
   ```

7. **Deploy**: Railway will auto-deploy on every push to main branch

#### Option B: Via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Link to existing project (if you created one in dashboard)
railway link

# Add PostgreSQL (or use existing Supabase)
railway add postgresql

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-secret
railway variables set FRONTEND_URL=https://your-frontend.vercel.app
# ... set all other variables

# Deploy
railway up
```

### 2.3 Get Backend URL

After deployment, Railway will give you a URL like:
- `https://your-backend-production.up.railway.app`

**Save this URL** - you'll need it for frontend configuration.

---

## 🎨 Step 3: Frontend Deployment (Vercel)

### 3.1 Prepare Frontend

1. **Test build locally**:
   ```bash
   # From root directory
   npm install
   npm run build
   ```

2. **Verify build output**:
   - Check that `dist/` folder is created
   - No build errors

### 3.2 Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "Add New Project"**
3. **Import your GitHub repository**
4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Set Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   VITE_GEMINI_API_KEY=your-gemini-key (optional)
   ```

6. **Deploy**: Click "Deploy"

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Link to existing project? No
# - Project name? findhandvaerkeren
# - Directory? ./
```

### 3.3 Get Frontend URL

After deployment, Vercel will give you a URL like:
- `https://your-app.vercel.app`

**Update backend `FRONTEND_URL`** in Railway with this URL.

---

## 💳 Step 4: Stripe Production Setup

### 4.1 Get Production Keys

1. **Go to [Stripe Dashboard](https://dashboard.stripe.com)**
2. **Switch to "Live mode"** (toggle in top right)
3. **Get API Keys**:
   - Go to Developers → API keys
   - Copy **Publishable key** (`pk_live_...`)
   - Copy **Secret key** (`sk_live_...`)

4. **Create Production Prices**:
   - Go to Products → Create/Edit your product
   - Create Monthly and Annual prices
   - Copy the Price IDs (`price_...`)

### 4.2 Configure Stripe Webhook

1. **Go to Developers → Webhooks**
2. **Add endpoint**:
   - URL: `https://your-backend.railway.app/api/stripe/webhook`
   - Events to listen: Select all `checkout.session.*` and `invoice.*` events
3. **Copy Webhook Secret** (`whsec_...`)

### 4.3 Update Backend Environment Variables

In Railway, update:
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_... (production)
STRIPE_PRICE_ANNUAL=price_... (production)
```

---

## 🔐 Step 5: Environment Variables Summary

### Backend (Railway)

```env
# Database
DATABASE_URL=postgresql://... (Supabase or Railway PostgreSQL)

# Server
NODE_ENV=production
PORT=5000

# JWT
JWT_SECRET=generate-a-strong-random-secret-here
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://your-frontend.vercel.app

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...

# Optional
GEMINI_API_KEY=...
SENTRY_DSN=...
```

### Frontend (Vercel)

```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_GEMINI_API_KEY=... (optional)
```

---

## 🌐 Step 6: Custom Domain (Optional)

### 6.1 Frontend Domain (Vercel)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `findhandvaerkeren.dk`)
3. Follow DNS instructions:
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Or A record: `@` → Vercel IP

### 6.2 Backend Domain (Railway)

1. Go to Railway Dashboard → Your Service → Settings → Networking
2. Add custom domain (e.g., `api.findhandvaerkeren.dk`)
3. Update DNS:
   - Add CNAME: `api` → `your-service.railway.app`

### 6.3 Update Environment Variables

After setting up domains:
- **Backend**: Update `FRONTEND_URL` to your custom domain
- **Frontend**: Update `VITE_API_URL` to your custom backend domain

---

## ✅ Step 7: Post-Deployment Verification

### 7.1 Test Backend

```bash
# Health check
curl https://your-backend.railway.app/health

# Should return: {"status":"ok",...}
```

### 7.2 Test Frontend

1. Visit your Vercel URL
2. Test:
   - [ ] Homepage loads
   - [ ] Navigation works
   - [ ] Sign up works
   - [ ] Login works
   - [ ] API calls work (check browser console)
   - [ ] Stripe checkout works (test with test card)

### 7.3 Test Stripe

1. **Test Mode First**:
   - Use test card: `4242 4242 4242 4242`
   - Complete a test payment
   - Verify webhook receives events

2. **Production Mode**:
   - Switch Stripe to Live mode
   - Test with real card (small amount)
   - Verify payment succeeds

---

## 🔍 Step 8: Monitoring & Logs

### 8.1 Railway Logs

```bash
# View logs via CLI
railway logs

# Or view in Railway Dashboard → Deployments → View Logs
```

### 8.2 Vercel Logs

- Go to Vercel Dashboard → Your Project → Deployments → Click deployment → View Function Logs

### 8.3 Error Monitoring (Sentry)

1. **Create Sentry project**: https://sentry.io
2. **Get DSN**
3. **Add to environment variables**:
   - Backend: `SENTRY_DSN=...`
   - Frontend: `VITE_SENTRY_DSN=...`

---

## 🚨 Troubleshooting

### Backend Issues

**Database connection failed:**
- Check `DATABASE_URL` format
- Verify database is accessible
- Check if using connection pooler URL for Supabase

**CORS errors:**
- Verify `FRONTEND_URL` matches your Vercel domain exactly
- Check CORS middleware in `backend/src/server.ts`

**Stripe webhook not working:**
- Verify webhook URL is correct
- Check webhook secret matches
- View webhook events in Stripe Dashboard

### Frontend Issues

**API calls failing:**
- Verify `VITE_API_URL` is correct
- Check browser console for CORS errors
- Verify backend is running

**Build errors:**
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Test build locally first: `npm run build`

---

## 📝 Quick Reference

### Deployment URLs

- **Backend**: `https://your-backend.railway.app`
- **Frontend**: `https://your-app.vercel.app`
- **Database**: Your Supabase/Neon dashboard

### Important Commands

```bash
# Backend
cd backend
npm run build        # Build
npm start            # Start production server
npm run db:migrate   # Run migrations

# Frontend
npm run build        # Build
npm run preview      # Preview production build locally
```

### Environment Variable Checklist

**Backend:**
- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] FRONTEND_URL
- [ ] STRIPE_SECRET_KEY (live)
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] STRIPE_PRICE_MONTHLY (live)
- [ ] STRIPE_PRICE_ANNUAL (live)

**Frontend:**
- [ ] VITE_API_URL

---

## 🎉 You're Live!

Your application is now deployed to production. Monitor logs, set up alerts, and enjoy! 🚀

---

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Stripe Production Checklist](https://stripe.com/docs/keys)
- [Supabase Docs](https://supabase.com/docs)

