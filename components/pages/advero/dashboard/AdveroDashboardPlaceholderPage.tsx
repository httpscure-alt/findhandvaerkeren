import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import AdveroDashboardPageHeader from './AdveroDashboardPageHeader';

interface AdveroDashboardPlaceholderPageProps {
  titleDa: string;
  titleEn: string;
  bodyDa: string;
  bodyEn: string;
  actionHref?: string;
  actionLabelDa?: string;
  actionLabelEn?: string;
}

const AdveroDashboardPlaceholderPage: React.FC<AdveroDashboardPlaceholderPageProps> = ({
  titleDa,
  titleEn,
  bodyDa,
  bodyEn,
  actionHref,
  actionLabelDa,
  actionLabelEn,
}) => {
  const { lang } = useMarketplace();
  const isDa = lang === 'da';

  return (
    <>
      <AdveroDashboardPageHeader title={isDa ? titleDa : titleEn} />
      <div className="advero-dash-page-body">
        <p className="advero-dash-lead">{isDa ? bodyDa : bodyEn}</p>
        {actionHref ? (
          <Link to={actionHref} className="advero-dash-btn-primary inline-flex items-center gap-2">
            {isDa ? actionLabelDa : actionLabelEn}
            <ArrowRight size={16} />
          </Link>
        ) : null}
      </div>
    </>
  );
};

export default AdveroDashboardPlaceholderPage;
