import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { Loader2, CheckCircle, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const OtpVerification = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendStatus, setResendStatus] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth(); // We might need to manually set auth state

    const email = location.state?.email || new URLSearchParams(location.search).get('email');

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4">
                        Email not found. Please register again.
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="text-indigo-600 font-medium hover:underline"
                    >
                        Go back home
                    </button>
                </div>
            </div>
        );
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.verifyOtp(email, otp);
            if (response && response.token) {
                // Store token and update auth context (reloading page is a brute-force way to init context if needed)
                localStorage.setItem('token', response.token);
                if (response.user) {
                    localStorage.setItem('user', JSON.stringify(response.user));
                }

                // Navigate to dashboard
                window.location.href = '/dashboard';
            } else {
                setError('Verification failed. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setResendStatus('Sending...');
            await api.resendOtp(email);
            setResendStatus('Sent!');
            setTimeout(() => setResendStatus(''), 3000);
        } catch (err) {
            setError('Failed to resend OTP');
            setResendStatus('');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10 animate-fadeIn">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#1D1D1F] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform -rotate-6">
                        <Mail className="text-white" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-[#1D1D1F] mb-3">Check your email</h2>
                    <p className="text-gray-500">
                        We've sent a 6-digit verification code to <br />
                        <span className="font-semibold text-gray-900">{email}</span>
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-sm text-red-600 animate-shake">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            required
                            maxLength={6}
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full px-4 py-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all placeholder:tracking-normal placeholder:text-gray-300"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.length < 6}
                        className="w-full py-4 rounded-xl bg-[#1D1D1F] text-white font-medium shadow-lg hover:bg-black transform active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify Account
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 mb-3">Didn't receive the code?</p>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendStatus !== ''}
                        className="text-sm font-semibold text-[#1D1D1F] hover:text-gray-600 transition-colors"
                    >
                        {resendStatus === 'Sent!' ? (
                            <span className="text-green-600 flex items-center justify-center gap-1">
                                <CheckCircle size={14} /> Sent!
                            </span>
                        ) : resendStatus === 'Sending...' ? (
                            'Sending...'
                        ) : (
                            'Click to resend'
                        )}
                    </button>
                </div>
            </div>

            <p className="mt-8 text-xs text-gray-400">
                &copy; {new Date().getFullYear()} Findhåndværkeren. All rights reserved.
            </p>
        </div>
    );
};
