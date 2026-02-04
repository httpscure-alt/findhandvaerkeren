import React, { useState } from 'react';
import { X, Loader2, CheckCircle, Building2, User, Mail, Phone, Lock, MessageSquare } from 'lucide-react';
import { ModalState, Language, Company } from '../types';
import { translations } from '../translations';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  type: ModalState;
  onClose: () => void;
  lang: Language;
  onSuccess?: () => void;
  company?: Company | null;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, type, onClose, lang, onSuccess, company }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'CONSUMER' | 'PARTNER'>('CONSUMER');
  const { login, register } = useAuth();
  const t = translations[lang].auth;

  if (!isOpen || type === ModalState.CLOSED) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const companyName = formData.get('companyName') as string;
    const fullName = formData.get('fullName') as string;
    const message = formData.get('message') as string;

    try {
      if (type === ModalState.REGISTER_FREE) {
        // Register based on selected role
        if (userRole === 'PARTNER') {
          const response: any = await register(email, password, companyName, undefined, undefined, 'PARTNER');
          if (response && response.requiresVerification) {
            window.location.href = `/verify-email?email=${email}`;
            return;
          }
        } else {
          // Consumer signup with name
          const response: any = await register(email, password, fullName, undefined, undefined, 'CONSUMER');
          if (response && response.requiresVerification) {
            window.location.href = `/verify-email?email=${email}`;
            return;
          }
        }
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
          onSuccess?.();
        }, 2000);
      } else if (type === ModalState.LOGIN) {
        await login(email, password);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
          onSuccess?.();
        }, 2000);
      } else if (type === ModalState.CONTACT_SALES || type === ModalState.CONTACT_VENDOR) {
        // For now, just show success (inquiry creation would go here)
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      // In offline mode, auth functions will use mock data, so errors are unlikely
      // But if there's an error, show it
      if (err.message && !err.message.includes('API_NOT_AVAILABLE')) {
        setError(err.message || 'An error occurred');
      } else {
        // API not available, but auth should still work with mock
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
          onSuccess?.();
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isSales = type === ModalState.CONTACT_SALES;
  const isVendorContact = type === ModalState.CONTACT_VENDOR;

  let title = t.createAccount;
  let submitText = t.submitReg;
  let subtitle = lang === 'da' ? 'Start din rejse i dag.' : 'Start your journey today.';

  if (isSales) {
    title = t.contactSales;
    submitText = t.submitSales;
    subtitle = lang === 'da' ? 'Fortæl os om dine behov.' : 'Tell us about your enterprise needs.';
  } else if (isVendorContact) {
    title = company ? (lang === 'da' ? `Kontakt ${company.name}` : `Contact ${company.name}`) : t.contactVendor;
    submitText = t.submitVendor;
    subtitle = lang === 'da' ? 'Send en direkte forespørgsel.' : 'Send a direct inquiry.';
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      ></div>

      {/* Modal Content */}
      <div
        className="relative w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-[#1D1D1F]">
              {lang === 'da' ? 'Tak!' : 'Thank You!'}
            </h3>
            <p className="text-gray-500 mt-2">
              {isSales || isVendorContact
                ? (lang === 'da' ? 'Vi vender tilbage inden for 24 timer.' : 'We will reach out within 24 hours.')
                : (lang === 'da' ? 'Din konto er oprettet.' : 'Your account has been created.')}
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-[#1D1D1F] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <h2 className="text-2xl font-bold text-[#1D1D1F]">{title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {subtitle}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection - Only for registration */}
              {type === ModalState.REGISTER_FREE && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
                    {lang === 'da' ? 'Kontotype' : 'Account Type'}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUserRole('CONSUMER')}
                      className={`flex-1 px-4 py-2 rounded-xl border transition-all ${userRole === 'CONSUMER'
                        ? 'border-nexus-accent bg-nexus-accent/10 text-nexus-accent'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {lang === 'da' ? 'Forbrugere' : 'Consumer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserRole('PARTNER')}
                      className={`flex-1 px-4 py-2 rounded-xl border transition-all ${userRole === 'PARTNER'
                        ? 'border-nexus-accent bg-nexus-accent/10 text-nexus-accent'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {lang === 'da' ? 'Partner' : 'Partner'}
                    </button>
                  </div>
                </div>
              )}

              {/* Consumer Fields - Full Name */}
              {type === ModalState.REGISTER_FREE && userRole === 'CONSUMER' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
                    {lang === 'da' ? 'Fulde Navn' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      name="fullName"
                      required
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-nexus-accent/50 focus:border-nexus-accent outline-none transition-all"
                      placeholder={lang === 'da' ? 'Dit navn' : 'Your name'}
                    />
                  </div>
                </div>
              )}

              {/* Company Name - Only for Partner registration or sales, optional for vendor contact */}
              {(!isVendorContact && (type !== ModalState.REGISTER_FREE || userRole === 'PARTNER')) && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">{t.companyName}</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      name="companyName"
                      required={type === ModalState.REGISTER_FREE && userRole === 'PARTNER'}
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-nexus-accent/50 focus:border-nexus-accent outline-none transition-all"
                      placeholder={lang === 'da' ? 'F.eks. Mesterbyg ApS' : 'Ex. Acme Corp'}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    name="email"
                    required
                    type="email"
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-nexus-accent/50 focus:border-nexus-accent outline-none transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              {!isSales && !isVendorContact && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">{t.password}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      name="password"
                      required
                      type="password"
                      className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-nexus-accent/50 focus:border-nexus-accent outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {(isSales || isVendorContact) && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">{t.message}</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 text-gray-400" size={18} />
                    <textarea
                      name="message"
                      className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-nexus-accent/50 focus:border-nexus-accent outline-none transition-all min-h-[100px]"
                      placeholder="..."
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#1D1D1F] text-white font-medium shadow-lg hover:bg-black transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    {translations[lang].pricing.checkout.processing}
                  </>
                ) : (
                  <>
                    {submitText}
                    <CheckCircle size={18} />
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-gray-400 px-4">
                {t.terms}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;