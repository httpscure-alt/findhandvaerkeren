import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Download,
  Minus,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useMarketplace } from '../../../../contexts/MarketplaceContext';
import { useAdveroDashboardData } from '../../../../hooks/useAdveroDashboardData';
import { buildDashboardIntelligence } from '../../../../lib/adveroDashboardIntelligence';
import { markSetupComplete } from '../../../../lib/adveroSetupProgress';
import { getDashboardHomeCopy } from './adveroDashboardHomeCopy';
import AdveroDashboardPageHeader from './AdveroDashboardPageHeader';
import AdveroHomeSparkline from './AdveroHomeSparkline';
import {
  AdveroDashboardConnectedFlow,
  AdveroDashboardGrowthUpsell,
  AdveroDashboardManualFulfillmentBanner,
  AdveroDashboardPriorityBlock,
  AdveroDashboardSetupChecklist,
  AdveroDashboardVisibilityHistory,
  AdveroDashboardWorkspaceHealth,
  MetricBusinessImpact,
} from './AdveroDashboardIntelligenceBlocks';

function TrendIcon({ trend }: { trend: 'up' | 'flat' | 'down' }) {
  if (trend === 'up') return <TrendingUp size={14} className="text-emerald-300/90" aria-hidden />;
  if (trend === 'down') return <ArrowUpRight size={14} className="rotate-90 text-amber-300/90" aria-hidden />;
  return <Minus size={14} className="text-white/40" aria-hidden />;
}

