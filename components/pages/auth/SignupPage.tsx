import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, X } from 'lucide-react';
import { Language } from '../../../types';
import { translations } from '../../../translations';
import { useAuth } from '../../../contexts/AuthContext';
import { SelectedPlan } from '../../../types';

interface SignupPageProps {
  lang: Language;
  role?: 'CONSUMER' | 'PARTNER';
  onSuccess: (role: 'CONSUMER' | 'PARTNER') => void;
  onBack?: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ lang, role: initialRole, onSuccess, onBack }) => {
  // Determine role from localStorage or prop (pricing page sets this)
  const savedRole = localStorage.getItem('signupRole') as 'CONSUMER' | 'PARTNER' | null;
  const [userRole, setUserRole] = useState<'CONSUMER' | 'PARTNER'>(initialRole || savedRole || 'CONSUMER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();
  const t = translations[lang].auth;

  // If coming from pricing, force partner role
  // Otherwise, respect the initialRole prop
  useEffect(() => {
    if (initialRole) {
      setUserRole(initialRole);
    } else {
      const savedPlan = localStorage.getItem('selectedPlan');
      const savedRole = localStorage.getItem('signupRole');
      if (savedPlan || savedRole === 'PARTNER') {
        setUserRole('PARTNER');
      }
    }
  }, [initialRole]);

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
        // Partner signup - no company name, just email/password/name
        await register(email, password, fullName || undefined, undefined, undefined, 'PARTNER');
      } else {
        // Consumer signup - split full name if provided
        const nameParts = fullName ? fullName.trim().split(' ') : [];
        const firstName = nameParts[0] || undefined;
        const lastName = nameParts.slice(1).join(' ') || undefined;
        await register(email, password, undefined, firstName, lastName, 'CONSUMER');
      }
      
      // Clear signup role from localStorage
      localStorage.removeItem('signupRole');
      
      // Redirect immediately - no success page
      onSuccess(userRole);
    } catch (err: any) {
      if (err.message && !err.message.includes('API_NOT_AVAILABLE')) {
        setError(err.message || 'An error occurred');
      } else {
        // API not available, but auth should still work with mock
        localStorage.removeItem('signupRole');
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

        {/* Role Display (if coming from pricing, show partner) */}
        {userRole === 'PARTNER' && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-700 text-center">
              {lang === 'da' 
                ? 'Opretter partner konto' 
                : 'Creating partner account'}
            </p>
          </div>
        )}

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
                {t.submitReg}
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-gray-400 px-4">
            {t.terms}
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
