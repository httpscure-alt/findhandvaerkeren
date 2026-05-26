import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAdveroLang } from '../../../lib/adveroLocale';
import { useToast } from '../../../hooks/useToast';
import { api } from '../../../services/api';
import { safeAdveroNext } from '../../../lib/adveroSession';
import AdveroClientAuthLayout from './AdveroClientAuthLayout';
import './advero-ds.css';

const DEFAULT_NEXT = '/advero/get-started?step=3';

const AdveroVerifyEmailPage: React.FC = () => {
  const { isDa } = useAdveroLang();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const email = (searchParams.get('email') || '').trim();
  const next = safeAdveroNext(searchParams.get('next')) ?? DEFAULT_NEXT;
  const backHref = next;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finishWithToken = (token: string, user: { id: string; email: string; name?: string | null; role: string }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    toast.success(isDa ? 'E-mail bekræftet — du er klar.' : 'Email verified — you are all set.');
    navigate(next, { replace: true });
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(isDa ? 'Mangler e-mail. Gå tilbage og opret konto igen.' : 'Missing email. Go back and sign up again.');
      return;
    }
    const code = otp.replace(/\D/g, '').slice(0, 6);
    if (code.length < 6) {
      setError(isDa ? 'Indtast den 6-cifrede kode fra e-mailen.' : 'Enter the 6-digit code from your email.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { user, token } = await api.verifyOtp(email, code, 'advero');
      if (token && user) {
        finishWithToken(token, user);
        return;
      }
      setError(isDa ? 'Bekræftelse mislykkedes.' : 'Verification failed.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : isDa ? 'Ugyldig eller udløbet kode.' : 'Invalid or expired code.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await api.resendOtp(email, 'advero');
      toast.success(isDa ? 'Ny kode sendt til din e-mail.' : 'A new code was sent to your email.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : isDa ? 'Kunne ikke sende kode igen.' : 'Could not resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AdveroClientAuthLayout backHref={backHref}>
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-8 shadow-[0_32px_64px_-24px_rgba(15,23,42,0.28)]">
          <div
            className="pointer-events-none absolute right-0 top-0 h-24 w-[55%] opacity-90"
            aria-hidden
            style={{
              background:
                'radial-gradient(ellipse 90% 100% at 100% 0%, rgba(56, 189, 248, 0.18), transparent 58%)',
            }}
          />
          <div className="relative">
            <h1 className="text-center text-xl font-bold tracking-tight text-slate-900">
              {isDa ? 'Bekræft din e-mail' : 'Confirm your email'}
            </h1>
            <p className="mt-2 text-center text-sm text-slate-600">
              {isDa
                ? 'Vi har sendt en 6-cifret kode. Indtast den her for at fortsætte til plan og betaling.'
                : 'We sent a 6-digit code. Enter it here to continue to your plan and payment.'}
            </p>
            {email ? (
              <p className="mt-3 text-center text-xs font-medium text-slate-500">{email}</p>
            ) : (
              <p className="mt-3 text-center text-sm text-amber-700">
                {isDa ? 'Ingen e-mail i linket.' : 'No email in this link.'}{' '}
                <Link to={`/advero/signup?next=${encodeURIComponent(next)}`} className="underline">
                  {isDa ? 'Opret konto' : 'Sign up'}
                </Link>
              </p>
            )}

            <form onSubmit={handleVerify} className="mt-6 space-y-4">
              <label className="block">
                <span className="mono-label mb-1.5 block text-[10px] text-slate-500">
                  {isDa ? 'Bekræftelseskode' : 'Verification code'}
                </span>
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-center text-lg font-semibold tracking-[0.35em] text-slate-900"
                  placeholder="000000"
                />
              </label>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <button
                type="submit"
                disabled={loading || !email}
                className="advero-btn-slate-solid flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold uppercase tracking-[0.14em] disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {isDa ? 'Bekræft og fortsæt' : 'Verify and continue'}
              </button>
            </form>

            <div className="mt-4 flex flex-col items-center gap-2 text-center text-sm text-slate-600">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || !email}
                className="font-medium text-sky-700 underline disabled:opacity-50"
              >
                {resending ? (isDa ? 'Sender…' : 'Sending…') : isDa ? 'Send kode igen' : 'Resend code'}
              </button>
              <p>
                {isDa ? 'Allerede bekræftet?' : 'Already verified?'}{' '}
                <Link
                  to={`/advero/login?next=${encodeURIComponent(next)}`}
                  className="font-medium text-sky-700 underline"
                >
                  {isDa ? 'Log ind' : 'Log in'}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdveroClientAuthLayout>
  );
};

export default AdveroVerifyEmailPage;
