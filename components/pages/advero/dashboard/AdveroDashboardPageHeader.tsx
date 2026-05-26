import React from 'react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import AdveroLangToggle from '../AdveroLangToggle';

type AdveroDashboardPageHeaderProps = {
  eyebrow?: string;
  title: string;
  actions?: React.ReactNode;
};

const AdveroDashboardPageHeader: React.FC<AdveroDashboardPageHeaderProps> = ({
  eyebrow,
  title,
  actions,
}) => {
  const { lang, setLang } = useMarketplace();

  return (
    <header className="advero-dash-page-header">
      <div className="advero-dash-page-header-text">
        {eyebrow ? <p className="advero-dash-page-eyebrow mono-label">{eyebrow}</p> : null}
        <h1 className="advero-dash-page-title">{title}</h1>
      </div>
      <div className="advero-dash-page-header-actions">
        {actions}
        <AdveroLangToggle lang={lang} onChange={setLang} />
      </div>
    </header>
  );
};

export default AdveroDashboardPageHeader;
