import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { buildDashboardIntelligence } from '../../../../lib/adveroDashboardIntelligence';
import { useAdveroDashboardData } from '../../../../hooks/useAdveroDashboardData';
import AdveroDashboardPageHeader from './AdveroDashboardPageHeader';
import { AdveroDashboardConnectedFlow, MetricBusinessImpact } from './AdveroDashboardIntelligenceBlocks';

const AdveroDashboardVisibilityPage: React.FC = () => {
  const { lang } = useMarketplace();
  const isDa = lang === 'da';
  const { payload: apiPayload } = useAdveroDashboardData(lang === 'da' ? 'da' : 'en');
  const showAds = Boolean(apiPayload?.entitlements?.ads);
  const intel = useMemo(() => buildDashboardIntelligence(lang, apiPayload), [lang, apiPayload]);

  return (
    <>
      <AdveroDashboardPageHeader title={isDa ? 'Synlighedsanalyse' : 'Visibility audit'} />
      <div className="advero-dash-page-body space-y-6">
        <p className="advero-dash-lead">
          {intel.hasAudit
            ? isDa
              ? 'Jeres synlighedsanalyse driver anbefalinger, kampagner og rapporter her i dashboardet.'
              : 'Your visibility analysis drives recommendations, campaigns, and reports in this dashboard.'
            : isDa
              ? 'Forbind Search Console og Google Ads under Integrationer for at aktivere fuld synlighedsovervågning.'
              : 'Connect Search Console and Google Ads under Integrations to enable full visibility monitoring.'}
        </p>

        {intel.hasAudit ? (
          <section className="advero-dash-priority advero-dash-priority--compact">
            <p className="mono-label text-[10px] text-white/45">{isDa ? 'Seneste fund' : 'Latest finding'}</p>
            <p className="advero-dash-priority-title text-lg">{intel.priority.title}</p>
            <MetricBusinessImpact text={intel.priority.businessImpact} />
            {intel.auditId ? (
              <Link
                to={`/advero/audit/results?id=${encodeURIComponent(intel.auditId)}`}
                className="advero-dash-btn-ghost inline-flex items-center gap-2 !mt-3 text-xs"
              >
                {isDa ? 'Se fulde resultater' : 'View full results'}
                <ArrowRight size={14} />
              </Link>
            ) : null}
          </section>
        ) : null}

        <AdveroDashboardConnectedFlow
          intel={{
            ...intel,
            connectedFlow: intel.connectedFlow.filter((step) => step.key !== 'campaigns' || showAds),
          }}
          isDa={isDa}
        />

        {!intel.hasAudit ? (
          <section className="advero-dash-cta-card">
            <p className="advero-dash-cta-text">
              {isDa
                ? 'Som kunde ser I jeres analyse og anbefalinger her, når datakilder er forbundet.'
                : 'As a customer, your analysis and recommendations appear here once data sources are connected.'}
            </p>
            <Link
              to="/advero/dashboard/integrations"
              className="advero-dash-btn-primary inline-flex items-center gap-2 !mt-0"
            >
              {isDa ? 'Gå til integrationer' : 'Go to integrations'}
              <ArrowRight size={16} />
            </Link>
          </section>
        ) : null}
      </div>
    </>
  );
};

export default AdveroDashboardVisibilityPage;
