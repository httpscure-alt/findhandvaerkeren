import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, CreditCard } from 'lucide-react';
import { Language, SelectedPlan } from '../types';
import { translations } from '../translations';

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
      const plan = JSON.parse(savedPlan);
      setSelectedPlan(plan);
      setPricingMode(plan.billingPeriod || 'monthly');
    }
  }, []);

  // Calculate price based on mode
  const getPrice = (monthlyPrice: number): number => {
    if (pricingMode === 'monthly') {
      return monthlyPrice;
    }
    // Annual: monthly * 12 * 0.8 (20% discount)
    return Math.round(monthlyPrice * 12 * 0.8);
  };

  // Format price display
  const formatPrice = (monthlyPrice: number): { price: string; period: string; billing: string } => {
    const price = getPrice(monthlyPrice);
    const period = pricingMode === 'monthly' 
      ? (lang === 'da' ? '/måned' : '/month')
      : (lang === 'da' ? '/år' : '/year');
    const billing = pricingMode === 'monthly'
      ? (lang === 'da' ? 'Faktureret månedligt' : 'Billed monthly')
      : (lang === 'da' ? 'Faktureret årligt (20% RABAT)' : 'Billed yearly (20% OFF)');
    
    return {
      price: `$${price}`,
      period,
      billing
    };
  };

  if (!selectedPlan) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">
          {lang === 'da' ? 'Ingen plan valgt' : 'No plan selected'}
        </p>
      </div>
    );
  }

  const priceInfo = formatPrice(selectedPlan.monthlyPrice);

  // Features based on plan
  const getFeatures = () => {
    if (selectedPlan.id === 'pro') {
      return [
        t.features.priority,
        t.features.verified,
        t.features.search3,
        t.features.messaging,
        t.features.customHeader,
      ];
    }
    return [];
  };

  const features = getFeatures();

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
              if (selectedPlan) {
                const updatedPlan = { ...selectedPlan, billingPeriod: newMode };
                setSelectedPlan(updatedPlan);
                localStorage.setItem('selectedPlan', JSON.stringify(updatedPlan));
              }
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
                  {selectedPlan.name} {lang === 'da' ? 'Plan' : 'Plan'}
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
            {lang === 'da' ? 'Fortsæt til betaling' : 'Continue to Payment'}
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
