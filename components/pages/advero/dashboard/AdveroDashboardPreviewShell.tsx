import React from 'react';
import { Link, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { AdveroDashboardPreviewProvider } from '../../../../contexts/AdveroDashboardPreviewContext';
import {
  DASHBOARD_PREVIEW_MODES,
  isDashboardPreviewModeId,
  type DashboardPreviewModeId,
} from '../../../../lib/adveroDashboardPreviewFixtures';
import {
  entitlementsFromSubscription,
  packageLabel,
} from '../../../../lib/workspaceEntitlements';
import AdveroDashboardSidebar from './AdveroDashboardSidebar';
import '../advero-ds.css';

const DEFAULT_MODE: DashboardPreviewModeId = 'growth';

const AdveroDashboardPreviewShell: React.FC = () => {
  const { mode: modeParam } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const { lang, setLang } = useMarketplace();
  const isDa = lang === 'da';

  if (!modeParam || !isDashboardPreviewModeId(modeParam)) {
    return <Navigate to={`/advero/dev/dashboard-preview/${DEFAULT_MODE}`} replace />;
  }

  const mode = modeParam;
  const meta = DASHBOARD_PREVIEW_MODES.find((m) => m.id === mode)!;
  const entitlements = meta.tierId
    ? entitlementsFromSubscription(meta.tierId, meta.serviceLine)
    : entitlementsFromSubscription(null, null);
  const dashboardBasePath = `/advero/dev/dashboard-preview/${mode}`;
  const hasPaidSupport = mode !== 'none';

  return (
    <AdveroDashboardPreviewProvider mode={mode} lang={isDa ? 'da' : 'en'}>
      <div className="advero-ds min-h-screen bg-[#1e293b]">
        <div className="border-b border-amber-400/30 bg-amber-950/90 px-4 py-3 text-amber-50">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200/90">
                {isDa ? 'Lokal forhåndsvisning' : 'Local preview'}
              </p>
              <p className="text-sm text-amber-50/90">
                {isDa
                  ? 'Ikke deployet — viser rigtige dashboard-komponenter med mock-data.'
                  : 'Not deployed — real dashboard components with mock data.'}
              </p>
            </div>
            <Link
              to="/advero/dashboard"
              className="text-xs font-medium text-amber-100 underline underline-offset-2 hover:text-white"
            >
              {isDa ? '← Til rigtigt dashboard' : '← Back to live dashboard'}
            </Link>
          </div>
        </div>

        <div className="border-b border-white/10 bg-[#334155] px-4 py-3">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2">
            <span className="mr-2 text-xs font-medium uppercase tracking-[0.12em] text-white/50">
              {isDa ? 'Abonnement' : 'Plan'}
            </span>
            {DASHBOARD_PREVIEW_MODES.map((m) => {
              const active = m.id === mode;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => navigate(`/advero/dev/dashboard-preview/${m.id}`)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition ${
                    active
                      ? 'bg-white text-slate-900'
                      : 'bg-white/10 text-white/80 hover:bg-white/15'
                  }`}
                >
                  {isDa ? m.labelDa : m.labelEn}
                </button>
              );
            })}
            <span className="ml-auto hidden text-xs text-white/55 sm:inline">
              {packageLabel(entitlements, isDa ? 'da' : 'en')}
              {' · '}
              SEO {entitlements.seo ? '✓' : '—'} · Ads {entitlements.ads ? '✓' : '—'} · AI{' '}
              {entitlements.aiVisibility ? '✓' : '—'}
            </span>
          </div>
        </div>

        <div className="advero-dash-shell relative isolate min-h-[calc(100vh-120px)]">
          <div className="advero-dot-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />
          <div className="advero-dash-frame relative z-[1]">
            <AdveroDashboardSidebar
              lang={lang}
              onLangChange={setLang}
              workspaceName="Nordic Demo ApS"
              workspaceInitial="N"
              onLogout={() => navigate('/advero/dev/dashboard-preview')}
              showContactSupport={!hasPaidSupport}
              entitlements={entitlements}
              dashboardBasePath={dashboardBasePath}
            />
            <div className="advero-dash-main">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </AdveroDashboardPreviewProvider>
  );
};

export default AdveroDashboardPreviewShell;
