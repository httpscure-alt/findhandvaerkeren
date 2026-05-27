import React, { useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { useAdveroPaidSupport } from '../../../../hooks/useAdveroPaidSupport';
import { useToast } from '../../../../hooks/useToast';
import AdveroDashboardSidebar from './AdveroDashboardSidebar';
import '../advero-ds.css';

interface AdveroDashboardLayoutProps {
  getCompanyName?: () => string | null;
}

const AdveroDashboardLayout: React.FC<AdveroDashboardLayoutProps> = ({ getCompanyName }) => {
  const { lang, setLang } = useMarketplace();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const isDa = lang === 'da';
  const { hasPaidSupport, entitlements } = useAdveroPaidSupport(true);

  const workspaceName = useMemo(() => {
    const fromCompany = getCompanyName?.();
    if (fromCompany?.trim()) return fromCompany.trim();
    if (user?.ownedCompany?.name?.trim()) return user.ownedCompany.name.trim();
    if (user?.name?.trim()) return user.name.trim();
    return isDa ? 'Min virksomhed' : 'My business';
  }, [getCompanyName, user, isDa]);

  const workspaceInitial = workspaceName.charAt(0).toUpperCase() || 'A';

  const handleLogout = () => {
    logout();
    toast.info(isDa ? 'Du er nu logget ud' : 'Logged out');
    navigate('/advero/login');
  };

  return (
    <div className="advero-ds advero-dash-shell min-h-screen relative isolate">
      <div className="advero-dot-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <div className="advero-dash-frame relative z-[1]">
        <AdveroDashboardSidebar
          lang={lang}
          onLangChange={setLang}
          workspaceName={workspaceName}
          workspaceInitial={workspaceInitial}
          onLogout={handleLogout}
          showContactSupport={!hasPaidSupport}
          entitlements={entitlements}
        />
        <div className="advero-dash-main">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdveroDashboardLayout;
