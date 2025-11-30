import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Language, ModalState, SelectedPlan } from '../types';
import { translations } from '../translations';

interface PricingProps {
  lang: Language;
  onOpenModal: (type: ModalState) => void;
  onPlanSelected?: (plan: SelectedPlan) => void;
}

type PricingMode = 'monthly' | 'annual';

const Pricing: React.FC<PricingProps> = ({ lang, onOpenModal, onPlanSelected }) => {
  const [pricingMode, setPricingMode] = useState<PricingMode>('monthly');
  const t = translations[lang].pricing;

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

  const handlePlanSelect = (tierName: string, isPaid: boolean, monthlyPrice: number) => {
    // All plans are for partners only
    // Elite -> Open Sales Contact
    if (tierName === 'Elite') {
      onOpenModal(ModalState.CONTACT_SALES);
      return;
    }

    // Basic or Pro -> Save plan and redirect to Partner Signup
    const selectedPlan: SelectedPlan = {
      id: tierName.toLowerCase(),
      name: tierName,
      monthlyPrice,
      billingPeriod: pricingMode,
    };
    
    // Save plan to localStorage for later use
    localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
    
    // Set role to partner
    localStorage.setItem('signupRole', 'PARTNER');
    
    // Notify parent component if callback provided
    onPlanSelected?.(selectedPlan);
    
    // Parent component will handle redirect to signup page
  };

  const tiers = [
    {
      id: 'Basic',
      name: t.tiers.basic.name,
      monthlyPrice: 0, // Free
      description: t.tiers.basic.desc,
      features: [t.features.listing, t.features.search1, t.features.analytics, t.features.support],
      cta: t.tiers.basic.cta,
      highlight: false,
      paid: false
    },
    {
      id: 'Pro',
      name: t.tiers.pro.name,
      monthlyPrice: 49,
      description: t.tiers.pro.desc,
      features: [t.features.priority, t.features.verified, t.features.search3, t.features.messaging, t.features.customHeader],
      cta: t.tiers.pro.cta,
      highlight: true,
      paid: true
    },
    {
      id: 'Elite',
      name: t.tiers.elite.name,
      monthlyPrice: 149,
      description: t.tiers.elite.desc,
      features: [t.features.topPlacement, t.features.unlimited, t.features.video, t.features.manager, t.features.api],
      cta: t.tiers.elite.cta,
      highlight: false,
      paid: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn relative z-0">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-4xl font-bold text-[#1D1D1F] mb-4 tracking-tight">{t.title}</h2>
        <p className="text-xl text-[#86868B] mb-8">{t.subtitle}</p>
        
        {/* Pricing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <span 
            className={`text-sm font-medium transition-colors duration-200 ${
              pricingMode === 'monthly' ? 'text-[#1D1D1F]' : 'text-[#86868B]'
            }`}
          >
            {lang === 'da' ? 'Månedligt' : 'Monthly'}
          </span>
          <button
            onClick={() => setPricingMode(pricingMode === 'monthly' ? 'annual' : 'monthly')}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {tiers.filter(tier => tier.id !== 'Basic').map((tier) => {
          const priceInfo = tier.monthlyPrice === 0 
            ? { price: lang === 'da' ? 'Gratis' : 'Free', period: '', billing: '' }
            : formatPrice(tier.monthlyPrice);
          
          return (
            <div 
              key={tier.name} 
              className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 
                ${tier.highlight 
                  ? 'bg-white shadow-xl scale-105 border border-gray-100 z-10' 
                  : 'bg-[#F5F5F7]/50 border border-white hover:bg-white hover:shadow-lg'
                }`}
            >
              <div className="mb-8">
                <h3 className="text-lg font-medium text-[#1D1D1F] mb-2">{tier.name}</h3>
                <div className="mb-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#1D1D1F] transition-all duration-300">
                      {priceInfo.price}
                    </span>
                    {priceInfo.period && (
                      <span className="text-lg font-medium text-[#86868B] transition-all duration-300">
                        {priceInfo.period}
                      </span>
                    )}
                  </div>
                  {priceInfo.billing && (
                    <p className="text-xs text-[#86868B] mt-1 transition-all duration-300">
                      {priceInfo.billing}
                    </p>
                  )}
                </div>
                <p className="text-sm text-[#86868B]">{tier.description}</p>
              </div>

            <ul className="space-y-4 mb-8 flex-1">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="mt-0.5 p-0.5 rounded-full bg-green-100">
                    <Check size={12} className="text-green-600" />
                  </div>
                  <span className="text-sm text-[#1D1D1F]">{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handlePlanSelect(tier.id, tier.paid, tier.monthlyPrice)}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2
                ${tier.highlight 
                  ? 'bg-[#1D1D1F] text-white hover:bg-black shadow-lg' 
                  : 'bg-white text-[#1D1D1F] border border-gray-200 hover:bg-gray-50'
                }`}
            >
              {tier.cta}
            </button>
          </div>
        );
        })}
      </div>
    </div>
  );
};

export default Pricing;