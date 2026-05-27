import React, { useMemo } from 'react';
import { useAdveroDashboardData } from '../../../../hooks/useAdveroDashboardData';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { buildReportsPageNarrative } from '../../../../lib/adveroDashboardIntelligence';
import AdveroDashboardPageHeader from './AdveroDashboardPageHeader';
import { AdveroDashboardConnectedFlow } from './AdveroDashboardIntelligenceBlocks';
import { buildDashboardIntelligence } from '../../../../lib/adveroDashboardIntelligence';

const AdveroDashboardReportsPage: React.FC = () => {
  const { lang } = useMarketplace();
  const isDa = lang === 'da';
  const { payload: apiPayload } = useAdveroDashboardData(lang === 'da' ? 'da' : 'en');
  const showAds = Boolean(apiPayload?.entitlements?.ads);

  const reports = useMemo(() => buildReportsPageNarrative(lang, apiPayload), [lang, apiPayload]);
  const intel = useMemo(() => buildDashboardIntelligence(lang, apiPayload), [lang, apiPayload]);

  return (
    <>
      <AdveroDashboardPageHeader title={isDa ? 'Rapporter' : 'Reports'} />
      <div className="advero-dash-page-body space-y-6">
        <section className="advero-dash-narrative">
          <p className="mono-label text-[10px] text-white/45">
            {isDa ? 'Månedlig fortælling' : 'Monthly narrative'}
          </p>
          <p className="advero-dash-narrative-body">{reports.narrative}</p>
          {reports.hasAudit ? (
            <p className="advero-dash-narrative-meta">{reports.monthProgress}</p>
          ) : null}
        </section>

        <AdveroDashboardConnectedFlow
          intel={{
            ...intel,
            connectedFlow: intel.connectedFlow.filter((step) => step.key !== 'campaigns' || showAds),
          }}
          isDa={isDa}
        />

        {reports.auditId ? (
          <section className="advero-dash-cta-card">
            <h2 className="advero-dash-cta-title">{isDa ? 'Seneste analyse' : 'Latest audit'}</h2>
            <p className="advero-dash-cta-text font-mono text-xs opacity-80">{reports.auditId}</p>
            <Link
              to={`/advero/audit/results?id=${encodeURIComponent(reports.auditId)}`}
              className="advero-dash-btn-primary inline-flex items-center gap-2 !mt-0"
            >
              {isDa ? 'Åbn resultater' : 'Open results'}
              <ArrowRight size={16} />
            </Link>
          </section>
        ) : (
          <section className="advero-dash-cta-card">
            <p className="advero-dash-cta-text">
              {isDa
                ? 'Månedsrapporten bygger på jeres forbundne data og seneste synlighedsanalyse.'
                : 'Monthly reporting builds on your connected data and latest visibility analysis.'}
            </p>
            <Link
              to="/advero/dashboard/integrations"
              className="advero-dash-btn-primary inline-flex items-center gap-2 !mt-0"
            >
              {isDa ? 'Forbind datakilder' : 'Connect data sources'}
              <ArrowRight size={16} />
            </Link>
          </section>
        )}

        <section className="advero-dash-kpi-card opacity-90">
          <p className="advero-dash-kpi-label mono-label">{isDa ? 'Fuld rapport' : 'Full report'}</p>
          <p className="advero-dash-kpi-hint mt-2">
            {isDa
              ? 'Fortæller synlighedsudvikling, forbedringer og anbefalinger — låses op efter 12 måneders aktivt abonnement.'
              : 'Covers visibility evolution, improvements, and recommendations — unlocks after 12 months of active subscription.'}
          </p>
        </section>
      </div>
    </>
  );
};

export default AdveroDashboardReportsPage;
