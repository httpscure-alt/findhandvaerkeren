# Clean Signup & Pricing Flow

## Overview

The signup and pricing flow has been completely restructured for clarity and consistency.

## Key Changes

### 1. Pricing Page - Partners Only

- **Removed**: Consumer option (Basic plan removed)
- **Shows**: Only Pro and Elite plans (2-column layout)
- **All "Get Started" buttons**:
  - Save selected plan to localStorage
  - Set `signupRole = "PARTNER"` in localStorage
  - Redirect to `/auth/signup?role=partner` (SIGNUP view)

### 2. Signup Form - Simplified

**Fields:**
- Email (required)
- Password (required, min 6 chars)
- Full Name (optional)

**Removed:**
- Company name (moved to onboarding step 1)
- First Name / Last Name split (now just Full Name)
- Role selection toggle (auto-detected from localStorage)

**Behavior:**
- If `signupRole = "PARTNER"` in localStorage → Shows "Creating partner account" banner
- Partner signup → Redirects directly to onboarding step 1 (no success page)
- Consumer signup → Redirects directly to dashboard (no wizard)

### 3. Onboarding Wizard - 5 Steps

**STEP 1: Business Info**
- Company name *
- Category *
- Location (City) *
- Short description * (max 200 chars)

**STEP 2: Full Description**
- Full description * (detailed business description)

**STEP 3: Logo & Gallery**
- Logo URL
- Banner URL
- Gallery items (optional)

**STEP 4: Verification**
- Completion confirmation
- "Continue" button → Goes to Plan Review

**STEP 5: Plan Review**
- Shows selected plan
- Monthly/Annual toggle
- Features list
- "Continue to Payment" → Payment placeholder

### 4. Redirect Logic

**After Partner Signup:**
```
Signup → Auto-login → PARTNER_ONBOARDING_STEP_1 (immediate, no success page)
```

**After Consumer Signup:**
```
Signup → Auto-login → CONSUMER_DASHBOARD (immediate, no wizard)
```

**After Onboarding Step 4:**
```
Step 4 Complete → PLAN_REVIEW (if plan saved) → PAYMENT_COMING_SOON
```

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PRICING PAGE                              │
│  (Partners Only - Pro & Elite)                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
              Click "Get Started"
                          ↓
        Save plan + Set role=PARTNER
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    SIGNUP PAGE                               │
│  Email + Password + Full Name (optional)                     │
│  Shows: "Creating partner account" banner                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
              Auto-login after signup
                          ↓
┌─────────────────────────────────────────────────────────────┐
│          ONBOARDING STEP 1 (Business Info)                   │
│  - Company name *                                           │
│  - Category *                                                │
│  - Location *                                                │
│  - Short description *                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│          ONBOARDING STEP 2 (Full Description)               │
│  - Full description *                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│          ONBOARDING STEP 3 (Logo & Gallery)                  │
│  - Logo URL                                                  │
│  - Banner URL                                                │
│  - Gallery items                                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│          ONBOARDING STEP 4 (Verification)                    │
│  - Completion confirmation                                   │
│  - "Continue" button                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│          PLAN REVIEW (Step 5)                                │
│  - Selected plan display                                     │
│  - Monthly/Annual toggle                                    │
│  - Features list                                             │
│  - "Continue to Payment"                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│          PAYMENT_COMING_SOON                                 │
│  - Stripe placeholder                                       │
└─────────────────────────────────────────────────────────────┘
```

## Files Modified

### 1. `components/Pricing.tsx`
- Removed Basic plan from display (filtered out)
- All plans redirect to signup with partner role
- Saves plan and sets `signupRole` in localStorage

### 2. `components/pages/auth/SignupPage.tsx`
- Removed company name field
- Removed role selection toggle
- Only asks for: Email, Password, Full Name (optional)
- Removed "Account Created" success page
- Redirects immediately after signup

### 3. `components/PartnerOnboardingWizard.tsx`
- Step 1: Now asks for company name, category, location, short description
- Step 2: Only asks for full description
- Updated progress bar to show 5 steps
- Step 4 completion redirects to Plan Review
- Loads saved data on mount

### 4. `App.tsx`
- Updated SIGNUP view routing
- Partner signup → Direct redirect to onboarding step 1
- Consumer signup → Direct redirect to dashboard
- Updated onboarding step routing

### 5. `services/mockApi.ts`
- Updated `saveOnboardingStep1` to use user email if contactEmail not provided

## State Management

### localStorage Keys

- `selectedPlan`: Selected pricing plan
  ```json
  {
    "id": "pro",
    "name": "Pro",
    "monthlyPrice": 49,
    "billingPeriod": "monthly"
  }
  ```

- `signupRole`: Role for signup page
  - `"PARTNER"` (set by pricing page)
  - Cleared after successful signup

## Testing Checklist

- [x] Pricing page shows only Pro and Elite plans
- [x] "Get Started" saves plan and redirects to signup
- [x] Signup form only asks for email, password, full name
- [x] Partner signup redirects directly to onboarding step 1
- [x] Consumer signup redirects directly to dashboard
- [x] Onboarding step 1 asks for company name, category, location, short description
- [x] Onboarding step 2 asks for full description only
- [x] Onboarding has 5 steps (including plan review)
- [x] Step 4 completion redirects to plan review
- [x] No "Account Created" page shown
- [x] Consumers never enter wizard







