import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useAdveroLang } from '../../../lib/adveroLocale';
import { api } from '../../../services/api';
import { buildAuditInterpretation } from '../../../lib/auditInterpretation';
import { buildPackageCards } from '../../../lib/auditPackages';
import { explainRecommendation, recommendPlan } from '../../../lib/recommendPlan';
import type { GrowthGoal, IndustryCategory } from '../../../lib/recommendPlan';
import { persistAuditSnapshot } from '../../../lib/adveroDashboardIntelligence';
import { resultsNextCopy } from '../../../lib/adveroJourneyStory';
import { markSetupComplete } from '../../../lib/adveroSetupProgress';
import { loadAuditFromSession, saveAuditToSession, type VisibilityAuditResult } from '../../../lib/mockAnalyzeVisibility';
import GetStartedRecommendationPanel from './GetStartedRecommendationPanel';
import './advero-ds.css';

const AdveroAuditResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { isDa } = useAdveroLang();
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
    return (
      audit.recommendation ??
      recommendPlan({
        scores: audit.scores,
        goal: audit.growthGoal,
        industry: audit.industry,
        auditId: audit.id,
      })
    );
  }, [audit]);

  const interpretation = useMemo(() => {
    if (!audit) return null;
    return audit.interpretation ?? buildAuditInterpretation(audit.scores, audit.engine ?? 'mock');
  }, [audit]);

  const packages = useMemo(() => (rec && audit ? buildPackageCards(rec, audit.id) : []), [rec, audit]);

  const getStartedPath = useMemo(() => {
    if (!rec) return '/advero/get-started?step=2';
    const gs = rec.ctaPath.replace(/step=\d+/, 'step=2');
    return gs.includes('step=') ? gs : `${gs}${gs.includes('?') ? '&' : '?'}step=2`;
  }, [rec]);

  const signupNext = useMemo(
    () => `/advero/signup?next=${encodeURIComponent(getStartedPath.replace(/step=\d+/, 'step=3'))}`,
    [getStartedPath]
  );

  const loginNext = useMemo(
    () => `/advero/login?next=${encodeURIComponent(getStartedPath.replace(/step=\d+/, 'step=3'))}`,
    [getStartedPath]
  );

  const shellHeader = (
    <header className="advero-site-header">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-4 sm:px-10 sm:py-5">
        <Link to="/" className="advero-site-header-brand shrink-0" aria-label="Advero">
          <img
            src="/brand/advero-logo-light.png"
            alt=""
            width={800}
            height={168}
            className="advero-logo-wordmark-light object-contain object-left"
          />
        </Link>
        <Link to="/" className="advero-btn-ghost text-[11px] font-semibold uppercase tracking-[0.12em]">
          {isDa ? 'Til forsiden' : 'Back to home'}
        </Link>
      </div>
    </header>
  );

  if (loading) {
    return (
      <div className="advero-ds relative isolate min-h-screen">
        <div className="advero-dot-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />
        {shellHeader}
        <div className="flex min-h-[50vh] items-center justify-center px-4">
          <p className="text-sm text-white/70">{isDa ? 'Henter resultater…' : 'Loading results…'}</p>
        </div>
      </div>
    );
  }

  if (!audit || !rec || !interpretation) {
    return (
      <div className="advero-ds relative isolate min-h-screen">
        <div className="advero-dot-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />
        {shellHeader}
        <div className="relative z-[1] flex flex-col items-center px-4 py-16">
          <div className="advero-setup-card w-full text-center">
            <div className="advero-setup-card-corner" aria-hidden />
            <div className="p-8">
              <p className="text-sm text-slate-600">{isDa ? 'Ingen resultater fundet.' : 'No results found.'}</p>
              <Link
                to="/advero/audit"
                className="advero-btn-slate-solid mt-5 inline-flex rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em]"
              >
                {isDa ? 'Ny analyse' : 'New analysis'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const copy = explainRecommendation(rec, isDa ? 'da' : 'en');
  const opportunities = (isDa ? interpretation.opportunitiesDa : interpretation.opportunitiesEn).slice(0, 4);
  const summary = isDa ? interpretation.executiveSummaryDa : interpretation.executiveSummaryEn;

  return (
    <div className="advero-ds relative isolate min-h-screen">
      <div className="advero-dot-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />
      {shellHeader}

      <div className="relative z-[1] flex flex-col items-center px-4 py-8 pb-24 sm:px-6 lg:px-10">
        <div className="advero-setup-card advero-setup-card--wide w-full">
          <div className="advero-setup-card-corner" aria-hidden />
          <div className="advero-setup-card-head">
            <p className="mono-label text-[10px] text-slate-500">{isDa ? 'Resultater klar' : 'Results ready'}</p>
            <h1 className="advero-setup-card-title mt-1">{isDa ? 'Jeres synlighedsresultater' : 'Your visibility results'}</h1>
            <p className="advero-setup-card-sub">{summary}</p>
            {audit.delta ? (
              <p className="advero-setup-progress-pill mt-3 text-emerald-700">{audit.delta}</p>
            ) : null}
          </div>

          <div className="advero-setup-divider" aria-hidden />

          <div className="advero-setup-body">
            <div className="advero-setup-body-inner space-y-6">
              <GetStartedRecommendationPanel audit={audit} recommendation={rec} isDa={isDa} />

              <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <h2 className="text-sm font-semibold text-slate-900">{isDa ? 'Nøglefund' : 'Key findings'}</h2>
                <p className="mt-2 text-sm text-slate-600">{audit.topRecommendation}</p>
                <ul className="mt-3 space-y-2">
                  {opportunities.slice(0, 3).map((o) => (
                    <li key={o} className="flex gap-2 text-sm text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                      {o}
                    </li>
                  ))}
                </ul>
              </section>

              <div className="grid gap-4 sm:grid-cols-2">
                <section className="rounded-xl border border-slate-200 p-4">
                  <h2 className="text-sm font-semibold text-slate-900">{isDa ? 'Synlighedstjek' : 'Visibility checks'}</h2>
                  <ul className="mt-3 space-y-2">
                    {interpretation.engineChecks.map((c) => (
                      <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-slate-700">{isDa ? c.labelDa : c.labelEn}</span>
                        <span className={c.ok ? 'font-medium text-emerald-700' : 'font-medium text-amber-700'}>
                          {isDa ? c.statusDa : c.statusEn}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-sky-600" aria-hidden />
                    <h2 className="text-sm font-semibold text-slate-900">{isDa ? 'AI-klarhed' : 'AI readiness'}</h2>
                  </div>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{audit.scores.ai}/100</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {isDa ? interpretation.aiReadinessLabelDa : interpretation.aiReadinessLabelEn}
                  </p>
                </section>
              </div>

              {opportunities.length > 3 ? (
                <section>
                  <h2 className="mono-label mb-2 text-[10px] text-slate-500">
                    {isDa ? 'Vækstmuligheder' : 'Growth opportunities'}
                  </h2>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {opportunities.map((o) => (
                      <li key={o} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                        {o}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section>
                <h2 className="text-sm font-semibold text-slate-900">{isDa ? 'Anbefalet pakke' : 'Recommended package'}</h2>
                <p className="mt-1 text-sm text-slate-600">{copy.headline}</p>
                <p className="mt-1 text-sm text-slate-500">{copy.reason}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {packages.map((pkg) => (
                    <article
                      key={pkg.id}
                      className={`advero-pick-tile px-3 py-3.5 text-left ${pkg.recommended ? 'advero-pick-tile--on' : ''}`}
                    >
                      {pkg.recommended ? (
                        <span className="advero-pick-tile-badge-rec">{isDa ? 'Anbefalet' : 'Recommended'}</span>
                      ) : null}
                      <h3 className="text-sm font-semibold text-slate-900">{isDa ? pkg.nameDa : pkg.nameEn}</h3>
                      <p className="mt-1 text-xs text-slate-500">{isDa ? pkg.descDa : pkg.descEn}</p>
                    </article>
                  ))}
                </div>
              </section>

              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 text-center">
                <p className="text-sm text-slate-600">{resultsNextCopy(isDa)}</p>
                <Link
                  to={getStartedPath}
                  className="advero-btn-slate-solid mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em]"
                >
                  {isDa ? 'Se anbefalet plan' : 'View recommended plan'}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <p className="mt-3 text-xs text-slate-500">
                  {isDa ? 'Har du allerede en konto?' : 'Already have an account?'}{' '}
                  <Link to={loginNext} className="font-semibold text-sky-700 underline">
                    {isDa ? 'Log ind' : 'Log in'}
                  </Link>
                  {' · '}
                  <Link to={signupNext} className="font-semibold text-sky-700 underline">
                    {isDa ? 'Opret konto' : 'Create account'}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdveroAuditResultsPage;
