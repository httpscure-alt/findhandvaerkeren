# Quick Start Guide

## 🎯 Current Status

✅ **Backend**: Dependencies installed, Prisma configured  
✅ **Frontend**: Dependencies installed, ready to run  
⚠️ **Database**: Connection needs to be established (Supabase may be paused)

## 🚀 Quick Start (After Database is Active)

### Step 1: Activate Supabase Database

1. Visit [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. If paused, click **"Restore"** or **"Resume"**
4. Wait 1-2 minutes for activation

### Step 2: Setup Database

```bash
cd backend
npm run db:push
npm run db:seed
```

### Step 3: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Step 4: Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## 🔐 Test Credentials

After seeding:
- **Admin**: `admin@findhandvaerkeren.dk` / `admin123`
- **Consumer**: `consumer@example.com` / `consumer123`
- **Partner**: `partner@nexussolutions.com` / `partner123`

## 🧪 Test Database Connection

```bash
cd backend
npm run test:connection
```

## 📚 Full Documentation

- Setup details: `SETUP_COMMANDS.md`
- API docs: `docs/API_DOCUMENTATION.md`
- Deployment: `docs/DEPLOYMENT.md`
