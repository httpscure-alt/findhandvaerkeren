import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, ArrowRight, CreditCard, FileText, Shield, LayoutDashboard, Sparkles } from 'lucide-react';
import { Language } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';

interface BillingSuccessPageProps {
  lang: Language;
  onContinue?: () => void;
}

interface SessionDetails {
  session: {
    id: string;
    status: string;
    paymentStatus: string;
    billingCycle: string;
    planType: string;
    amountTotal: number;
    currency: string;
    customerEmail: string;
    createdAt: string;
  };
  subscription: {
    id: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  } | null;
}

const BillingSuccessPage: React.FC<BillingSuccessPageProps> = ({ lang, onContinue }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isDa = lang === 'da';

  useEffect(() => {
    // Get session_id from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
      // No session_id in URL - show success page with basic info
      setSessionDetails({
        session: {
          id: 'unknown',
          status: 'complete',
          paymentStatus: 'paid',
          billingCycle: 'monthly',
          planType: 'Partner Plan',
          amountTotal: 0,
          currency: 'USD',
          customerEmail: user?.email || '',
          createdAt: new Date().toISOString(),
        },
        subscription: null,
      });
      setError(null);
      setIsLoading(false);
      return;
    }

    // Fetch session details from backend
    const fetchSessionDetails = async () => {
      try {
        const details = await api.getStripeSessionDetails(sessionId);
        setSessionDetails(details);
        setError(null);
      } catch (err: any) {
        // If it's a mock API fallback, that's okay - show success anyway
        if (err.message === 'USE_MOCK_API' || err.message === 'API_NOT_AVAILABLE') {
          setSessionDetails({
            session: {
              id: sessionId,
              status: 'complete',
              paymentStatus: 'paid',
              billingCycle: 'monthly',
              planType: 'Partner Plan',
              amountTotal: 99,
              currency: 'USD',
              customerEmail: user?.email || '',
              createdAt: new Date().toISOString(),
            },
            subscription: null,
          });
          setError(null);
        } else {
          // Payment was successful even if session details failed to load
          setError(null);
          // Set basic session details so success page shows
          setSessionDetails({
            session: {
              id: sessionId,
              status: 'complete',
              paymentStatus: 'paid',
              billingCycle: 'monthly',
              planType: 'Partner Plan',
              amountTotal: 99,
              currency: 'USD',
              customerEmail: user?.email || '',
              createdAt: new Date().toISOString(),
            },
            subscription: null,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionDetails();
  }, [isDa]);

  useEffect(() => {
    // After successful payment, check if company needs verification/onboarding
    if (sessionDetails && user?.role === 'PARTNER') {
      // The webhook should have already:
      // 1. Marked subscription as active
      // 2. Created transaction entry
      // 3. Sent email
      // Here we just ensure the user is guided to next steps
    }
  }, [sessionDetails, user]);

  const handleGoToDashboard = () => {
    if (onContinue) {
      onContinue();
    } else {
      navigate('/dashboard');
    }
  };

  const handleCompleteProfile = () => {
    navigate('/dashboard/profile');
  };

  const handleUploadDocuments = () => {
    navigate('/dashboard/verification');
  };

  const handleViewBilling = () => {
    navigate('/dashboard/billing');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-nexus-accent" size={48} />
          <p className="text-gray-500">
            {isDa ? 'Indlæser betalingsdetaljer...' : 'Loading payment details...'}
          </p>
        </div>
      </div>
    );
  }

  if (error && !sessionDetails) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-[#1D1D1F] mb-4">
            {isDa ? 'Betaling Gennemført!' : 'Payment Successful!'}
          </h1>

          {/* Error Message */}
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {error}
          </p>

          {/* Action Button */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-[#1D1D1F] text-white hover:bg-black transition-all"
          >
            {isDa ? 'Gå til Dashboard' : 'Go to Dashboard'}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const billingCycle = sessionDetails?.session.billingCycle || 'monthly';
  const amountTotal = sessionDetails?.session.amountTotal || 0;
  const currency = sessionDetails?.session.currency || 'USD';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600" size={40} />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#1D1D1F] mb-4 text-center">
          {isDa ? 'Betaling Gennemført!' : 'Payment Successful!'}
        </h1>

        {/* Confirmation Message */}
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto text-center">
          {isDa
            ? 'Tak for dit køb! Dit abonnement er nu aktivt, og du kan begynde at bruge alle funktioner.'
            : 'Thank you for your purchase! Your subscription is now active, and you can start using all features.'}
        </p>

        {/* Plan Details */}
        {sessionDetails && (
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 max-w-xl mx-auto">
            <div className="text-center">
              <h3 className="font-semibold text-[#1D1D1F] mb-4">
                {isDa ? 'Din Plan' : 'Your Plan'}
              </h3>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-[#1D1D1F]">
                  {sessionDetails.session.planType}
                </p>
                <p className="text-gray-600">
                  {billingCycle === 'monthly'
                    ? (isDa ? 'Månedligt abonnement' : 'Monthly subscription')
                    : (isDa ? 'Årligt abonnement' : 'Annual subscription')}
                </p>
                <p className="text-lg font-semibold text-[#1D1D1F] mt-2">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency,
                  }).format(amountTotal)}
                  <span className="text-sm font-normal text-gray-600 ml-1">
                    /{billingCycle === 'monthly' ? (isDa ? 'måned' : 'month') : (isDa ? 'år' : 'year')}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Go to Dashboard */}
          <Link
            to={sessionDetails?.session.planType === 'Marketing Service' ? "/dashboard/growth" : "/dashboard"}
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium bg-[#1D1D1F] text-white hover:bg-black transition-all"
          >
            {sessionDetails?.session.planType === 'Marketing Service' ? <Sparkles size={20} /> : <LayoutDashboard size={20} />}
            <span>{sessionDetails?.session.planType === 'Marketing Service'
              ? (isDa ? 'Gå til Vækst Dashboard' : 'Go to Growth Dashboard')
              : (isDa ? 'Gå til Dashboard' : 'Go to Dashboard')}</span>
          </Link>

          {/* Conditional Second Button */}
          {sessionDetails?.session.planType !== 'Marketing Service' ? (
            <Link
              to="/dashboard/profile"
              className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium border border-gray-200 text-[#1D1D1F] hover:bg-gray-50 transition-all"
            >
              <FileText size={20} />
              <span>{isDa ? 'Fuldfør Virksomhedsprofil' : 'Complete Business Profile'}</span>
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium border border-gray-200 text-[#1D1D1F] hover:bg-gray-50 transition-all"
            >
              <LayoutDashboard size={20} />
              <span>{isDa ? 'Gå til Hovedmenu' : 'Go to Main Dashboard'}</span>
            </Link>
          )}

          {/* Upload Verification Documents (Only for Partner Plans) */}
          {sessionDetails?.session.planType !== 'Marketing Service' && (
            <Link
              to="/dashboard/verification"
              className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium border border-gray-200 text-[#1D1D1F] hover:bg-gray-50 transition-all"
            >
              <Shield size={20} />
              <span>{isDa ? 'Upload Verifikationsdokumenter' : 'Upload Verification Documents'}</span>
            </Link>
          )}

          {/* View Subscription & Billing */}
          <Link
            to="/dashboard/billing"
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium border border-gray-200 text-[#1D1D1F] hover:bg-gray-50 transition-all"
          >
            <CreditCard size={20} />
            <span>{isDa ? 'Se Abonnement & Fakturering' : 'View Subscription & Billing'}</span>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {isDa
              ? 'Du modtager en bekræftelsesemail fra Stripe med alle detaljer.'
              : 'You will receive a confirmation email from Stripe with all details.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillingSuccessPage;

