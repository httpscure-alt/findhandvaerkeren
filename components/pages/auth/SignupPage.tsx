import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, X } from 'lucide-react';
import { Language } from '../../../types';
import { translations } from '../../../translations';
import { useAuth } from '../../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { SelectedPlan } from '../../../types';
import { useToast } from '../../../hooks/useToast';
import { supabase, isSupabaseConfigured } from '../../../services/supabase';

interface SignupPageProps {
  lang: Language;
  role?: 'CONSUMER' | 'PARTNER';
  onSuccess: (role: 'CONSUMER' | 'PARTNER') => void;
  onBack?: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ lang, role: initialRole, onSuccess, onBack }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const roleParam = searchParams.get('role') as 'CONSUMER' | 'PARTNER' | null;

  // Determine role from URL, prop, or localStorage
  const savedRole = localStorage.getItem('signupRole') as 'CONSUMER' | 'PARTNER' | null;
  const [userRole, setUserRole] = useState<'CONSUMER' | 'PARTNER'>(roleParam || initialRole || savedRole || 'CONSUMER');
  const [roleLockedFromUrlOrProp] = useState<boolean>(!!roleParam || !!initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, isAuthenticated, user } = useAuth();
  const toast = useToast();
  const t = (translations[lang] as any).auth;
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
    if (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    // If already authenticated as a partner, redirect to dashboard/growth
    if (isAuthenticated && user?.role === 'PARTNER') {
      const services = searchParams.get('services');
      if (services) {
        localStorage.setItem('selectedGrowthServices', services);
      }
      navigate('/dashboard/growth');
      return;
    }

    const services = searchParams.get('services');
    if (services) {
      localStorage.setItem('selectedGrowthServices', services);
    }

    // IMPORTANT:
    // Only force-set role when it came from URL (?role=) or a parent prop (initialRole).
    // Otherwise let the user toggle freely (account-type selector).
    if (roleParam) {
      setUserRole(roleParam);
      return;
    }
    if (initialRole) {
      setUserRole(initialRole);
      return;
    }
  }, [initialRole, roleParam, isAuthenticated, user?.role]);

  const setRole = (role: 'CONSUMER' | 'PARTNER') => {
    if (roleLockedFromUrlOrProp) return;
    setUserRole(role);
    localStorage.setItem('signupRole', role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    try {
      if (userRole === 'PARTNER') {
        // Partner signup
        const response: any = await register(email, password, fullName || undefined, undefined, undefined, 'PARTNER');
        if (response && response.requiresVerification) {
          toast.info(lang === 'da' ? 'Tjek din e-mail for en bekræftelseskode' : 'Please check your email for a verification code');
          window.location.href = `/verify-email?email=${email}`;
          return;
        }
      } else {
        // Consumer signup
        const response: any = await register(email, password, fullName || undefined, undefined, undefined, 'CONSUMER');
        if (response && response.requiresVerification) {
          toast.info(lang === 'da' ? 'Tjek din e-mail for en bekræftelseskode' : 'Please check your email for a verification code');
          window.location.href = `/verify-email?email=${email}`;
          return;
        }
      }

      // Clear signup role from localStorage
      localStorage.removeItem('signupRole');
      toast.success(lang === 'da' ? 'Konto oprettet med succes!' : 'Account created successfully!');

      // Redirect immediately - no success page
      onSuccess(userRole);
    } catch (err: any) {
      if (err.message && !err.message.includes('API_NOT_AVAILABLE')) {
        const msg = err.message || (lang === 'da' ? 'Der skete en fejl' : 'An error occurred');
        setError(msg);
        toast.error(msg);
      } else {
        // API not available, but auth should still work with mock
        localStorage.removeItem('signupRole');
        toast.success(lang === 'da' ? 'Velkommen! Din konto er klar.' : 'Welcome! Your account is ready.');
        onSuccess(userRole);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute left-4 top-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          )}
          <div className="w-12 h-12 bg-[#1D1D1F] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1D1D1F]">
            {lang === 'da' ? 'Opret konto' : 'Create Account'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {lang === 'da'
              ? 'Start din rejse i dag'
              : 'Start your journey today'}
          </p>
        </div>

        {/* Account type selector */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
            {isDa ? 'Kontotype' : 'Account type'}
          </label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('CONSUMER')}
              disabled={roleLockedFromUrlOrProp}
              className={`p-4 rounded-2xl border text-left transition-all ${
                userRole === 'CONSUMER'
                  ? 'border-[#1D1D1F] bg-gray-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="text-sm font-bold text-[#1D1D1F]">
                {isDa ? 'Kunde' : 'Customer'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {isDa ? 'Find og kontakt håndværkere' : 'Find and contact craftsmen'}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole('PARTNER')}
              disabled={roleLockedFromUrlOrProp}
              className={`p-4 rounded-2xl border text-left transition-all ${
                userRole === 'PARTNER'
                  ? 'border-[#1D1D1F] bg-gray-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="text-sm font-bold text-[#1D1D1F]">
                {isDa ? 'Partner' : 'Partner'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {isDa ? 'Bliv fundet + køb vækst' : 'Get found + buy growth'}
              </div>
            </button>
          </div>
          {roleLockedFromUrlOrProp && (
            <p className="text-xs text-gray-400 mt-2">
              {isDa
                ? 'Kontotypen er valgt fra din tidligere handling og kan ikke ændres her.'
                : 'Account type is pre-selected from your previous action and can’t be changed here.'}
            </p>
          )}
        </div>

        {/* Social signup */}
        <div className="mb-6">
          <div className="grid grid-cols-1 gap-3">
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
              {isDa ? 'Fortsæt med Google' : 'Continue with Google'}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {isDa ? 'eller' : 'or'}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (Optional) - for both Consumer and Partner */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
              {lang === 'da' ? 'Fulde navn' : 'Full Name'} {lang === 'da' ? '(valgfrit)' : '(optional)'}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                name="fullName"
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-nexus-accent/50 focus:border-nexus-accent outline-none transition-all"
                placeholder={lang === 'da' ? 'F.eks. John Doe' : 'Ex. John Doe'}
              />
            </div>
          </div>

          {/* Email */}
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

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">{t.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                name="password"
                required
                type="password"
                minLength={6}
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-nexus-accent/50 focus:border-nexus-accent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-[#1D1D1F] text-white font-medium shadow-lg hover:bg-black transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                {lang === 'da' ? 'Opretter...' : 'Creating...'}
              </>
            ) : (
              <>
                {isDa ? 'Opret konto' : 'Create account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="text-sm text-gray-600 hover:text-nexus-accent transition-colors mt-2"
            >
              {isDa ? 'Har du allerede en konto? Log ind' : 'Already have an account? Log in'}
            </button>
          </div>

          <p className="text-[10px] text-center text-gray-400 px-4">
            {t.terms}
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;







