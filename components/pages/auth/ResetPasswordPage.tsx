import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { Language } from '../../../types';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { api } from '../../../services/api';

export default function ResetPasswordPage({ lang }: { lang: Language }) {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const isDa = lang === 'da';

  const qs = new URLSearchParams(location.search);
  const token = qs.get('token') || '';
  const email = qs.get('email') || '';

  const [newPassword, setNewPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) {
      toast.error(isDa ? 'Ugyldigt link' : 'Invalid link');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword({ email, token, newPassword });
      toast.success(isDa ? 'Adgangskode opdateret' : 'Password updated');
      navigate('/auth', { replace: true });
    } catch (err: any) {
      toast.error(err?.message || (isDa ? 'Kunne ikke nulstille adgangskode' : 'Failed to reset password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#1D1D1F] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <h2 className="text-2xl font-bold text-[#1D1D1F]">
              {isDa ? 'Nulstil adgangskode' : 'Reset password'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {email ? email : (isDa ? 'Indtast ny adgangskode' : 'Enter a new password')}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
                {isDa ? 'Ny adgangskode' : 'New password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-nexus-accent/50 focus:border-nexus-accent outline-none transition-all"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#1D1D1F] text-white font-medium shadow-lg hover:bg-black transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isDa ? 'Opdater adgangskode' : 'Update password'}
              <ArrowRight size={18} />
            </button>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="text-sm text-gray-600 hover:text-nexus-accent transition-colors"
              >
                {isDa ? 'Tilbage til login' : 'Back to login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

