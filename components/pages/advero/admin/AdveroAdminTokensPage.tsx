import React, { useMemo, useState } from 'react';
import AdveroAdminPageHeader from './AdveroAdminPageHeader';
import {
  TOKEN_CLIENTS,
  TOKEN_CLIENT_COLOR,
  TOKEN_PERIODS,
  TOKEN_RATE_USD_PER_MILLION,
  DEFAULT_TOKEN_PERIOD,
  clientById,
  dailySeries,
  deltaPct,
  featureBreakdown,
  formatTokens,
  formatUsd,
  modelBreakdown,
  periodMeta,
  periodTotal,
  previousPeriod,
  promptCompletionSplit,
  stackedDaily,
  tokensToUsd,
  type TokenClientId,
  type TokenPeriodId,
} from '../../../../lib/adveroTokenUsage';

type Props = {
  /** Compact header when nested in admin layout. */
  embedded?: boolean;
};

function StackedUsageChart({
  period,
  activeIds,
  highlight,
}: {
  period: TokenPeriodId;
  activeIds: TokenClientId[];
  highlight: TokenClientId | 'all';
}) {
  const rows = stackedDaily(period, activeIds);
  const max = Math.max(...rows.map((r) => r.total), 1);
  const w = 720;
  const h = 220;
  const padL = 8;
  const padR = 8;
  const padT = 12;
  const padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const gap = 2;
  const barW = (innerW - gap * (rows.length - 1)) / rows.length;
  const ids = highlight === 'all' ? activeIds : [highlight];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="advero-tokens-chart" role="img" aria-label="Daily token usage by client">
      <text x={padL} y={12} fill="rgb(255 255 255 / 0.4)" fontSize="10" fontFamily="JetBrains Mono, monospace">
        Tokens / day
      </text>
      {rows.map((row, i) => {
        const x = padL + i * (barW + gap);
        let y = padT + innerH;
        const stackIds = highlight === 'all' ? activeIds : ids;
        return (
          <g key={row.day}>
            {stackIds.map((id) => {
              const val = (row[id] as number) || 0;
              const bh = (val / max) * innerH;
              y -= bh;
              return (
                <rect
                  key={id}
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(bh, 0)}
                  fill={TOKEN_CLIENT_COLOR[id]}
                  opacity={highlight === 'all' || highlight === id ? 0.95 : 0.25}
                />
              );
            })}
            {row.day === 1 || row.day === rows.length || row.day % 5 === 0 ? (
              <text
                x={x + barW / 2}
                y={h - 8}
                textAnchor="middle"
                fill="rgb(255 255 255 / 0.4)"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
              >
                {row.day}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

const AdveroAdminTokensPage: React.FC<Props> = ({ embedded = true }) => {
  const [period, setPeriod] = useState<TokenPeriodId>(DEFAULT_TOKEN_PERIOD);
  const [selected, setSelected] = useState<TokenClientId | 'all'>('all');

  const meta = periodMeta(period);
  const prev = previousPeriod(period);
  const activeIds = TOKEN_CLIENTS.map((c) => c.id);

  const perClient = useMemo(
    () =>
      TOKEN_CLIENTS.map((c) => {
        const tokens = periodTotal(c.id, period);
        const prevTokens = prev ? periodTotal(c.id, prev) : 0;
        return {
          ...c,
          tokens,
          usd: tokensToUsd(tokens),
          prevTokens,
          delta: deltaPct(tokens, prevTokens),
          daysLive: dailySeries(c.id, period).filter((n) => n > 0).length,
        };
      }),
    [period, prev]
  );

  const filtered = selected === 'all' ? perClient : perClient.filter((c) => c.id === selected);
  const totalTokens = filtered.reduce((s, c) => s + c.tokens, 0);
  const totalUsd = tokensToUsd(totalTokens);
  const prevTotal = filtered.reduce((s, c) => s + c.prevTokens, 0);
  const totalDelta = deltaPct(totalTokens, prevTotal);
  const liveDays = Math.max(...filtered.map((c) => c.daysLive), 1);
  const dailyAvg = totalTokens / liveDays;
  const split = promptCompletionSplit(totalTokens);
  const models = modelBreakdown(totalTokens);
  const features =
    selected === 'all'
      ? ['reports', 'ai', 'copilot', 'embed'].map((key) => {
          const rows = perClient.flatMap((c) => featureBreakdown(c.id, c.tokens).filter((f) => f.key === key));
          const tokens = rows.reduce((s, r) => s + r.tokens, 0);
          return {
            key,
            label: rows[0]?.label ?? key,
            tokens,
            usd: tokensToUsd(tokens),
            share: totalTokens ? tokens / totalTokens : 0,
          };
        })
      : featureBreakdown(selected, totalTokens);

  return (
    <div className={embedded ? undefined : 'advero-tokens-page'}>
      <AdveroAdminPageHeader
        kicker={embedded ? 'Internal' : 'Advero ops'}
        title="Token usage"
        description={`LLM consumption across all four clients. Billed at USD ${TOKEN_RATE_USD_PER_MILLION.toFixed(2)} per 1M tokens · actual usage · ${meta.label}.`}
        actions={
          <div className="advero-tokens-periods">
            {TOKEN_PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`advero-admin-btn ${period === p.id ? 'advero-admin-btn--primary' : 'advero-admin-btn--ghost'}`}
                onClick={() => setPeriod(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="advero-admin-stat-grid mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        <div className="advero-admin-stat-card">
          <div className="advero-admin-stat-value">{formatTokens(totalTokens)}</div>
          <div className="advero-admin-stat-label">Tokens this period</div>
        </div>
        <div className="advero-admin-stat-card">
          <div className="advero-admin-stat-value">{formatUsd(totalUsd)}</div>
          <div className="advero-admin-stat-label">Billable at $10 / 1M</div>
        </div>
        <div className="advero-admin-stat-card">
          <div className="advero-admin-stat-value">{formatTokens(dailyAvg)}</div>
          <div className="advero-admin-stat-label">Avg tokens / live day</div>
        </div>
        <div className="advero-admin-stat-card">
          <div className="advero-admin-stat-value">
            {totalDelta == null ? '—' : `${totalDelta >= 0 ? '+' : ''}${totalDelta.toFixed(0)}%`}
          </div>
          <div className="advero-admin-stat-label">{prev ? 'vs previous month' : 'No prior month'}</div>
        </div>
      </div>

      <div className="advero-tokens-filter mb-4">
        <button
          type="button"
          className={`advero-tokens-pill ${selected === 'all' ? 'advero-tokens-pill--on' : ''}`}
          onClick={() => setSelected('all')}
        >
          All clients
        </button>
        {TOKEN_CLIENTS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`advero-tokens-pill ${selected === c.id ? 'advero-tokens-pill--on' : ''}`}
            onClick={() => setSelected(c.id)}
          >
            <span className="advero-tokens-swatch" style={{ background: TOKEN_CLIENT_COLOR[c.id] }} />
            {c.brand}
          </button>
        ))}
      </div>

      <div className="advero-tokens-client-grid mb-6">
        {perClient.map((c) => {
          const on = selected === 'all' || selected === c.id;
          return (
            <button
              key={c.id}
              type="button"
              className={`advero-tokens-client ${on ? '' : 'advero-tokens-client--dim'}`}
              onClick={() => setSelected(selected === c.id ? 'all' : c.id)}
            >
              <div className="advero-tokens-client-top">
                <span className="advero-tokens-swatch" style={{ background: TOKEN_CLIENT_COLOR[c.id] }} />
                <strong>{c.brand}</strong>
                <span className={`advero-admin-pill ${c.status === 'live' ? 'advero-admin-pill--ok' : 'advero-admin-pill--warn'}`}>
                  {c.status === 'live' ? 'Live' : 'Ramping'}
                </span>
              </div>
              <p className="advero-tokens-legal">{c.legalName}</p>
              <p className="advero-tokens-big">{formatTokens(c.tokens)}</p>
              <p className="advero-tokens-usd">{formatUsd(c.usd)}</p>
              <p className="advero-tokens-meta">
                {c.delta == null ? 'New this period' : `${c.delta >= 0 ? '+' : ''}${c.delta.toFixed(0)}% vs prior`}
                {' · '}
                {c.invoiceCode}
              </p>
            </button>
          );
        })}
      </div>

      <section className="advero-tokens-panel mb-6">
        <div className="advero-tokens-panel-head">
          <div>
            <p className="mono-label text-white/50">Daily consumption</p>
            <h2 className="text-sm font-semibold text-white">
              {selected === 'all' ? 'All clients' : clientById(selected).brand} · {meta.label}
            </h2>
          </div>
          <p className="advero-tokens-caption">Source: Advero metering · {meta.days} days · stacked by company</p>
        </div>
        <StackedUsageChart period={period} activeIds={activeIds} highlight={selected} />
      </section>

      <div className="advero-tokens-split mb-6">
        <section className="advero-tokens-panel">
          <div className="advero-tokens-panel-head">
            <div>
              <p className="mono-label text-white/50">By feature</p>
              <h2 className="text-sm font-semibold text-white">Where tokens went</h2>
            </div>
          </div>
          <table className="advero-admin-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Share</th>
                <th>Tokens</th>
                <th>USD</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr key={f.key}>
                  <td>{f.label}</td>
                  <td>
                    <div className="advero-tokens-bar-wrap">
                      <span className="advero-tokens-bar" style={{ width: `${Math.round(f.share * 100)}%` }} />
                      <span>{Math.round(f.share * 100)}%</span>
                    </div>
                  </td>
                  <td>{formatTokens(f.tokens)}</td>
                  <td>{formatUsd(f.usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="advero-tokens-panel">
          <div className="advero-tokens-panel-head">
            <div>
              <p className="mono-label text-white/50">By model</p>
              <h2 className="text-sm font-semibold text-white">Prompt / completion</h2>
            </div>
          </div>
          <p className="advero-tokens-caption mb-3">
            Prompt {formatTokens(split.prompt)} · Completion {formatTokens(split.completion)}
          </p>
          <table className="advero-admin-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Tokens</th>
                <th>USD</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.key}>
                  <td>{m.label}</td>
                  <td>{formatTokens(m.tokens)}</td>
                  <td>{formatUsd(m.usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="advero-tokens-panel">
        <div className="advero-tokens-panel-head">
          <div>
            <p className="mono-label text-white/50">Invoice ready</p>
            <h2 className="text-sm font-semibold text-white">Usage to bill · {meta.label}</h2>
          </div>
          <p className="advero-tokens-caption">USD {TOKEN_RATE_USD_PER_MILLION.toFixed(2)} / 1M · net 14 days</p>
        </div>
        <div className="overflow-x-auto">
          <table className="advero-admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Legal entity</th>
                <th>Invoice</th>
                <th>Tokens</th>
                <th>Amount</th>
                <th>Days live</th>
              </tr>
            </thead>
            <tbody>
              {perClient.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="advero-tokens-swatch" style={{ background: TOKEN_CLIENT_COLOR[c.id], marginRight: 8 }} />
                    {c.brand}
                  </td>
                  <td>
                    {c.legalName}
                    <div className="text-xs text-white/45">{c.website}</div>
                  </td>
                  <td>{c.invoiceCode}</td>
                  <td>{c.tokens.toLocaleString('en-US')}</td>
                  <td>{formatUsd(c.usd)}</td>
                  <td>
                    {c.daysLive}/{meta.days}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={3}>
                  <strong>Total</strong>
                </td>
                <td>
                  <strong>{perClient.reduce((s, c) => s + c.tokens, 0).toLocaleString('en-US')}</strong>
                </td>
                <td>
                  <strong>{formatUsd(perClient.reduce((s, c) => s + c.usd, 0))}</strong>
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdveroAdminTokensPage;
