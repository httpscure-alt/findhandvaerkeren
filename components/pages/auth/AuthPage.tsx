import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, Loader2, X } from 'lucide-react';
import { Language } from '../../../types';
import { translations } from '../../../translations';
import { useAuth } from '../../../contexts/AuthContext';
import SignupPage from './SignupPage';
import { useToast } from '../../../hooks/useToast';
import { supabase, isSupabaseConfigured } from '../../../services/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthPageProps {
  lang: Language;
  initialMode?: 'login' | 'signup';
  onSuccess?: () => void;
  onBack?: () => void;
  onNavigateToSignup?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ lang, initialMode, onSuccess, onBack, onNavigateToSignup }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const t = translations[lang].auth;
  const isDa = lang === 'da';

  const startOAuth = async (provider: 'google' | 'apple') => {
    if (!supabase || !isSupabaseConfigured) {
      toast.error(isDa ? 'Supabase er ikke konfigureret (mangler env vars)' : 'Supabase is not configured (missing env vars)');
      return;
    }
    const redirectTo = `${window.location.origin}/auth/supabase/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) toast.error(error.message);
  };

  // Check URL params for mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('mode');
    if (urlMode === 'signup') {
      setMode('signup');
    }
  }, []);

  // Also check on window location change (for mobile drawer navigation)
  useEffect(() => {
    const checkMode = () => {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      if (urlMode === 'signup' && mode !== 'signup') {
        setMode('signup');
      } else if (urlMode !== 'signup' && mode === 'signup' && !initialMode) {
        setMode('login');
      }
    };

    // Check immediately
    checkMode();

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', checkMode);

    return () => window.removeEventListener('popstate', checkMode);
  }, [mode, initialMode]);

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError(lang === 'da' ? 'Indtast en gyldig e-mail' : 'Enter a valid email');
      return;
    }
    setShowPasswordStep(true);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      toast.success(lang === 'da' ? 'Logget ind med succes!' : 'Logged in successfully!');
      onSuccess?.();
    } catch (err: any) {
      if (err.message && !err.message.includes('API_NOT_AVAILABLE')) {
        const msg = err.message || (lang === 'da' ? 'Login mislykkedes' : 'Login failed');
        setError(msg);
        toast.error(msg);
      } else {
        // API not available, but auth should still work with mock
        toast.success(lang === 'da' ? 'Velkommen tilbage!' : 'Welcome back!');
        onSuccess?.();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // Placeholder for social login
    console.log(`${provider} login clicked`);
    // In a real app, this would redirect to OAuth provider
  };

  // If in signup mode, show the SignupPage component
  if (mode === 'signup') {
    return (
      <SignupPage
        lang={lang}
        onSuccess={(userRole) => {
          onSuccess?.();
        }}
        onBack={() => {
          if (onBack) {
            onBack();
          } else {
            setMode('login');
            setShowPasswordStep(false);
            setEmail('');
            setPassword('');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full max-w-md">
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
            <span className="text-sm">{lang === 'da' ? 'Tilbage' : 'Back'}</span>
          </button>
        )}

        {/* Main Auth Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#1D1D1F] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <h2 className="text-2xl font-bold text-[#1D1D1F]">
              {showPasswordStep
                ? (lang === 'da' ? 'Log ind' : 'Log In')
                : (lang === 'da' ? 'Velkommen tilbage' : 'Welcome back')
              }
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {showPasswordStep
                ? (lang === 'da' ? 'Indtast din adgangskode' : 'Enter your password')
                : (lang === 'da' ? 'Indtast din e-mail for at fortsætte' : 'Enter your email to continue')
              }
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          {!showPasswordStep ? (
            // Email Step
            <form onSubmit={handleEmailContinue} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-nexus-accent/50 focus:border-nexus-accent outline-none transition-all"
                    placeholder="name@company.com"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#1D1D1F] text-white font-medium shadow-lg hover:bg-black transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
              >
                {lang === 'da' ? 'Fortsæt' : 'Continue'}
                <ArrowRight size={18} />
              </button>

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

                <div className="mt-6 grid grid-cols-1 gap-3">
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

              {/* Link to Sign Up Selection */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToSignup) {
                      onNavigateToSignup();
                    } else {
                      setMode('signup');
                    }
                  }}
                  className="text-sm text-gray-600 hover:text-nexus-accent transition-colors"
                >
                  {lang === 'da' ? 'Har du ikke en konto? Opret konto' : "Don't have an account? Sign Up"}
                </button>
              </div>

              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/auth/forgot-password')}
                  className="text-sm text-gray-600 hover:text-nexus-accent transition-colors"
                >
                  {isDa ? 'Glemt adgangskode?' : 'Forgot password?'}
                </button>
              </div>
            </form>
          ) : (
            // Password Step
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
                  {t.password}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-nexus-accent/50 focus:border-nexus-accent outline-none transition-all"
                    placeholder="••••••••"
                    autoFocus
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
                    {lang === 'da' ? 'Logger ind...' : 'Logging in...'}
                  </>
                ) : (
                  <>
                    {lang === 'da' ? 'Log ind' : 'Log In'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/auth/forgot-password')}
                  className="text-sm text-gray-600 hover:text-nexus-accent transition-colors"
                >
                  {isDa ? 'Glemt adgangskode?' : 'Forgot password?'}
                </button>
              </div>

              {/* Back to email */}
              <button
                type="button"
                onClick={() => {
                  setShowPasswordStep(false);
                  setPassword('');
                }}
                className="w-full text-sm text-gray-600 hover:text-nexus-accent transition-colors mt-2"
              >
                {lang === 'da' ? '← Tilbage til e-mail' : '← Back to email'}
              </button>

              {/* Link to Sign Up Selection */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToSignup) {
                      onNavigateToSignup();
                    } else {
                      setMode('signup');
                    }
                  }}
                  className="text-sm text-gray-600 hover:text-nexus-accent transition-colors"
                >
                  {lang === 'da' ? 'Har du ikke en konto? Opret konto' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;







