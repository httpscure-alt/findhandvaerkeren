import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { useAdveroLang } from '../../../lib/adveroLocale';
import { api } from '../../../services/api';
import { persistAuditSnapshot } from '../../../lib/adveroDashboardIntelligence';
import { markSetupComplete } from '../../../lib/adveroSetupProgress';
import { mockAnalyzeVisibility, saveAuditToSession } from '../../../lib/mockAnalyzeVisibility';
import { getJourneyStoryCopy } from '../../../lib/adveroJourneyStory';
import './advero-ds.css';

const MIN_MS = 4800;

type StepId = 'visibility' | 'local' | 'ai' | 'interpret' | 'package';

const AdveroAuditAnalyzingPage: React.FC = () => {
  const { isDa } = useAdveroLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auditId = searchParams.get('id');

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statusLabel, setStatusLabel] = useState<string | null>(null);

  const story = useMemo(() => getJourneyStoryCopy(), []);

  const steps = useMemo(
    () =>
      [
        { id: 'visibility' as StepId, da: 'Kører synlighedsanalyse', en: 'Running visibility analysis' },
        { id: 'local' as StepId, da: 'Tjekker lokal synlighed', en: 'Checking local discoverability' },
        { id: 'ai' as StepId, da: 'Vurderer AI-klarhed', en: 'Evaluating AI readiness' },
        { id: 'interpret' as StepId, da: 'Fortolker resultater', en: 'Interpreting results' },
        { id: 'package' as StepId, da: 'Anbefaler den rigtige pakke', en: 'Matching the right package' },
      ],
    []
  );

  useEffect(() => {
    if (!auditId) {
      navigate('/advero/audit', { replace: true });
      return;
    }

    let cancelled = false;
    const started = Date.now();

    const stepTimer = window.setInterval(() => {
      setActiveStep((s) => Math.min(s + 1, steps.length - 1));
    }, 900);

    (async () => {
      let audit;
      try {
        setStatusLabel(isDa ? 'Job i kø…' : 'Job queued…');
        const res = await api.pollVisibilityAudit(auditId);
        audit = res.audit;
        if (audit.status === 'failed') {
          throw new Error(audit.errorMessage || 'failed');
        }
      } catch (err) {
        if ((err as Error).message === 'AUDIT_TIMEOUT' || (err as Error).message === 'failed') {
          if (!cancelled) {
            setError(isDa ? 'Analysen mislykkedes. Prøv igen.' : 'Analysis failed. Please try again.');
          }
          return;
        }
        audit = mockAnalyzeVisibility({
          companyName: 'Demo',
          contactEmail: 'demo@advero.dk',
        });
        audit = { ...audit, id: auditId };
      }

      const elapsed = Date.now() - started;
      if (elapsed < MIN_MS) {
        await new Promise((r) => setTimeout(r, MIN_MS - elapsed));
      }

      if (cancelled) return;

      saveAuditToSession(audit);
      persistAuditSnapshot(audit);
      markSetupComplete('audit');
      window.clearInterval(stepTimer);
      navigate(`/advero/audit/results?id=${audit.id}`, { replace: true });
    })().catch(() => {
      if (!cancelled) {
        setError(isDa ? 'Analysen mislykkedes. Prøv igen.' : 'Analysis failed. Please try again.');
      }
    });

    return () => {
      cancelled = true;
      window.clearInterval(stepTimer);
    };
  }, [auditId, isDa, navigate, steps.length]);

  return (
    <div className="advero-ds relative isolate min-h-screen">
      <div className="advero-dot-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />

      <main className="relative z-[1] mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <div className="advero-setup-card w-full">
          <div className="advero-setup-card-corner" aria-hidden />
          <div className="advero-setup-card-head text-center sm:text-left">
            <p className="mono-label text-[10px] text-slate-500">{isDa ? 'Analyse i gang' : 'Analysis in progress'}</p>
            <h1 className="advero-setup-card-title mt-1">
              {isDa ? 'Vi analyserer jeres synlighed' : 'Analyzing your visibility'}
            </h1>
            <p className="advero-setup-card-sub">
              {statusLabel || (isDa ? story.engineNoteDa : story.engineNoteEn)}
            </p>
          </div>

          <div className="advero-setup-divider" aria-hidden />

          <div className="advero-setup-body">
            <div className="advero-setup-body-inner">
              {error ? (
                <p className="text-center text-sm text-red-600">{error}</p>
              ) : (
                <ul className="advero-audit-steps space-y-2">
                  {steps.map((step, i) => {
                    const done = i < activeStep;
                    const current = i === activeStep;
                    return (
                      <li
                        key={step.id}
                        className={`advero-audit-step ${done ? 'advero-audit-step--done' : ''} ${current ? 'advero-audit-step--active' : ''}`}
                      >
                        <span className="advero-audit-step-icon" aria-hidden>
                          {done ? (
                            <Check size={16} strokeWidth={2.5} />
                          ) : current ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : null}
                        </span>
                        <span>{isDa ? step.da : step.en}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdveroAuditAnalyzingPage;
