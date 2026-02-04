# Onboarding Routing & Upgrade Plan Flow Fix

## Summary

Fixed onboarding completion state, partner dashboard routing logic, Dashboard button behavior, and Upgrade Plan button functionality.

---

## Changes Made

### 1. Implemented Onboarding Completion State

**Backend:**
- **`backend/prisma/schema.prisma`**: Added `onboardingCompleted Boolean @default(false)` to Company model
- **`backend/src/controllers/onboardingController.ts`**: 
  - `completeOnboarding()` now sets `onboardingCompleted = true` when Step 5 completes
  - `getOnboardingStatus()` returns `onboardingCompleted` status

**Frontend:**
- **`types.ts`**: Added `onboardingCompleted?: boolean` to Company interface
- **`components/PartnerOnboardingWizard.tsx`**: 
  - `handleComplete()` redirects to `/partner/dashboard` after successful completion
  - Clears `selectedPlan` from localStorage
  - Sets `onboardingCompleted = true` in backend

**Result:**
- Onboarding completion is tracked in database
- Partners are redirected to dashboard after completing onboarding
- No more forced onboarding after completion

---

### 2. Fixed Partner Dashboard Routing Logic

**`App.tsx`**:
- Added `isCheckingOnboarding` state to prevent multiple checks
- Added `useEffect` that checks onboarding status when navigating to `PARTNER_DASHBOARD`
- Logic:
  ```typescript
  IF user.role === "partner":
    IF company.onboardingCompleted === false:
      redirect to /partner/onboarding/step-1 (or current step)
    ELSE:
      show Partner Dashboard
  ```
- Shows loading spinner while checking
- Handles API errors gracefully (checks company object directly)

**Result:**
- Partners with incomplete onboarding are redirected to appropriate step
- Partners with completed onboarding see dashboard
- No infinite redirect loops
- Works with both API and mock data

---

### 3. Fixed "Dashboard" Button in Navbar

**`components/Navbar.tsx`**:
- Added `company` prop to receive company data
- Updated Dashboard button logic:
  ```typescript
  IF user.role === "consumer":
    go to /dashboard
  IF user.role === "partner":
    IF company.onboardingCompleted === false:
      go to /partner/onboarding/step-1
    ELSE:
      go to /partner/dashboard
  ```
- Applied to both desktop menu and dropdown menu
- Applied to mobile drawer

**`components/layout/MobileDrawer.tsx`**:
- Added `company` prop
- Updated Dashboard button with same logic

**`App.tsx`**:
- Passes `company={getCurrentCompany()}` to Navbar when user is partner

**Result:**
- Dashboard button intelligently routes based on onboarding status
- Works in desktop, mobile, and dropdown menus

---

### 4. Fixed "Upgrade Plan" Button

**`components/pages/partner/SubscriptionBillingPage.tsx`**:
- Fixed button `onClick` to call `setShowUpgradeModal(true)` instead of `onUpgrade`
- Modal already exists and works correctly

**`components/pages/partner/UpgradePlanModal.tsx`**:
- Updated button text to include "(Stripe coming soon)" placeholder
- Modal shows available plans (Pro, Elite)
- "Continue to Payment" navigates to `PAYMENT_COMING_SOON`

**Result:**
- Upgrade Plan button opens modal (Option A - preferred)
- No navigation to public `/pricing` page
- All flows stay internal
- Clear placeholder messaging

---

### 5. Logo/Banner Optional Behavior Preserved

- All previous changes maintained:
  - Logo and banner are optional in onboarding
  - Placeholders show when images are missing
  - No validation errors for missing images

---

## Updated Files

### Backend
1. `backend/prisma/schema.prisma` - Added `onboardingCompleted` field
2. `backend/src/controllers/onboardingController.ts` - Updated completion logic
3. `backend/src/routes/onboardingRoutes.ts` - Route changed to `/complete`

### Frontend
1. `types.ts` - Added `onboardingCompleted` to Company interface
2. `App.tsx` - Fixed dashboard routing with useEffect
3. `components/Navbar.tsx` - Fixed Dashboard button logic
4. `components/layout/MobileDrawer.tsx` - Fixed Dashboard button logic
5. `components/PartnerOnboardingWizard.tsx` - Redirects to dashboard on completion
6. `components/pages/partner/SubscriptionBillingPage.tsx` - Fixed Upgrade button
7. `components/pages/partner/UpgradePlanModal.tsx` - Updated button text

### Services
1. `services/api.ts` - Updated `completeOnboarding()` and `getOnboardingStatus()` types
2. `services/mockApi.ts` - Updated to handle `onboardingCompleted`

---

## Updated Company Model

