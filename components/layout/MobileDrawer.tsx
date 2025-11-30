import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { ViewState, Language } from '../../types';
import { translations } from '../../translations';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  setView: (view: ViewState) => void;
  lang: Language;
  isLoggedIn: boolean;
  userRole?: 'CONSUMER' | 'PARTNER' | 'ADMIN' | null;
  onLoginPartner: () => void;
  onLoginConsumer: () => void;
  onLogout?: () => void;
  company?: { onboardingCompleted?: boolean } | null;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  setView,
  lang,
  isLoggedIn,
  userRole,
  onLoginPartner,
  onLoginConsumer,
  onLogout,
  company,
}) => {
  const t = translations[lang].nav;

  // Disable body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle navigation and close
  const handleNavigate = (view: ViewState) => {
    setView(view);
    onClose();
  };

  // Don't render anything if not open
  if (!isOpen) return null;

  // Render drawer content using Portal to document.body
  const drawerContent = (
    <>
      {/* Backdrop - Semi-transparent overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-[9998] md:hidden transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Full-screen drawer with slide animation */}
      <div
        className="fixed inset-0 w-full h-full bg-white z-[9999] md:hidden overflow-y-auto transform transition-transform duration-300 ease-in-out translate-x-0"
      >
        {/* Header with logo and close button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1D1D1F] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-800">Findhåndværkeren</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-800 hover:text-gray-600 focus:outline-none p-2 transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable menu content */}
        <div className="px-4 pt-4 pb-8 space-y-1">
          {!isLoggedIn ? (
            // Visitor mobile menu
            <>
              <button
                onClick={() => handleNavigate(ViewState.HOME)}
                className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {t.home}
              </button>
              <button
                onClick={() => handleNavigate(ViewState.LISTINGS)}
                className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {t.browse}
              </button>
              <button
                onClick={() => handleNavigate(ViewState.CATEGORIES)}
                className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {lang === 'da' ? 'Kategorier' : 'Categories'}
              </button>
              <button
                onClick={() => handleNavigate(ViewState.PRICING)}
                className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {t.pricing}
              </button>
              <button
                onClick={() => handleNavigate(ViewState.ABOUT)}
                className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {lang === 'da' ? 'Om Os' : 'About'}
              </button>
              <button
                onClick={() => handleNavigate(ViewState.CONTACT)}
                className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {lang === 'da' ? 'Kontakt' : 'Contact'}
              </button>
              <div className="border-t border-gray-200 my-4"></div>
              <button
                onClick={() => {
                  // Save placeholder plan to indicate partner signup
                  localStorage.setItem('selectedPlan', JSON.stringify({ id: 'partner', name: 'Partner', monthlyPrice: 0, billingPeriod: 'monthly' }));
                  handleNavigate(ViewState.SIGNUP);
                }}
                className="block w-full text-center px-4 py-3 bg-[#1D1D1F] text-white rounded-lg font-medium hover:bg-black transition-colors mt-4"
              >
                {t.listBusiness}
              </button>
              <div className="border-t border-gray-200 my-4"></div>
              <div className="px-4 py-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.login}</span>
                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => {
                      handleNavigate(ViewState.AUTH);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {t.login}
                  </button>
                  <button
                    onClick={() => {
                      // Navigate to AUTH with signup mode
                      handleNavigate(ViewState.AUTH);
                      // Use setTimeout to ensure navigation happens first, then update URL
                      setTimeout(() => {
                        window.history.replaceState({}, '', window.location.pathname + '?mode=signup');
                        // Trigger a re-render by updating the view state (but keep it as AUTH)
                        // The AuthPage component will read the URL param on mount
                      }, 0);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {lang === 'da' ? 'Opret konto' : 'Create Account'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Logged in mobile menu
            <>
              {userRole === 'CONSUMER' && (
                <>
                  <button
                    onClick={() => handleNavigate(ViewState.CONSUMER_DASHBOARD)}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {lang === 'da' ? 'Dashboard' : 'Dashboard'}
                  </button>
                  <button
                    onClick={() => handleNavigate(ViewState.CONSUMER_SAVED_LISTINGS)}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {lang === 'da' ? 'Gemte Annoncer' : 'Saved Listings'}
                  </button>
                  <button
                    onClick={() => handleNavigate(ViewState.CONSUMER_INQUIRIES)}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {lang === 'da' ? 'Mine Forespørgsler' : 'My Inquiries'}
                  </button>
                  <button
                    onClick={() => handleNavigate(ViewState.CONSUMER_SETTINGS)}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {lang === 'da' ? 'Indstillinger' : 'Settings'}
                  </button>
                </>
              )}
              {userRole === 'PARTNER' && (
                <>
                  <button
                    onClick={() => {
                      // If onboarding not completed, redirect to onboarding, else to dashboard
                      if (company && !company.onboardingCompleted) {
                        handleNavigate(ViewState.PARTNER_ONBOARDING_STEP_1);
                      } else {
                        handleNavigate(ViewState.PARTNER_DASHBOARD);
                      }
                    }}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {lang === 'da' ? 'Dashboard' : 'Dashboard'}
                  </button>
                  <button
                    onClick={() => handleNavigate(ViewState.PARTNER_PROFILE_EDIT)}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {lang === 'da' ? 'Profil' : 'Profile'}
                  </button>
                  <button
                    onClick={() => handleNavigate(ViewState.PARTNER_SERVICES)}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {lang === 'da' ? 'Ydelser' : 'Services'}
                  </button>
                  <button
                    onClick={() => handleNavigate(ViewState.PARTNER_LEADS)}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {lang === 'da' ? 'Leads' : 'Leads'}
                  </button>
                  <button
                    onClick={() => handleNavigate(ViewState.PARTNER_SETTINGS)}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {lang === 'da' ? 'Indstillinger' : 'Settings'}
                  </button>
                </>
              )}
              {userRole === 'ADMIN' && (
                <>
                  <button
                    onClick={() => handleNavigate(ViewState.ADMIN)}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {lang === 'da' ? 'Dashboard' : 'Dashboard'}
                  </button>
                  <button
                    onClick={() => handleNavigate(ViewState.ADMIN_COMPANIES)}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {lang === 'da' ? 'Virksomheder' : 'Companies'}
                  </button>
                  <button
                    onClick={() => handleNavigate(ViewState.ADMIN_ANALYTICS)}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {lang === 'da' ? 'Analytics' : 'Analytics'}
                  </button>
                </>
              )}
              {onLogout && (
                <>
                  <div className="border-t border-gray-200 my-4"></div>
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {lang === 'da' ? 'Log Ud' : 'Logout'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );

  // Render to document.body using Portal
  return createPortal(drawerContent, document.body);
};

export default MobileDrawer;
