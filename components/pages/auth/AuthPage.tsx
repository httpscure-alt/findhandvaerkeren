import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, Loader2, X } from 'lucide-react';
import { Language } from '../../../types';
import { translations } from '../../../translations';
import { useAuth } from '../../../contexts/AuthContext';
import SignupPage from './SignupPage';

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
  const t = translations[lang].auth;

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
      onSuccess?.();
    } catch (err: any) {
      if (err.message && !err.message.includes('API_NOT_AVAILABLE')) {
        setError(err.message || 'Login failed');
      } else {
        // API not available, but auth should still work with mock
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

              {/* Social Logins - Hidden until OAuth is configured */}
              {/* Uncomment when Google/Facebook OAuth is set up
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

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">...</svg>
                    <span className="text-sm font-medium text-gray-700">Google</span>
                  </button>
                  <button type="button" onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">...</svg>
                    <span className="text-sm font-medium text-gray-700">Facebook</span>
                  </button>
                </div>
              </div>
              */}

              {/* Link to Sign Up Selection */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToSignup) {
                      onNavigateToSignup();
                    }
                  }}
                  className="text-sm text-gray-600 hover:text-nexus-accent transition-colors"
                >
                  {lang === 'da' ? 'Har du ikke en konto? Opret konto' : "Don't have an account? Sign Up"}
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







