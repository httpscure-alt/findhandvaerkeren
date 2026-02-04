# Unified Signup & Onboarding Flow

## Overview

The platform now has a **single, unified signup and onboarding system** that works consistently across all entry points.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONSUMER FLOW                                 │
└─────────────────────────────────────────────────────────────────┘

Any Signup Button
    ↓
SignupPage (role=CONSUMER)
    ↓
Email + Password + FirstName + LastName
    ↓
Auto-login
    ↓
CONSUMER_DASHBOARD
    ↓
✅ No onboarding required

┌─────────────────────────────────────────────────────────────────┐
│                    PARTNER FLOW                                  │
└─────────────────────────────────────────────────────────────────┘

Any Partner Signup Trigger:
- "Get Started" (Pricing)
- "Become a Partner" / "List Business" (Navbar)
- Pricing CTA
- Any partner signup button
    ↓
Step 1: Save selected plan to localStorage
    ↓
SignupPage (role=PARTNER)
    ↓
Email + Password + CompanyName
    ↓
Auto-login
    ↓
PARTNER_ONBOARDING_STEP_1
    ↓
Step 1: Business Info (name, category, location, email, website*, phone*)
    ↓
PARTNER_ONBOARDING_STEP_2
    ↓
Step 2: Descriptions (short + full)
    ↓
PARTNER_ONBOARDING_STEP_3
    ↓
Step 3: Logo + Gallery
    ↓
PARTNER_ONBOARDING_STEP_4
    ↓
Step 4: Verification (complete)
    ↓
Check: Is plan saved in localStorage?
    ├─ YES → PLAN_REVIEW
    │   ↓
    │   Review plan + pricing toggle
    │   ↓
    │   "Continue to Payment"
    │   ↓
    │   PAYMENT_COMING_SOON (placeholder)
    │
    └─ NO → PARTNER_DASHBOARD
```

## Entry Points

### Partner Signup Triggers

All of these redirect to `/auth/signup?role=partner`:

1. **Pricing Page - "Get Started" (Pro Plan)**
   - Saves plan to localStorage
   - Redirects to SignupPage

2. **Navbar - "List Business" Button**
   - Saves placeholder plan to localStorage
   - Redirects to SignupPage

3. **Any "Become a Partner" CTA**
   - Saves placeholder plan to localStorage
   - Redirects to SignupPage

### Consumer Signup Triggers

1. **Pricing Page - "Get Started" (Basic Plan)**
   - Opens AuthModal (for now, can be updated to SignupPage)

2. **AuthModal - Register Free**
   - Opens signup modal

## Components

### 1. SignupPage (`components/pages/auth/SignupPage.tsx`)

**Unified signup component** that handles both Consumer and Partner registration.

- **Props:**
  - `lang: Language`
  - `role?: 'CONSUMER' | 'PARTNER'` (auto-detected from localStorage)
  - `onSuccess: (role) => void`
  - `onBack?: () => void`

- **Features:**
  - Role selection toggle
  - Dynamic form fields (Consumer: firstName/lastName, Partner: companyName)
  - Auto-detects role from saved plan
  - Auto-login after registration
  - Redirects based on role

### 2. PartnerOnboardingWizard (`components/PartnerOnboardingWizard.tsx`)

**Full-page onboarding wizard** with routing support.

- **Props:**
  - `lang: Language`
  - `currentStep: number` (1-4)
  - `onNavigate: (view: ViewState) => void`
  - `onComplete: () => void`

- **Steps:**
  1. Business Info (name, category, location, email, website*, phone*)
  2. Descriptions (short + full)
  3. Logo + Gallery
  4. Verification (complete)

- **Features:**
  - Progress tracking
  - Step navigation
  - Auto-saves progress
  - Resumes from last step on reload
  - Website field is optional (no validation blocking)

### 3. PlanReview (`components/PlanReview.tsx`)

Shows selected plan with pricing toggle and features.

- Displays plan details
- Monthly/Annual toggle
- Feature list
- "Continue to Payment" button

### 4. PaymentComingSoon (`components/PaymentComingSoon.tsx`)

Placeholder page for Stripe integration.

## Routing

### ViewState Enum

```typescript
SIGNUP = 'SIGNUP'
PARTNER_ONBOARDING_STEP_1 = 'PARTNER_ONBOARDING_STEP_1'
PARTNER_ONBOARDING_STEP_2 = 'PARTNER_ONBOARDING_STEP_2'
PARTNER_ONBOARDING_STEP_3 = 'PARTNER_ONBOARDING_STEP_3'
PARTNER_ONBOARDING_STEP_4 = 'PARTNER_ONBOARDING_STEP_4'
PLAN_REVIEW = 'PLAN_REVIEW'
PAYMENT_COMING_SOON = 'PAYMENT_COMING_SOON'
```

## State Management

### localStorage Keys

- `selectedPlan`: Stores selected pricing plan
  ```json
  {
    "id": "pro",
    "name": "Pro",
    "monthlyPrice": 49,
    "billingPeriod": "monthly" | "annual"
  }
  ```

### Auto-Resume Logic

- **Onboarding:** Checks API for last completed step on mount
- **Dashboard:** Redirects to appropriate onboarding step if incomplete
- **Plan:** Persists across page reloads

## Fixes

### ✅ Website Field Validation
- Website field is now **optional** (no `required` attribute)
- Form can submit without website URL

### ✅ Modal Closing
- Clicking backdrop closes modal
- Clicking outside modal content closes modal
- `stopPropagation()` prevents event bubbling

## Files Modified

1. `types.ts` - Added new ViewState types
2. `components/pages/auth/SignupPage.tsx` - NEW unified signup page
3. `components/PartnerOnboardingWizard.tsx` - Updated to full-page with routing
4. `components/Pricing.tsx` - Updated to redirect to signup
5. `components/AuthModal.tsx` - Fixed modal closing behavior
6. `components/Navbar.tsx` - Updated "List Business" button
7. `App.tsx` - Updated routing logic

## Testing Checklist

- [ ] Consumer signup → Dashboard (no onboarding)
- [ ] Partner signup from Pricing → Onboarding → Plan Review → Payment
- [ ] Partner signup from Navbar → Onboarding → Dashboard
- [ ] Onboarding step navigation (back/forward)
- [ ] Onboarding resume after page reload
- [ ] Website field optional (can submit without)
- [ ] Modal closes on backdrop click
- [ ] Plan persists across reloads







