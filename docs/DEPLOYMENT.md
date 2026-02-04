# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon, Supabase, or self-hosted)
- Git

---

## Backend Deployment (Railway)

### 1. Prepare Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
NODE_ENV=production
FRONTEND_URL="https://your-frontend-domain.vercel.app"
```

### 2. Database Setup

1. Generate Prisma client:
```bash
npm run db:generate
```

2. Run migrations:
```bash
npm run db:migrate
```

3. (Optional) Seed database:
```bash
npm run db:seed
```

### 3. Deploy to Railway

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize project:
```bash
railway init
```

4. Link to existing project (if applicable):
```bash
railway link
```

5. Add PostgreSQL service:
```bash
railway add postgresql
```

6. Set environment variables in Railway dashboard or via CLI:
```bash
railway variables set DATABASE_URL=$DATABASE_URL
railway variables set JWT_SECRET=$JWT_SECRET
railway variables set FRONTEND_URL=$FRONTEND_URL
```

7. Deploy:
```bash
railway up
```

### 4. Railway Configuration

Create `railway.json` in backend root:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## Frontend Deployment (Vercel)

### 1. Prepare Frontend

1. Navigate to root directory:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_GEMINI_API_KEY=your-gemini-key
```

### 2. Build Locally (Test)

```bash
npm run build
```

### 3. Deploy to Vercel

#### Option A: Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set environment variables:
```bash
vercel env add VITE_API_URL
vercel env add VITE_GEMINI_API_KEY
```

#### Option B: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables in dashboard
5. Deploy

### 4. Vercel Configuration

Create `vercel.json` in root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Database Setup (Neon)

### 1. Create Neon Project

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

### 2. Update Backend .env

```env
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

### 3. Run Migrations

```bash
cd backend
npm run db:migrate
npm run db:seed
```

---

## Environment Variables Summary

### Backend (.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
GEMINI_API_KEY=optional
SHOPIFY_DOMAIN=optional
SHOPIFY_STOREFRONT_TOKEN=optional
```

### Frontend (.env.local)
```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_GEMINI_API_KEY=your-key
VITE_SHOPIFY_DOMAIN=optional
VITE_SHOPIFY_STOREFRONT_TOKEN=optional
```

---

## Production Environment Variables

### Backend (Railway)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-random-secret>
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...

# Email
FROM_EMAIL=noreply@findhandvaerkeren.dk

# File Uploads
UPLOAD_DIR=uploads
```

### Frontend (Vercel)
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_GEMINI_API_KEY=...
```

## Database Backups

### Automated Backups (Neon)
Neon provides automatic daily backups. To enable:
1. Go to Neon dashboard
2. Navigate to project settings
3. Enable "Point-in-time recovery"
4. Set retention period (7-30 days recommended)

### Manual Backup
```bash
# Using pg_dump
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20240115.sql
```

### Backup Schedule
- **Daily**: Automated via Neon
- **Before major changes**: Manual backup
- **Weekly**: Export to S3/cloud storage (optional)

## SSL/HTTPS Setup

### Railway (Backend)
Railway provides SSL automatically. Ensure:
- Custom domain configured in Railway
- DNS records point to Railway
- SSL certificate auto-provisioned

### Vercel (Frontend)
Vercel provides SSL automatically. Ensure:
- Custom domain added in Vercel dashboard
- DNS records configured
- SSL certificate auto-provisioned

### Domain Configuration
1. **Backend Domain**: `api.yourdomain.com`
   - A record or CNAME pointing to Railway
   
2. **Frontend Domain**: `yourdomain.com` or `www.yourdomain.com`
   - A record or CNAME pointing to Vercel

## Error Monitoring

### Sentry Integration (Recommended)

**Backend:**
```bash
npm install @sentry/node @sentry/profiling-node
```

Create `backend/src/utils/sentry.ts`:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export default Sentry;
```

Add to `server.ts`:
```typescript
import Sentry from './utils/sentry';

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
// ... routes
app.use(Sentry.Handlers.errorHandler());
```

**Frontend:**
```bash
npm install @sentry/react
```

Add to `index.tsx`:
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

### Logflare Integration (Alternative)

For structured logging:
```bash
npm install @logflare/pino-transport
```

## Post-Deployment Checklist

- [ ] Backend is accessible at Railway URL
- [ ] Frontend is accessible at Vercel URL
- [ ] Database connection working
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] SSL certificates active
- [ ] Error monitoring configured (Sentry/Logflare)
- [ ] Database backups enabled
- [ ] Custom domain configured
- [ ] Stripe webhooks configured
- [ ] Health check endpoint working
- [ ] GDPR compliance verified
- [ ] Cookie consent banner working
- [ ] Privacy policy and terms accessible

---

## Troubleshooting

### Backend Issues

**Database connection failed:**
- Check DATABASE_URL format
- Verify database is accessible
- Check firewall rules

**CORS errors:**
- Verify FRONTEND_URL matches your Vercel domain
- Check CORS middleware configuration

**JWT errors:**
- Verify JWT_SECRET is set
- Check token expiration

### Frontend Issues

**API calls failing:**
- Verify VITE_API_URL is correct
- Check CORS on backend
- Verify backend is running

**Build errors:**
- Check Node.js version (18+)
- Clear node_modules and reinstall
- Check for TypeScript errors

---

## Monitoring

### Railway
- View logs: `railway logs`
- Check metrics in dashboard

### Vercel
- View logs in dashboard
- Check analytics
- Monitor performance

---

## CI/CD (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm run build
      # Add Railway deployment step

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      # Add Vercel deployment step
```
