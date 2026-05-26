import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Language } from '../../../types';
import { translations } from '../../../translations';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/useToast';
import { supabase, isSupabaseConfigured } from '../../../services/supabase';

interface SignupPageProps {
  lang: Language;
  role?: 'CONSUMER' | 'PARTNER';
  /** When set, account type is fixed (e.g. Advero client checkout = consumer). */
  forcedRole?: 'CONSUMER' | 'PARTNER';
  /** Use Advero wordmark + slate CTAs (embedded in Advero journey). */
  brandVariant?: 'platform' | 'advero';
  /** "Already have an account" target (default `/auth`). */
  alternateAuthHref?: string;
  onSuccess: (role: 'CONSUMER' | 'PARTNER') => void;
  onBack?: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({
  lang,
  role: initialRole,
  forcedRole,
  brandVariant = 'platform',
  alternateAuthHref,
  onSuccess,
  onBack,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const roleParam = searchParams.get('role') as 'CONSUMER' | 'PARTNER' | null;

  // Determine role from URL, prop, or localStorage
  const savedRole =
    typeof localStorage !== 'undefined' ? (localStorage.getItem('signupRole') as 'CONSUMER' | 'PARTNER' | null) : null;
  const [userRole, setUserRole] = useState<'CONSUMER' | 'PARTNER'>(() => {
    if (forcedRole) return forcedRole;
    return roleParam || initialRole || savedRole || 'CONSUMER';
  });
  const [roleLockedFromUrlOrProp] = useState<boolean>(() => !!roleParam || !!initialRole || !!forcedRole);
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
    const cb = new URL(`${window.location.origin}/auth/supabase/callback`);
    cb.searchParams.set('role', userRole);
    const nextParam = searchParams.get('next');
    if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')) {
      cb.searchParams.set('next', nextParam);
    }
    const redirectTo = cb.toString();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (forcedRole) {
      setUserRole(forcedRole);
      return;
    }
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
  }, [forcedRole, initialRole, roleParam, isAuthenticated, user?.role, location.search, navigate]);

  const setRole = (role: 'CONSUMER' | 'PARTNER') => {
    if (forcedRole || roleLockedFromUrlOrProp) return;
    setUserRole(role);
    localStorage.setItem('signupRole', role);
  };

  const isAdvero = brandVariant === 'advero';
  const loginHref = alternateAuthHref ?? '/auth';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const emailBrand = isAdvero ? 'advero' : 'platform';

    try {
      if (userRole === 'PARTNER') {
        const response: any = await register(
          email,
          password,
          fullName || undefined,
          undefined,
          undefined,
          'PARTNER',
          emailBrand
        );
        if (response && response.requiresVerification) {
          if (isAdvero) localStorage.setItem('advero.emailBrand', 'advero');
          toast.info(lang === 'da' ? 'Tjek din e-mail for en bekræftelseskode' : 'Please check your email for a verification code');
          window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
          return;
        }
      } else {
        const response: any = await register(
          email,
          password,
          fullName || undefined,
          undefined,
          undefined,
          'CONSUMER',
          emailBrand
        );
        if (response && response.requiresVerification) {
          if (isAdvero) localStorage.setItem('advero.emailBrand', 'advero');
          toast.info(lang === 'da' ? 'Tjek din e-mail for en bekræftelseskode' : 'Please check your email for a verification code');
          window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
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

  const fieldClass = isAdvero
    ? 'w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-800/12'
    : 'w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-nexus-accent/50 focus:border-nexus-accent outline-none transition-all';

  const outerWrap = isAdvero ? 'w-full' : 'max-w-md mx-auto px-4 py-20';
  const cardWrap = isAdvero
    ? 'relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_32px_64px_-24px_rgba(15,23,42,0.28)] p-8'
    : 'bg-white rounded-3xl shadow-xl border border-gray-100 p-8';

  return (
    <div className={`${outerWrap} ${onBack ? 'relative' : ''}`}>
      <div className={cardWrap}>
        {isAdvero ? (
          <div
            className="pointer-events-none absolute right-0 top-0 h-24 w-[55%] opacity-90"
            aria-hidden
            style={{
              background:
                'radial-gradient(ellipse 90% 100% at 100% 0%, rgba(56, 189, 248, 0.18), transparent 58%)',
            }}
          />
        ) : null}
        <div className={isAdvero ? 'relative' : ''}>
          {/* Header */}
          <div className={`mb-8 text-center ${isAdvero ? '' : ''}`}>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className={`p-2 transition-colors ${isAdvero ? 'absolute left-0 top-0 text-slate-400 hover:text-slate-700' : 'absolute left-4 top-4 text-gray-400 hover:text-gray-600'}`}
              >
                <X size={20} />
              </button>
            )}
            {isAdvero ? (
              <img
                src="/brand/advero-logo.png"
                alt=""
                width={320}
                height={80}
                decoding="async"
                className="mx-auto mb-4 h-8 w-auto max-w-[160px] object-contain object-center"
              />
            ) : (
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1D1D1F] shadow-lg">
                <span className="text-xl font-bold text-white">F</span>
              </div>
            )}
            <h2 className={`text-2xl font-bold ${isAdvero ? 'tracking-tight text-slate-900' : 'text-[#1D1D1F]'}`}>
              {lang === 'da' ? 'Opret konto' : 'Create account'}
            </h2>
            <p className={`mt-1 text-sm ${isAdvero ? 'text-slate-600' : 'text-gray-500'}`}>
              {isAdvero
                ? isDa
                  ? 'Fortsæt til betaling og opsætning hos Advero.'
                  : 'Continue to checkout and setup with Advero.'
                : isDa
                  ? 'Start din rejse i dag'
                  : 'Start your journey today'}
            </p>
          </div>

          {/* Account type selector */}
          {!forcedRole ? (
            <div className="mb-6">
              <label className="ml-1 text-xs font-semibold uppercase text-gray-500">
                {isDa ? 'Kontotype' : 'Account type'}
              </label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('CONSUMER')}
                  disabled={roleLockedFromUrlOrProp}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    userRole === 'CONSUMER'
                      ? 'border-[#1D1D1F] bg-gray-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-sm font-bold text-[#1D1D1F]">{isDa ? 'Kunde' : 'Customer'}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {isDa ? 'Find og kontakt håndværkere' : 'Find and contact craftsmen'}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('PARTNER')}
                  disabled={roleLockedFromUrlOrProp}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    userRole === 'PARTNER'
                      ? 'border-[#1D1D1F] bg-gray-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-sm font-bold text-[#1D1D1F]">{isDa ? 'Partner' : 'Partner'}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {isDa ? 'Bliv fundet + køb vækst' : 'Get found + buy growth'}
                  </div>
                </button>
              </div>
              {roleLockedFromUrlOrProp && !forcedRole ? (
                <p className="mt-2 text-xs text-gray-400">
                  {isDa
                    ? 'Kontotypen er valgt fra din tidligere handling og kan ikke ændres her.'
                    : 'Account type is pre-selected from your previous action and can’t be changed here.'}
                </p>
              ) : null}
            </div>
          ) : null}

          {/* Social signup */}
          <div className="mb-6">
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => startOAuth('google')}
                className={
                  isAdvero
                    ? 'advero-btn-ghost-on-light flex w-full items-center justify-center gap-3 py-3 text-[13px]'
                    : 'flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#1D1D1F] transition-colors hover:bg-gray-50'
                }
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303C33.66 32.657 29.215 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.043 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306 14.691l6.571 4.819C14.655 16.108 19.008 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.043 6.053 29.268 4 24 4c-7.682 0-14.35 4.337-17.694 10.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.19-5.238C29.179 35.091 26.715 36 24 36c-5.192 0-9.62-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303a12.01 12.01 0 0 1-4.084 5.565l.002-.001 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                  />
                </svg>
                {isDa ? 'Fortsæt med Google' : 'Continue with Google'}
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isAdvero ? 'border-slate-200' : 'border-gray-200'}`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${isAdvero ? 'bg-white text-slate-500' : 'bg-white text-gray-500'}`}>
                  {isDa ? 'eller' : 'or'}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div
              className={`mb-4 rounded-xl border p-3 text-sm ${isAdvero ? 'border-red-200 bg-red-50 text-red-800' : 'border-red-200 bg-red-50 text-red-700'}`}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label
                className={`ml-1 text-xs font-semibold uppercase ${isAdvero ? 'mono-label tracking-[0.14em] text-slate-500' : 'text-gray-500'}`}
              >
                {lang === 'da' ? 'Fulde navn' : 'Full name'} {lang === 'da' ? '(valgfrit)' : '(optional)'}
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-3 ${isAdvero ? 'text-slate-400' : 'text-gray-400'}`} size={18} />
                <input
                  name="fullName"
                  type="text"
                  className={fieldClass}
                  placeholder={lang === 'da' ? 'F.eks. John Doe' : 'Ex. John Doe'}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                className={`ml-1 text-xs font-semibold uppercase ${isAdvero ? 'mono-label tracking-[0.14em] text-slate-500' : 'text-gray-500'}`}
              >
                {t.email}
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-3 ${isAdvero ? 'text-slate-400' : 'text-gray-400'}`} size={18} />
                <input
                  name="email"
                  required
                  type="email"
                  className={fieldClass}
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                className={`ml-1 text-xs font-semibold uppercase ${isAdvero ? 'mono-label tracking-[0.14em] text-slate-500' : 'text-gray-500'}`}
              >
                {t.password}
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-3 ${isAdvero ? 'text-slate-400' : 'text-gray-400'}`} size={18} />
                <input
                  name="password"
                  required
                  type="password"
                  minLength={6}
                  className={fieldClass}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={
                isAdvero
                  ? 'advero-btn-slate-solid mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] disabled:opacity-50'
                  : 'mt-4 flex w-full transform items-center justify-center gap-2 rounded-xl bg-[#1D1D1F] py-3.5 font-medium text-white shadow-lg transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50'
              }
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
              <Link
                to={loginHref}
                className={`mt-2 inline-block text-sm underline-offset-4 ${isAdvero ? 'font-medium text-slate-600 hover:text-slate-900 hover:underline' : 'text-gray-600 transition-colors hover:text-nexus-accent'}`}
              >
                {isDa ? 'Har du allerede en konto? Log ind' : 'Already have an account? Log in'}
              </Link>
            </div>

            <p className={`px-4 text-center text-[10px] ${isAdvero ? 'text-slate-400' : 'text-gray-400'}`}>{t.terms}</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;







