# 🔍 Stripe Payment Debug Guide

## Current Issue
Payment goes straight to "Payment Successful" page instead of Stripe Checkout.

## Quick Diagnosis

### Step 1: Check Browser Console
1. Open your app: http://localhost:3000
2. Open DevTools (F12) → Console tab
3. Click "Continue to Payment"
4. Look for these logs:
   - `🔧 API Configuration:` - Should show `API_BASE_URL: "http://localhost:4000/api"`
   - `🔵 Creating Stripe checkout session...`
   - Either `✅ Stripe checkout session created:` or an error

### Step 2: Check What URL You're Getting
In the console, you should see the URL returned. It should be:
- ✅ **Good:** `https://checkout.stripe.com/c/pay/...` (Stripe URL)
- ❌ **Bad:** `/billing/success?session_id=...` (Mock URL)

### Step 3: Check Backend Logs
In your backend terminal, when you click "Continue to Payment", you should see:
- ✅ **Good:** `Creating Stripe checkout session...` or `Stripe checkout session created`
- ❌ **Bad:** `Stripe is not configured` or no logs at all

## Common Issues & Fixes

### Issue 1: Frontend Using Mock Mode
**Symptoms:** Console shows `USE_MOCK_API: true` or `API_BASE_URL: ""`

**Fix:**
1. Check `.env.local` has: `VITE_API_URL=http://localhost:4000/api`
2. **Restart frontend** after adding it

### Issue 2: Backend Not Running
**Symptoms:** Console shows `API_NOT_AVAILABLE` or connection errors

**Fix:**
1. Start backend: `cd backend && npm run dev`
2. Verify: `curl http://localhost:4000/health`
3. Should return: `{"status":"ok",...}`

### Issue 3: Backend Not Loading Stripe Config
**Symptoms:** Backend logs show "Stripe is not configured"

**Fix:**
1. Verify `backend/.env` has Stripe keys (you showed me they're there)
2. **Restart backend** - it only loads .env on startup
3. Check: `cd backend && node check-stripe-config.js`

### Issue 4: Health Check Failing
**Symptoms:** Frontend thinks backend is down even though it's running

**Fix:**
1. Check backend is on port 4000: `lsof -ti:4000`
2. Check health endpoint: `curl http://localhost:4000/health`
3. If different port, update `VITE_API_URL` in `.env.local`

## Test Scripts

I've created test scripts for you:

### Test Backend Stripe Config:
```bash
cd backend
node check-stripe-config.js
```

### Test Stripe API Endpoint:
```bash
./test-stripe.sh
```

## What to Check Right Now

1. **Is backend running?**
   ```bash
   lsof -ti:4000
   # Should show a process ID
   ```

2. **Is frontend running?**
   ```bash
   lsof -ti:3000
   # Should show a process ID
   ```

3. **Check browser console** when clicking "Continue to Payment"
   - What logs do you see?
   - What error messages appear?

4. **Check backend terminal** when clicking "Continue to Payment"
   - What logs appear?
   - Any errors?

## Expected Flow

1. User clicks "Continue to Payment"
2. Frontend calls: `POST http://localhost:4000/api/stripe/create-checkout-session`
3. Backend creates Stripe session
4. Backend returns: `{ url: "https://checkout.stripe.com/..." }`
5. Frontend redirects to Stripe Checkout
6. User completes payment on Stripe
7. Stripe redirects back to: `/billing/success?session_id=...`

## Current Problem

You're skipping steps 3-5 and going straight to step 7 with a mock session ID.

This means the frontend is getting a mock URL (`/billing/success?session_id=cs_mock_...`) instead of a Stripe URL.

**This happens when:**
- Frontend can't reach backend → Falls back to mock
- Backend returns error → Frontend catches it and uses mock
- Health check fails → Frontend thinks backend is down

## Next Steps

1. **Start both servers** (if not running)
2. **Open browser console** (F12)
3. **Click "Continue to Payment"**
4. **Share the console logs** with me so I can see exactly what's happening

