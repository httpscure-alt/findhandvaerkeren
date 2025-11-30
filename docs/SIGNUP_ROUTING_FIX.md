# Signup Routing Fix

## Overview

Fixed the signup routing flow to properly separate Consumer and Partner signup paths, preventing accidental auto-redirects to partner onboarding.

## Changes Made

### 1. Created Signup Selection Page

**New Component:** `components/pages/auth/SignupSelectPage.tsx`

**Route:** `/signup-select` (ViewState.SIGNUP_SELECT)

**Features:**
- Centered card with title "Create Your Account"
- Two large buttons:
  - "I'm a Consumer" → Links to `/register` (CONSUMER_SIGNUP)
  - "I'm a Business / Partner" → Links to `/partner/register` (PARTNER_REGISTER)
- Matches existing UI styling
- Back button to return to login

### 2. Updated Login Flow

**Updated:** `components/pages/auth/AuthPage.tsx`

**Changes:**
- "Don't have an account? Sign Up" link now redirects to `/signup-select` instead of toggling signup mode
- Added `onNavigateToSignup` prop to handle navigation
- Login flow remains exactly the same

### 3. New View States

**Added to `types.ts`:**
- `SIGNUP_SELECT` - Account type selection page
- `CONSUMER_SIGNUP` - Consumer registration page
- `PARTNER_REGISTER` - Partner registration page

### 4. Fixed Routing in App.tsx

**Consumer Signup (`/register` → CONSUMER_SIGNUP):**
```typescript
if (currentView === ViewState.CONSUMER_SIGNUP) {
  return (
    <SignupPage
      lang={lang}
      role="CONSUMER"
      onSuccess={(userRole) => {
        setCurrentView(ViewState.CONSUMER_DASHBOARD);
      }}
      onBack={() => setCurrentView(ViewState.SIGNUP_SELECT)}
    />
  );
}
```

**Partner Signup (`/partner/register` → PARTNER_REGISTER):**
```typescript
if (currentView === ViewState.PARTNER_REGISTER) {
  return (
    <SignupPage
      lang={lang}
      role="PARTNER"
      onSuccess={(userRole) => {
        setCurrentView(ViewState.PARTNER_ONBOARDING_STEP_1);
      }}
      onBack={() => setCurrentView(ViewState.SIGNUP_SELECT)}
    />
  );
}
```

### 5. Removed Auto-Redirects

**Fixed:** `App.tsx` - Partner Dashboard routing

**Before:**
- All partners were auto-redirected to onboarding when accessing dashboard

**After:**
- Only partners who just signed up (have `selectedPlan` in localStorage) are redirected
- Existing partners can access dashboard normally
- Auto-redirect only happens immediately after signup

**Code:**
```typescript
// Only redirect if user just signed up
const savedPlan = localStorage.getItem('selectedPlan');
if (savedPlan && (!company || showOnboarding)) {
  // Redirect to onboarding
} else {
  // Show dashboard normally
}
```

### 6. Post-Signup Redirects

**Consumers:**
- After signup → Redirects to `CONSUMER_DASHBOARD`
- No onboarding wizard

**Partners:**
- After signup → Always redirects to `PARTNER_ONBOARDING_STEP_1`
- Goes through 5-step onboarding wizard

### 7. Legacy Signup Route

**Updated:** `ViewState.SIGNUP`

**Behavior:**
- If coming from pricing page (has `selectedPlan`) → Goes directly to partner register
- Otherwise → Shows signup selection page

## User Flows

### Consumer Signup Flow
```
Login Page → Click "Sign Up" → Signup Select → "I'm a Consumer" → 
Consumer Signup Form → Dashboard
```

### Partner Signup Flow
```
Login Page → Click "Sign Up" → Signup Select → "I'm a Business" → 
Partner Signup Form → Onboarding Wizard Step 1
```

### Partner from Pricing Flow
```
Pricing Page → "Get Started" → Partner Signup Form → Onboarding Wizard Step 1
```

## Files Modified

1. **`components/pages/auth/SignupSelectPage.tsx`** (NEW)
   - Account type selection page

2. **`components/pages/auth/AuthPage.tsx`**
   - Updated "Sign Up" links to navigate to SIGNUP_SELECT
   - Added `onNavigateToSignup` prop

3. **`components/pages/auth/SignupPage.tsx`**
   - Updated to respect `initialRole` prop
   - Fixed role detection logic

4. **`App.tsx`**
   - Added routing for SIGNUP_SELECT, CONSUMER_SIGNUP, PARTNER_REGISTER
   - Fixed auto-redirect logic in partner dashboard
   - Updated post-signup redirects

5. **`types.ts`**
   - Added new ViewState values

## Testing Checklist

- [x] "Sign Up" link in login redirects to signup select
- [x] Signup select shows two options (Consumer and Partner)
- [x] Consumer signup redirects to dashboard
- [x] Partner signup redirects to onboarding wizard
- [x] No auto-redirect for existing partners
- [x] Pricing page flow still works (direct to partner register)
- [x] Login flow unchanged
