import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { buildDashboardIntelligence } from '../../../../lib/adveroDashboardIntelligence';
import AdveroDashboardPageHeader from './AdveroDashboardPageHeader';
import { AdveroDashboardConnectedFlow, MetricBusinessImpact } from './AdveroDashboardIntelligenceBlocks';

const AdveroDashboardVisibilityPage: React.FC = () => {
  const { lang } = useMarketplace();
  const isDa = lang === 'da';
  const intel = useMemo(() => buildDashboardIntelligence(lang), [lang]);

  return (
    <>
      <AdveroDashboardPageHeader title={isDa ? 'Synlighedsanalyse' : 'Visibility audit'} />
      <div className="advero-dash-page-body space-y-6">
        <p className="advero-dash-lead">
          {isDa
            ? 'Gratis TopRank-analyse — resultaterne driver anbefalinger, kampagner og rapporter i dashboardet.'
            : 'Free TopRank analysis — results drive recommendations, campaigns, and reports in your dashboard.'}
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

        <AdveroDashboardConnectedFlow intel={intel} isDa={isDa} />

        <section className="advero-dash-cta-card">
          <Link to="/advero/audit" className="advero-dash-btn-primary inline-flex items-center gap-2 !mt-0">
            {isDa ? 'Få gratis synlighedsaudit' : 'Get free visibility audit'}
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </>
  );
};

export default AdveroDashboardVisibilityPage;
