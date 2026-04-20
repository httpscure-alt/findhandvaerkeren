import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../../services/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/useToast';
import { Language } from '../../../types';

export default function SupabaseCallbackPage({ lang }: { lang: Language }) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { loginWithSupabase } = useAuth();
  const isDa = lang === 'da';

  React.useEffect(() => {
    const run = async () => {
      if (!supabase || !isSupabaseConfigured) {
        toast.error(isDa ? 'Supabase er ikke konfigureret' : 'Supabase is not configured');
        navigate('/auth', { replace: true });
        return;
      }

      const qs = new URLSearchParams(location.search);
      const roleHint = (qs.get('role') as 'CONSUMER' | 'PARTNER' | null) || undefined;

      const { data, error } = await supabase.auth.getSession();
      if (error) {
        toast.error(error.message);
        navigate('/auth', { replace: true });
        return;
      }

      const accessToken = data.session?.access_token;
      if (!accessToken) {
        toast.error(isDa ? 'Manglende Supabase session' : 'Missing Supabase session');
        navigate('/auth', { replace: true });
        return;
      }

      try {
        await loginWithSupabase(accessToken, roleHint);
        toast.success(isDa ? 'Logget ind' : 'Signed in');
        navigate('/', { replace: true });
      } catch (e: any) {
        toast.error(e?.message || (isDa ? 'Login fejlede' : 'Login failed'));
        navigate('/auth', { replace: true });
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="text-sm text-gray-500">
          {isDa ? 'Logger dig ind…' : 'Signing you in…'}
        </div>
      </div>
    </div>
  );
}

