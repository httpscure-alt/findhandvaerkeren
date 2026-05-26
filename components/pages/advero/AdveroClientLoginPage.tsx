import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Loader2, Mail } from 'lucide-react';
import { useMarketplace } from '../../../contexts/MarketplaceContext';
import { translations } from '../../../translations';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/useToast';
import { supabase, isSupabaseConfigured } from '../../../services/supabase';
import AdveroClientAuthLayout from './AdveroClientAuthLayout';
import { ADVERO_DASHBOARD_PATH, hasStoredAdveroSession } from '../../../lib/adveroSession';
import { api } from '../../../services/api';
import './advero-ds.css';

/** Where login lands when no `?next=` — checkout flow passes its own `next`. */
const LOGIN_DEFAULT = ADVERO_DASHBOARD_PATH;

function safeNext(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}

const AdveroClientLoginPage: React.FC = () => {
  const { lang } = useMarketplace();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { login, isAuthenticated } = useAuth();

  const next = safeNext(searchParams.get('next'));
  const afterLogin = next ?? LOGIN_DEFAULT;

  useEffect(() => {
    if (isAuthenticated || hasStoredAdveroSession()) {
      navigate(afterLogin, { replace: true });
    }
  }, [isAuthenticated, afterLogin, navigate]);
  const backHref = next ?? LOGIN_DEFAULT;
  const signupTo = `/advero/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDa = lang === 'da';
  const t = translations[lang].auth;

  const cardTitle = useMemo(
    () =>
      showPasswordStep
        ? isDa
          ? 'Log ind'
          : 'Log in'
        : isDa
          ? 'Velkommen tilbage'
          : 'Welcome back',
    [isDa, showPasswordStep]
  );

  const cardSub = useMemo(
    () =>
      showPasswordStep
        ? isDa
          ? 'Indtast din adgangskode'
          : 'Enter your password'
        : isDa
          ? 'Brug din e-mail for at fortsætte til betaling.'
          : 'Use your email to continue to checkout.',
    [isDa, showPasswordStep]
  );

  const startOAuth = async (provider: 'google' | 'apple') => {
    if (!supabase || !isSupabaseConfigured) {
      toast.error(isDa ? 'Supabase er ikke konfigureret (mangler env vars)' : 'Supabase is not configured (missing env vars)');
      return;
    }
    const cb = new URL(`${window.location.origin}/auth/supabase/callback`);
    cb.searchParams.set('next', next ?? LOGIN_DEFAULT);
    const { error: oErr } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: cb.toString() },
    });
    if (oErr) toast.error(oErr.message);
  };

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError(isDa ? 'Indtast en gyldig e-mail' : 'Enter a valid email');
      return;
    }
    setShowPasswordStep(true);
    setError(null);
  };

  const goAfterLogin = () => {
    window.location.assign(afterLogin);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      const lastAuditId = sessionStorage.getItem('advero.lastAuditId');
      if (lastAuditId) {
        api.claimAdveroAudit(lastAuditId).catch(() => {});
      }
      toast.success(isDa ? 'Logget ind med succes!' : 'Logged in successfully!');
      goAfterLogin();
    } catch (err: any) {
      if (hasStoredAdveroSession()) {
        toast.success(isDa ? 'Velkommen tilbage!' : 'Welcome back!');
        goAfterLogin();
        return;
      }
      const msg =
        err.message === 'API_NOT_AVAILABLE'
          ? isDa
            ? 'Backend svarer ikke. Start `npm run dev:all` eller fjern VITE_API_URL for mock-login.'
            : 'Backend is unavailable. Run `npm run dev:all` or remove VITE_API_URL for mock login.'
          : err.message || (isDa ? 'Login mislykkedes' : 'Login failed');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-800/12';

  return (
    <AdveroClientAuthLayout backHref={backHref}>
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_32px_64px_-24px_rgba(15,23,42,0.28)]">
          <div
            className="pointer-events-none absolute right-0 top-0 h-24 w-[55%] opacity-90"
            aria-hidden
            style={{
              background:
                'radial-gradient(ellipse 90% 100% at 100% 0%, rgba(56, 189, 248, 0.18), transparent 58%)',
            }}
          />
          <div className="relative p-8">
            <div className="mb-8 text-center">
              <img
                src="/brand/advero-logo.png"
                alt=""
                width={320}
                height={80}
                decoding="async"
                className="mx-auto mb-4 h-8 w-auto max-w-[160px] object-contain object-center"
              />
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{cardTitle}</h1>
              <p className="mt-1 text-sm text-slate-600">{cardSub}</p>
            </div>

            {error ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
            ) : null}

            {!showPasswordStep ? (
              <form onSubmit={handleEmailContinue} className="space-y-4">
                <div className="space-y-1">
                  <label className="mono-label ml-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t.email}
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" aria-hidden />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder="name@company.com"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <button type="submit" className="advero-btn-slate-solid mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em]">
                  {isDa ? 'Fortsæt' : 'Continue'}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-slate-500">{isDa ? 'eller' : 'or'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => startOAuth('google')}
                  className="advero-btn-ghost-on-light flex w-full items-center justify-center gap-3 py-3 text-[13px]"
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
                  <span>{isDa ? 'Fortsæt med Google' : 'Continue with Google'}</span>
                </button>

                <div className="mt-6 text-center">
                  <Link to={signupTo} className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline">
                    {isDa ? 'Har du ikke en konto? Opret konto' : "Don't have an account? Sign up"}
                  </Link>
                </div>
                <div className="mt-3 text-center">
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline"
                  >
                    {isDa ? 'Glemt adgangskode?' : 'Forgot password?'}
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="mono-label ml-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t.password}
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="advero-btn-slate-solid mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      {isDa ? 'Logger ind…' : 'Signing in…'}
                    </>
                  ) : (
                    <>
                      {isDa ? 'Log ind' : 'Log in'}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </>
                  )}
                </button>

                <div className="mt-3 text-center">
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline"
                  >
                    {isDa ? 'Glemt adgangskode?' : 'Forgot password?'}
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordStep(false);
                    setPassword('');
                  }}
                  className="mt-2 w-full text-sm text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
                >
                  {isDa ? '← Tilbage til e-mail' : '← Back to email'}
                </button>

                <div className="mt-6 text-center">
                  <Link to={signupTo} className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline">
                    {isDa ? 'Har du ikke en konto? Opret konto' : "Don't have an account? Sign up"}
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </AdveroClientAuthLayout>
  );
};

export default AdveroClientLoginPage;
