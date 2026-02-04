# Running Frontend in Offline Mode (No API)

The frontend can now run completely offline using mock data! 🎉

## ✅ What Works Offline

- ✅ **Home page** - Full UI with search
- ✅ **Listings page** - Browse companies with filters
- ✅ **Company profiles** - View detailed company information
- ✅ **Search & filters** - All filtering works with mock data
- ✅ **Admin Dashboard** - View and manage companies (mock data)
- ✅ **Partner Dashboard** - View partner dashboard (mock data)
- ✅ **Consumer Dashboard** - View saved listings (mock data)
- ✅ **Authentication** - Mock login/register (works offline)
- ✅ **Pricing page** - Full pricing UI

## 🚀 Quick Start (Offline Mode)

### 1. Start Frontend (No Backend Needed)

```bash
npm run dev
```

The frontend will:
- Use mock data automatically
- Work without any API connection
- Show all UI features
- Allow mock login/registration

### 2. Access the App

Open: *it**

## 🔐 Mock Login Credentials

You can "login" with any email/password combination:

**For Admin Dashboard:**
- Email: `admin@example.com` (or any email with "admin" in it)
- Password: anything

**For Partner Dashboard:**
- Email: `partner@example.com` (or any email with "partner" in it)  
- Password: anything

**For Consumer Dashboard:**
- Email: `consumer@example.com` (or any other email)
- Password: anything

Or use the existing mock login buttons in the navbar.

## 📊 Mock Data

The app uses `MOCK_COMPANIES` from `constants.ts` which includes:
- 6 sample companies
- Full company profiles with services, portfolio, testimonials
- Categories: Technology, Finance, Marketing, Logistics, Consulting, Legal
- Locations: København, Aarhus, Odense, Aalborg, Roskilde

## 🔄 Switching Between Offline and Online

### Offline Mode (Current)
- Frontend uses mock data
- No API calls made
- All features work with local data

### Online Mode
When backend is running:
1. Set `VITE_API_URL` in `.env.local` to your backend URL
2. Restart the frontend
3. The app will automatically use the API when available

## 🎨 Features Available Offline

### Navigation
- ✅ Home page
- ✅ Browse listings
- ✅ View company profiles
- ✅ Pricing page
- ✅ All dashboards

### Search & Filters
- ✅ Text search
- ✅ Category filter
- ✅ Location filter
- ✅ Verified filter
- ✅ AI search suggestions (if Gemini API key is set)

### User Features
- ✅ Mock login/register
- ✅ Save listings (local storage)
- ✅ View saved listings
- ✅ Browse companies

### Admin Features
- ✅ View all companies
- ✅ Toggle verification status (local only)
- ✅ Search companies
- ✅ View stats

## ⚠️ Limitations in Offline Mode

- **No persistence**: Changes (like saving listings) are only in browser localStorage
- **No real authentication**: Mock tokens are used
- **No data sync**: Changes won't sync to database
- **No real analytics**: Stats are calculated from mock data

## 🧪 Testing Offline Mode

1. **Don't set** `VITE_API_URL` in `.env.local` (or set it to empty)
2. Start frontend: `npm run dev`
3. All features work with mock data!

## 🔌 When Backend is Ready

Once your backend is running:

1. Update `.env.local`:
   ```env
   VITE_API_URL=http://localhost:4000/api
   ```

2. Restart frontend:
   ```bash
   npm run dev
   ```

3. The app will automatically switch to API mode when backend is available

## 💡 Tips

- **Mock data is in**: `constants.ts`
- **Add more companies**: Edit `MOCK_COMPANIES` array
- **Test different scenarios**: Modify mock data as needed
- **No network required**: Everything works completely offline!

---

**Enjoy developing the frontend without needing the backend!** 🚀