const AdveroDashboardHomePage: React.FC = () => {
  const { lang } = useMarketplace();
  const isDa = lang === 'da';
  const { payload: apiPayload } = useAdveroDashboardData(lang === 'da' ? 'da' : 'en');
  const entitlements = apiPayload?.entitlements;
  const showSeo = Boolean(entitlements?.seo);
  const showAds = Boolean(entitlements?.ads);
  const showAi = Boolean(entitlements?.aiVisibility);

  useEffect(() => {
    markSetupComplete('dashboard');
  }, []);

  const intel = useMemo(() => buildDashboardIntelligence(lang, apiPayload), [lang, apiPayload]);

  useEffect(() => {
    const s = apiPayload?.workspace?.setupState;
    if (s && (s as { auditComplete?: boolean }).auditComplete) markSetupComplete('audit');
    if (s && (s as { gsc?: boolean }).gsc) markSetupComplete('gsc');
    if (apiPayload?.googleAds?.connected && apiPayload.googleAds.source === 'google') {
      markSetupComplete('ads');
    }
  }, [apiPayload]);
  const c = useMemo(() => getDashboardHomeCopy(lang), [lang]);

  const activityItems =
    apiPayload?.activity?.length && apiPayload.activity.length > 0
      ? apiPayload.activity.map((e) => (lang === 'da' ? e.titleDa : e.titleEn))
      : c.activitySection.items;

  return (
    <>
      <AdveroDashboardPageHeader
        eyebrow={intel.hasAudit ? (isDa ? 'Synlighedsoverblik' : 'Visibility overview') : c.eyebrow}
        title={c.title}
      />

      <div className="advero-dash-page-body advero-home">
        <p className="advero-dash-lead advero-home-lead">
          {intel.hasAudit && intel.companyName
            ? isDa
              ? `Overblik for ${intel.companyName} — fortolket til forretningsværdi, ikke SEO-jargon.`
              : `Overview for ${intel.companyName} — translated into business value, not SEO jargon.`
            : c.lead}
        </p>

        {apiPayload?.manualFulfillment ? (
          <AdveroDashboardManualFulfillmentBanner
            manual={apiPayload.manualFulfillment}
            isDa={isDa}
          />
        ) : null}

        <AdveroDashboardSetupChecklist intel={intel} isDa={isDa} />
        <AdveroDashboardPriorityBlock intel={intel} isDa={isDa} />
        <AdveroDashboardConnectedFlow
          intel={{
            ...intel,
            connectedFlow: intel.connectedFlow.filter(
              (step) => step.key !== 'campaigns' || showAds
            ),
          }}
          isDa={isDa}
        />
        <AdveroDashboardWorkspaceHealth intel={intel} isDa={isDa} />

        <div className="advero-home-metrics">
          {intel.metrics
            .filter((m) => {
              if (m.key === 'leads') return showAds;
              if (m.key === 'ai') return showAi;
              if (m.key === 'search') return showSeo;
              return true;
            })
            .map((m, i) => (
            <article
              key={m.key}
              className={`advero-home-metric advero-home-metric--${m.tone} advero-home-enter ${
                m.highlight ? 'advero-home-metric--featured' : ''
              }`}
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <p className="advero-home-metric-label mono-label">{m.label}</p>
              <div className="advero-home-metric-value-row">
                <span className="advero-home-metric-value">{m.value}</span>
                {m.suffix ? <span className="advero-home-metric-suffix">{m.suffix}</span> : null}
              </div>
              <p className="advero-home-metric-delta">{m.delta}</p>
              <MetricBusinessImpact text={m.businessImpact} />
            </article>
          ))}
        </div>

        <AdveroDashboardVisibilityHistory
          intel={{
            ...intel,
            visibilityCategories: intel.visibilityCategories.filter((cat) => {
              const n = cat.name.toLowerCase();
              if (!showAi && n.includes('ai')) return false;
              if (
                !showSeo &&
                (n.includes('search') ||
                  n.includes('local') ||
                  n.includes('søg') ||
                  n.includes('søge') ||
                  n.includes('lokal'))
              ) {
                return false;
              }
              return true;
            }),
          }}
          isDa={isDa}
        />

        <section className="advero-home-panel advero-home-enter" style={{ animationDelay: '220ms' }}>
          <div className="advero-home-panel-head">
            <div>
              <h2 className="advero-home-section-title">{c.visibilitySection.title}</h2>
              <p className="advero-home-section-sub">{c.visibilitySection.subtitle}</p>
            </div>
            <Link to="/advero/dashboard/visibility" className="advero-dash-btn-ghost !mt-0 inline-flex items-center gap-2 text-xs">
              {isDa ? 'Audit' : 'Audit'}
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="advero-home-visibility-grid">
            <div className="advero-home-visibility-chart">
              <AdveroHomeSparkline
                points={intel.history.map((h) => h.score)}
              />
              <p className="advero-home-chart-caption mono-label">
                {isDa ? 'Synlighed — 6 måneder' : 'Visibility — 6 months'}
              </p>
            </div>
            <ul className="advero-home-visibility-list">
              {intel.visibilityCategories
                .filter((cat) => {
                  const n = cat.name.toLowerCase();
                  if (!showAi && n.includes('ai')) return false;
                  if (
                    !showSeo &&
                    (n.includes('search') ||
                      n.includes('local') ||
                      n.includes('søg') ||
                      n.includes('søge') ||
                      n.includes('lokal'))
                  ) {
                    return false;
                  }
                  return true;
                })
                .map((cat) => (
                <li key={cat.name} className="advero-home-visibility-row">
                  <div className="advero-home-visibility-row-top">
                    <span className="advero-home-visibility-name">{cat.name}</span>
                    <span className="advero-home-visibility-status">
                      <TrendIcon trend={cat.trend} />
                      {cat.status}
                    </span>
                  </div>
                  <p className="advero-home-visibility-insight">{cat.insight}</p>
                  <p className="advero-dash-channel-impact">{cat.businessImpact}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="advero-home-two-col">
          <section className="advero-home-panel advero-home-enter" style={{ animationDelay: '280ms' }}>
            <div className="advero-home-panel-head">
              <div>
                <h2 className="advero-home-section-title">{c.actionsSection.title}</h2>
                <p className="advero-home-section-sub">{c.actionsSection.subtitle}</p>
              </div>
            </div>
            <ul className="advero-home-actions">
              {(intel.actionsFromAudit.length > 0 ? intel.actionsFromAudit : c.actionsSection.items.map((item) => ({
                title: item.title,
                body: item.body,
                priority: item.priority,
                priorityKey: item.priorityKey,
                cta: item.cta,
                ctaHref: intel.priority.ctaHref,
              }))).map((item) => (
                <li key={item.title}>
                  <article className="advero-home-action-card">
                    <div className="advero-home-action-top">
                      <span className={`advero-home-priority advero-home-priority--${item.priorityKey}`}>
                        {item.priority}
                      </span>
                    </div>
                    <h3 className="advero-home-action-title">{item.title}</h3>
                    <p className="advero-home-action-body">{item.body}</p>
                    <Link to={item.ctaHref} className="advero-home-action-cta">
                      {item.cta}
                      <ArrowRight size={14} aria-hidden />
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          </section>

          <div className="advero-home-stack">
            {showAds ? (
              <section className="advero-home-panel advero-home-enter" style={{ animationDelay: '320ms' }}>
                <div className="advero-home-panel-head">
                  <div>
                    <h2 className="advero-home-section-title">{c.leadsSection.title}</h2>
                    <p className="advero-home-section-sub">{c.leadsSection.subtitle}</p>
                  </div>
                  <Link
                    to="/advero/dashboard/campaigns"
                    className="advero-dash-btn-ghost !mt-0 text-xs"
                  >
                    {isDa ? 'Kampagner' : 'Campaigns'}
                  </Link>
                </div>
                <div className="advero-home-leads-grid">
                  {intel.leads.stats.map((s) => (
                    <div key={s.label} className="advero-home-lead-stat">
                      <p className="advero-home-lead-label mono-label">{s.label}</p>
                      <p className="advero-home-lead-value">{s.value}</p>
                    </div>
                  ))}
                </div>
                <p className="mono-label mt-2 text-[10px] text-white/40">{intel.leads.deltaLabel}</p>
                <div className="advero-home-mini-chart">
                  <AdveroHomeSparkline points={intel.leads.trendPoints} />
                </div>
              </section>
            ) : null}

            {showAi ? (
              <section
                className="advero-home-panel advero-home-panel--ai advero-home-enter"
                style={{ animationDelay: '360ms' }}
              >
                <div className="advero-home-panel-head">
                  <div className="advero-home-ai-title-row">
                    <Sparkles size={18} className="text-sky-200/80 shrink-0" aria-hidden />
                    <div>
                      <h2 className="advero-home-section-title">{c.aiSection.title}</h2>
                      <p className="advero-home-section-sub">{c.aiSection.subtitle}</p>
                    </div>
                  </div>
                </div>
                <p className="advero-home-ai-headline">{intel.aiSection.headline}</p>
                <MetricBusinessImpact text={intel.aiSection.businessImpact} />
                <div className="advero-home-ai-score">
                  <p className="mono-label advero-home-ai-score-label">
                    {isDa ? 'AI-score' : 'AI score'} · {intel.aiSection.readinessLabel}
                  </p>
                  <p className="advero-home-ai-score-value">
                    {intel.aiSection.opportunityValue}
                    <span className="advero-home-ai-score-max">/ 100</span>
                  </p>
                </div>
                <div className="advero-home-mini-chart advero-home-mini-chart--glow">
                  <AdveroHomeSparkline
                    points={[
                      48,
                      52,
                      54,
                      58,
                      62,
                      65,
                      68,
                      70,
                      intel.history[intel.history.length - 1]?.score ?? 72,
                    ]}
                  />
                </div>
                <div className="advero-home-ai-suggestions">
                  <p className="mono-label advero-home-ai-suggestions-label">{c.aiSection.suggestionsTitle}</p>
                  <ul>
                    {intel.aiSection.suggestions.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}
          </div>
        </div>

        <section className="advero-home-panel advero-home-enter" style={{ animationDelay: '400ms' }}>
          <div className="advero-home-panel-head">
            <div>
              <h2 className="advero-home-section-title">{c.activitySection.title}</h2>
              <p className="advero-home-section-sub">{c.activitySection.subtitle}</p>
            </div>
          </div>
          <ul className="advero-home-timeline">
            {activityItems.map((item, i) => (
              <li key={item} className="advero-home-timeline-item" style={{ animationDelay: `${420 + i * 40}ms` }}>
                <span className="advero-home-timeline-check" aria-hidden>
                  <Check size={12} strokeWidth={2.5} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="advero-home-panel advero-home-enter" style={{ animationDelay: '440ms' }}>
          <div className="advero-home-panel-head advero-home-panel-head--split">
            <div>
              <h2 className="advero-home-section-title">{c.reportsSection.title}</h2>
              <p className="advero-home-section-sub">{intel.reportNarrative}</p>
            </div>
            <Link to="/advero/dashboard/reports" className="advero-dash-btn-ghost !mt-0 inline-flex items-center gap-2 text-xs">
              {c.reportsSection.viewAll}
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="advero-home-reports">
            {c.reportsSection.items.map((r) => (
              <article key={r.title} className="advero-home-report-card">
                <div>
                  <h3 className="advero-home-report-title">{r.title}</h3>
                  <p className="advero-home-report-date mono-label">{r.date}</p>
                </div>
                <button type="button" className="advero-home-report-btn" disabled title={isDa ? 'Kommer med fuld rapport' : 'Coming with full report'}>
                  <Download size={15} aria-hidden />
                  {c.reportsSection.download}
                </button>
              </article>
            ))}
          </div>
        </section>

        <AdveroDashboardGrowthUpsell intel={intel} isDa={isDa} />
      </div>
    </>
  );
};

export default AdveroDashboardHomePage;
