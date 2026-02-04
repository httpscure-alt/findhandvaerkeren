import React from 'react';
import { XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Language } from '../../../types';

interface BillingCancelPageProps {
  lang: Language;
  onBack?: () => void;
  onRetry?: () => void;
}

const BillingCancelPage: React.FC<BillingCancelPageProps> = ({ lang, onBack, onRetry }) => {
  const isDa = lang === 'da';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
        {/* Cancel Icon */}
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="text-amber-600" size={40} />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#1D1D1F] mb-4">
          {isDa ? 'Betaling Annulleret' : 'Payment Canceled'}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          {isDa 
            ? 'Din betaling blev annulleret. Ingen beløb er blevet trukket. Du kan prøve igen når som helst.'
            : 'Your payment was canceled. No charges were made. You can try again anytime.'}
        </p>

        {/* Info Box */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 max-w-xl mx-auto">
          <div className="text-left">
            <h3 className="font-semibold text-[#1D1D1F] mb-2">
              {isDa ? 'Hvad sker der nu?' : 'What happens next?'}
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                {isDa 
                  ? '• Ingen betaling er blevet trukket'
                  : '• No payment has been charged'}
              </li>
              <li>
                {isDa 
                  ? '• Din plan er gemt, så du kan fortsætte senere'
                  : '• Your plan selection is saved, so you can continue later'}
              </li>
              <li>
                {isDa 
                  ? '• Du kan prøve igen når som helst'
                  : '• You can try again anytime'}
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border border-gray-200 text-[#1D1D1F] hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={18} />
              {isDa ? 'Tilbage' : 'Back'}
            </button>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-[#1D1D1F] text-white hover:bg-black transition-all"
            >
              {isDa ? 'Prøv Igen' : 'Try Again'}
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingCancelPage;







