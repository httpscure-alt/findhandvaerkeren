
import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Search, User, Globe, ChevronDown, ShieldCheck, Briefcase } from 'lucide-react';
import { ViewState, Language } from '../types';
import { translations } from '../translations';

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
}

const Navbar: React.FC<NavbarProps> = ({ setView, currentView, lang, setLang, onLoginPartner, onLoginConsumer, isLoggedIn, userRole, onLogout }) => {
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
                <span onClick={() => setView(ViewState.PARTNER_DASHBOARD)} className={navLinkClass(ViewState.PARTNER_DASHBOARD)}>
                  {lang === 'da' ? 'Dashboard' : 'Dashboard'}
                </span>
                <span onClick={() => setView(ViewState.LISTINGS)} className={navLinkClass(ViewState.LISTINGS)}>{t.browse}</span>
              </>
            ) : userRole === 'ADMIN' ? (
              // Admin menu
              <>
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

            {/* Login / Dashboard Dropdown */}
            <div className="relative" ref={loginDropdownRef}>
              <button 
                onClick={() => setIsLoginOpen(!isLoginOpen)}
                className={`flex items-center gap-1 text-sm font-medium transition-opacity focus:outline-none ${isLoggedIn ? 'text-nexus-accent' : 'text-[#1D1D1F] hover:text-opacity-70'}`}
              >
                {isLoggedIn ? t.dashboard : t.login} <ChevronDown size={14} />
              </button>
              
              {isLoginOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fadeIn z-50">
                  {!isLoggedIn ? (
                    <>
                      <button 
                        onClick={() => { onLoginConsumer(); setIsLoginOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors flex items-center gap-2"
                      >
                        <User size={14} /> {t.loginConsumer}
                      </button>
                      <button 
                        onClick={() => { onLoginPartner(); setIsLoginOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors flex items-center gap-2"
                      >
                        <Briefcase size={14} /> {t.loginBusiness}
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={() => { setView(ViewState.ADMIN); setIsLoginOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-nexus-accent hover:bg-blue-50 transition-colors flex items-center gap-2"
                      >
                        <ShieldCheck size={14} /> {t.loginAdmin}
                      </button>
                    </>
                  ) : (
                    <>
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
                          <button onClick={() => { setView(ViewState.PARTNER_DASHBOARD); setIsLoginOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors flex items-center gap-2">
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
                    </>
                  )}
                </div>
              )}
            </div>

            {!isLoggedIn && (
              <button 
                onClick={() => setView(ViewState.PRICING)}
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
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden frosted-glass absolute w-full border-b border-gray-200 shadow-lg">
          <div className="px-4 pt-2 pb-3 space-y-1 sm:px-3">
            {!isLoggedIn ? (
              // Visitor mobile menu
              <>
                <button onClick={() => { setView(ViewState.HOME); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#1D1D1F]">{t.home}</button>
                <button onClick={() => { setView(ViewState.LISTINGS); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#86868B]">{t.browse}</button>
                <button onClick={() => { setView(ViewState.CATEGORIES); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#86868B]">{lang === 'da' ? 'Kategorier' : 'Categories'}</button>
                <button onClick={() => { setView(ViewState.PRICING); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#86868B]">{t.pricing}</button>
                <button onClick={() => { setView(ViewState.ABOUT); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#86868B]">{lang === 'da' ? 'Om Os' : 'About'}</button>
                <button onClick={() => { setView(ViewState.CONTACT); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#86868B]">{lang === 'da' ? 'Kontakt' : 'Contact'}</button>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="px-3 py-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.login}</span>
                  <button onClick={() => { onLoginConsumer(); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 text-sm font-medium text-[#1D1D1F]">{t.loginConsumer}</button>
                  <button onClick={() => { onLoginPartner(); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 text-sm font-medium text-[#1D1D1F]">{t.loginBusiness}</button>
                  <button onClick={() => { setView(ViewState.ADMIN); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 text-sm font-medium text-nexus-accent">{t.loginAdmin}</button>
                </div>
              </>
            ) : (
              // Logged in mobile menu
              <>
                {userRole === 'CONSUMER' && (
                  <>
                    <button onClick={() => { setView(ViewState.CONSUMER_DASHBOARD); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#1D1D1F]">{lang === 'da' ? 'Dashboard' : 'Dashboard'}</button>
                    <button onClick={() => { setView(ViewState.CONSUMER_SAVED_LISTINGS); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#86868B]">{lang === 'da' ? 'Gemte Annoncer' : 'Saved Listings'}</button>
                    <button onClick={() => { setView(ViewState.CONSUMER_INQUIRIES); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#86868B]">{lang === 'da' ? 'Mine Forespørgsler' : 'My Inquiries'}</button>
                    <button onClick={() => { setView(ViewState.CONSUMER_SETTINGS); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#86868B]">{lang === 'da' ? 'Indstillinger' : 'Settings'}</button>
                  </>
                )}
                {userRole === 'PARTNER' && (
                  <>
                    <button onClick={() => { setView(ViewState.PARTNER_DASHBOARD); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#1D1D1F]">{lang === 'da' ? 'Dashboard' : 'Dashboard'}</button>
                    <button onClick={() => { setView(ViewState.PARTNER_PROFILE_EDIT); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#86868B]">{lang === 'da' ? 'Profil' : 'Profile'}</button>
                    <button onClick={() => { setView(ViewState.PARTNER_SERVICES); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#86868B]">{lang === 'da' ? 'Ydelser' : 'Services'}</button>
                    <button onClick={() => { setView(ViewState.PARTNER_LEADS); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#86868B]">{lang === 'da' ? 'Leads' : 'Leads'}</button>
                    <button onClick={() => { setView(ViewState.PARTNER_SETTINGS); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#86868B]">{lang === 'da' ? 'Indstillinger' : 'Settings'}</button>
                  </>
                )}
                {userRole === 'ADMIN' && (
                  <>
                    <button onClick={() => { setView(ViewState.ADMIN); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#1D1D1F]">{lang === 'da' ? 'Dashboard' : 'Dashboard'}</button>
                    <button onClick={() => { setView(ViewState.ADMIN_COMPANIES); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#86868B]">{lang === 'da' ? 'Virksomheder' : 'Companies'}</button>
                    <button onClick={() => { setView(ViewState.ADMIN_ANALYTICS); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-[#86868B]">{lang === 'da' ? 'Analytics' : 'Analytics'}</button>
                  </>
                )}
                {onLogout && (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="block px-3 py-2 text-base font-medium text-red-500">{lang === 'da' ? 'Log Ud' : 'Logout'}</button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
