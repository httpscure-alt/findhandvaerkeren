import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, CreditCard, Loader2 } from 'lucide-react';
import { Language, SelectedPlan } from '../types';
import { translations } from '../translations';
import { PARTNER_PLAN_PRICING, getPartnerPlanFeatures, formatPrice } from '../constants/pricing';
import { api } from '../services/api';

interface PlanReviewProps {
  lang: Language;
  onContinueToPayment: () => void;
  onBack?: () => void;
}

type PricingMode = 'monthly' | 'annual';

const PlanReview: React.FC<PlanReviewProps> = ({ lang, onContinueToPayment, onBack }) => {
  const [pricingMode, setPricingMode] = useState<PricingMode>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
  const t = translations[lang].pricing;

  useEffect(() => {
    // Load selected plan from localStorage
    const savedPlan = localStorage.getItem('selectedPlan');
    if (savedPlan) {
      try {
        const plan = JSON.parse(savedPlan);
        // Ensure monthlyPrice is set correctly (fix if 0 or missing)
        const validPlan = {
          ...plan,
          monthlyPrice: (plan.monthlyPrice && plan.monthlyPrice > 0)
            ? plan.monthlyPrice
            : PARTNER_PLAN_PRICING.BASIC_MONTHLY,
          billingPeriod: (plan.billingPeriod || 'monthly') as 'monthly' | 'annual',
        };
        setSelectedPlan(validPlan);
        setPricingMode(validPlan.billingPeriod || 'monthly');
        // Update localStorage with corrected plan
        localStorage.setItem('selectedPlan', JSON.stringify(validPlan));
      } catch (error) {
        // If parsing fails, create default plan
        const defaultPlan = {
          id: 'partner',
          name: 'Partner Plan',
          monthlyPrice: PARTNER_PLAN_PRICING.BASIC_MONTHLY,
          billingPeriod: 'monthly',
        };
        setSelectedPlan(defaultPlan);
        setPricingMode('monthly');
        localStorage.setItem('selectedPlan', JSON.stringify(defaultPlan));
      }
    } else {
      // No plan in localStorage, create default
      const defaultPlan = {
        id: 'partner',
        name: 'Partner Plan',
        monthlyPrice: PARTNER_PLAN_PRICING.BASIC_MONTHLY,
        billingPeriod: 'monthly',
      };
      setSelectedPlan(defaultPlan);
      setPricingMode('monthly');
      localStorage.setItem('selectedPlan', JSON.stringify(defaultPlan));
    }
  }, []);

  // Use centralized pricing format function
  const getPriceInfo = () => {
    // Always use PARTNER_PLAN_PRICING.BASIC_MONTHLY if monthlyPrice is missing, 0, or invalid
    const monthlyPrice = (selectedPlan?.monthlyPrice && selectedPlan.monthlyPrice > 0)
      ? selectedPlan.monthlyPrice
      : PARTNER_PLAN_PRICING.BASIC_MONTHLY;
    return formatPrice(monthlyPrice, pricingMode, lang);
  };

  // Ensure we have a valid plan with correct pricing
  const validPlan = selectedPlan || {
    id: 'partner',
    name: 'Partner Plan',
    monthlyPrice: PARTNER_PLAN_PRICING.BASIC_MONTHLY,
    billingPeriod: pricingMode,
  };

  const priceInfo = getPriceInfo();
  const planFeatures = getPartnerPlanFeatures(lang);
  const features = planFeatures.BASIC; // Using BASIC plan features
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinueToPayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Get billing cycle from current pricing mode
      const billingCycle = pricingMode;

      // Call Stripe checkout API
      const { url } = await api.createCheckoutSession(billingCycle);

      if (url) {
        // ONLY redirect if it's a Stripe checkout URL
        if (url.startsWith('https://checkout.stripe.com') || url.includes('stripe.com')) {
          // Redirect to Stripe Checkout - this is what we want!
          console.log('✅ Redirecting to Stripe Checkout:', url);
          window.location.href = url;
          return;
        }

        // If we get a mock URL or local URL, that's an error - backend should return Stripe URL
        if (url.startsWith('/billing/success') || url.startsWith('/billing/coming-soon')) {
          console.error('❌ Got mock/local URL instead of Stripe URL:', url);
          throw new Error('Backend returned a local URL instead of Stripe checkout URL. Please check Stripe configuration.');
        }

        // If it's not a Stripe URL, that's unexpected - show error
        console.error('❌ Unexpected URL format:', url);
        throw new Error(`Invalid checkout URL format: ${url}. Expected Stripe checkout URL.`);
      } else {
        throw new Error('No checkout URL returned from backend');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      // Show more helpful error messages
      let errorMessage = 'Failed to create checkout session. Please try again.';

      if (err.message) {
        if (err.message.includes('Stripe') || err.message.includes('stripe')) {
          errorMessage = lang === 'da'
            ? 'Stripe er ikke konfigureret korrekt. Kontakt support for hjælp.'
            : 'Stripe is not configured correctly. Please contact support for assistance.';
        } else if (err.message.includes('Authentication') || err.message.includes('token')) {
          errorMessage = lang === 'da'
            ? 'Du skal være logget ind for at fortsætte. Log venligst ind igen.'
            : 'You must be logged in to continue. Please log in again.';
        } else if (err.message.includes('API_NOT_AVAILABLE') || err.message.includes('USE_MOCK_API') || err.message.includes('backend is not available') || err.message.includes('API URL is not configured')) {
          errorMessage = lang === 'da'
            ? 'Backend er ikke tilgængelig. Sørg for at backend kører på http://localhost:4000 og at VITE_API_URL er sat i .env.local filen.'
            : 'Backend is not available. Please ensure the backend is running on http://localhost:4000 and that VITE_API_URL is set in your .env.local file.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1D1D1F] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#1D1D1F] mb-2">
            {lang === 'da' ? 'Gennemgå din plan' : 'Review Your Plan'}
          </h1>
          <p className="text-gray-500">
            {lang === 'da'
              ? 'Gennemgå din valgte plan og fortsæt til betaling'
              : 'Review your selected plan and continue to payment'}
          </p>
        </div>

        {/* Pricing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8 pb-8 border-b border-gray-200">
          <span
            className={`text-sm font-medium transition-colors duration-200 ${pricingMode === 'monthly' ? 'text-[#1D1D1F]' : 'text-[#86868B]'
              }`}
          >
            {lang === 'da' ? 'Månedligt' : 'Monthly'}
          </span>
          <button
            onClick={() => {
              const newMode = pricingMode === 'monthly' ? 'annual' : 'monthly';
              setPricingMode(newMode);
              const updatedPlan = {
                ...validPlan,
                monthlyPrice: PARTNER_PLAN_PRICING.BASIC_MONTHLY,
                billingPeriod: newMode
              };
              setSelectedPlan(updatedPlan);
              localStorage.setItem('selectedPlan', JSON.stringify(updatedPlan));
            }}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-nexus-accent focus:ring-offset-2 ${pricingMode === 'annual' ? 'bg-[#1D1D1F]' : 'bg-gray-300'
              }`}
            aria-label={lang === 'da' ? 'Skift prisperiode' : 'Toggle pricing period'}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${pricingMode === 'annual' ? 'translate-x-8' : 'translate-x-1'
                }`}
            />
          </button>
          <span
            className={`text-sm font-medium transition-colors duration-200 ${pricingMode === 'annual' ? 'text-[#1D1D1F]' : 'text-[#86868B]'
              }`}
          >
            {lang === 'da' ? 'Årligt (Spar 20%)' : 'Annual (Save 20%)'}
          </span>
        </div>

        {/* Plan Summary */}
        <div className="mb-8">
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#1D1D1F] mb-2">
                  {validPlan.name || 'Partner Plan'}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#1D1D1F]">
                    {priceInfo.price}
                  </span>
                  <span className="text-lg font-medium text-[#86868B]">
                    {priceInfo.period}
                  </span>
                </div>
                <p className="text-sm text-[#86868B] mt-2">
                  {priceInfo.billing}
                </p>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-[#1D1D1F] mb-4">
              {lang === 'da' ? 'Inkluderede funktioner' : 'Included Features'}
            </h4>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100 flex-shrink-0">
                    <Check size={14} className="text-green-600" />
                  </div>
                  <span className="text-sm text-[#1D1D1F]">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex-1 py-3 px-6 rounded-xl font-medium border border-gray-200 text-[#1D1D1F] hover:bg-gray-50 transition-all"
            >
              {lang === 'da' ? 'Tilbage' : 'Back'}
            </button>
          )}
          <button
            onClick={handleContinueToPayment}
            disabled={isProcessing}
            className="flex-1 py-3 px-6 rounded-xl font-medium bg-[#1D1D1F] text-white hover:bg-black shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {lang === 'da' ? 'Opretter betalingssession...' : 'Creating checkout session...'}
              </>
            ) : (
              <>
                {lang === 'da' ? 'Fortsæt til betaling' : 'Continue to Payment'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Security Note */}
        <p className="text-xs text-center text-gray-400 mt-6">
          {lang === 'da'
            ? 'Sikker betaling via Stripe. Betalingsoplysninger behandles sikkert.'
            : 'Secure payment via Stripe. Payment information is processed securely.'}
        </p>
      </div>
    </div>
  );
};

export default PlanReview;


