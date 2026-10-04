import React from 'react';
import AdveroAdminPageHeader from './AdveroAdminPageHeader';
import {
  TOKEN_CLIENTS,
  TOKEN_CLIENT_COLOR,
  TOKEN_LEDGER,
  entryTokens,
  formatTokens,
  formatUsd,
  remainingTokensFor,
  usedTokensFor,
  usedUsdFor,
} from '../../../../lib/adveroTokenUsage';

type Props = {
  embedded?: boolean;
};

const AdveroAdminTokensPage: React.FC<Props> = ({ embedded = true }) => {
  return (
    <div className={embedded ? undefined : 'advero-tokens-page'}>
      <AdveroAdminPageHeader title="Token usage" />

      <div className="advero-tokens-client-grid">
        {TOKEN_CLIENTS.map((c) => {
          const usedUsd = usedUsdFor(c.id);
          const source = TOKEN_CLIENTS.find((s) => s.id === c.tokenSource);
          const fundedClients = TOKEN_CLIENTS.filter((s) => s.tokenSource === c.id);
          return (
            <div key={c.id} className="advero-tokens-client">
              <div className="advero-tokens-client-top">
                <span className="advero-tokens-swatch" style={{ background: TOKEN_CLIENT_COLOR[c.id] }} />
                <strong>{c.brand}</strong>
              </div>
              <p className="advero-tokens-legal">{c.legalName}</p>
              <p className="advero-tokens-big">{formatUsd(c.remainingUsd)}</p>
              <p className="advero-tokens-meta">Remaining · {formatTokens(remainingTokensFor(c))}</p>
              <p className="advero-tokens-used">
                Used {formatUsd(usedUsd)} · {formatTokens(usedTokensFor(c.id))}
              </p>
              {source ? (
                <p className="advero-tokens-source">Now using {source.brand} tokens</p>
              ) : null}
              {fundedClients.length > 0 ? (
                <p className="advero-tokens-source">
                  Also funds {fundedClients.map((s) => s.brand).join(' · ')}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="advero-tokens-panel" style={{ marginTop: '0.85rem' }}>
        <div className="advero-tokens-panel-head">
          <strong>Usage log</strong>
          <p className="advero-tokens-caption">All top-ups and deductions since 30 Sep 2026</p>
        </div>
        <div className="advero-tokens-table-wrap">
          <table className="advero-tokens-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Type</th>
                <th>USD</th>
                <th>Tokens</th>
              </tr>
            </thead>
            <tbody>
              {TOKEN_LEDGER.map((row, i) => {
                const client = TOKEN_CLIENTS.find((c) => c.id === row.clientId);
                const source = TOKEN_CLIENTS.find((c) => c.id === row.source);
                const signed = row.kind === 'topup' ? row.usd : -row.usd;
                return (
                  <tr key={`${row.date}-${row.clientId}-${row.usd}-${i}`}>
                    <td>{row.date}</td>
                    <td>{client?.brand}</td>
                    <td>
                      {row.kind === 'topup' ? 'Top-up' : row.note}
                      {source ? ` · via ${source.brand}` : ''}
                    </td>
                    <td className={row.kind === 'topup' ? 'advero-tokens-credit' : 'advero-tokens-debit'}>
                      {row.kind === 'topup' ? '+' : '-'}
                      {formatUsd(Math.abs(signed))}
                    </td>
                    <td className={row.kind === 'topup' ? 'advero-tokens-credit' : 'advero-tokens-debit'}>
                      {row.kind === 'topup' ? '+' : '-'}
                      {formatTokens(entryTokens(row))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdveroAdminTokensPage;
