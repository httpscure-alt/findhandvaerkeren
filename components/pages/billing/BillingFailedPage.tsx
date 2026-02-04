import * as React from 'react';
import { useEffect, useState } from 'react';
import { XCircle, ArrowRight, CreditCard, AlertTriangle, Loader2 } from 'lucide-react';
import { Language } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';

interface BillingFailedPageProps {
  lang: Language;
  onRetry?: () => void;
  onBack?: () => void;
}

const BillingFailedPage: React.FC<BillingFailedPageProps> = ({ lang, onRetry, onBack }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isDa = lang === 'da';

  const handleRetryPayment = async () => {
    if (onRetry) {
      onRetry();
    } else {
      // Navigate to billing page to retry
      window.location.href = '/dashboard/billing';
    }
  };

  const handleUpdatePaymentMethod = async () => {
    setIsLoading(true);
    try {
      const { url } = await api.getStripePortalUrl();
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      toast.error(error.message || (isDa ? 'Kunne ikke åbne faktureringsportal' : 'Could not open billing portal'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
        {/* Failed Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="text-red-600" size={40} />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#1D1D1F] mb-4">
          {isDa ? 'Betaling Fejlede' : 'Payment Failed'}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          {isDa
            ? 'Din betaling kunne ikke gennemføres. Dette kan skyldes utilstrækkelige midler, en ugyldig betalingsmetode eller et teknisk problem.'
            : 'Your payment could not be processed. This may be due to insufficient funds, an invalid payment method, or a technical issue.'}
        </p>

        {/* Alert Box */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 max-w-xl mx-auto">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-left">
              <h3 className="font-semibold text-red-900 mb-2">
                {isDa ? 'Hvad skal jeg gøre?' : 'What should I do?'}
              </h3>
              <ul className="space-y-2 text-sm text-red-800">
                <li>
                  {isDa
                    ? '• Kontroller at din betalingsmetode er gyldig og har tilstrækkelige midler'
                    : '• Verify your payment method is valid and has sufficient funds'}
                </li>
                <li>
                  {isDa
                    ? '• Opdater din betalingsmetode hvis den er udløbet'
                    : '• Update your payment method if it has expired'}
                </li>
                <li>
                  {isDa
                    ? '• Prøv igen eller kontakt support hvis problemet fortsætter'
                    : '• Try again or contact support if the problem persists'}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Update Payment Method */}
          <button
            onClick={handleUpdatePaymentMethod}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium bg-[#1D1D1F] text-white hover:bg-black transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>{isDa ? 'Indlæser...' : 'Loading...'}</span>
              </>
            ) : (
              <>
                <CreditCard size={20} />
                <span>{isDa ? 'Opdater Betalingsmetode' : 'Update Payment Method'}</span>
              </>
            )}
          </button>

          {/* Retry Payment */}
          <button
            onClick={handleRetryPayment}
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium border border-gray-200 text-[#1D1D1F] hover:bg-gray-50 transition-all"
          >
            <ArrowRight size={20} />
            <span>{isDa ? 'Prøv Igen' : 'Try Again'}</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {isDa
              ? 'Du modtager en email med flere detaljer om fejlen. Hvis problemet fortsætter, kontakt venligst support.'
              : 'You will receive an email with more details about the failure. If the problem persists, please contact support.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillingFailedPage;





