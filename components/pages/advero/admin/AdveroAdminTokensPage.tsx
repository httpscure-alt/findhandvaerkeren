import React, { useState } from 'react';
import AdveroAdminPageHeader from './AdveroAdminPageHeader';
import {
  TOKEN_CLIENTS,
  TOKEN_CLIENT_COLOR,
  TOKEN_LEDGER,
  type TokenLedgerEntry,
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

const LOG_LIMIT = 100;
const LATEST = 'latest';

const LOG_DATES = [...new Set(TOKEN_LEDGER.map((row) => row.date))].reverse();

function logByDate(selected: string): { date: string; rows: TokenLedgerEntry[] }[] {
  const rows =
    selected === LATEST
      ? TOKEN_LEDGER.slice(-LOG_LIMIT)
      : TOKEN_LEDGER.filter((row) => row.date === selected);
  const groups: { date: string; rows: TokenLedgerEntry[] }[] = [];
  for (const row of [...rows].reverse()) {
    const last = groups[groups.length - 1];
    if (last && last.date === row.date) last.rows.push(row);
    else groups.push({ date: row.date, rows: [row] });
  }
  return groups;
}

const AdveroAdminTokensPage: React.FC<Props> = ({ embedded = true }) => {
  const [selectedDate, setSelectedDate] = useState(LATEST);
  const groups = logByDate(selectedDate);
  const rowCount = groups.reduce((sum, g) => sum + g.rows.length, 0);

  return (
    <div className={embedded ? undefined : 'advero-tokens-page'}>
      <AdveroAdminPageHeader title="Token usage" />

      <div className="advero-tokens-client-grid">
        {TOKEN_CLIENTS.map((c) => {
          const usedUsd = usedUsdFor(c.id);
          const source = TOKEN_CLIENTS.find((s) => s.id === c.tokenSource);
          const fundedClients = TOKEN_CLIENTS.filter((s) => s.tokenSource === c.id);
          const balance = source ?? c;
          return (
            <div key={c.id} className="advero-tokens-client">
              <div className="advero-tokens-client-top">
                <span className="advero-tokens-swatch" style={{ background: TOKEN_CLIENT_COLOR[c.id] }} />
                <strong>{c.brand}</strong>
              </div>
              <p className="advero-tokens-legal">{c.legalName}</p>
              <p className="advero-tokens-big">{formatUsd(balance.remainingUsd)}</p>
              <p className="advero-tokens-meta">Remaining · {formatTokens(remainingTokensFor(balance))}</p>
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
          <div className="advero-tokens-log-filter">
            <p className="advero-tokens-caption">
              {selectedDate === LATEST
                ? `Latest ${LOG_LIMIT} top-ups and deductions, newest first`
                : `${rowCount} entries on ${selectedDate}`}
            </p>
            <select
              className="advero-tokens-date-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Filter usage log by date"
            >
              <option value={LATEST}>Latest {LOG_LIMIT}</option>
              {LOG_DATES.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="advero-tokens-table-wrap">
          <table className="advero-tokens-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Client</th>
                <th>Type</th>
                <th>USD</th>
                <th>Tokens</th>
              </tr>
            </thead>
            {groups.map((group) => (
              <tbody key={group.date}>
                <tr className="advero-tokens-date-row">
                  <td colSpan={5}>{group.date}</td>
                </tr>
                {group.rows.map((row, i) => {
                  const client = TOKEN_CLIENTS.find((c) => c.id === row.clientId);
                  const source = TOKEN_CLIENTS.find((c) => c.id === row.source);
                  const tone = row.kind === 'topup' ? 'advero-tokens-credit' : 'advero-tokens-debit';
                  const sign = row.kind === 'topup' ? '+' : '-';
                  return (
                    <tr key={`${row.clientId}-${row.usd}-${i}`}>
                      <td className="advero-tokens-time">{row.time ?? '—'}</td>
                      <td>{client?.brand}</td>
                      <td>
                        {row.kind === 'topup' && row.note !== 'Opening balance' ? 'Top-up' : row.note}
                        {source ? ` · via ${source.brand}` : ''}
                      </td>
                      <td className={tone}>
                        {sign}
                        {formatUsd(row.usd)}
                      </td>
                      <td className={tone}>
                        {sign}
                        {formatTokens(entryTokens(row))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdveroAdminTokensPage;
