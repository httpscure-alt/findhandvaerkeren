import React, { useState } from 'react';
import { Check, Loader2, ShoppingBag } from 'lucide-react';
import { Language, ModalState } from '../types';
import { translations } from '../translations';
import { createCheckout, PRODUCT_VARIANTS } from '../services/shopifyService';

interface PricingProps {
  lang: Language;
  onOpenModal: (type: ModalState) => void;
}

const Pricing: React.FC<PricingProps> = ({ lang, onOpenModal }) => {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const t = translations[lang].pricing;

  const handlePlanSelect = async (tierName: string, isPaid: boolean) => {
    
    // Basic -> Open Registration Modal
    if (tierName === 'Basic') {
      onOpenModal(ModalState.REGISTER_FREE);
      return;
    }

    // Elite -> Open Sales Contact
    if (tierName === 'Elite') {
      onOpenModal(ModalState.CONTACT_SALES);
      return;
    }

    // Pro -> Shopify Integration
    if (isPaid && tierName === 'Pro') {
      setLoadingTier(tierName);
      try {
        // Use the constant variant ID from the service
        const response = await createCheckout(PRODUCT_VARIANTS.PRO_PLAN_MONTHLY);
        
        if (response.success && response.checkoutUrl) {
          // If it's the demo URL, just alert
          if (response.checkoutUrl.includes('checkout_demo')) {
             setTimeout(() => {
                alert(lang === 'da' 
                  ? "Dette er en demo. I en rigtig app ville du blive sendt til Shopify Checkout." 
                  : "This is a demo. In a live app, you would be redirected to Shopify Checkout.");
                setLoadingTier(null);
             }, 1000);
          } else {
             // REAL REDIRECT
             window.location.href = response.checkoutUrl;
          }
        } else {
          alert("Error creating checkout: " + (response.error || "Unknown error"));
          setLoadingTier(null);
        }
      } catch (error) {
        console.error("Checkout error", error);
        setLoadingTier(null);
        alert("An unexpected error occurred.");
      }
    }
  };

  const tiers = [
    {
      id: 'Basic',
      name: t.tiers.basic.name,
      price: 'Free',
      description: t.tiers.basic.desc,
      features: [t.features.listing, t.features.search1, t.features.analytics, t.features.support],
      cta: t.tiers.basic.cta,
      highlight: false,
      paid: false
    },
    {
      id: 'Pro',
      name: t.tiers.pro.name,
      price: '$49/mo',
      description: t.tiers.pro.desc,
      features: [t.features.priority, t.features.verified, t.features.search3, t.features.messaging, t.features.customHeader],
      cta: t.tiers.pro.cta,
      highlight: true,
      paid: true
    },
    {
      id: 'Elite',
      name: t.tiers.elite.name,
      price: '$149/mo',
      description: t.tiers.elite.desc,
      features: [t.features.topPlacement, t.features.unlimited, t.features.video, t.features.manager, t.features.api],
      cta: t.tiers.elite.cta,
      highlight: false,
      paid: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn relative z-0">
      {/* Checkout Overlay for Loading State */}
      {loadingTier && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center max-w-sm w-full text-center">
             <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-nexus-accent border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShoppingBag size={20} className="text-nexus-accent" />
                </div>
             </div>
             <h3 className="text-lg font-bold text-[#1D1D1F] mb-2">{t.checkout.redirecting}</h3>
             <p className="text-sm text-gray-500">{t.checkout.success}</p>
          </div>
        </div>
      )}

      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-4xl font-bold text-[#1D1D1F] mb-4 tracking-tight">{t.title}</h2>
        <p className="text-xl text-[#86868B]">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => (
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
              <div className="text-4xl font-bold text-[#1D1D1F] mb-2">{tier.price}</div>
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
              onClick={() => handlePlanSelect(tier.id, tier.paid)}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2
                ${tier.highlight 
                  ? 'bg-[#1D1D1F] text-white hover:bg-black shadow-lg' 
                  : 'bg-white text-[#1D1D1F] border border-gray-200 hover:bg-gray-50'
                }`}
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;