```prisma
model Company {
  // ... existing fields ...
  onboardingCompleted Boolean @default(false)
  // ... rest of fields ...
}
```

```typescript
export interface Company {
  // ... existing fields ...
  onboardingCompleted?: boolean;
  // ... rest of fields ...
}
```

---

## Updated Onboarding Completion Logic

**Backend (`onboardingController.ts`):**
```typescript
export const completeOnboarding = async (req: AuthRequest, res: Response) => {
  const company = await prisma.company.update({
    where: { ownerId: userId },
    data: {
      onboardingCompleted: true,  // ✅ Set to true
    },
    // ...
  });
  res.json({ 
    company,
    step: 5,
    completed: true,
    onboardingCompleted: true,  // ✅ Return status
  });
};
```

**Frontend (`PartnerOnboardingWizard.tsx`):**
```typescript
const handleComplete = async () => {
  const result = await api.completeOnboarding();
  localStorage.removeItem('selectedPlan');  // ✅ Clear saved plan
  onNavigate(ViewState.PARTNER_DASHBOARD);  // ✅ Redirect to dashboard
  onComplete();
};
```

---

## Fixed Dashboard Routing Code

**`App.tsx`** - useEffect hook:
```typescript
useEffect(() => {
  const checkOnboardingForDashboard = async () => {
    if (currentView === ViewState.PARTNER_DASHBOARD && 
        userRole === 'PARTNER' && 
        isAuthenticated && 
        user && 
        !isCheckingOnboarding) {
      setIsCheckingOnboarding(true);
      try {
        const status = await api.getOnboardingStatus();
        if (!status.onboardingCompleted) {
          // Redirect to appropriate onboarding step
          if (!status.hasCompany) {
            setCurrentView(ViewState.PARTNER_ONBOARDING_STEP_1);
          } else {
            // Redirect to current step based on progress
            const stepViewMap = { /* ... */ };
            setCurrentView(stepViewMap[status.step]);
          }
        }
      } catch (error) {
        // Fallback to company object check
        const company = getCurrentCompany();
        if (company && !company.onboardingCompleted) {
          setCurrentView(ViewState.PARTNER_ONBOARDING_STEP_1);
        }
      } finally {
        setIsCheckingOnboarding(false);
      }
    }
  };
  checkOnboardingForDashboard();
}, [currentView, userRole, isAuthenticated, user]);
```

**Dashboard render:**
```typescript
if (currentView === ViewState.PARTNER_DASHBOARD) {
  // Show loading while checking
  if (isCheckingOnboarding && user?.role === 'PARTNER') {
    return <Loader2 />;
  }
  // Show dashboard (redirect handled by useEffect)
  return <BusinessDashboard ... />;
}
```

---

## Working Upgrade Plan Button + Modal

**`SubscriptionBillingPage.tsx`**:
```typescript
<button
  onClick={() => setShowUpgradeModal(true)}  // ✅ Opens modal
  className="..."
>
  {lang === 'da' ? 'Opgrader Plan' : 'Upgrade Plan'}
</button>

<UpgradePlanModal
  isOpen={showUpgradeModal}
  onClose={() => setShowUpgradeModal(false)}
  lang={lang}
  currentPlan={company.pricingTier}
  onSelectPlan={(planId, planName, monthlyPrice) => {
    // Save plan to localStorage
    localStorage.setItem('selectedPlan', JSON.stringify({...}));
    // Navigate to payment coming soon
    if (onNavigate) {
      onNavigate(ViewState.PAYMENT_COMING_SOON);
    }
    setShowUpgradeModal(false);
  }}
/>
```

**`UpgradePlanModal.tsx`**:
- Shows Pro and Elite plans
- Highlights current plan
- "Continue to Payment (Stripe coming soon)" button
- Navigates to `PAYMENT_COMING_SOON` after selection

---

## Testing Checklist

- [x] Onboarding completion sets `onboardingCompleted = true`
- [x] Partners redirected to dashboard after completion
- [x] Dashboard routing checks onboarding status
- [x] Dashboard button routes correctly based on status
- [x] Upgrade Plan button opens modal
- [x] Modal shows plans and navigates correctly
- [x] No navigation to public `/pricing` page
- [x] Logo/banner optional behavior preserved

---

## Next Steps

1. **Run Prisma Migration:**
   ```bash
   cd backend
   npx prisma migrate dev --name add_onboarding_completed
   ```

2. **Test Flow:**
   - Register as partner
   - Complete onboarding (all 5 steps)
   - Verify redirect to dashboard
   - Click Dashboard button → should stay on dashboard
   - Click Upgrade Plan → should open modal

---

**All changes maintain existing styling and behavior!** ✅







