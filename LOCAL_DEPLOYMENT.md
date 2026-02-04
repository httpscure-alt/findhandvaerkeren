# Local Deployment Guide

Complete guide to deploy Findhåndværkeren locally on your machine.

---

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database (or Supabase connection string)
- **Git** (optional, for cloning)

---

## Quick Start (Offline Mode - Frontend Only)

If you just want to see the frontend with mock data:

```bash
# Install dependencies
npm installhe

# Start frontend
npm run dev
```

Open: **http://localhost:3000**

The frontend will use mock data automatically. See `OFFLINE_MODE.md` for details.

---

## Full Local Deployment (Frontend + Backend)

### Step 1: Install Dependencies

#### Frontend
```bash
# In project root
npm install
```

#### Backend
```bash
# Navigate to backend folder
cd backend
npm install
```

---

### Step 2: Set Up Environment Variables

#### Frontend Environment

Create `.env.local` in the project root:

```bash
# Frontend .env.local
VITE_API_URL=http://localhost:4000/api
VITE_GEMINI_API_KEY=your_gemini_api_key_here  # Optional, for AI search
```

**Note:** If you don't set `VITE_API_URL`, the frontend will use mock data automatically.

#### Backend Environment

Create `.env` in the `backend` folder:

```bash
# Backend .env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/findhandvaerkeren?schema=public"

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Server
PORT=4000
NODE_ENV=development

# CORS (for frontend)
CORS_ORIGIN=http://localhost:3000
```

**For Supabase:**
```bash
DATABASE_URL="postgresql://user:password@db.xxxxx.supabase.co:5432/postgres?sslmode=require&schema=public"
```

---

### Step 3: Set Up Database

#### Option A: Local PostgreSQL

1. Install PostgreSQL locally
2. Create database:
   ```sql
   CREATE DATABASE findhandvaerkeren;
   ```
3. Update `DATABASE_URL` in `backend/.env`

#### Option B: Supabase (Cloud)

1. Get connection string from Supabase dashboard
2. Update `DATABASE_URL` in `backend/.env` with your Supabase URL

---

### Step 4: Initialize Database Schema

```bash
cd backend

# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Optional: Seed database with sample data
npm run db:seed
```

**Alternative (using migrations):**
```bash
npm run db:migrate
```

---

### Step 5: Start Backend Server

```bash
# In backend folder
npm run dev
```

Backend will run on: **http://localhost:4000**

You should see:
```
Server running on port 4000
Database connected successfully
```

---

### Step 6: Start Frontend

Open a **new terminal** (keep backend running):

```bash
# In project root
npm run dev
```

Frontend will run on: **http://localhost:3000**

---

## Verify Deployment

### 1. Check Backend Health

Open: **http://localhost:4000/api/health** (if endpoint exists)

Or test with:
```bash
curl http://localhost:4000/api/companies
```

### 2. Check Frontend

Open: **http://localhost:3000**

You should see:
- Homepage loads
- Navigation works
- Can browse listings
- Can view company profiles

### 3. Test Authentication

1. Click "Log In" in navbar
2. Try registering a new account
3. Login should redirect to appropriate dashboard

---

## Common Issues & Solutions

### Issue: Database Connection Error

**Error:** `P1001: Can't reach database server`

**Solutions:**
1. Check `DATABASE_URL` in `backend/.env` is correct
2. For Supabase: Ensure `sslmode=require` is in the URL
3. Check database is running (if local PostgreSQL)
4. Verify network/firewall allows connection

### Issue: Frontend Shows Blank Page

**Solutions:**
1. Check browser console for errors
2. Ensure `VITE_API_URL` is set correctly (or leave empty for mock mode)
3. Check if backend is running on port 4000
4. Clear browser cache

### Issue: CORS Errors

**Solutions:**
1. Ensure `CORS_ORIGIN=http://localhost:3000` in `backend/.env`
2. Check backend server is running
3. Verify frontend is on port 3000

### Issue: Prisma Client Not Generated

**Solution:**
```bash
cd backend
npm run db:generate
```

### Issue: Port Already in Use

**Backend (port 4000):**
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9
```

**Frontend (port 3000):**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

Or change ports in:
- Backend: `backend/.env` → `PORT=4001`
- Frontend: `vite.config.ts` → `server.port: 3001`

---

## Development Workflow

### Running Both Services

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

### Making Changes

- **Frontend changes:** Hot reload automatically (Vite)
- **Backend changes:** Auto-restart with `tsx watch`
- **Database changes:** Run `npm run db:push` in backend folder

---

## Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend
```bash
npm run dev          # Start development server (watch mode)
npm run build        # Build TypeScript
npm run start        # Start production server
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio (database GUI)
```

---

## Database Management

### View Database (Prisma Studio)

```bash
cd backend
npm run db:studio
```

Opens GUI at: **http://localhost:5555**

### Reset Database

```bash
cd backend
# Drop all tables and recreate
npx prisma migrate reset
# Or
npx prisma db push --force-reset
```

---

## Production Build

### Frontend
```bash
npm run build
# Output in: dist/
```

### Backend
```bash
cd backend
npm run build
# Output in: dist/
npm run start
```

---

## Environment Variables Reference

### Frontend (.env.local)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | No (uses mock if empty) |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | No (AI search disabled if empty) |

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `PORT` | Server port | No (default: 4000) |
| `NODE_ENV` | Environment | No (default: development) |
| `CORS_ORIGIN` | Allowed CORS origin | No (default: http://localhost:3000) |

---

## Next Steps

1. **Test the application:**
   - Register as Consumer
   - Register as Partner
   - Complete partner onboarding
   - Browse listings
   - View company profiles

2. **Customize:**
   - Add more mock data in `constants.ts`
   - Modify styling in components
   - Add new features

3. **Deploy:**
   - Frontend: Vercel (see `docs/VERCEL_DEPLOYMENT.md`)
   - Backend: Railway, Render, or similar

---

## Support

- **Frontend Issues:** Check `OFFLINE_MODE.md`
- **Backend Issues:** Check `backend/README.md`
- **Database Issues:** Check `backend/check-db-status.sh`

---

**Happy coding! 🚀**







