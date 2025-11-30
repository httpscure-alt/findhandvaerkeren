import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, CreditCard } from 'lucide-react';
import { Language, SelectedPlan } from '../types';
import { translations } from '../translations';
import { PARTNER_PLAN_PRICING, PARTNER_PLAN_FEATURES, formatPrice } from '../constants/pricing';

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
            : PARTNER_PLAN_PRICING.MONTHLY,
          billingPeriod: plan.billingPeriod || 'monthly',
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
          monthlyPrice: PARTNER_PLAN_PRICING.MONTHLY,
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
        monthlyPrice: PARTNER_PLAN_PRICING.MONTHLY,
        billingPeriod: 'monthly',
      };
      setSelectedPlan(defaultPlan);
      setPricingMode('monthly');
      localStorage.setItem('selectedPlan', JSON.stringify(defaultPlan));
    }
  }, []);

  // Use centralized pricing format function
  const getPriceInfo = () => {
    // Always use PARTNER_PLAN_PRICING.MONTHLY if monthlyPrice is missing, 0, or invalid
    const monthlyPrice = (selectedPlan?.monthlyPrice && selectedPlan.monthlyPrice > 0) 
      ? selectedPlan.monthlyPrice 
      : PARTNER_PLAN_PRICING.MONTHLY;
    return formatPrice(monthlyPrice, pricingMode, lang);
  };

  // Ensure we have a valid plan with correct pricing
  const validPlan = selectedPlan || {
    id: 'partner',
    name: 'Partner Plan',
    monthlyPrice: PARTNER_PLAN_PRICING.MONTHLY,
    billingPeriod: pricingMode,
  };

  const priceInfo = getPriceInfo();
  const features = PARTNER_PLAN_FEATURES.PRO;

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
            className={`text-sm font-medium transition-colors duration-200 ${
              pricingMode === 'monthly' ? 'text-[#1D1D1F]' : 'text-[#86868B]'
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
                monthlyPrice: PARTNER_PLAN_PRICING.MONTHLY,
                billingPeriod: newMode 
              };
              setSelectedPlan(updatedPlan);
              localStorage.setItem('selectedPlan', JSON.stringify(updatedPlan));
            }}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-nexus-accent focus:ring-offset-2 ${
              pricingMode === 'annual' ? 'bg-[#1D1D1F]' : 'bg-gray-300'
            }`}
            aria-label={lang === 'da' ? 'Skift prisperiode' : 'Toggle pricing period'}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                pricingMode === 'annual' ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <span 
            className={`text-sm font-medium transition-colors duration-200 ${
              pricingMode === 'annual' ? 'text-[#1D1D1F]' : 'text-[#86868B]'
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
            onClick={onContinueToPayment}
            className="flex-1 py-3 px-6 rounded-xl font-medium bg-[#1D1D1F] text-white hover:bg-black shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {lang === 'da' ? 'Fortsæt til betaling (Stripe kommer snart)' : 'Continue to Payment (Stripe coming soon)'}
            <ArrowRight size={18} />
          </button>
        </div>

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
