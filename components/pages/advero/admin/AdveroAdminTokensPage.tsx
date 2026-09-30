import React from 'react';
import AdveroAdminPageHeader from './AdveroAdminPageHeader';
import {
  TOKEN_CLIENTS,
  TOKEN_CLIENT_COLOR,
  formatUsd,
} from '../../../../lib/adveroTokenUsage';

type Props = {
  embedded?: boolean;
};

const AdveroAdminTokensPage: React.FC<Props> = ({ embedded = true }) => {
  return (
    <div className={embedded ? undefined : 'advero-tokens-page'}>
      <AdveroAdminPageHeader
        kicker={embedded ? 'Internal' : 'Advero ops'}
        title="Token usage"
        description="Remaining token balance in USD."
      />

      <div className="advero-tokens-client-grid">
        {TOKEN_CLIENTS.map((c) => (
          <div key={c.id} className="advero-tokens-client">
            <div className="advero-tokens-client-top">
              <span className="advero-tokens-swatch" style={{ background: TOKEN_CLIENT_COLOR[c.id] }} />
              <strong>{c.brand}</strong>
            </div>
            <p className="advero-tokens-legal">{c.legalName}</p>
            <p className="advero-tokens-big">{formatUsd(c.remainingUsd)}</p>
            <p className="advero-tokens-meta">Remaining</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdveroAdminTokensPage;
