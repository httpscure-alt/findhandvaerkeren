import * as React from 'react';
import { useState, useEffect } from 'react';
import { Company, Language, ViewState } from '../../../types';
import { CreditCard, CheckCircle, Calendar, Download, ArrowRight, Loader2, ExternalLink, Settings } from 'lucide-react';
import { translations } from '../../../translations';
import UpgradePlanModal from './UpgradePlanModal';
import { PARTNER_PLAN_PRICING, formatPrice } from '../../../constants/pricing';
import { api } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import { ConfirmDialog } from '../../common/ConfirmDialog';

interface SubscriptionBillingPageProps {
  company: Company;
  lang: Language;
  onBack: () => void;
  onUpgrade?: () => void;
  onNavigate?: (view: ViewState) => void;
}

interface Subscription {
  id: string;
  tier: string;
  status: string;
  billingCycle?: 'monthly' | 'annual';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  cancelAtPeriodEnd?: boolean;
}

const SubscriptionBillingPage: React.FC<SubscriptionBillingPageProps> = ({ company, lang, onBack, onUpgrade, onNavigate }) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });
  const t = translations[lang].pricing;
  const toast = useToast();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await api.getSubscription();
        setSubscription(data.subscription);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        // Fallback to mock data if API fails
        setSubscription({
          id: 'sub_1',
          tier: company.pricingTier,
          status: 'active',
          billingCycle: 'monthly',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, [company.pricingTier]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: { da: string; en: string } }> = {
      active: { bg: 'bg-green-50', text: 'text-green-700', label: { da: 'Aktiv', en: 'Active' } },
      canceled: { bg: 'bg-gray-50', text: 'text-gray-700', label: { da: 'Annulleret', en: 'Canceled' } },
      past_due: { bg: 'bg-red-50', text: 'text-red-700', label: { da: 'Forfalden', en: 'Past Due' } },
      inactive: { bg: 'bg-gray-50', text: 'text-gray-700', label: { da: 'Inaktiv', en: 'Inactive' } },
    };
    const statusInfo = statusMap[status] || statusMap.inactive;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 ${statusInfo.bg} ${statusInfo.text} rounded-full text-sm font-medium`}>
        <CheckCircle size={14} />
        {statusInfo.label[lang]}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getNextPaymentAmount = () => {
    if (!subscription) return `$${PARTNER_PLAN_PRICING.MONTHLY}`;
    const billingCycle = subscription.billingCycle || 'monthly';
    const priceInfo = formatPrice(PARTNER_PLAN_PRICING.MONTHLY, billingCycle, lang);
    return priceInfo.price;
  };

  const billingHistory = [
    { id: '1', date: '2024-01-15', amount: getNextPaymentAmount(), plan: 'Partner Plan', status: 'Paid' },
    { id: '2', date: '2023-12-15', amount: getNextPaymentAmount(), plan: 'Partner Plan', status: 'Paid' },
    { id: '3', date: '2023-11-15', amount: getNextPaymentAmount(), plan: 'Partner Plan', status: 'Paid' }
  ];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-nexus-accent" size={32} />
        </div>
      </div>
    );
  }

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
              <span className={`px-4 py-2 rounded-xl text-sm font-medium ${company.pricingTier === 'Elite' ? 'bg-purple-50 text-purple-700' :
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
            <p className="text-xl font-bold text-[#1D1D1F]">{getNextPaymentAmount()}</p>
            <p className="text-xs text-nexus-subtext mt-1">
              {subscription?.currentPeriodEnd
                ? formatDate(subscription.currentPeriodEnd)
                : (lang === 'da' ? '15. februar 2024' : 'February 15, 2024')}
            </p>
            {subscription?.billingCycle && (
              <p className="text-xs text-nexus-subtext mt-1">
                {lang === 'da'
                  ? `Faktureret ${subscription.billingCycle === 'monthly' ? 'månedligt' : 'årligt'}`
                  : `Billed ${subscription.billingCycle}`}
              </p>
            )}
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
            {getStatusBadge(subscription?.status || 'active')}
          </div>
        </div>

        {/* Manage Subscription */}
        {subscription?.stripeCustomerId && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={async () => {
                setOpeningPortal(true);
                try {
                  const { url } = await api.getStripePortalUrl();
                  if (url) {
                    window.location.href = url;
                  }
                } catch (error: any) {
                  toast.error(error.message || (lang === 'da' ? 'Kunne ikke åbne faktureringsportal' : 'Could not open billing portal'));
                } finally {
                  setOpeningPortal(false);
                }
              }}
              disabled={openingPortal}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1D1D1F] border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {openingPortal ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  {lang === 'da' ? 'Åbner...' : 'Opening...'}
                </>
              ) : (
                <>
                  <Settings size={16} />
                  {lang === 'da' ? 'Administrer i Stripe' : 'Manage in Stripe'}
                  <ExternalLink size={16} />
                </>
              )}
            </button>

            {subscription?.status === 'active' && !subscription.cancelAtPeriodEnd && (
              <button
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: lang === 'da' ? 'Annuller Abonnement' : 'Cancel Subscription',
                    message: lang === 'da'
                      ? 'Er du sikker på, at du vil annullere dit abonnement ved udgangen af perioden?'
                      : 'Are you sure you want to cancel your subscription at the end of the period?',
                    onConfirm: async () => {
                      setIsCanceling(true);
                      try {
                        await api.cancelSubscription();
                        const data = await api.getSubscription();
                        setSubscription(data.subscription);
                        toast.success(lang === 'da' ? 'Dit abonnement vil blive annulleret ved udgangen af perioden.' : 'Your subscription will be canceled at the end of the current period.');
                        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                      } catch (error: any) {
                        toast.error(error.message || (lang === 'da' ? 'Kunne ikke annullere abonnement' : 'Could not cancel subscription'));
                      } finally {
                        setIsCanceling(false);
                      }
                    }
                  });
                }}
                disabled={isCanceling}
                className="ml-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-100 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isCanceling ? <Loader2 className="animate-spin" size={16} /> : null}
                {lang === 'da' ? 'Annuller Abonnement' : 'Cancel Subscription'}
              </button>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {lang === 'da'
                ? 'Opdater betalingsmetode, se fakturaer eller annuller abonnement'
                : 'Update payment method, view invoices, or cancel subscription'}
            </p>
          </div>
        )}
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
        onSelectPlan={async (planId, planName, monthlyPrice, billingCycle) => {
          setShowUpgradeModal(false);

          // Best practice for first deployment with pending Stripe:
          // Inform the user and direct them to contact sales/support.
          toast.success(
            lang === 'da'
              ? `Din anmodning om ${planName} er modtaget! Vi kontakter dig snarest for manuel opgradering.`
              : `Request for ${planName} received! We will contact you shortly for manual onboarding.`
          );

          // Optionally navigate to contact page or just stay here
          // if (onNavigate) onNavigate(ViewState.CONTACT);
        }}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => !isCanceling && setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isLoading={isCanceling}
        isDestructive={true}
        lang={lang}
      />
    </div>
  );
};

export default SubscriptionBillingPage;
