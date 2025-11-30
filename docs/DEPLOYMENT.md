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

## Post-Deployment Checklist

- [ ] Backend is accessible at Railway URL
- [ ] Frontend is accessible at Vercel URL
- [ ] Database connection working
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] SSL certificates active
- [ ] Error logging configured

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
