# Clean Signup & Pricing Flow - Summary

## ✅ Completed Changes

### 1. Pricing Page (`components/Pricing.tsx`)

**Changes:**
- ✅ Removed Basic plan from display (filtered out, only shows Pro & Elite)
- ✅ Changed grid to 2 columns (`md:grid-cols-2`)
- ✅ All "Get Started" buttons:
  - Save selected plan to localStorage
  - Set `signupRole = "PARTNER"` in localStorage
  - Trigger redirect to SIGNUP view via `onPlanSelected` callback

**Key Code:**
```typescript
const handlePlanSelect = (tierName: string, isPaid: boolean, monthlyPrice: number) => {
  const selectedPlan: SelectedPlan = {
    id: tierName.toLowerCase(),
    name: tierName,
    monthlyPrice,
    billingPeriod: pricingMode,
  };
  
  localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
  localStorage.setItem('signupRole', 'PARTNER');
  onPlanSelected?.(selectedPlan); // Triggers redirect in App.tsx
};
```

---

### 2. Signup Page (`components/pages/auth/SignupPage.tsx`)

**Changes:**
- ✅ Removed company name field
- ✅ Removed role selection toggle
- ✅ Only asks for:
  - Email (required)
  - Password (required, min 6 chars)
  - Full Name (optional)
- ✅ Removed "Account Created" success page
- ✅ Redirects immediately after signup (no delay)

**Key Code:**
```typescript
// Form fields
- Full Name (optional)
- Email (required)
- Password (required)

// After signup
onSuccess(userRole); // Immediate redirect, no success page
```

**Redirect Logic:**
- Consumer → `CONSUMER_DASHBOARD`
- Partner → `PARTNER_ONBOARDING_STEP_1`

---

### 3. Onboarding Wizard Step 1 (`components/PartnerOnboardingWizard.tsx`)

**Changes:**
- ✅ Step 1 now asks for:
  - Company name *
  - Category *
  - Location (City) *
  - Short description * (max 200 chars)
- ✅ Removed: Email, Website, Phone from step 1
- ✅ Progress bar shows 5 steps (was 4)
- ✅ Loads saved data on mount

**Key Code:**
```typescript
// Step 1 Data
const [step1Data, setStep1Data] = useState({
  name: '',
  category: '',
  location: '',
  shortDescription: '',
});

// On submit
await api.saveOnboardingStep1({
  name: step1Data.name,
  category: step1Data.category,
  location: step1Data.location,
  contactEmail: '', // API uses user email
  website: '',
  phone: '',
});

// Also save short description
await api.saveOnboardingStep2({
  shortDescription: step1Data.shortDescription,
  description: '', // Will be filled in step 2
});
```

---

### 4. Onboarding Wizard Step 2

**Changes:**
- ✅ Only asks for Full Description
- ✅ Removed Short Description field (moved to step 1)

**Key Code:**
```typescript
// Step 2 Data
const [step2Data, setStep2Data] = useState({
  description: '',
});

// On submit - includes short description from step 1
await api.saveOnboardingStep2({
  shortDescription: step1Data.shortDescription || '',
  description: step2Data.description,
});
```

---

### 5. Onboarding Wizard - 5 Steps

**Updated Flow:**
1. **Step 1**: Business Info (name, category, location, short description)
2. **Step 2**: Full Description
3. **Step 3**: Logo & Gallery
4. **Step 4**: Verification (completion)
5. **Step 5**: Plan Review (separate component)

**Progress Bar:**
- Shows 5 steps: `[1, 2, 3, 4, 5]`
- Step counter: "Step X of 5"

---

### 6. Redirect Logic (`App.tsx`)

**After Partner Signup:**
```typescript
onSuccess={(userRole) => {
  if (userRole === 'CONSUMER') {
    setCurrentView(ViewState.CONSUMER_DASHBOARD);
  } else {
    // Partner: redirect directly to onboarding step 1
    setCurrentView(ViewState.PARTNER_ONBOARDING_STEP_1);
  }
}}
```

**After Onboarding Step 4:**
```typescript
const handleComplete = async () => {
  await api.completeOnboarding();
  setCurrentStep(5);
  onNavigate(ViewState.PLAN_REVIEW); // Redirects to plan review
  onComplete();
};
```

---

## Complete Flow

```
PRICING PAGE
  ↓ (Click "Get Started")
Save Plan + Set role=PARTNER
  ↓
SIGNUP PAGE
  - Email
  - Password  
  - Full Name (optional)
  ↓ (Submit)
Auto-login
  ↓
ONBOARDING STEP 1
  - Company name *
  - Category *
  - Location *
  - Short description *
  ↓
ONBOARDING STEP 2
  - Full description *
  ↓
ONBOARDING STEP 3
  - Logo URL
  - Banner URL
  - Gallery
  ↓
ONBOARDING STEP 4
  - Verification (Complete)
  ↓
PLAN REVIEW (Step 5)
  - Selected plan
  - Pricing toggle
  - Features
  - "Continue to Payment"
  ↓
PAYMENT_COMING_SOON
  - Stripe placeholder
```

---

## Files Modified

1. ✅ `components/Pricing.tsx` - Removed Basic plan, all buttons redirect to signup
2. ✅ `components/pages/auth/SignupPage.tsx` - Simplified form, removed success page
3. ✅ `components/PartnerOnboardingWizard.tsx` - Updated step 1, 5-step flow
4. ✅ `App.tsx` - Updated redirect logic
5. ✅ `services/mockApi.ts` - Updated to use user email for contactEmail

---

## Testing

- [x] Pricing shows only Pro & Elite
- [x] "Get Started" saves plan and redirects
- [x] Signup only asks for email, password, full name
- [x] Partner signup → Direct to onboarding step 1
- [x] Consumer signup → Direct to dashboard
- [x] Step 1 asks for company name, category, location, short description
- [x] Step 2 asks for full description only
- [x] Wizard shows 5 steps
- [x] Step 4 → Plan Review
- [x] No "Account Created" page
- [x] Consumers never enter wizard







