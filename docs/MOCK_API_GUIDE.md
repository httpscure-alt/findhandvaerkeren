# Mock API System - Complete Guide

## Overview

The platform now includes a **complete mock API system** that allows you to preview the entire application with dummy data **without connecting to any real backend**.

## How It Works

The mock API automatically activates when:
1. `VITE_API_URL` is empty or not set
2. `VITE_USE_MOCK_API=true` is set in your `.env` file

The API service (`services/api.ts`) automatically falls back to the mock API (`services/mockApi.ts`) when the real API is unavailable.

## Features

### ✅ Complete API Coverage

The mock API implements **ALL** endpoints:

- **Authentication**: register, login, getMe
- **Companies**: getCompanies, getCompany, createCompany, updateCompany, deleteCompany, verifyCompany
- **Saved Listings**: getSavedListings, saveListing, unsaveListing
- **Inquiries**: getInquiries, createInquiry, updateInquiry
- **Categories**: getCategories, createCategory, updateCategory, deleteCategory
- **Locations**: getLocations, createLocation, updateLocation, deleteLocation
- **Analytics**: trackEvent, getCompanyAnalytics
- **Onboarding**: getOnboardingStatus, saveOnboardingStep1-4, completeOnboarding
- **Consumer Profile**: getConsumerProfile, updateConsumerProfile, changePassword, deleteAccount
- **Business Dashboard**: getBusinessDashboard, updateBusinessListing, getBusinessAnalytics

### ✅ Realistic Behavior

- **Network delays**: Simulates real API response times (100-500ms)
- **State persistence**: Data persists in memory during session
- **User authentication**: Tracks logged-in users via localStorage
- **Data relationships**: Properly links companies, users, inquiries, saved listings
- **Filtering & Search**: Full support for category, location, verified, and search filters
- **Pagination**: Supports pagination with realistic page/limit handling

### ✅ Mock Data

- **6 Sample Companies**: From `MOCK_COMPANIES` in `constants.ts`
- **Categories**: Technology, Finance, Marketing, Logistics, Consulting, Legal
- **Locations**: København, Aarhus, Odense, Aalborg, Roskilde
- **Users**: Auto-created on login/register with role detection

## Usage

### Option 1: Automatic (No Backend URL)

Simply **don't set** `VITE_API_URL` in your `.env` file:

```bash
# .env
# VITE_API_URL=  # Leave empty or don't set
```

The mock API will automatically activate.

### Option 2: Explicit Enable

Set `VITE_USE_MOCK_API=true`:

```bash
# .env
VITE_USE_MOCK_API=true
# VITE_API_URL=http://localhost:4000  # Can be set but will be ignored
```

### Option 3: Force Mock Mode

Even with a backend URL, you can force mock mode:

```bash
# .env
VITE_API_URL=http://localhost:4000
VITE_USE_MOCK_API=true  # This overrides and uses mock
```

## Testing Different User Roles

### Consumer Account

1. Register with email: `consumer@example.com`
2. Or login with any email containing "consumer"
3. Access: Dashboard, Saved Listings, Inquiries, Account Settings

### Partner Account

1. Register with email: `partner@example.com` (or any email with "partner")
2. Complete onboarding wizard (4 steps)
3. Access: Business Dashboard, Services, Portfolio, Leads

### Admin Account

1. Login with email containing "admin" (e.g., `admin@example.com`)
2. Access: Admin Dashboard, Companies, Users, Analytics

## Mock Data Structure

### Companies

All companies from `MOCK_COMPANIES`:
- Nexus Solutions (Technology, Verified)
- Summit Capital (Finance, Verified)
- Alpha Design Studio (Marketing)
- Swift Logistics (Logistics)
- Vanguard Legal (Legal, Verified)
- Nordic Consult (Consulting, Verified)

### State Management

The mock API maintains state in memory:
- **Users**: Map of userId → user data
- **Saved Listings**: Map of userId → Set of companyIds
- **Inquiries**: Array of inquiry objects
- **Analytics**: Map of companyId → event array

**Note**: Data resets on page refresh (in-memory storage).

## Example Usage

```typescript
import { api } from './services/api';

// Get all companies (uses mock if no backend)
const { companies } = await api.getCompanies();

// Filter by category
const { companies } = await api.getCompanies({ category: 'Technology' });

// Search
const { companies } = await api.getCompanies({ search: 'cloud' });

// Register as consumer
const { user, token } = await api.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  role: 'CONSUMER'
});

// Save a listing
await api.saveListing('1'); // Saves Nexus Solutions

// Create inquiry
await api.createInquiry('1', 'I need cloud migration services');
```

## Switching to Real Backend

When you're ready to use the real backend:

1. Set `VITE_API_URL` in `.env`:
   ```bash
   VITE_API_URL=http://localhost:4000/api
   ```

2. Remove or set `VITE_USE_MOCK_API=false`:
   ```bash
   VITE_USE_MOCK_API=false
   ```

3. The API service will automatically use the real backend.

## Benefits

✅ **No Backend Required**: Preview the entire platform immediately  
✅ **Fast Development**: No need to wait for backend setup  
✅ **Complete Functionality**: All features work with mock data  
✅ **Easy Testing**: Test all user flows without database  
✅ **Seamless Switch**: Switch to real API by setting one env variable  

## File Structure

```
services/
  ├── api.ts          # Main API service (auto-falls back to mock)
  └── mockApi.ts      # Complete mock API implementation
```

## Notes

- Mock data is **session-based** (resets on refresh)
- All operations are **synchronous** with simulated delays
- Authentication uses **localStorage** (same as real API)
- Data relationships are **properly maintained** (companies, users, inquiries)

---

**The platform is now fully functional with mock data!** 🎉







