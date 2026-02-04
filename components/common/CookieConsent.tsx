import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield } from 'lucide-react';
import { Language } from '../../types';

interface CookieConsentProps {
  lang: Language;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ lang }) => {
  const [isVisible, setIsVisible] = useState(false);
  const isDa = lang === 'da';

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slideUp">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Cookie className="text-blue-600" size={24} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#1D1D1F] mb-2 flex items-center gap-2">
              <Shield size={18} className="text-blue-600" />
              {isDa ? 'Cookie-indstillinger' : 'Cookie Settings'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {isDa 
                ? 'Vi bruger cookies til at forbedre din oplevelse, analysere trafik og personalisere indhold. Du kan acceptere alle cookies eller vælge kun nødvendige cookies.'
                : 'We use cookies to enhance your experience, analyze traffic, and personalize content. You can accept all cookies or choose only necessary cookies.'}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleAccept}
                className="px-6 py-2.5 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-black transition-all text-sm"
              >
                {isDa ? 'Accepter alle' : 'Accept All'}
              </button>
              <button
                onClick={handleReject}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm"
              >
                {isDa ? 'Kun nødvendige' : 'Necessary Only'}
              </button>
              <a
                href="/privacy"
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                {isDa ? 'Læs mere' : 'Learn more'}
              </a>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleReject}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={isDa ? 'Luk' : 'Close'}
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;





