import React from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { Language } from '../../../types';
import { useToast } from '../../../hooks/useToast';
import { api } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

export default function ForgotPasswordPage({ lang }: { lang: Language }) {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const isDa = lang === 'da';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.forgotPassword(email);
      toast.success(isDa ? 'Hvis e-mailen findes, har vi sendt et link.' : 'If the email exists, we sent a link.');
      navigate('/auth', { replace: true });
    } catch (err: any) {
      toast.error(err?.message || (isDa ? 'Kunne ikke sende reset-link' : 'Failed to send reset link'));
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
              {isDa ? 'Glemt adgangskode' : 'Forgot password'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isDa ? 'Vi sender et link til at nulstille adgangskoden.' : 'We’ll email you a reset link.'}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
                {isDa ? 'E-mail' : 'Email'}
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
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#1D1D1F] text-white font-medium shadow-lg hover:bg-black transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isDa ? 'Send link' : 'Send link'}
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

