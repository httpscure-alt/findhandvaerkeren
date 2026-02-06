import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, User, Briefcase, Shield } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../translations';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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
  lang,
  isLoggedIn,
  userRole,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[lang].nav;

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] md:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="absolute right-0 top-0 h-full w-[80%] max-w-sm bg-white shadow-2xl animate-slideInRight flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1D1D1F] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-[#1D1D1F]">Findhåndværkeren</span>
          </div>
          <button onClick={onClose} className="p-2 text-[#86868B] hover:text-[#1D1D1F]">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => handleNavigate('/')}
              className={`text-lg font-bold text-left ${location.pathname === '/' ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}
            >
              {t.home}
            </button>
            <button
              onClick={() => handleNavigate('/browse')}
              className={`text-lg font-bold text-left ${location.pathname === '/browse' ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}
            >
              {t.findPros}
            </button>
            <button
              onClick={() => handleNavigate('/pricing')}
              className={`text-lg font-bold text-left ${location.pathname === '/pricing' ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}
            >
              {t.pricing}
            </button>
            <button
              onClick={() => handleNavigate('/for-businesses')}
              className={`text-lg font-bold text-left ${location.pathname === '/for-businesses' ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}
            >
              {t.forBusinesses}
            </button>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => handleNavigate('/dashboard')}
                  className="w-full py-4 px-4 rounded-xl bg-gray-50 text-[#1D1D1F] font-bold text-left flex items-center gap-3 transition-colors active:bg-gray-100"
                >
                  <Briefcase size={20} />
                  {t.dashboard}
                </button>
                <button
                  onClick={() => { onLogout?.(); onClose(); }}
                  className="w-full py-4 px-4 text-red-500 font-bold text-left flex items-center gap-3"
                >
                  <Shield size={20} />
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate('/auth')}
                  className="w-full py-4 px-4 rounded-xl text-[#1D1D1F] font-bold text-left flex items-center gap-3 transition-colors active:bg-gray-50 border border-gray-100"
                >
                  <User size={20} />
                  {t.login}
                </button>
                <button
                  onClick={() => handleNavigate('/signup?role=PARTNER')}
                  className="w-full py-4 px-4 rounded-xl bg-[#1D1D1F] text-white font-bold text-left flex items-center gap-3 transition-transform active:scale-[0.98]"
                >
                  <Briefcase size={20} />
                  {t.listBusiness}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[10px] text-gray-400 font-medium">© 2024 Findhåndværkeren</p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MobileDrawer;
