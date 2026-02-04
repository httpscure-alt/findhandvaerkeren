# 🚀 Quick Start - Run Locally

## Current Status
✅ Backend dependencies installed  
✅ Frontend dependencies installed  
✅ Prisma client generated  
⚠️ Database connection issue (app will use mock mode)

## Start the Application

### Option 1: Start Everything (Recommended)

Open **3 separate terminal windows**:

#### Terminal 1: Stripe Webhooks (Optional but Recommended)
```bash
# Install Stripe CLI first if not installed:
# brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to your backend
stripe listen --forward-to localhost:4000/api/stripe/webhook
```

**Copy the webhook secret** (starts with `whsec_`) and update `backend/.env`:
```env
STRIPE_WEBHOOK_SECRET="whsec_..."  # Paste the secret from Stripe CLI
```

#### Terminal 2: Backend Server
```bash
cd /Users/aldyprabowo/Documents/findhåndværkeren/backend
npm run dev
```

You should see:
```
🚀 Server running on port 4000
📡 Environment: development
```

#### Terminal 3: Frontend Server
```bash
cd /Users/aldyprabowo/Documents/findhåndværkeren
npm run dev
```

You should see:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Option 2: Start Without Stripe Webhooks (Simpler)

If you just want to test the UI without Stripe webhooks:

#### Terminal 1: Backend
```bash
cd /Users/aldyprabowo/Documents/findhåndværkeren/backend
npm run dev
```

#### Terminal 2: Frontend
```bash
cd /Users/aldyprabowo/Documents/findhåndværkeren
npm run dev
```

## Access Your App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## Database Connection Issue

The database connection is currently failing. The app will automatically use **mock mode** which means:

✅ All features work  
✅ No database needed  
✅ Data is stored in memory (resets on restart)  
✅ Perfect for UI testing

### To Fix Database Connection (Optional)

1. **Check your Supabase database is active:**
   - Go to https://supabase.com
   - Check if your project is active
   - Verify the connection string in `backend/.env`

2. **Try the connection pooler URL:**
   ```env
   DATABASE_URL="postgresql://postgres:Arsene2020-@db.cxtahzminxrnujysbvtz.supabase.co:6543/postgres?pgbouncer=true&sslmode=require&schema=public"
   ```

3. **Test connection:**
   ```bash
   cd backend
   npm run test:connection
   ```

## Test the Payment Flow

1. **Go to**: http://localhost:3000
2. **Click**: "List Business" or go to `/signup-select`
3. **Choose**: "I'm a Business / Partner"
4. **Complete**: Registration and onboarding
5. **On Plan Review**: Click "Continue to Payment"
6. **Use Stripe Test Card**:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

## Troubleshooting

### Backend won't start
- Check if port 4000 is in use: `lsof -i :4000`
- Verify `.env` file exists in `backend/` folder
- Check console for error messages

### Frontend won't start
- Check if port 3000 is in use: `lsof -i :3000`
- Try: `rm -rf node_modules && npm install`

### Stripe webhook errors
- Make sure Stripe CLI is running in Terminal 1
- Verify `STRIPE_WEBHOOK_SECRET` in `backend/.env` matches Stripe CLI output
- Check backend console for webhook errors

## What Works in Mock Mode

✅ All UI pages and navigation  
✅ User authentication (mock)  
✅ Partner onboarding flow  
✅ Plan review and pricing  
✅ Stripe checkout (redirects to Stripe)  
✅ Subscription & billing page  
✅ Admin dashboard  
✅ All frontend features  

⚠️ Data resets on server restart  
⚠️ No persistent storage  

## Next Steps

1. ✅ Start both servers (see above)
2. ✅ Open http://localhost:3000
3. ✅ Test the payment flow
4. ✅ Fix database connection if needed (optional)

---

**You're all set!** 🎉

The app is running in mock mode, which is perfect for development and testing.







