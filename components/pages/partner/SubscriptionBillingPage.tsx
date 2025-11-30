import React, { useState } from 'react';
import { Company, Language, ViewState } from '../../../types';
import { CreditCard, CheckCircle, Calendar, Download, ArrowRight } from 'lucide-react';
import { translations } from '../../../translations';
import UpgradePlanModal from './UpgradePlanModal';
import { PARTNER_PLAN_PRICING } from '../../../constants/pricing';

interface SubscriptionBillingPageProps {
  company: Company;
  lang: Language;
  onBack: () => void;
  onUpgrade?: () => void;
  onNavigate?: (view: ViewState) => void;
}

const SubscriptionBillingPage: React.FC<SubscriptionBillingPageProps> = ({ company, lang, onBack, onUpgrade, onNavigate }) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const t = translations[lang].pricing;
  const billingHistory = [
    { id: '1', date: '2024-01-15', amount: `$${PARTNER_PLAN_PRICING.MONTHLY}`, plan: 'Partner Plan', status: 'Paid' },
    { id: '2', date: '2023-12-15', amount: `$${PARTNER_PLAN_PRICING.MONTHLY}`, plan: 'Partner Plan', status: 'Paid' },
    { id: '3', date: '2023-11-15', amount: `$${PARTNER_PLAN_PRICING.MONTHLY}`, plan: 'Partner Plan', status: 'Paid' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="text-nexus-accent" size={24} />
        <h1 className="text-3xl font-bold text-[#1D1D1F]">
          {lang === 'da' ? 'Abonnement & Fakturering' : 'Subscription & Billing'}
        </h1>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1D1D1F] mb-2">
              {lang === 'da' ? 'Nuværende Plan' : 'Current Plan'}
            </h2>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
                company.pricingTier === 'Elite' ? 'bg-purple-50 text-purple-700' :
                company.pricingTier === 'Premium' ? 'bg-indigo-50 text-indigo-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {company.pricingTier}
              </span>
              {company.isVerified && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle size={16} />
                  {lang === 'da' ? 'Verificeret' : 'Verified'}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="px-6 py-3 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-black transition-colors flex items-center gap-2"
          >
            {lang === 'da' ? 'Opgrader Plan' : 'Upgrade Plan'} <ArrowRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
          <div>
            <p className="text-sm text-nexus-subtext mb-1">
              {lang === 'da' ? 'Næste Betaling' : 'Next Payment'}
            </p>
            <p className="text-xl font-bold text-[#1D1D1F]">${PARTNER_PLAN_PRICING.MONTHLY}</p>
            <p className="text-xs text-nexus-subtext mt-1">
              {lang === 'da' ? '15. februar 2024' : 'February 15, 2024'}
            </p>
          </div>
          <div>
            <p className="text-sm text-nexus-subtext mb-1">
              {lang === 'da' ? 'Betalingsmetode' : 'Payment Method'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <CreditCard size={18} className="text-nexus-subtext" />
              <span className="text-sm text-[#1D1D1F]">•••• •••• •••• 4242</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-nexus-subtext mb-1">
              {lang === 'da' ? 'Status' : 'Status'}
            </p>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium mt-1">
              <CheckCircle size={14} />
              {lang === 'da' ? 'Aktiv' : 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100">
        <h2 className="text-xl font-bold text-[#1D1D1F] mb-6">
          {lang === 'da' ? 'Faktureringshistorik' : 'Billing History'}
        </h2>
        <div className="space-y-4">
          {billingHistory.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-nexus-bg rounded-xl flex items-center justify-center">
                  <Calendar className="text-nexus-accent" size={20} />
                </div>
                <div>
                  <p className="font-medium text-[#1D1D1F]">
                    {invoice.plan} {lang === 'da' ? 'Plan' : 'Plan'} - {invoice.date}
                  </p>
                  <p className="text-sm text-nexus-subtext">
                    {lang === 'da' ? 'Månedligt abonnement' : 'Monthly subscription'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-[#1D1D1F]">{invoice.amount}</span>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download size={18} className="text-nexus-accent" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        lang={lang}
        currentPlan={company.pricingTier}
        onSelectPlan={(planId, planName, monthlyPrice) => {
          // Save selected plan
          localStorage.setItem('selectedPlan', JSON.stringify({
            id: planId.toLowerCase(),
            name: planName,
            monthlyPrice,
            billingPeriod: 'monthly'
          }));
          
          // Navigate to payment coming soon
          if (onNavigate) {
            onNavigate(ViewState.PAYMENT_COMING_SOON);
          } else if (onUpgrade) {
            onUpgrade();
          }
          setShowUpgradeModal(false);
        }}
      />
    </div>
  );
};

export default SubscriptionBillingPage;
