import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Search, User, Globe, ChevronDown, ShieldCheck, Briefcase, Shield, Bell } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { Language } from '../types';
import { translations } from '../translations';
import MobileDrawer from './layout/MobileDrawer';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onLoginPartner: () => void;
  onLoginConsumer: () => void;
  isLoggedIn: boolean;
  userRole?: 'CONSUMER' | 'PARTNER' | 'ADMIN' | null;
  onLogout?: () => void;
  company?: { onboardingCompleted?: boolean } | null;
}


const Navbar: React.FC<NavbarProps> = ({ lang, setLang, onLoginPartner, onLoginConsumer, isLoggedIn, userRole, onLogout, company }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const t = translations[lang].nav;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchNotifications = async () => {
        try {
          const res = await api.getNotifications();
          setUnreadCount(res.unreadCount);
        } catch (error) {
          console.error('Failed to fetch notifications', error);
        }
      };
      fetchNotifications();
      // Poll every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `text-sm font-semibold transition-colors duration-300 cursor-pointer hover:text-[#1D1D1F] ${isActive(path) ? 'text-[#1D1D1F]' : 'text-[#86868B]'
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
      <nav className="sticky top-0 z-50 w-full frosted-glass border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1D1D1F] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-[#1D1D1F]">Findhåndværkeren</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <span onClick={() => navigate('/browse')} className={navLinkClass('/browse')}>
                {t.findPros}
              </span>
              <span onClick={() => navigate('/pricing')} className={navLinkClass('/pricing')}>
                {t.pricing}
              </span>
              <span onClick={() => navigate('/for-businesses')} className={navLinkClass('/for-businesses')}>
                {t.forBusinesses}
              </span>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Language Toggle */}
              <button
                onClick={() => setLang(lang === 'en' ? 'da' : 'en')}
                className="flex items-center gap-1 text-xs font-bold text-[#86868B] hover:text-[#1D1D1F] transition-colors uppercase"
              >
                <Globe size={14} />
                <span>{lang}</span>
              </button>

              {/* Notifications */}
              {isLoggedIn && (
                <button
                  onClick={() => navigate('/dashboard/notifications')}
                  className="relative text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* Log In */}
              {!isLoggedIn ? (
                <button
                  onClick={() => navigate('/auth')}
                  className="text-sm font-semibold text-[#1D1D1F] hover:opacity-70 transition-colors"
                >
                  {t.login}
                </button>
              ) : (
                <div className="relative" ref={loginDropdownRef}>
                  <button
                    onClick={() => setIsLoginOpen(!isLoginOpen)}
                    className="flex items-center gap-1 text-sm font-semibold text-[#1D1D1F] focus:outline-none"
                  >
                    {t.dashboard} <ChevronDown size={14} />
                  </button>

                  {isLoginOpen && (
                    <div className="absolute right-0 mt-4 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fadeIn z-50">
                      <button onClick={() => { navigate('/dashboard'); setIsLoginOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Briefcase size={14} /> {t.dashboard}
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={() => { onLogout?.(); setIsLoginOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
                        {t.logout}
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={() => setLang(lang === 'en' ? 'da' : 'en')}
                className="text-xs font-bold text-[#86868B] uppercase"
              >
                {lang}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#1D1D1F]"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
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
