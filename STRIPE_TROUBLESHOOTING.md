# 🔧 Stripe Troubleshooting Guide

## Common Issues and Fixes

### Issue 1: "Stripe is not configured" Error

**Problem:** Backend returns error that Stripe is not configured.

**Check:**
1. Verify `STRIPE_SECRET_KEY` in `backend/.env`:
   ```bash
   cd backend
   cat .env | grep STRIPE_SECRET_KEY
   ```

2. **Key should:**
   - Start with `sk_test_` (test mode) or `sk_live_` (production)
   - Be complete (not truncated)
   - Have no extra characters at the end

3. **Fix:** Update your `.env` file with the complete key from Stripe Dashboard:
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy the **Secret key** (starts with `sk_test_`)
   - Paste into `backend/.env`:
     ```env
     STRIPE_SECRET_KEY="sk_test_..."
     ```
   - **Note:** Remove any trailing periods or extra characters

### Issue 2: "Stripe price configuration missing" Error

**Problem:** Backend can't find price IDs.

**Check:**
1. Verify price IDs in `backend/.env`:
   ```bash
   cd backend
   cat .env | grep STRIPE_PRICE
   ```

2. **Price IDs should:**
   - Start with `price_` prefix
   - Be valid Stripe Price IDs from your Stripe Dashboard

3. **Fix:**
   - Go to: https://dashboard.stripe.com/test/products
   - Click on your product
   - Copy the **Price ID** (starts with `price_`)
   - Update `backend/.env`:
     ```env
     STRIPE_PRICE_MONTHLY="price_1ABC..."  # Must start with "price_"
     STRIPE_PRICE_ANNUAL="price_1XYZ..."   # Must start with "price_"
     ```

   **If your price IDs don't have the prefix**, the code will auto-add it, but it's better to use the correct format.

### Issue 3: Frontend Can't Connect to Backend

**Problem:** Frontend shows "Failed to create checkout session" or uses mock API.

**Check:**
1. Verify frontend has API URL configured:
   ```bash
   # Check if .env.local exists in project root
   ls -la .env.local
   ```

2. **Fix:** Create `.env.local` in project root:
   ```env
   VITE_API_URL=http://localhost:4000/api
   ```

3. **Restart frontend server** after creating `.env.local`:
   ```bash
   # Stop frontend (Ctrl+C)
   # Then restart:
   npm run dev
   ```

### Issue 4: "Company not found" Error

**Problem:** Backend says company not found when trying to checkout.

**Cause:** User hasn't completed onboarding or company doesn't exist in database.

**Fix:**
1. Complete the full partner onboarding flow (all 5 steps)
2. Or use mock mode (app will work without database)

### Issue 5: Webhook Not Working

**Problem:** Payment succeeds but subscription not created in database.

**Check:**
1. Is Stripe CLI running?
   ```bash
   stripe listen --forward-to localhost:4000/api/stripe/webhook
   ```

2. Does webhook secret match?
   - Stripe CLI outputs: `whsec_xxxxx`
   - Should match `STRIPE_WEBHOOK_SECRET` in `backend/.env`

3. **Fix:**
   - Start Stripe CLI (see above)
   - Copy the webhook secret from CLI output
   - Update `backend/.env`:
     ```env
     STRIPE_WEBHOOK_SECRET="whsec_xxxxx"  # From Stripe CLI
     ```
   - Restart backend server

### Issue 6: Stripe API Version Error

**Problem:** Backend shows Stripe API version errors.

**Fix:** The code uses `2024-11-20.acacia`. If this doesn't work, try:
```typescript
// In backend/src/controllers/stripeController.ts
apiVersion: '2024-11-20.acacia',  // Current
// Or try:
apiVersion: '2024-11-20.acacia',  // Should work
```

## Testing Checklist

✅ **Backend running?**
```bash
curl http://localhost:4000/health
# Should return: {"status":"ok",...}
```

✅ **Stripe key valid?**
```bash
cd backend
node -e "console.log(process.env.STRIPE_SECRET_KEY?.substring(0, 10))"
# Should show: sk_test_51
```

✅ **Price IDs valid?**
```bash
cd backend
node -e "console.log('Monthly:', process.env.STRIPE_PRICE_MONTHLY); console.log('Annual:', process.env.STRIPE_PRICE_ANNUAL)"
# Should show price IDs starting with "price_"
```

✅ **Frontend API URL set?**
```bash
cat .env.local
# Should show: VITE_API_URL=http://localhost:4000/api
```

✅ **User authenticated?**
- Check browser console for token
- Check Network tab for 401 errors

✅ **Company exists?**
- Complete onboarding first
- Or use mock mode

## Quick Test

1. **Test backend endpoint directly:**
   ```bash
   # Get auth token first (login via frontend, check localStorage)
   curl -X POST http://localhost:4000/api/stripe/create-checkout-session \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"billingCycle":"monthly"}'
   ```

2. **Check backend logs:**
   - Look for "Creating Stripe checkout session" log
   - Look for any error messages

3. **Check browser console:**
   - Open DevTools → Console
   - Look for API errors
   - Check Network tab for failed requests

## Still Not Working?

1. **Check backend console** for detailed error messages
2. **Check browser console** for frontend errors
3. **Verify all environment variables** are set correctly
4. **Restart both servers** after changing `.env` files
5. **Check Stripe Dashboard** → Logs for API errors

---

**Need more help?** Check:
- Backend logs in terminal
- Browser DevTools → Console & Network
- Stripe Dashboard → Developers → Logs







