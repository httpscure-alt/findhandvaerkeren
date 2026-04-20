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
import { useLocation, useNavigate } from 'react-router-dom';

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
  const location = useLocation();
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
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
        setSubscription(data.subscription || null);
      } catch (error) {
        if ((import.meta as any).env.DEV) console.error('Failed to fetch subscription:', error);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, [company?.pricingTier]);

  // If we arrive here from onboarding with ?plan=Basic|Gold&period=monthly|annual, start Stripe Checkout immediately.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan');
    const period = params.get('period') as 'monthly' | 'annual' | null;

    if (!plan || !period) return;
    if (isStartingCheckout) return;

    const normalizedPlan = plan === 'Basic' || plan === 'Gold' ? plan : null;
    const normalizedPeriod = period === 'monthly' || period === 'annual' ? period : null;
    if (!normalizedPlan || !normalizedPeriod) return;

    const start = async () => {
      setIsStartingCheckout(true);
      try {
        const { url } = await api.createCheckoutSession({
          tier: normalizedPlan,
          billingCycle: normalizedPeriod,
        });
        window.location.href = url;
      } catch (e: any) {
        toast.error(e?.message || (lang === 'da' ? 'Kunne ikke starte betaling' : 'Could not start checkout'));
        // Remove params so the page doesn't re-trigger on refresh
        navigate('/dashboard/billing', { replace: true });
      } finally {
        setIsStartingCheckout(false);
      }
    };

    start();
  }, [location.search, isStartingCheckout, lang, navigate, toast]);

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
    if (!subscription) return `$${PARTNER_PLAN_PRICING.BASIC_MONTHLY}`;
    const billingCycle = subscription.billingCycle || 'monthly';
    const priceInfo = formatPrice(PARTNER_PLAN_PRICING.BASIC_MONTHLY, billingCycle, lang);
    return priceInfo.price;
  };

  const billingHistory = [
    { id: '1', date: '2024-01-15', amount: getNextPaymentAmount(), plan: 'Basic Plan', status: 'Paid' },
    { id: '2', date: '2023-12-15', amount: getNextPaymentAmount(), plan: 'Basic Plan', status: 'Paid' },
    { id: '3', date: '2023-11-15', amount: getNextPaymentAmount(), plan: 'Basic Plan', status: 'Paid' }
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

  if (isStartingCheckout) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
        <div className="bg-white rounded-3xl p-10 border border-gray-100">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-nexus-accent" size={24} />
            <div>
              <div className="text-xl font-bold text-[#1D1D1F]">
                {lang === 'da' ? 'Sender dig til betaling…' : 'Redirecting to checkout…'}
              </div>
              <div className="text-sm text-nexus-subtext mt-1">
                {lang === 'da' ? 'Vent et øjeblik.' : 'Please wait a moment.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
        <div className="flex items-center gap-3 mb-8">
          <CreditCard className="text-nexus-accent" size={24} />
          <h1 className="text-3xl font-bold text-[#1D1D1F]">
            {lang === 'da' ? 'Abonnement & Fakturering' : 'Subscription & Billing'}
          </h1>
        </div>

        <div className="bg-white rounded-3xl p-10 border border-gray-100">
          <h2 className="text-2xl font-bold text-[#1D1D1F]">
            {lang === 'da' ? 'Intet aktivt abonnement endnu' : 'No active subscription yet'}
          </h2>
          <p className="text-nexus-subtext mt-2">
            {lang === 'da'
              ? 'Vælg en plan for at fortsætte til betaling i Stripe.'
              : 'Choose a plan to continue to Stripe checkout.'}
          </p>

          <div className="mt-6">
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-6 py-3 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-black transition-colors inline-flex items-center gap-2"
            >
              {lang === 'da' ? 'Vælg plan og betal' : 'Choose plan & pay'} <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <UpgradePlanModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          lang={lang}
          currentPlan={null}
          onSelectPlan={async (planId, planName, monthlyPrice, billingCycle) => {
            setShowUpgradeModal(false);
            try {
              const cycle = billingCycle || 'monthly';
              const { url } = await api.createCheckoutSession({
                tier: planId,
                billingCycle: cycle,
              });
              window.location.href = url;
            } catch (e: any) {
              toast.error(e?.message || (lang === 'da' ? 'Kunne ikke starte betaling' : 'Could not start checkout'));
            }
          }}
        />
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

      <div className="mb-8 bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-[#1D1D1F]">
            {lang === 'da' ? 'Vil du teste checkout-flowet igen?' : 'Want to replay the checkout flow?'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {lang === 'da'
              ? 'Gå direkte til planvalg (trin 5) og start Stripe checkout igen.'
              : 'Jump to plan selection (step 5) and start Stripe checkout again.'}
          </div>
        </div>
        <button
          onClick={() => window.location.href = '/dashboard/onboarding/replay/5'}
          className="px-5 py-3 rounded-xl bg-white border border-gray-200 font-bold text-sm text-[#1D1D1F] hover:bg-gray-100 transition-colors"
        >
          {lang === 'da' ? 'Vælg plan igen' : 'Choose plan again'}
        </button>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1D1D1F] mb-2">
              {lang === 'da' ? 'Nuværende Plan' : 'Current Plan'}
            </h2>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-xl text-sm font-medium ${company?.pricingTier === 'Gold' ? 'bg-purple-50 text-purple-700' :
                company?.pricingTier === 'Basic' ? 'bg-indigo-50 text-indigo-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                {company?.pricingTier || 'Basic'}
              </span>
              {company?.isVerified && (
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
        {subscription && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            {subscription?.stripeCustomerId ? (
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
            ) : null}

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
                className={`${subscription?.stripeCustomerId ? 'ml-4' : ''} inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-100 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50`}
              >
                {isCanceling ? <Loader2 className="animate-spin" size={16} /> : null}
                {lang === 'da' ? 'Annuller Abonnement' : 'Cancel Subscription'}
              </button>
            )}

            {subscription?.status === 'active' && subscription.cancelAtPeriodEnd && (
              <div className="mt-3 text-xs text-gray-500">
                {lang === 'da'
                  ? 'Dit abonnement er planlagt til at blive annulleret ved periodens udløb.'
                  : 'Your subscription is scheduled to cancel at the end of the period.'}
              </div>
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
        currentPlan={subscription?.tier || null}
        onSelectPlan={async (planId, planName, monthlyPrice, billingCycle) => {
          setShowUpgradeModal(false);
          try {
            const cycle = billingCycle || 'monthly';
            const { url } = await api.createCheckoutSession({
              tier: planId,
              billingCycle: cycle,
            });
            window.location.href = url;
          } catch (e: any) {
            toast.error(e?.message || (lang === 'da' ? 'Kunne ikke starte betaling' : 'Could not start checkout'));
          }
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
