# Partner Business Profile Flow Cleanup

## Summary

Cleaned up the partner business profile flow and implemented Danish verification requirements. All changes maintain existing styling and layout.

## Changes Made

### 1. Disabled Testimonials CRUD for Partners

**Frontend Changes:**
- `components/pages/partner/TestimonialsManagement.tsx`
  - Removed all add/edit/delete functionality
  - Shows read-only display of existing testimonials
  - Added info message explaining testimonials are temporarily disabled
  - Comment: `// Testimonials creation temporarily disabled until we finalise moderation rules.`

**Backend Changes:**
- No specific endpoint changes needed (testimonials are read-only in UI)
- Admin functionality remains intact

**Result:**
- Partners can view existing testimonials but cannot add/edit/delete
- No UI buttons for testimonials management
- Clear messaging about temporary disable

---

### 2. Fixed Subscription & Billing Upgrade UX

**Created:** `components/pages/partner/UpgradePlanModal.tsx`
- Modal component for in-dashboard plan selection
- Shows Pro and Elite plans
- Highlights current plan
- "Continue to Payment" button

**Updated:** `components/pages/partner/SubscriptionBillingPage.tsx`
- Removed navigation to public `/pricing` page
- Added upgrade modal integration
- "Upgrade Plan" button opens modal instead of navigating away
- Modal redirects to `PAYMENT_COMING_SOON` after plan selection

**Updated:** `App.tsx`
- Updated `PARTNER_BILLING` route to pass `onNavigate` instead of `onUpgrade`

**Result:**
- All upgrade flows stay within dashboard
- No navigation to public pricing page
- Consistent internal routing

---

### 3. Added Danish Verification Fields

**Database Schema:** `backend/prisma/schema.prisma`
```prisma
enum VerificationStatus {
  unverified
  pending
  verified
}

model Company {
  // ... existing fields ...
  
  // Danish verification fields
  cvrNumber          String?
  vatNumber          String?
  legalName          String?
  businessAddress    String?
  cvrLookupUrl       String?
  permitType         String?
  permitIssuer       String?
  permitNumber       String?
  permitDocuments    String[]    @default([])
  verificationStatus VerificationStatus @default(unverified)
  verificationNotes  String?     @db.Text
}
```

**TypeScript Types:** `types.ts`
- Added `VerificationStatus` type
- Updated `Company` interface with verification fields
- Made `logoUrl` and `bannerUrl` optional (`string | null`)

**Onboarding Wizard:** `components/PartnerOnboardingWizard.tsx`
- Added Step 4: Business Verification
- Fields:
  - CVR number (8-digit, required if verification requested)
  - Legal company name
  - Business address
  - Permit type (dropdown)
  - Issuing authority
  - Permit number (optional)
  - CVR profile link (optional)
  - Permit documents (file upload, required if verification requested)
- Checkbox to request verification
- Validation: CVR + at least one document required for verification request
- Status set to "pending" on submit (not "verified")
- Updated progress bar to show 6 steps

**Partner Dashboard:** `components/pages/partner/VerificationSection.tsx` (NEW)
- View/edit verification information
- Shows current verification status (Unverified/Pending/Verified)
- Edit mode allows updating CVR, permits, documents
- Status badges with appropriate colors
- Save sets status to "pending" (admin must approve)

**Sidebar:** `components/layout/PartnerSidebar.tsx`
- Added "Verification" menu item
- Links to `PARTNER_VERIFICATION` view

**Backend:** `backend/src/controllers/onboardingController.ts`
- Added `saveVerification` function
- Handles Step 4 data
- Sets `verificationStatus` to "pending" if verification requested
- Only sets `isVerified = true` if status is "verified" (admin action)

**Backend Routes:** `backend/src/routes/onboardingRoutes.ts`
- Added `POST /onboarding/step-4` route
- Changed `POST /onboarding/step-4` to `POST /onboarding/complete`

**Result:**
- Full Danish verification workflow
- Partners can request verification with CVR and documents
- Status remains "pending" until admin approval
- Verification badge only shows for `verificationStatus === 'verified'`

---

### 4. Made Logo and Banner Optional

**Schema:** Already nullable in Prisma schema

**Onboarding Wizard:** `components/PartnerOnboardingWizard.tsx`
- Step 3: Logo and banner marked as optional
- Added info message: "Logo and banner are optional. You can add them later."
- Added image previews when URLs are provided
- Error handling for broken image URLs
- Can proceed without uploading images

**Placeholders:**
- `components/ListingCard.tsx`:
  - Logo placeholder: First letter of company name in gray circle
  - Error handling for broken images
- `components/ProfileView.tsx`:
  - Logo placeholder: First letter in gray circle
  - Banner placeholder: Subtle gradient background
  - Error handling for broken images
- `components/layout/FeaturedProCard.tsx`:
  - Banner placeholder: Gradient background
  - Error handling for broken images

**Mock API:** `services/mockApi.ts`
- Updated `saveOnboardingStep3` to save `null` if URLs are empty
- No validation errors for missing images

