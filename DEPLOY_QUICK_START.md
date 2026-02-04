# ⚡ Quick Start: Deploy to Production

## 🎯 TL;DR - 5 Steps

1. **Database**: Use existing Supabase (already configured)
2. **Backend**: Deploy to Railway → Get URL
3. **Frontend**: Deploy to Vercel → Get URL
4. **Stripe**: Switch to Live mode, get production keys
5. **Connect**: Update environment variables

---

## 📦 Step-by-Step (15 minutes)

### 1️⃣ Backend on Railway

```bash
# Option A: Via Dashboard (Easiest)
1. Go to railway.app → New Project → Deploy from GitHub
2. Select your repo
3. Set Root Directory: backend
4. Add PostgreSQL (or use Supabase URL)
5. Add environment variables (see below)
6. Deploy!

# Option B: Via CLI
npm i -g @railway/cli
railway login
cd backend
railway init
railway up
```

**Environment Variables (Railway):**
```env
DATABASE_URL=your-supabase-url
NODE_ENV=production
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-app.vercel.app (update after step 2)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...
```

**Get Backend URL**: `https://your-backend.railway.app` ✅

---

### 2️⃣ Frontend on Vercel

```bash
# Option A: Via Dashboard (Easiest)
1. Go to vercel.com → Add New Project
2. Import GitHub repo
3. Framework: Vite
4. Build Command: npm run build
5. Output: dist
6. Add environment variable: VITE_API_URL=https://your-backend.railway.app/api
7. Deploy!

# Option B: Via CLI
npm i -g vercel
vercel login
vercel
```

**Environment Variable (Vercel):**
```env
VITE_API_URL=https://your-backend.railway.app/api
```

**Get Frontend URL**: `https://your-app.vercel.app` ✅

---

### 3️⃣ Update Backend with Frontend URL

Go back to Railway → Environment Variables:
```env
FRONTEND_URL=https://your-app.vercel.app
```

---

### 4️⃣ Stripe Production

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. **Switch to Live mode** (top right toggle)
3. Get keys:
   - Developers → API keys → Copy `sk_live_...` and `pk_live_...`
   - Products → Create/Edit prices → Copy `price_...` IDs
   - Webhooks → Add endpoint → Copy `whsec_...`
4. Update Railway environment variables with production keys

---

### 5️⃣ Test Everything

✅ Backend health: `curl https://your-backend.railway.app/health`  
✅ Frontend loads: Visit `https://your-app.vercel.app`  
✅ Sign up works  
✅ Login works  
✅ Stripe checkout works (test with `4242 4242 4242 4242`)

---

## 🔗 Important URLs

After deployment, save these:

- **Backend**: `https://your-backend.railway.app`
- **Frontend**: `https://your-app.vercel.app`
- **Database**: Your Supabase dashboard
- **Stripe Dashboard**: https://dashboard.stripe.com

---

## ⚠️ Common Issues

**"Backend not available" error:**
- Check `VITE_API_URL` in Vercel matches your Railway URL
- Verify backend is running (check Railway logs)

**CORS errors:**
- Update `FRONTEND_URL` in Railway to match Vercel URL exactly

**Stripe webhook not working:**
- Webhook URL: `https://your-backend.railway.app/api/stripe/webhook`
- Verify webhook secret matches

---

## 📚 Full Guide

For detailed instructions, see: `PRODUCTION_DEPLOYMENT.md`

---

**That's it! You're live! 🚀**

