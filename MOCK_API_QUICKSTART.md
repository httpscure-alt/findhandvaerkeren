# Mock API Quick Start Guide

## 🚀 Instant Preview Mode

The platform now includes a **complete mock API system** that lets you preview everything **without any backend connection**.

## Quick Setup

### Step 1: Ensure No Backend URL

Make sure your `.env` file does NOT have `VITE_API_URL` set, or set it to empty:

```bash
# .env
# VITE_API_URL=  # Leave empty
```

### Step 2: Start the Frontend

```bash
npm run dev
```

That's it! The mock API will automatically activate.

## What Works

✅ **All Features Functional**:
- User registration & login (Consumer, Partner, Admin)
- Company listings with filters
- Saved listings
- Inquiries
- Partner onboarding (4-step wizard)
- Consumer dashboard
- Business dashboard
- Admin panel
- Categories & Locations
- Analytics

✅ **Realistic Data**:
- 6 sample companies
- Multiple categories & locations
- Verified partners for hero rotation
- Full CRUD operations

✅ **State Management**:
- Data persists during session
- Proper relationships (companies ↔ users ↔ inquiries)
- Authentication via localStorage

## Test Accounts

### Consumer
- Email: `consumer@example.com` (or any email)
- Password: Any password
- Access: Dashboard, Saved Listings, Inquiries

### Partner
- Email: `partner@example.com` (or email with "partner")
- Password: Any password
- Access: Onboarding → Business Dashboard

### Admin
- Email: `admin@example.com` (or email with "admin")
- Password: Any password
- Access: Admin Dashboard

## Switching to Real Backend

When ready to use the real backend:

```bash
# .env
VITE_API_URL=http://localhost:4000/api
VITE_USE_MOCK_API=false
```

## Files

- `services/mockApi.ts` - Complete mock API implementation
- `services/api.ts` - Auto-falls back to mock when backend unavailable
- `docs/MOCK_API_GUIDE.md` - Full documentation

---

**The platform is ready to preview with full functionality!** 🎉
