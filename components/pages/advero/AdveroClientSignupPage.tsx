import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMarketplace } from '../../../contexts/MarketplaceContext';
import SignupPage from '../auth/SignupPage';
import AdveroClientAuthLayout from './AdveroClientAuthLayout';
import './advero-ds.css';

const JOURNEY_DEFAULT = '/advero/get-started?step=3';

function safeNext(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}

const AdveroClientSignupPage: React.FC = () => {
  const { lang } = useMarketplace();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const next = safeNext(searchParams.get('next'));
  const backHref = next ?? JOURNEY_DEFAULT;
  const nextQs = next ? `?next=${encodeURIComponent(next)}` : '';
  const loginHref = `/advero/login${nextQs}`;

  return (
    <AdveroClientAuthLayout backHref={backHref}>
      <div className="w-full max-w-md">
        <SignupPage
          lang={lang}
          forcedRole="CONSUMER"
          brandVariant="advero"
          alternateAuthHref={loginHref}
          onSuccess={() => {
            try {
              localStorage.setItem('advero.verifyNext', next ?? JOURNEY_DEFAULT);
            } catch {
              /* ignore */
            }
            navigate(next ?? JOURNEY_DEFAULT, { replace: true });
          }}
          onBack={() => navigate(loginHref)}
        />
      </div>
    </AdveroClientAuthLayout>
  );
};

export default AdveroClientSignupPage;
