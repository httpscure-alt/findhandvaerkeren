
import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Search, User, Globe, ChevronDown, ShieldCheck, Briefcase, Shield } from 'lucide-react';
import { ViewState, Language } from '../types';
import { translations } from '../translations';
import MobileDrawer from './layout/MobileDrawer';

interface NavbarProps {
  setView: (view: ViewState) => void;
  currentView: ViewState;
  lang: Language;
  setLang: (lang: Language) => void;
  onLoginPartner: () => void;
  onLoginConsumer: () => void;
  isLoggedIn: boolean;
  userRole?: 'CONSUMER' | 'PARTNER' | 'ADMIN' | null;
  onLogout?: () => void;
  company?: { onboardingCompleted?: boolean } | null;
}

const Navbar: React.FC<NavbarProps> = ({ setView, currentView, lang, setLang, onLoginPartner, onLoginConsumer, isLoggedIn, userRole, onLogout, company }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const loginDropdownRef = useRef<HTMLDivElement>(null);
  
  const t = translations[lang].nav;

  const navLinkClass = (view: ViewState) => 
    `text-sm font-medium transition-colors duration-300 cursor-pointer hover:text-[#1D1D1F] ${
      currentView === view ? 'text-[#1D1D1F]' : 'text-[#86868B]'
    }`;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) {
        setIsLoginOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full frosted-glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 cursor-pointer" onClick={() => setView(ViewState.HOME)}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1D1D1F] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-[#1D1D1F]">Findhåndværkeren</span>
              </div>
            </div>

          {/* Desktop Nav - Role-based */}
          <div className="hidden md:flex items-center space-x-8">
            {!isLoggedIn ? (
              // Visitor menu
              <>
                <span onClick={() => setView(ViewState.HOME)} className={navLinkClass(ViewState.HOME)}>{t.home}</span>
                <span onClick={() => setView(ViewState.LISTINGS)} className={navLinkClass(ViewState.LISTINGS)}>{t.browse}</span>
                <span onClick={() => setView(ViewState.CATEGORIES)} className={navLinkClass(ViewState.CATEGORIES)}>
                  {lang === 'da' ? 'Kategorier' : 'Categories'}
                </span>
                <span onClick={() => setView(ViewState.PRICING)} className={navLinkClass(ViewState.PRICING)}>{t.pricing}</span>
                <span onClick={() => setView(ViewState.ABOUT)} className={navLinkClass(ViewState.ABOUT)}>
                  {lang === 'da' ? 'Om Os' : 'About'}
                </span>
                <span onClick={() => setView(ViewState.CONTACT)} className={navLinkClass(ViewState.CONTACT)}>
                  {lang === 'da' ? 'Kontakt' : 'Contact'}
                </span>
              </>
            ) : userRole === 'CONSUMER' ? (
              // Consumer menu
              <>
                <span onClick={() => setView(ViewState.CONSUMER_DASHBOARD)} className={navLinkClass(ViewState.CONSUMER_DASHBOARD)}>
                  {lang === 'da' ? 'Dashboard' : 'Dashboard'}
                </span>
                <span onClick={() => setView(ViewState.LISTINGS)} className={navLinkClass(ViewState.LISTINGS)}>{t.browse}</span>
              </>
            ) : userRole === 'PARTNER' ? (
              // Partner menu
              <>
                <span 
                  onClick={() => {
                    // Always go to dashboard - let App.tsx handle routing logic
                    // Only redirect to onboarding if company explicitly has onboardingCompleted === false
                    if (company && company.onboardingCompleted === false) {
                      setView(ViewState.PARTNER_ONBOARDING_STEP_1);
                    } else {
                      setView(ViewState.PARTNER_DASHBOARD);
                    }
                  }} 
                  className={navLinkClass(ViewState.PARTNER_DASHBOARD)}
                >
                  {lang === 'da' ? 'Dashboard' : 'Dashboard'}
                </span>
                <span onClick={() => setView(ViewState.LISTINGS)} className={navLinkClass(ViewState.LISTINGS)}>{t.browse}</span>
              </>
            ) : userRole === 'ADMIN' ? (
              // Admin menu
              <>
                <span onClick={() => setView(ViewState.SUPER_ADMIN)} className={navLinkClass(ViewState.SUPER_ADMIN)}>
                  {lang === 'da' ? 'Super Admin' : 'Super Admin'}
                </span>
                <span onClick={() => setView(ViewState.ADMIN)} className={navLinkClass(ViewState.ADMIN)}>
                  {lang === 'da' ? 'Dashboard' : 'Dashboard'}
                </span>
              </>
            ) : (
              // Fallback visitor menu
              <>
                <span onClick={() => setView(ViewState.HOME)} className={navLinkClass(ViewState.HOME)}>{t.home}</span>
                <span onClick={() => setView(ViewState.LISTINGS)} className={navLinkClass(ViewState.LISTINGS)}>{t.browse}</span>
                <span onClick={() => setView(ViewState.PRICING)} className={navLinkClass(ViewState.PRICING)}>{t.pricing}</span>
              </>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
             {/* Language Toggle */}
             <button 
              onClick={() => setLang(lang === 'en' ? 'da' : 'en')}
              className="flex items-center gap-1 text-sm font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
            >
              <Globe size={16} />
              <span className="uppercase">{lang}</span>
            </button>

            <button 
              onClick={() => setView(ViewState.LISTINGS)}
              className="p-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Log In Button - Always goes to /auth */}
            {!isLoggedIn && (
              <button 
                onClick={() => setView(ViewState.AUTH)}
                className="text-sm font-medium text-[#1D1D1F] hover:text-opacity-70 transition-colors"
              >
                {t.login}
              </button>
            )}

            {/* Logged In User Menu */}
            {isLoggedIn && (
              <div className="relative" ref={loginDropdownRef}>
                <button 
                  onClick={() => setIsLoginOpen(!isLoginOpen)}
                  className="flex items-center gap-1 text-sm font-medium text-nexus-accent transition-opacity focus:outline-none"
                >
                  {t.dashboard} <ChevronDown size={14} />
                </button>
                
                {isLoginOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fadeIn z-50">
                    {userRole === 'CONSUMER' && (
                      <>
                        <button onClick={() => { setView(ViewState.CONSUMER_DASHBOARD); setIsLoginOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors flex items-center gap-2">
                          <User size={14} /> {lang === 'da' ? 'Dashboard' : 'Dashboard'}
                        </button>
                        <button onClick={() => { setView(ViewState.CONSUMER_SAVED_LISTINGS); setIsLoginOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors flex items-center gap-2">
                          <User size={14} /> {lang === 'da' ? 'Gemte Annoncer' : 'Saved Listings'}
                        </button>
                        <button onClick={() => { setView(ViewState.CONSUMER_SETTINGS); setIsLoginOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors flex items-center gap-2">
                          <User size={14} /> {lang === 'da' ? 'Indstillinger' : 'Settings'}
                        </button>
                      </>
                    )}
                    {userRole === 'PARTNER' && (
                      <>
                        <button 
                          onClick={() => { 
                            // Always go to dashboard - let App.tsx handle routing logic
                            // Only redirect to onboarding if company explicitly has onboardingCompleted === false
                            if (company && company.onboardingCompleted === false) {
                              setView(ViewState.PARTNER_ONBOARDING_STEP_1);
                            } else {
                              setView(ViewState.PARTNER_DASHBOARD);
                            }
                            setIsLoginOpen(false); 
                          }} 
                          className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors flex items-center gap-2"
                        >
                          <Briefcase size={14} /> {lang === 'da' ? 'Dashboard' : 'Dashboard'}
                        </button>
                        <button onClick={() => { setView(ViewState.PARTNER_PROFILE_EDIT); setIsLoginOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors flex items-center gap-2">
                          <Briefcase size={14} /> {lang === 'da' ? 'Profil' : 'Profile'}
                        </button>
                        <button onClick={() => { setView(ViewState.PARTNER_SETTINGS); setIsLoginOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors flex items-center gap-2">
                          <Briefcase size={14} /> {lang === 'da' ? 'Indstillinger' : 'Settings'}
                        </button>
                      </>
                    )}
                    {userRole === 'ADMIN' && (
                      <>
                        <button onClick={() => { setView(ViewState.SUPER_ADMIN); setIsLoginOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2 font-semibold">
                          <Shield size={14} /> {lang === 'da' ? 'Super Admin' : 'Super Admin'}
                        </button>
                        <button onClick={() => { setView(ViewState.ADMIN); setIsLoginOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors flex items-center gap-2">
                          <ShieldCheck size={14} /> {lang === 'da' ? 'Dashboard' : 'Dashboard'}
                        </button>
                      </>
                    )}
                    {onLogout && (
                      <>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button onClick={() => { onLogout(); setIsLoginOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          {lang === 'da' ? 'Log Ud' : 'Logout'}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* List Business Button */}
            {!isLoggedIn && (
              <button 
                onClick={() => {
                  // Save placeholder plan to indicate partner signup
                  localStorage.setItem('selectedPlan', JSON.stringify({ id: 'partner', name: 'Partner', monthlyPrice: 0, billingPeriod: 'monthly' }));
                  setView(ViewState.SIGNUP);
                }}
                className="bg-[#1D1D1F] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md"
              >
                {t.listBusiness}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
             <button 
              onClick={() => setLang(lang === 'en' ? 'da' : 'en')}
              className="text-sm font-medium text-[#86868B] uppercase"
            >
              {lang}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#1D1D1F] hover:text-gray-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      </nav>

      {/* Mobile Drawer - Rendered via Portal to document.body (outside nav) */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        setView={setView}
        lang={lang}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        onLoginPartner={onLoginPartner}
        onLoginConsumer={onLoginConsumer}
        onLogout={onLogout}
        company={company}
      />
    </>
  );
};

export default Navbar;
