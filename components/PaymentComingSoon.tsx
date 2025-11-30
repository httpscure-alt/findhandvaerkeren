import React from 'react';
import { CreditCard, Clock, ArrowLeft } from 'lucide-react';
import { Language, ViewState } from '../types';

interface PaymentComingSoonProps {
  lang: Language;
  onBack?: () => void;
}

const PaymentComingSoon: React.FC<PaymentComingSoonProps> = ({ lang, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="text-amber-600" size={40} />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#1D1D1F] mb-4">
          {lang === 'da' ? 'Betaling kommer snart' : 'Payment Coming Soon'}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          {lang === 'da' 
            ? 'Vi arbejder på at integrere Stripe-betalinger. Din plan er gemt, og du vil blive notificeret, når betaling er klar.'
            : 'We are working on integrating Stripe payments. Your plan has been saved, and you will be notified when payment is ready.'}
        </p>

        {/* Info Box */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 max-w-xl mx-auto">
          <div className="flex items-start gap-4">
            <CreditCard className="text-gray-400 flex-shrink-0 mt-1" size={24} />
            <div className="text-left">
              <h3 className="font-semibold text-[#1D1D1F] mb-2">
                {lang === 'da' ? 'Hvad sker der nu?' : 'What happens next?'}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  {lang === 'da' 
                    ? '• Din valgte plan er gemt i systemet'
                    : '• Your selected plan has been saved'}
                </li>
                <li>
                  {lang === 'da' 
                    ? '• Du kan fortsætte med at bruge platformen'
                    : '• You can continue using the platform'}
                </li>
                <li>
                  {lang === 'da' 
                    ? '• Vi kontakter dig, når betaling er klar'
                    : '• We will contact you when payment is ready'}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border border-gray-200 text-[#1D1D1F] hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={18} />
            {lang === 'da' ? 'Tilbage til dashboard' : 'Back to Dashboard'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentComingSoon;
