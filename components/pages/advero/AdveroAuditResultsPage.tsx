import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useMarketplace } from '../../../contexts/MarketplaceContext';
import { api } from '../../../services/api';
import { buildAuditInterpretation } from '../../../lib/auditInterpretation';
import { buildPackageCards } from '../../../lib/auditPackages';
import { explainRecommendation, recommendPlan } from '../../../lib/recommendPlan';
import type { GrowthGoal, IndustryCategory } from '../../../lib/recommendPlan';
import { persistAuditSnapshot } from '../../../lib/adveroDashboardIntelligence';
import { markSetupComplete } from '../../../lib/adveroSetupProgress';
import { loadAuditFromSession, saveAuditToSession, type VisibilityAuditResult } from '../../../lib/mockAnalyzeVisibility';
import './advero-ds.css';

const AdveroAuditResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { lang } = useMarketplace();
  const isDa = lang === 'da';
  const auditId = searchParams.get('id');

  const [audit, setAudit] = useState<VisibilityAuditResult | null>(null);
  const [loading, setLoading] = useState(Boolean(auditId));

  useEffect(() => {
    if (!auditId) {
      setLoading(false);
      return;
    }
    const cached = loadAuditFromSession(auditId);
    if (cached) {
      setAudit(cached);
      persistAuditSnapshot(cached);
      markSetupComplete('audit');
      setLoading(false);
      return;
    }
    api
      .getVisibilityAudit(auditId)
      .then(({ audit: a }) => {
        setAudit(a);
        saveAuditToSession(a);
        persistAuditSnapshot(a);
        markSetupComplete('audit');
      })
      .catch(() => setAudit(null))
      .finally(() => setLoading(false));
  }, [auditId]);

  const rec = useMemo(() => {
    if (!audit) return null;
    return audit.recommendation ?? recommendPlan({
      scores: audit.scores,
      goal: audit.growthGoal,
      industry: audit.industry,
      auditId: audit.id,
    });
  }, [audit]);

  const interpretation = useMemo(() => {
    if (!audit) return null;
    return audit.interpretation ?? buildAuditInterpretation(audit.scores, audit.engine ?? 'mock');
  }, [audit]);

  const packages = useMemo(() => (rec && audit ? buildPackageCards(rec, audit.id) : []), [rec, audit]);

  const signupNext = useMemo(() => {
    if (!rec) return '/advero/signup';
    const gs = rec.ctaPath.replace(/step=\d+/, 'step=1');
    return `/advero/signup?next=${encodeURIComponent(gs)}`;
  }, [rec]);

  if (loading) {
    return (
      <div className="advero-ds flex min-h-screen items-center justify-center bg-[#334155] text-white/70">
        <p className="text-sm">{isDa ? 'Henter resultater…' : 'Loading results…'}</p>
      </div>
    );
  }

  if (!audit || !rec || !interpretation) {
    return (
      <div className="advero-ds flex min-h-screen flex-col items-center justify-center gap-4 bg-[#334155] px-4">
        <p className="text-white/80">{isDa ? 'Ingen resultater fundet.' : 'No results found.'}</p>
        <Link to="/advero/audit" className="advero-btn-slate-solid rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em]">
          {isDa ? 'Ny analyse' : 'New analysis'}
        </Link>
      </div>
    );
  }

  const copy = explainRecommendation(rec, isDa ? 'da' : 'en');
  const channels = [
    { label: isDa ? 'Søg' : 'Search', value: audit.scores.search },
    { label: isDa ? 'Lokal' : 'Local', value: audit.scores.local },
    { label: 'AI', value: audit.scores.ai },
    { label: 'Web', value: audit.scores.web },
  ];

  return (
    <div className="advero-ds relative isolate min-h-screen bg-[#334155]">
      <div className="advero-dot-grid pointer-events-none absolute inset-0 -z-10 opacity-35" aria-hidden />

      <header className="advero-site-header border-b border-white/10">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="advero-site-header-brand shrink-0" aria-label="Advero">
            <img src="/brand/advero-logo-light.png" alt="" width={800} height={168} className="advero-logo-wordmark-light object-contain object-left" />
          </Link>
          <span className="mono-label text-[10px] font-semibold tracking-[0.18em] text-emerald-300/90">
            {isDa ? 'Resultater klar' : 'Results ready'}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 pb-20 sm:px-6">
        <p className="mono-label text-[10px] tracking-[0.16em] text-white/45">{audit.companyName}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {isDa ? 'Jeres synlighedsresultater' : 'Your visibility results'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          {isDa ? interpretation.executiveSummaryDa : interpretation.executiveSummaryEn}
        </p>

        <div className="advero-results-score mt-8">
          <p className="mono-label text-[10px] text-white/45">{isDa ? 'Synlighedsscore' : 'Visibility score'}</p>
          <p className="advero-results-score-value">
            {audit.overallScore}
            <span>/100</span>
          </p>
          {audit.delta ? <p className="advero-results-score-delta">{audit.delta}</p> : null}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {channels.map((ch) => (
            <div key={ch.label} className="advero-results-channel">
              <p className="mono-label text-[9px] text-white/40">{ch.label}</p>
              <p className="mt-1 text-xl font-bold text-white">{ch.value}</p>
            </div>
          ))}
        </div>

        <section className="advero-results-panel mt-8">
          <h2 className="text-base font-semibold text-white">{isDa ? 'Nøglefund' : 'Key findings'}</h2>
          <p className="mt-2 text-sm text-white/60">{audit.topRecommendation}</p>
          <ul className="mt-4 space-y-2">
            {(isDa ? interpretation.opportunitiesDa : interpretation.opportunitiesEn).slice(0, 3).map((o) => (
              <li key={o} className="flex gap-2 text-sm text-white/72">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300/90" aria-hidden />
                {o}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="advero-results-panel">
            <h2 className="text-base font-semibold text-white">{isDa ? 'TopRank-analyse' : 'TopRank analysis'}</h2>
            <ul className="mt-4 space-y-2">
              {interpretation.engineChecks.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-white/75">{isDa ? c.labelDa : c.labelEn}</span>
                  <span className={c.ok ? 'text-emerald-300/90' : 'text-amber-200/90'}>
                    {isDa ? c.statusDa : c.statusEn}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="advero-results-panel advero-results-panel--ai">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-200/90" aria-hidden />
              <h2 className="text-base font-semibold text-white">{isDa ? 'AI-klarhed' : 'AI readiness'}</h2>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">{audit.scores.ai}/100</p>
            <p className="mt-1 text-sm text-white/55">
              {isDa ? interpretation.aiReadinessLabelDa : interpretation.aiReadinessLabelEn}
            </p>
          </section>
        </div>

        <section className="advero-results-panel mt-6">
          <h2 className="text-base font-semibold text-white">{isDa ? 'Vækstmuligheder' : 'Growth opportunities'}</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {(isDa ? interpretation.opportunitiesDa : interpretation.opportunitiesEn).map((o) => (
              <li key={o} className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-white/65">
                {o}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-white">{isDa ? 'Anbefalet pakke' : 'Recommended package'}</h2>
          <p className="mt-1 text-sm text-white/55">{copy.headline}</p>
          <p className="mt-2 text-sm text-white/50">{copy.reason}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {packages.map((pkg) => (
              <article
                key={pkg.id}
                className={`advero-results-package ${pkg.recommended ? 'advero-results-package--rec' : ''}`}
              >
                {pkg.recommended ? (
                  <span className="advero-results-package-badge">
                    {isDa ? 'Anbefalet' : 'Recommended'}
                  </span>
                ) : null}
                <h3 className="text-sm font-semibold text-white">{isDa ? pkg.nameDa : pkg.nameEn}</h3>
                <p className="mt-1 text-xs text-white/50">{isDa ? pkg.descDa : pkg.descEn}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="advero-results-cta mt-10 rounded-2xl border border-white/12 bg-white/[0.04] p-6 text-center sm:p-8">
          <p className="text-sm text-white/65">
            {isDa
              ? 'Næste skridt: opret konto → vælg pakke → betaling → dashboard.'
              : 'Next: create account → choose package → payment → dashboard.'}
          </p>
          <Link
            to={signupNext}
            className="advero-btn-slate-solid mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em]"
          >
            {isDa ? 'Opret konto og fortsæt' : 'Create account and continue'}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <p className="mt-4 text-xs text-white/40">
            {isDa ? 'Har du allerede en konto?' : 'Already have an account?'}{' '}
            <Link to={`/advero/login?next=${encodeURIComponent(rec.ctaPath.replace(/step=\d+/, 'step=1'))}`} className="underline hover:text-white/70">
              {isDa ? 'Log ind' : 'Log in'}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdveroAuditResultsPage;