**Result:**
- Users can complete onboarding without images
- No broken image errors
- Clean placeholders when images are missing
- Images can be added later

---

### 5. Updated Verified Badge Logic

**All Components:**
- `components/ListingCard.tsx`: Uses `verificationStatus === 'verified' || isVerified`
- `components/ProfileView.tsx`: Uses `verificationStatus === 'verified' || isVerified`
- `components/layout/FeaturedProCard.tsx`: Uses `verificationStatus === 'verified' || isVerified`
- `hooks/useVerifiedPartnerRotation.ts`: Filters by `verificationStatus === 'verified' || isVerified`
- `App.tsx`: Filter logic uses `verificationStatus === 'verified' || isVerified`
- `backend/src/controllers/companyController.ts`: Query uses `verificationStatus === 'verified' || isVerified`

**Result:**
- Verified badge only shows for companies with `verificationStatus === 'verified'`
- Backward compatible with existing `isVerified` field
- Filtering works correctly

---

## Files Modified

### Frontend
1. `components/pages/partner/TestimonialsManagement.tsx` - Disabled CRUD
2. `components/pages/partner/SubscriptionBillingPage.tsx` - In-dashboard upgrade
3. `components/pages/partner/UpgradePlanModal.tsx` (NEW) - Upgrade modal
4. `components/pages/partner/VerificationSection.tsx` (NEW) - Verification management
5. `components/PartnerOnboardingWizard.tsx` - Added Step 4, made images optional
6. `components/ListingCard.tsx` - Logo placeholder, verified badge logic
7. `components/ProfileView.tsx` - Logo/banner placeholders, verified badge logic
8. `components/layout/FeaturedProCard.tsx` - Banner placeholder, verified badge logic
9. `components/layout/PartnerSidebar.tsx` - Added Verification menu item
10. `types.ts` - Added verification fields, made logo/banner optional
11. `App.tsx` - Added verification route, updated filtering logic
12. `hooks/useVerifiedPartnerRotation.ts` - Updated verified filter

### Backend
1. `backend/prisma/schema.prisma` - Added verification fields
2. `backend/src/controllers/onboardingController.ts` - Added `saveVerification`
3. `backend/src/routes/onboardingRoutes.ts` - Added step-4 route
4. `backend/src/controllers/companyController.ts` - Updated verified filter

### Services
1. `services/api.ts` - Added `saveOnboardingStep4` method
2. `services/mockApi.ts` - Added `saveOnboardingStep4`, fixed image saving

---

## Updated Company/Business Model

```typescript
export interface Company {
  // ... existing fields ...
  logoUrl?: string | null;  // Now optional
  bannerUrl?: string | null;  // Now optional
  
  // Danish verification fields
  cvrNumber?: string | null;
  vatNumber?: string | null;
  legalName?: string | null;
  businessAddress?: string | null;
  cvrLookupUrl?: string | null;
  permitType?: string | null;
  permitIssuer?: string | null;
  permitNumber?: string | null;
  permitDocuments?: string[];
  verificationStatus?: VerificationStatus;
  verificationNotes?: string | null;
}
```

---

## Onboarding Wizard - 6 Steps

1. **Step 1**: Business Info (name, category, location, short description)
2. **Step 2**: Full Description
3. **Step 3**: Images (Logo & Banner - **optional**, Gallery)
4. **Step 4**: Business Verification (CVR, permits, documents - **NEW**)
5. **Step 5**: Verification Complete / Profile Ready
6. **Step 6**: Plan Review → Payment

---

## Partner Dashboard - Verification Section

**Route:** `/partner/verification` (ViewState.PARTNER_VERIFICATION)

**Features:**
- View current verification status
- Edit CVR, permits, documents
- Upload additional documents
- Request verification (sets status to "pending")
- Status badges: Unverified (gray), Pending (yellow), Verified (green)

---

## Subscription & Billing - Upgrade Flow

**Before:**
- "Upgrade Plan" → Navigates to public `/pricing` page

**After:**
- "Upgrade Plan" → Opens modal in dashboard
- Modal shows Pro and Elite plans
- Select plan → Saves to localStorage
- "Continue to Payment" → Navigates to `PAYMENT_COMING_SOON`
- All flows stay internal

---

## Testing Checklist

- [x] Testimonials are read-only for partners
- [x] Upgrade modal opens in dashboard
- [x] Upgrade flow stays internal
- [x] Verification step in onboarding works
- [x] Verification section in dashboard works
- [x] Logo/banner placeholders show correctly
- [x] No broken image errors
- [x] Verified badge uses `verificationStatus === 'verified'`
- [x] Filtering works with verification status
- [x] All styling preserved

---

## Next Steps (Admin)

1. **Admin Verification Review:**
   - Create admin interface to review pending verification requests
   - Approve/reject with notes
   - Set `verificationStatus = 'verified'` on approval

2. **Image Upload:**
   - Implement actual file upload (currently URL-based)
   - Add image validation and storage

3. **Stripe Integration:**
   - Replace `PAYMENT_COMING_SOON` with actual Stripe checkout
   - Handle subscription creation
