import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight } from 'lucide-react';
import { Language } from '../../../types';
import { translations } from '../../../translations';
import { PARTNER_PLAN_PRICING, PARTNER_PLAN_FEATURES } from '../../../constants/pricing';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentPlan: string;
  onSelectPlan: (planId: string, planName: string, monthlyPrice: number, billingCycle?: 'monthly' | 'annual') => void;
}

const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({ isOpen, onClose, lang, currentPlan, onSelectPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const t = translations[lang].pricing;

  if (!isOpen) return null;

  const plans = [
    {
      id: 'Basic',
      name: 'Basic Plan',
      monthlyPrice: PARTNER_PLAN_PRICING.BASIC_MONTHLY,
      description: t.tiers.pro.desc,
      features: PARTNER_PLAN_FEATURES.BASIC,
    },
    {
      id: 'Gold',
      name: 'Gold Plan',
      monthlyPrice: PARTNER_PLAN_PRICING.GOLD_MONTHLY,
      description: t.tiers.gold?.desc || 'Maksimal synlighed og Guld-highlight',
      features: PARTNER_PLAN_FEATURES.GOLD,
    },
  ];

  const handleContinue = () => {
    if (selectedPlan) {
      const plan = plans.find(p => p.id === selectedPlan);
      if (plan) {
        onSelectPlan(plan.id, plan.name, plan.monthlyPrice, billingCycle);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-2">
            {lang === 'da' ? 'Opgrader din plan' : 'Upgrade Your Plan'}
          </h2>
          <p className="text-gray-500 mb-4">
            {lang === 'da'
              ? 'Vælg en plan, der passer til din virksomhed'
              : 'Choose a plan that fits your business'}
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span
              className={`text-sm font-medium transition-colors duration-200 ${billingCycle === 'monthly' ? 'text-[#1D1D1F]' : 'text-[#86868B]'
                }`}
            >
              {lang === 'da' ? 'Månedligt' : 'Monthly'}
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-nexus-accent focus:ring-offset-2 ${billingCycle === 'annual' ? 'bg-[#1D1D1F]' : 'bg-gray-300'
                }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${billingCycle === 'annual' ? 'translate-x-8' : 'translate-x-1'
                  }`}
              />
            </button>
            <span
              className={`text-sm font-medium transition-colors duration-200 ${billingCycle === 'annual' ? 'text-[#1D1D1F]' : 'text-[#86868B]'
                }`}
            >
              {lang === 'da' ? 'Årligt (Spar 20%)' : 'Annual (Save 20%)'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6 max-w-2xl mx-auto">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isCurrent = currentPlan === plan.id;

            return (
              <div
                key={plan.id}
                onClick={() => !isCurrent && setSelectedPlan(plan.id)}
                className={`relative rounded-2xl p-6 border-2 transition-all cursor-pointer ${isSelected
                  ? 'border-nexus-accent bg-nexus-accent/5'
                  : isCurrent
                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                {isCurrent && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                      {lang === 'da' ? 'Nuværende' : 'Current'}
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-[#1D1D1F] mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-[#1D1D1F]">${plan.monthlyPrice}</span>
                  <span className="text-gray-500 text-sm ml-1">/month</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {!isCurrent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan.id);
                    }}
                    className={`w-full py-2.5 rounded-xl font-medium transition-all ${isSelected
                      ? 'bg-[#1D1D1F] text-white hover:bg-black'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {isSelected
                      ? (lang === 'da' ? 'Valgt' : 'Selected')
                      : (lang === 'da' ? 'Vælg' : 'Select')
                    }
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            {lang === 'da' ? 'Annuller' : 'Cancel'}
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedPlan}
            className="px-6 py-2 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {lang === 'da' ? 'Kontakt os for opgradering' : 'Contact Support to Upgrade'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlanModal;







