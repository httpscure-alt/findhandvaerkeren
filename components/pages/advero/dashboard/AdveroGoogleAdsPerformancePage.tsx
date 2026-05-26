import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Megaphone, Sparkles, TrendingUp } from 'lucide-react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { api } from '../../../../services/api';
import type { AdveroDashboardApiPayload } from '../../../../lib/adveroDashboardApi';
import AdveroDashboardPageHeader from './AdveroDashboardPageHeader';
import AdveroHomeSparkline from './AdveroHomeSparkline';
import { buildDashboardIntelligence, getLastDashboardAudit } from '../../../../lib/adveroDashboardIntelligence';
import { AdveroDashboardConnectedFlow } from './AdveroDashboardIntelligenceBlocks';
import { getGoogleAdsCopy } from './adveroGoogleAdsCopy';

const AdveroGoogleAdsPerformancePage: React.FC = () => {
  const { lang } = useMarketplace();
  const c = useMemo(() => getGoogleAdsCopy(lang), [lang]);
  const [apiPayload, setApiPayload] = useState<AdveroDashboardApiPayload | null>(null);
  const intel = useMemo(() => buildDashboardIntelligence(lang, apiPayload), [lang, apiPayload]);
  const isDa = lang === 'da';
  const ads = apiPayload?.googleAds;
  const liveAds = ads?.connected && ads.source === 'google';

  useEffect(() => {
    const last = getLastDashboardAudit();
    api
      .getAdveroDashboard(last?.id, isDa ? 'da' : 'en')
      .then(setApiPayload)
      .catch(() => setApiPayload(null));
  }, [isDa]);

  const metrics = useMemo(() => {
    if (!liveAds || !ads) return c.metrics;
    return c.metrics.map((m) => {
      if (m.key === 'inquiries' && ads.conversions != null) {
        return {
          ...m,
          value: String(Math.round(ads.conversions)),
          hint: ads.syncedAt
            ? isDa
              ? `Synket ${new Date(ads.syncedAt).toLocaleDateString('da-DK')}`
              : `Synced ${new Date(ads.syncedAt).toLocaleDateString('en-DK')}`
            : m.hint,
        };
      }
      if (m.key === 'efficiency' && ads.costDkk) {
        return { ...m, value: ads.costDkk, hint: isDa ? 'Forbrug seneste 30 dage' : 'Spend last 30 days' };
      }
      if (m.key === 'visibility' && ads.clicks != null) {
        return {
          ...m,
          value: `${ads.clicks}`,
          suffix: isDa ? 'klik' : 'clicks',
          hint: ads.impressions != null ? `${ads.impressions} ${isDa ? 'visninger' : 'impressions'}` : m.hint,
        };
      }
      return m;
    });
  }, [liveAds, ads, c.metrics, isDa]);

  return (
    <>
      <AdveroDashboardPageHeader
        eyebrow={c.eyebrow}
        title={c.title}
        actions={
          <div className="advero-gads-status-wrap">
            <span className="advero-gads-status-pulse" aria-hidden />
            <span className="advero-gads-status-pill">
              <Megaphone size={13} aria-hidden />
              {liveAds
                ? `${c.statusActive} · ${ads?.customerName || c.statusDetail}`
                : `${c.statusActive} · ${c.statusDetail}`}
            </span>
            <span className="advero-gads-trend-pill">
              <TrendingUp size={13} aria-hidden />
              {c.monthlyTrend}
            </span>
          </div>
        }
      />

      <div className="advero-dash-page-body advero-gads">
        <p className="advero-dash-lead advero-home-lead">{c.subtitle}</p>

        {!liveAds ? (
          <p className="mb-6 rounded-xl border border-violet-400/25 bg-violet-500/10 px-4 py-3 text-sm text-violet-100/95">
            {isDa
              ? 'Forbind en rigtig Google Ads-konto for at se live tal (ikke eksempeldata).'
              : 'Connect a real Google Ads account to see live metrics (not sample data).'}{' '}
            <Link to="/advero/dashboard/settings" className="font-medium text-white underline underline-offset-2">
              {isDa ? 'Gå til integrationer' : 'Open integrations'}
            </Link>
          </p>
        ) : null}

        {intel.hasAudit ? (
          <p className="advero-dash-campaigns-bridge">
            {isDa
              ? `Koblet til audit: ${intel.connectedFlow[3]?.detail ?? ''}`
              : `Linked to audit: ${intel.connectedFlow[3]?.detail ?? ''}`}
          </p>
        ) : null}

        <AdveroDashboardConnectedFlow intel={intel} isDa={isDa} />

        <div className="advero-home-metrics">
          {metrics.map((m, i) => (
            <article
              key={m.key}
              className={`advero-home-metric advero-home-metric--${m.tone} advero-home-enter`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <p className="advero-home-metric-label mono-label">{m.label}</p>
              <div className="advero-home-metric-value-row">
                <span className="advero-home-metric-value">{m.value}</span>
                {'suffix' in m && m.suffix ? (
                  <span className="advero-home-metric-suffix">{m.suffix}</span>
                ) : null}
              </div>
              <p className="advero-home-metric-delta">{m.hint}</p>
            </article>
          ))}
        </div>

        <section className="advero-home-panel advero-home-enter" style={{ animationDelay: '200ms' }}>
          <div className="advero-home-panel-head">
            <div>
              <h2 className="advero-home-section-title">{c.overview.title}</h2>
              <p className="advero-home-section-sub">{c.overview.subtitle}</p>
            </div>
          </div>
          <div className="advero-gads-overview-grid">
            {c.overview.items.map((item) => (
              <div key={item.label} className="advero-gads-overview-card">
                <p className="mono-label advero-gads-overview-label">{item.label}</p>
                <p className="advero-gads-overview-value">{item.value}</p>
                <p className="advero-gads-overview-detail">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="advero-home-panel advero-home-enter" style={{ animationDelay: '260ms' }}>
          <div className="advero-home-panel-head">
            <div>
              <h2 className="advero-home-section-title">{c.trend.title}</h2>
              <p className="advero-home-section-sub">{c.trend.subtitle}</p>
            </div>
            <span className="advero-gads-trend-meta mono-label">{c.trend.growth}</span>
          </div>
          <div className="advero-gads-trend-chart">
            <div className="advero-gads-trend-legend">
              <span>
                <i className="advero-gads-legend-dot advero-gads-legend-dot--sky" aria-hidden />
                {c.trend.visibility}
              </span>
              <span>
                <i className="advero-gads-legend-dot advero-gads-legend-dot--violet" aria-hidden />
                {c.trend.inquiries}
              </span>
            </div>
            <AdveroHomeSparkline points={[38, 42, 44, 48, 52, 55, 58, 62, 66, 70, 74]} />
            <div className="advero-gads-trend-secondary">
              <AdveroHomeSparkline points={[10, 11, 12, 14, 13, 15, 16, 17, 18, 17, 18]} />
            </div>
          </div>
        </section>

        <div className="advero-home-two-col">
          <section className="advero-home-panel advero-home-enter" style={{ animationDelay: '300ms' }}>
            <div className="advero-home-panel-head">
              <div>
                <h2 className="advero-home-section-title">{c.opportunities.title}</h2>
                <p className="advero-home-section-sub">{c.opportunities.subtitle}</p>
              </div>
            </div>
            <ul className="advero-home-actions">
              {c.opportunities.items.map((item) => (
                <li key={item.title}>
                  <article className="advero-home-action-card">
                    <span className={`advero-home-priority advero-home-priority--${item.impactKey}`}>
                      {item.impact}
                    </span>
                    <h3 className="advero-home-action-title">{item.title}</h3>
                    <p className="advero-home-action-body">{item.body}</p>
                    <button type="button" className="advero-home-action-cta">
                      {item.cta}
                      <ArrowRight size={14} aria-hidden />
                    </button>
                  </article>
                </li>
              ))}
            </ul>
          </section>

          <div className="advero-home-stack">
            <section className="advero-home-panel advero-home-enter" style={{ animationDelay: '340ms' }}>
              <div className="advero-home-panel-head">
                <div>
                  <h2 className="advero-home-section-title">{c.landing.title}</h2>
                  <p className="advero-home-section-sub">{c.landing.subtitle}</p>
                </div>
              </div>
              <p className="advero-gads-landing-highlight">{c.landing.highlight}</p>
              <div className="advero-gads-tags">
                {c.landing.tags.map((t) => (
                  <span key={t.label} className={`advero-gads-tag advero-gads-tag--${t.tone}`}>
                    {t.label}
                  </span>
                ))}
              </div>
              <ul className="advero-gads-suggest-list">
                {c.landing.suggestions.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>

            <section className="advero-home-panel advero-home-panel--ai advero-home-enter" style={{ animationDelay: '380ms' }}>
              <div className="advero-home-panel-head">
                <div className="advero-home-ai-title-row">
                  <Sparkles size={18} className="text-sky-200/80 shrink-0" aria-hidden />
                  <div>
                    <h2 className="advero-home-section-title">{c.ai.title}</h2>
                    <p className="advero-home-section-sub">{c.ai.subtitle}</p>
                  </div>
                </div>
              </div>
              <div className="advero-gads-ai-grid">
                {c.ai.cards.map((card) => (
                  <article key={card.title} className="advero-gads-ai-card">
                    <h3 className="advero-gads-ai-card-title">{card.title}</h3>
                    <p className="advero-gads-ai-card-body">{card.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section className="advero-home-panel advero-home-enter" style={{ animationDelay: '420ms' }}>
          <div className="advero-home-panel-head">
            <div>
              <h2 className="advero-home-section-title">{c.timeline.title}</h2>
              <p className="advero-home-section-sub">{c.timeline.subtitle}</p>
            </div>
          </div>
          <ul className="advero-home-timeline">
            {c.timeline.items.map((item, i) => (
              <li key={item} className="advero-home-timeline-item" style={{ animationDelay: `${440 + i * 35}ms` }}>
                <span className="advero-home-timeline-check" aria-hidden>
                  <Check size={12} strokeWidth={2.5} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
};

export default AdveroGoogleAdsPerformancePage;
