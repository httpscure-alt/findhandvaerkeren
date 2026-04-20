import React, { useState } from 'react';
import { X, Loader2, CheckCircle, Building2, User, Mail, Phone, Lock, MessageSquare } from 'lucide-react';
import { ModalState, Language, Company } from '../types';
import { translations } from '../translations';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useToast } from '../hooks/useToast';

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
  const toast = useToast();
  const isDa = lang === 'da';

  const startOAuth = async (provider: 'google' | 'apple') => {
    if (!supabase || !isSupabaseConfigured) {
      toast.error(isDa ? 'Supabase er ikke konfigureret (mangler env vars)' : 'Supabase is not configured (missing env vars)');
      return;
    }
    const redirectTo = `${window.location.origin}/auth/supabase/callback?role=${userRole}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) toast.error(error.message);
  };

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

              {(type === ModalState.LOGIN || type === ModalState.REGISTER_FREE) && (
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        {lang === 'da' ? 'eller' : 'or'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => startOAuth('google')}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-semibold text-sm text-[#1D1D1F]"
                    >
                      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.66 32.657 29.215 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.043 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 19.008 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.043 6.053 29.268 4 24 4c-7.682 0-14.35 4.337-17.694 10.691z"/>
                        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.19-5.238C29.179 35.091 26.715 36 24 36c-5.192 0-9.62-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.01 12.01 0 0 1-4.084 5.565l.002-.001 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                      </svg>
                      <span>{isDa ? 'Fortsæt med Google' : 'Continue with Google'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => startOAuth('apple')}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-semibold text-sm text-[#1D1D1F]"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                        <path d="M16.365 1.43c0 1.14-.41 2.21-1.23 3.2-.99 1.18-2.19 1.87-3.49 1.76-.16-1.1.45-2.26 1.38-3.31.51-.59 1.17-1.09 1.91-1.44.73-.35 1.44-.54 2.07-.58.23.12.36.25.36.37ZM21.75 17.26c-.28.66-.62 1.26-1.02 1.8-.55.77-1 1.3-1.35 1.61-.55.51-1.14.77-1.78.78-.46 0-1.01-.13-1.66-.39-.66-.26-1.27-.39-1.82-.39-.58 0-1.21.13-1.9.39-.69.26-1.25.4-1.68.41-.61.03-1.22-.24-1.82-.81-.39-.34-.86-.9-1.42-1.68-.6-.82-1.09-1.78-1.49-2.87-.43-1.18-.65-2.32-.65-3.43 0-1.27.27-2.36.82-3.28.43-.73 1.01-1.3 1.73-1.72.72-.42 1.49-.64 2.32-.66.46 0 1.06.14 1.81.42.74.28 1.22.42 1.43.42.16 0 .68-.16 1.56-.48.83-.3 1.53-.43 2.11-.39 1.56.13 2.73.74 3.52 1.84-1.39.84-2.08 2.01-2.07 3.52.01 1.17.44 2.14 1.28 2.92.38.36.81.64 1.28.83-.1.29-.2.56-.32.8Z"/>
                      </svg>
                      <span>{isDa ? 'Fortsæt med Apple' : 'Continue with Apple'}</span>
                    </button>
                  </div>
                </div>
              )}

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