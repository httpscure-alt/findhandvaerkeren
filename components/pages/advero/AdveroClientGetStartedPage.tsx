import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  CircleDashed,
  CreditCard,
  ExternalLink,
  Globe,
  Minimize2,
  Sparkles,
  Target,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useAdveroLang } from '../../../lib/adveroLocale';
import { api } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import type { GrowthGoal, IndustryCategory } from '../../../lib/recommendPlan';
import {
  buildGetStartedQueryString,
  getPaidTiers,
  getStartedPathWithQuery,
  markTierPaid,
  markTiersPaid,
} from '../../../lib/adveroJourney';
import { calculateCombinedCheckoutPricing } from '../../../lib/adveroCheckoutPricing';
import type { VisibilityAuditResult } from '../../../lib/mockAnalyzeVisibility';
import type { PlanRecommendation } from '../../../lib/recommendPlan';
import {
  fetchAuditForGetStarted,
  recommendationForAudit,
  resolveGetStartedAuditId,
  wizardPatchFromAudit,
} from '../../../lib/getStartedAudit';
import GetStartedRecommendationPanel from './GetStartedRecommendationPanel';
import { getStartedIntroCopy } from '../../../lib/adveroJourneyStory';
import {
  MARKETING_PRICING,
  MARKETING_TIER_LEVEL_NAMES,
  type MarketingTierId,
} from '../../../constants/marketingPricing';
import './advero-ds.css';

const STORAGE_KEY = 'advero.clientGetStarted.v1';

type StepId = 1 | 2 | 3 | 4;

interface WizardPersist {
  step: StepId;
  wantAds: boolean;
  wantSeo: boolean;
  adsTier: string | null;
  seoTier: string | null;
  billingName: string;
  growthGoal: GrowthGoal;
  industry: IndustryCategory;
  fromReport: boolean;
  auditId?: string;
}

const defaultPersist: WizardPersist = {
  step: 1,
  wantAds: true,
  wantSeo: false,
  adsTier: 'ads_standard',
  seoTier: 'seo_standard',
  billingName: '',
  growthGoal: 'both',
  industry: 'unknown',
  fromReport: false,
};

function loadPersist(): WizardPersist {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultPersist };
    const parsed = JSON.parse(raw) as Partial<WizardPersist>;
    return { ...defaultPersist, ...parsed, step: clampStep(parsed.step) };
  } catch {
    return { ...defaultPersist };
  }
}

/** Map legacy step URLs (5-step wizard) onto 4-step pay-first flow. */
function clampStep(s: unknown): StepId {
  const n = Number(s);
  if (n >= 5) return 4;
  if (n >= 4) return 3;
  if (n === 3) return 3;
  if (n === 2) return 2;
  return 1;
}

function savePersist(p: WizardPersist) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

const fmtKr = (n: number) => new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 }).format(n);

const ADS_TIERS = [
  {
    id: 'ads_basic' as const,
    price: fmtKr(MARKETING_PRICING.ADS_BASIC),
    labelDa: `Google Ads ${MARKETING_TIER_LEVEL_NAMES.basic.da}`,
    labelEn: `Google Ads ${MARKETING_TIER_LEVEL_NAMES.basic.en}`,
  },
  {
    id: 'ads_standard' as const,
    price: fmtKr(MARKETING_PRICING.ADS_STANDARD),
    labelDa: `Google Ads ${MARKETING_TIER_LEVEL_NAMES.standard.da}`,
    labelEn: `Google Ads ${MARKETING_TIER_LEVEL_NAMES.standard.en}`,
    popular: true,
  },
  {
    id: 'ads_pro' as const,
    price: fmtKr(MARKETING_PRICING.ADS_PRO),
    labelDa: `Google Ads ${MARKETING_TIER_LEVEL_NAMES.pro.da}`,
    labelEn: `Google Ads ${MARKETING_TIER_LEVEL_NAMES.pro.en}`,
  },
] as const;

const SEO_TIERS = [
  {
    id: 'seo_basic' as const,
    price: fmtKr(MARKETING_PRICING.SEO_BASIC),
    labelDa: `SEO ${MARKETING_TIER_LEVEL_NAMES.basic.da}`,
    labelEn: `SEO ${MARKETING_TIER_LEVEL_NAMES.basic.en}`,
  },
  {
    id: 'seo_standard' as const,
    price: fmtKr(MARKETING_PRICING.SEO_STANDARD),
    labelDa: `SEO ${MARKETING_TIER_LEVEL_NAMES.standard.da}`,
    labelEn: `SEO ${MARKETING_TIER_LEVEL_NAMES.standard.en}`,
    popular: true,
  },
  {
    id: 'seo_pro' as const,
    price: fmtKr(MARKETING_PRICING.SEO_PRO),
    labelDa: `SEO ${MARKETING_TIER_LEVEL_NAMES.pro.da}`,
    labelEn: `SEO ${MARKETING_TIER_LEVEL_NAMES.pro.en}`,
  },
] as const;

const HIDE_HINTS_KEY = 'advero.getStarted.hideHints';

/** Ungated UI: skip step-3 auth + allow jumping checklist. True for local dev, localhost (incl. `vite preview`), `?preview=1`, or `VITE_ADVERO_GET_STARTED_UNGATED=true`. */
function isAdveroGetStartedUngated(searchParams: URLSearchParams): boolean {
  if (import.meta.env.DEV) return true;
  if (import.meta.env.VITE_ADVERO_GET_STARTED_UNGATED === 'true') return true;
  if (searchParams.get('preview') === '1') return true;
  if (typeof window !== 'undefined') {
    const h = window.location.hostname;
    if (h === 'localhost' || h === '127.0.0.1') return true;
  }
  return false;
}

const AdveroClientGetStartedPage: React.FC = () => {
  const { isDa, lang, setLang } = useAdveroLang();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const flowUngated = isAdveroGetStartedUngated(searchParams);

  const [persist, setPersist] = useState<WizardPersist>(() => loadPersist());
  const [auditContext, setAuditContext] = useState<VisibilityAuditResult | null>(null);
  const [auditRec, setAuditRec] = useState<PlanRecommendation | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);

  const introCopy = useMemo(
    () => getStartedIntroCopy(isDa, Boolean(auditContext)),
    [isDa, auditContext]
  );

  const t = useMemo(
    () => ({
      kicker: isDa ? 'Kom i gang' : 'Get started',
      title: introCopy.title,
      subtitle: introCopy.subtitle,
      backSite: isDa ? 'Til forsiden' : 'Back to home',
      contact: isDa ? 'Kontakt' : 'Contact',
      step1: isDa ? 'Ydelser' : 'Services',
      step2: isDa ? 'Planer' : 'Plans',
      step3: isDa ? 'Betaling' : 'Payment',
      step4: isDa ? 'Næste skridt' : 'Next steps',
      ads: isDa ? 'Google Ads' : 'Google Ads',
      seo: isDa ? 'SEO' : 'SEO',
      perMonth: isDa ? 'DKK / md.' : 'DKK / mo.',
      needOne: isDa ? 'Vælg mindst én ydelse.' : 'Pick at least one service.',
      continue: isDa ? 'Fortsæt' : 'Continue',
      login: isDa ? 'Log ind' : 'Log in',
      signup: isDa ? 'Opret konto' : 'Create account',
      payEmailNote: isDa
        ? 'Vi bruger e-mailen fra jeres audit til Stripe og til at sende link til adgangskode efter betaling.'
        : 'We use your audit email for Stripe and to send a set-password link after payment.',
      billingLabel: isDa ? 'Navn til faktura' : 'Name on invoice',
      billingHint: isDa
        ? 'Bruges til fakturering. Opretter en privat faktureringsprofil hvis du ikke allerede har en.'
        : 'Used for invoicing. Creates a private billing profile if you do not already have one.',
      payAds: isDa ? 'Betal Google Ads' : 'Pay for Google Ads',
      paySeo: isDa ? 'Betal SEO' : 'Pay for SEO',
      payBothHint: isDa
        ? 'Ét abonnement med begge ydelser — 5% rabat på den samlede månedlige pris.'
        : 'One subscription for both services — 5% off the combined monthly price.',
      payCombined: isDa ? 'Gå til betaling' : 'Continue to checkout',
      subtotal: isDa ? 'Subtotal' : 'Subtotal',
      discount: isDa ? 'Kombinationsrabat (5%)' : 'Bundle discount (5%)',
      totalMonthly: isDa ? 'I alt pr. måned' : 'Total per month',
      exclVat: isDa ? 'Priser ekskl. moms' : 'Prices excl. VAT',
      redirecting: isDa ? 'Sender dig til betaling…' : 'Redirecting to checkout…',
      postTitle: isDa ? 'Efter betaling' : 'After payment',
      postBody: isDa
        ? 'Tjek din e-mail for at vælge adgangskode og logge ind på dashboardet. Derefter guider vi jer videre med opsætning.'
        : 'Check your email to set your password and log in to the dashboard. Then we guide you through setup.',
      connectAds: isDa ? 'Forbind Google Ads i dashboard' : 'Connect Google Ads in dashboard',
      connectGsc: isDa ? 'Forbind Search Console (kommer)' : 'Connect Search Console (coming)',
      mockToast: isDa ? 'Backend og OAuth tilkobling kommer i næste iteration.' : 'Backend and OAuth wiring comes next.',
      reset: isDa ? 'Start forfra' : 'Start over',
      on: isDa ? 'Valgt' : 'On',
      off: isDa ? 'Fra' : 'Off',
      popular: isDa ? 'Populær' : 'Popular',
      signedIn: isDa ? 'Logget ind som' : 'Signed in as',
      cardTitle: isDa ? 'Din opsætning' : 'Your setup',
      cardSubWhenHints: isDa
        ? 'Vælg ydelser, plan og betaling. Vi guider dig igennem trin for trin.'
        : 'Pick services, plans, and payment. We guide you step by step.',
      cardSubHidden: isDa ? 'Følg tjeklisten nedenfor.' : 'Follow the checklist below.',
      progressStep: (n: number, total: number) =>
        isDa ? `Trin ${n} af ${total}` : `Step ${n} of ${total}`,
      dontShowHints: isDa ? 'Vis ikke denne tekst igen' : "Don't show this again",
      futureStep: isDa ? 'Fuldfør de forrige trin først.' : 'Complete the previous steps first.',
      minimize: isDa ? 'Minimer' : 'Minimize',
      fromReport: isDa ? 'Forslag fra jeres preview-rapport er forudvalgt.' : 'Suggestions from your preview report are pre-selected.',
      recFromAudit: isDa ? 'Anbefalet fra audit' : 'Recommended from audit',
      noAuditYet: isDa
        ? 'Kør en gratis synlighedsanalyse først for en personlig plan og forklaring.'
        : 'Run a free visibility analysis first for a personalized plan and explanation.',
      runAudit: isDa ? 'Start gratis analyse' : 'Start free analysis',
      whyBuying: isDa ? 'Hvorfor denne plan?' : 'Why this plan?',
      growthGoalLabel: isDa ? 'Primært mål' : 'Primary goal',
      goalLeads: isDa ? 'Flere henvendelser nu' : 'More leads now',
      goalLong: isDa ? 'Langsigtet synlighed' : 'Long-term visibility',
      goalBoth: isDa ? 'Begge dele' : 'Both',
      industryLabel: isDa ? 'Branche (valgfrit)' : 'Industry (optional)',
      expand: isDa ? 'Udvid opsætning' : 'Expand setup',
      paidLabel: isDa ? 'Betalt' : 'Paid',
      payRemaining: isDa ? 'Betal næste ydelse' : 'Pay for next service',
      paymentSuccess: isDa ? 'Betaling modtaget. Tak!' : 'Payment received. Thank you!',
      allPaid: isDa ? 'Alle valgte ydelser er betalt.' : 'All selected services are paid.',
      continuePayment: isDa ? 'Gå til betaling' : 'Continue to payment',
    }),
    [isDa, introCopy.title, introCopy.subtitle]
  );

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [paidTiers, setPaidTiers] = useState<Set<string>>(() => getPaidTiers());
  const journeyQuery = useMemo(() => buildGetStartedQueryString(searchParams), [searchParams]);
  const journeyPath = useMemo(() => getStartedPathWithQuery(journeyQuery), [journeyQuery]);
  const pendingPaymentTiers = useMemo(() => {
    const pending: string[] = [];
    if (persist.wantAds && persist.adsTier && !paidTiers.has(persist.adsTier)) pending.push(persist.adsTier);
    if (persist.wantSeo && persist.seoTier && !paidTiers.has(persist.seoTier)) pending.push(persist.seoTier);
    return pending;
  }, [persist, paidTiers]);

  const combinedPricing = useMemo(
    () =>
      calculateCombinedCheckoutPricing(
        persist.wantSeo,
        persist.seoTier,
        persist.wantAds,
        persist.adsTier
      ),
    [persist.wantSeo, persist.seoTier, persist.wantAds, persist.adsTier]
  );

  const useCombinedCheckout = pendingPaymentTiers.length >= 2;
  const [journeySheetOpen, setJourneySheetOpen] = useState(true);
  const [hideSetupHints, setHideSetupHints] = useState(() => {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem(HIDE_HINTS_KEY) === '1';
    } catch {
      return false;
    }
  });

  const isTierRecommended = useCallback(
    (tierId: string) =>
      Boolean(
        auditRec &&
          (tierId === auditRec.primaryTierId || tierId === auditRec.secondaryTierId)
      ),
    [auditRec]
  );

  const urlAuditId = searchParams.get('auditId');
  const resolvedAuditId = useMemo(
    () => resolveGetStartedAuditId(urlAuditId),
    [urlAuditId]
  );
  const appliedAuditIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!resolvedAuditId) {
      setAuditContext(null);
      setAuditRec(null);
      appliedAuditIdRef.current = null;
      return;
    }

    setAuditLoading(true);
    (async () => {
      const audit = await fetchAuditForGetStarted(resolvedAuditId, (aid) =>
        api.getVisibilityAudit(aid)
      );
      if (cancelled) return;
      if (!audit) {
        setAuditContext(null);
        setAuditRec(null);
        setAuditLoading(false);
        return;
      }
      const rec = recommendationForAudit(audit);
      setAuditContext(audit);
      setAuditRec(rec);

      if (appliedAuditIdRef.current !== audit.id) {
        appliedAuditIdRef.current = audit.id;
        setPersist((p) => {
          const patch = wizardPatchFromAudit(audit, rec);
          const next: WizardPersist = {
            ...p,
            ...patch,
            step: patch.fromReport ? (2 as StepId) : p.step,
            billingName: patch.billingName || p.billingName,
          };
          savePersist(next);
          return next;
        });
      }

      setAuditLoading(false);

      if (!urlAuditId) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set('auditId', audit.id);
            next.set('from', 'report');
            return next;
          },
          { replace: true }
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resolvedAuditId, urlAuditId, setSearchParams]);

  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const s = clampStep(Number(stepParam));
      setPersist((p) => {
        if (p.step === s) return p;
        const next = { ...p, step: s };
        savePersist(next);
        return next;
      });
    }

    const seo = searchParams.get('seo');
    const ads = searchParams.get('ads');
    const goal = searchParams.get('goal') as GrowthGoal | null;
    const industry = searchParams.get('industry') as IndustryCategory | null;
    const fromReport = searchParams.get('from') === 'report';

    const auditId = searchParams.get('auditId');
    const paidTier = searchParams.get('paid');

    if (paidTier) {
      if (paidTier.includes(',')) markTiersPaid(paidTier.split(','));
      else markTierPaid(paidTier);
      setPaidTiers(getPaidTiers());
    }

    if (seo || ads || goal || industry || fromReport || auditId) {
      setPersist((p) => {
        const next: WizardPersist = {
          ...p,
          fromReport: fromReport || p.fromReport,
          growthGoal: goal === 'leads_now' || goal === 'long_term' || goal === 'both' ? goal : p.growthGoal,
          industry: industry || p.industry,
        };
        if (seo?.startsWith('seo_')) {
          next.wantSeo = true;
          next.seoTier = seo;
        }
        if (ads?.startsWith('ads_')) {
          next.wantAds = true;
          next.adsTier = ads;
        }
        if (fromReport && (seo || ads) && !stepParam) {
          next.step = 2;
        }
        if (auditId) {
          next.auditId = auditId;
        }
        savePersist(next);
        return next;
      });
    }

    if ((searchParams.get('step') === '5' || searchParams.get('step') === '4') && paidTier) {
      setPersist((p) => {
        const next = { ...p, step: 4 as StepId };
        savePersist(next);
        return next;
      });
    }
  }, [searchParams]);

  useEffect(() => {
    savePersist(persist);
  }, [persist]);

  const setStep = useCallback(
    (step: StepId) => {
      setPersist((p) => ({ ...p, step }));
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('step', String(step));
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  useEffect(() => {
    if (persist.fromReport && auditContext && persist.step === 1) {
      setStep(2);
    }
  }, [persist.fromReport, auditContext, persist.step, setStep]);

  const defaultBillingName = useMemo(() => {
    const n = (user?.name || '').trim();
    if (n) return n;
    const email = (user?.email || '').trim();
    if (!email) return '';
    const local = email.split('@')[0] || '';
    return local ? (isDa ? `Virksomhed (${local})` : `Business (${local})`) : '';
  }, [user?.name, user?.email, isDa]);

  useEffect(() => {
    if (!persist.billingName && defaultBillingName) {
      setPersist((p) => ({ ...p, billingName: defaultBillingName }));
    }
  }, [defaultBillingName, persist.billingName]);

  const tierLabel = (id: string) => {
    const all = [...ADS_TIERS, ...SEO_TIERS];
    const row = all.find((x) => x.id === id);
    if (!row) return id;
    return isDa ? row.labelDa : row.labelEn;
  };

  const runCombinedCheckout = async () => {
    const name = persist.billingName.trim();
    if (!name) {
      toast.error(isDa ? 'Udfyld navn til faktura.' : 'Enter a billing name.');
      return;
    }
    const checkoutEmail = (user?.email || auditContext?.contactEmail || '').trim();
    if (!checkoutEmail.includes('@')) {
      toast.error(isDa ? 'Mangler e-mail fra audit. Kør analysen igen.' : 'Missing audit email. Run the analysis again.');
      return;
    }
    if (combinedPricing.items.length === 0) {
      toast.error(isDa ? 'Vælg mindst én plan.' : 'Select at least one plan.');
      return;
    }

    setCheckoutLoading('combined');
    try {
      toast.info(t.redirecting);
      const checkoutAuditId =
        persist.auditId || resolveGetStartedAuditId(searchParams.get('auditId')) || undefined;
      const { url } = await api.createCombinedCheckoutSession({
        items: combinedPricing.items,
        checkoutContext: 'advero',
        returnQuery: journeyQuery,
        auditId: checkoutAuditId,
        contactEmail: checkoutEmail,
        billingName: name,
        companyName: auditContext?.companyName || name,
      });
      if (url) window.location.href = url;
      else toast.error(isDa ? 'Ingen betalings-URL.' : 'No checkout URL.');
    } catch (e: any) {
      toast.error(e?.message || (isDa ? 'Betaling kunne ikke startes.' : 'Could not start checkout.'));
    } finally {
      setCheckoutLoading(null);
    }
  };

  const runCheckoutForTier = async (tierId: string) => {
    const name = persist.billingName.trim();
    if (!name) {
      toast.error(isDa ? 'Udfyld navn til faktura.' : 'Enter a billing name.');
      return;
    }
    const isGrowthBundle = tierId === 'growth_bundle';
    const [serviceType] = tierId.split('_');
    if (!isGrowthBundle && serviceType !== 'ads' && serviceType !== 'seo') {
      toast.error(isDa ? 'Ugyldig plan.' : 'Invalid plan.');
      return;
    }

    const checkoutEmail = (user?.email || auditContext?.contactEmail || '').trim();
    if (!checkoutEmail.includes('@')) {
      toast.error(isDa ? 'Mangler e-mail fra audit. Kør analysen igen.' : 'Missing audit email. Run the analysis again.');
      return;
    }

    setCheckoutLoading(tierId);
    try {
      toast.info(t.redirecting);
      if (isAuthenticated) {
        try {
          await api.createBillingCompany({ name, contactEmail: checkoutEmail });
          await api.submitGrowthRequest({
            services: isGrowthBundle ? ['seo', 'ads'] : [serviceType],
            details: { tier: tierId, source: 'advero_get_started' },
          });
        } catch {
          /* optional legacy hooks for logged-in users */
        }
      }
      const checkoutAuditId =
        persist.auditId || resolveGetStartedAuditId(searchParams.get('auditId')) || undefined;
      const { url } = await api.createCheckoutSession({
        serviceType: isGrowthBundle ? 'growth' : serviceType,
        tier: tierId as MarketingTierId,
        billingCycle: 'monthly',
        checkoutContext: 'advero',
        returnQuery: journeyQuery,
        auditId: checkoutAuditId,
        contactEmail: checkoutEmail,
        billingName: name,
        companyName: auditContext?.companyName || name,
      });
      if (url) window.location.href = url;
      else toast.error(isDa ? 'Ingen betalings-URL.' : 'No checkout URL.');
    } catch (e: any) {
      toast.error(e?.message || (isDa ? 'Betaling kunne ikke startes.' : 'Could not start checkout.'));
    } finally {
      setCheckoutLoading(null);
    }
  };

  const goNext = () => {
    if (persist.step === 1) {
      if (!persist.wantAds && !persist.wantSeo) {
        toast.error(t.needOne);
        return;
      }
      setStep(2);
      return;
    }
    if (persist.step === 2) {
      if (persist.wantAds && !persist.adsTier) {
        toast.error(isDa ? 'Vælg en Google Ads plan.' : 'Pick a Google Ads plan.');
        return;
      }
      if (persist.wantSeo && !persist.seoTier) {
        toast.error(isDa ? 'Vælg en SEO plan.' : 'Pick an SEO plan.');
        return;
      }
      setStep(3);
      return;
    }
  };

  const onChecklistStepClick = (id: StepId) => {
    if (id > persist.step && !flowUngated) {
      toast.error(t.futureStep);
      return;
    }
    setStep(id);
  };

  const steps: { id: StepId; label: string }[] = [
    { id: 1, label: t.step1 },
    { id: 2, label: t.step2 },
    { id: 3, label: t.step3 },
    { id: 4, label: t.step4 },
  ];

  return (
    <div className="advero-ds relative isolate min-h-screen">
      <div className="advero-dot-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />

      <header className="advero-site-header">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-10 sm:py-5">
          <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">
            <a href="/" className="advero-site-header-brand flex shrink-0 items-center" aria-label="Advero">
              <img
                src="/brand/advero-logo-light.png"
                alt=""
                width={800}
                height={168}
                decoding="async"
                className="advero-logo-wordmark-light object-contain object-left"
              />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="advero-lang-toggle" role="group" aria-label={isDa ? 'Sprog' : 'Language'}>
              <button
                type="button"
                aria-pressed={lang === 'da'}
                onClick={() => {
                  setLang('da');
                  try {
                    localStorage.setItem('advero.lang', 'da');
                  } catch {
                    /* ignore */
                  }
                }}
              >
                DK
              </button>
              <div className="advero-lang-divider" aria-hidden />
              <button
                type="button"
                aria-pressed={lang === 'en'}
                onClick={() => {
                  setLang('en');
                  try {
                    localStorage.setItem('advero.lang', 'en');
                  } catch {
                    /* ignore */
                  }
                }}
              >
                EN
              </button>
            </div>
            <a href="/brand-v2/advero-contact.html" className="advero-btn-ghost hidden text-center sm:inline-flex">
              {t.contact}
            </a>
            <a href="/" className="advero-btn-slate-solid inline-flex shrink-0 items-center rounded-full px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.14em] sm:text-[14px]">
              {t.backSite}
            </a>
          </div>
        </div>
      </header>

      {!journeySheetOpen ? (
        <button
          type="button"
          className="advero-setup-floating-pill"
          onClick={() => setJourneySheetOpen(true)}
          aria-label={t.expand}
        >
          <Sparkles className="h-4 w-4 shrink-0 text-sky-500" aria-hidden />
          <span className="min-w-0 flex-1">
            <div className="advero-setup-floating-pill-title">{t.cardTitle}</div>
            <div className="advero-setup-floating-pill-sub">{t.progressStep(persist.step, 4)}</div>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        </button>
      ) : null}

      <div className="relative z-[1] flex flex-col items-center px-4 py-10 pb-24 sm:px-6 lg:px-10">
        {journeySheetOpen ? (
          <div className="advero-setup-card w-full">
            <div className="advero-setup-card-corner" aria-hidden />
            <div className="advero-setup-card-head">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1 pr-2">
                  <h2 className="advero-setup-card-title">{t.title}</h2>
                  <p className="advero-setup-card-sub">{t.subtitle}</p>
                  <div className="advero-setup-progress-pill">{t.progressStep(persist.step, 4)}</div>
                </div>
                <button
                  type="button"
                  className="advero-setup-min-btn shrink-0"
                  aria-label={t.minimize}
                  onClick={() => setJourneySheetOpen(false)}
                >
                  <Minimize2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>

            <nav className="advero-setup-checklist" aria-label={isDa ? 'Trin' : 'Steps'}>
              {steps.map((s) => {
                const done = persist.step > s.id;
                const active = persist.step === s.id;
                const locked = !flowUngated && persist.step < s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={locked}
                    onClick={() => onChecklistStepClick(s.id)}
                    className={`advero-setup-row ${done ? 'advero-setup-row--done' : ''} ${active ? 'advero-setup-row--current' : ''}`}
                  >
                    <span className="advero-setup-icon-slot" aria-hidden>
                      {done ? (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white shadow-sm">
                          <Check className="h-3.5 w-3.5" strokeWidth={2.75} />
                        </span>
                      ) : (
                        <CircleDashed className={`h-6 w-6 ${active ? 'text-slate-600' : 'text-slate-300'}`} strokeWidth={1.4} />
                      )}
                    </span>
                    <span className="advero-setup-row-main">
                      <span className="advero-setup-row-label">{s.label}</span>
                      {active ? (
                        <span className="advero-setup-row-meta">{isDa ? 'I gang nu' : 'In progress'}</span>
                      ) : null}
                    </span>
                    {(s.id === 3 || s.id === 4) && !done ? (
                      <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                    ) : null}
                  </button>
                );
              })}
            </nav>

            <div className="advero-setup-divider" aria-hidden />

            <div className="advero-setup-body">
              <div className="advero-setup-body-inner">
                {auditLoading ? (
                  <p className="mb-4 text-sm text-slate-500">
                    {isDa ? 'Henter jeres audit-anbefaling…' : 'Loading your audit recommendation…'}
                  </p>
                ) : null}

                {auditContext && auditRec && persist.step <= 3 ? (
                  <GetStartedRecommendationPanel
                    audit={auditContext}
                    recommendation={auditRec}
                    isDa={isDa}
                    compact={persist.step === 4}
                  />
                ) : null}

                {!auditContext && !auditLoading && persist.step <= 2 ? (
                  <p className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {t.noAuditYet}{' '}
                    <Link to="/advero/audit" className="font-semibold text-sky-700 underline">
                      {t.runAudit}
                    </Link>
                  </p>
                ) : null}

                {persist.step === 1 && (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mono-label mb-1.5 block text-[10px] text-slate-500">{t.growthGoalLabel}</span>
                        <select
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                          value={persist.growthGoal}
                          onChange={(e) =>
                            setPersist((p) => ({ ...p, growthGoal: e.target.value as GrowthGoal }))
                          }
                        >
                          <option value="leads_now">{t.goalLeads}</option>
                          <option value="long_term">{t.goalLong}</option>
                          <option value="both">{t.goalBoth}</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="mono-label mb-1.5 block text-[10px] text-slate-500">{t.industryLabel}</span>
                        <select
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                          value={persist.industry}
                          onChange={(e) =>
                            setPersist((p) => ({ ...p, industry: e.target.value as IndustryCategory }))
                          }
                        >
                          <option value="unknown">{isDa ? 'Vælg senere' : 'Choose later'}</option>
                          <option value="local_services">{isDa ? 'Lokal service' : 'Local services'}</option>
                          <option value="professional_services">{isDa ? 'Professionel service' : 'Professional services'}</option>
                          <option value="retail_ecommerce">{isDa ? 'Retail / e-commerce' : 'Retail / e-commerce'}</option>
                          <option value="hospitality">{isDa ? 'Hotel / restaurant' : 'Hospitality'}</option>
                          <option value="health_wellness">{isDa ? 'Sundhed / wellness' : 'Health / wellness'}</option>
                          <option value="other">{isDa ? 'Andet' : 'Other'}</option>
                        </select>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPersist((p) => ({ ...p, wantAds: !p.wantAds }))}
                      className={`advero-pick-tile flex w-full min-w-0 items-center justify-between px-4 py-3.5 text-left ${
                        persist.wantAds ? 'advero-pick-tile--on' : ''
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Target className="h-5 w-5 shrink-0 text-slate-700" aria-hidden />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900">{t.ads}</div>
                          <div className="text-sm text-slate-600">
                            {isDa ? 'Månedlig annoncepleje og optimering.' : 'Monthly ad care and optimisation.'}
                          </div>
                        </div>
                      </div>
                      <span className="mono-label shrink-0 text-[9px] text-slate-400">{persist.wantAds ? t.on : t.off}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPersist((p) => ({ ...p, wantSeo: !p.wantSeo }))}
                      className={`advero-pick-tile flex w-full min-w-0 items-center justify-between px-4 py-3.5 text-left ${
                        persist.wantSeo ? 'advero-pick-tile--on' : ''
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Globe className="h-5 w-5 shrink-0 text-slate-700" aria-hidden />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900">{t.seo}</div>
                          <div className="text-sm text-slate-600">
                            {isDa ? 'Teknisk fundament og indhold over tid.' : 'Technical foundation and content over time.'}
                          </div>
                        </div>
                      </div>
                      <span className="mono-label shrink-0 text-[9px] text-slate-400">{persist.wantSeo ? t.on : t.off}</span>
                    </button>
                  </div>
                )}

                {persist.step === 2 && auditContext && persist.fromReport ? (
                  <div className="mb-5 rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 text-sm text-slate-700">
                    <p className="font-medium text-slate-900">{auditContext.companyName}</p>
                    {auditContext.websiteUrl ? (
                      <p className="mt-1 text-slate-600">{auditContext.websiteUrl}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-slate-500">
                      {isDa
                        ? 'Oplysninger fra jeres audit — I skal ikke udfylde virksomhedsdata igen.'
                        : 'Details from your audit — no need to enter your business information again.'}
                    </p>
                  </div>
                ) : null}

                {persist.step === 2 && (
                  <div className="space-y-8">
                    {persist.wantAds && (
                      <section>
                        <p className="mono-label mb-2 text-[10px] text-slate-500">{t.ads}</p>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {ADS_TIERS.map((row) => (
                            <button
                              key={row.id}
                              type="button"
                              onClick={() => setPersist((p) => ({ ...p, adsTier: row.id }))}
                              className={`advero-pick-tile px-3 py-3.5 text-left sm:px-3.5 ${
                                persist.adsTier === row.id ? 'advero-pick-tile--on' : ''
                              }`}
                            >
                              {isTierRecommended(row.id) ? (
                                <span className="advero-pick-tile-badge-rec">{t.recFromAudit}</span>
                              ) : row.popular ? (
                                <span className="mono-label mb-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-600">
                                  {t.popular}
                                </span>
                              ) : null}
                              <div className="text-sm font-semibold text-slate-900">{isDa ? row.labelDa : row.labelEn}</div>
                              <div className="mt-2 text-xl font-bold tabular-nums tracking-tight text-slate-900">
                                {row.price}{' '}
                                <span className="text-xs font-medium text-slate-500">{t.perMonth}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </section>
                    )}
                    {persist.wantSeo && (
                      <section>
                        <p className="mono-label mb-2 text-[10px] text-slate-500">{t.seo}</p>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {SEO_TIERS.map((row) => (
                            <button
                              key={row.id}
                              type="button"
                              onClick={() => setPersist((p) => ({ ...p, seoTier: row.id }))}
                              className={`advero-pick-tile px-3 py-3.5 text-left sm:px-3.5 ${
                                persist.seoTier === row.id ? 'advero-pick-tile--on' : ''
                              }`}
                            >
                              {isTierRecommended(row.id) ? (
                                <span className="advero-pick-tile-badge-rec">{t.recFromAudit}</span>
                              ) : row.popular ? (
                                <span className="mono-label mb-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-600">
                                  {t.popular}
                                </span>
                              ) : null}
                              <div className="text-sm font-semibold text-slate-900">{isDa ? row.labelDa : row.labelEn}</div>
                              <div className="mt-2 text-xl font-bold tabular-nums tracking-tight text-slate-900">
                                {row.price}{' '}
                                <span className="text-xs font-medium text-slate-500">{t.perMonth}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {persist.step === 3 && (
                  <div className="space-y-5">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                      <p className="mono-label text-[10px] text-slate-500">{isDa ? 'Opsummering' : 'Summary'}</p>
                      <ul className="mt-2 space-y-2 text-sm text-slate-700">
                        {persist.wantAds && persist.adsTier ? (
                          <li className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                            <span>
                              {t.ads}:{' '}
                              <span className="font-medium text-slate-900">{tierLabel(persist.adsTier)}</span>
                            </span>
                            {paidTiers.has(persist.adsTier) ? (
                              <span className="text-xs font-medium text-emerald-700">{t.paidLabel}</span>
                            ) : null}
                          </li>
                        ) : null}
                        {persist.wantSeo && persist.seoTier ? (
                          <li className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                            <span>
                              {t.seo}:{' '}
                              <span className="font-medium text-slate-900">{tierLabel(persist.seoTier)}</span>
                            </span>
                            {paidTiers.has(persist.seoTier) ? (
                              <span className="text-xs font-medium text-emerald-700">{t.paidLabel}</span>
                            ) : null}
                          </li>
                        ) : null}
                      </ul>
                      {useCombinedCheckout && combinedPricing.isCombined ? (
                        <dl className="mt-4 space-y-1.5 border-t border-slate-200 pt-3 text-sm">
                          <div className="flex justify-between text-slate-600">
                            <dt>{t.subtotal}</dt>
                            <dd className="tabular-nums">{fmtKr(combinedPricing.subtotalKr)} kr.</dd>
                          </div>
                          <div className="flex justify-between text-emerald-800">
                            <dt>{t.discount}</dt>
                            <dd className="tabular-nums">−{fmtKr(combinedPricing.discountKr)} kr.</dd>
                          </div>
                          <div className="flex justify-between font-semibold text-slate-900">
                            <dt>{t.totalMonthly}</dt>
                            <dd className="tabular-nums">{fmtKr(combinedPricing.totalKr)} kr.</dd>
                          </div>
                        </dl>
                      ) : null}
                      <p className="mt-3 text-[11px] text-slate-500">{t.exclVat}</p>
                    </div>
                    <div>
                      <label className="mono-label block text-[10px] text-slate-500">{t.billingLabel}</label>
                      <input
                        value={persist.billingName}
                        onChange={(e) => setPersist((p) => ({ ...p, billingName: e.target.value }))}
                        className="advero-input-light mt-2"
                        placeholder={isDa ? 'Fx dit firmanavn' : 'e.g. your company name'}
                        autoComplete="organization"
                      />
                      <p className="mt-2 text-xs text-slate-500">{t.billingHint}</p>
                      {auditContext?.contactEmail ? (
                        <p className="mt-2 text-xs text-slate-600">
                          {t.payEmailNote}{' '}
                          <span className="font-medium text-slate-800">{auditContext.contactEmail}</span>
                        </p>
                      ) : null}
                    </div>
                    {useCombinedCheckout ? (
                      <p className="text-xs text-slate-500">{t.payBothHint}</p>
                    ) : null}
                    <div className="flex flex-col gap-3">
                      {useCombinedCheckout && pendingPaymentTiers.length > 0 ? (
                        <button
                          type="button"
                          disabled={!!checkoutLoading}
                          onClick={runCombinedCheckout}
                          className="advero-btn-slate-solid inline-flex items-center justify-center gap-2 rounded-full px-[1.75rem] py-[0.8125rem] text-[13px] font-semibold uppercase tracking-[0.14em] sm:text-[14px]"
                        >
                          <CreditCard className="h-4 w-4" aria-hidden />
                          {checkoutLoading === 'combined' ? t.redirecting : t.payCombined}
                        </button>
                      ) : null}
                      {!useCombinedCheckout && persist.wantAds && persist.adsTier && !paidTiers.has(persist.adsTier) ? (
                        <button
                          type="button"
                          disabled={!!checkoutLoading}
                          onClick={() => runCheckoutForTier(persist.adsTier!)}
                          className="advero-btn-slate-solid inline-flex items-center justify-center gap-2 rounded-full px-[1.75rem] py-[0.8125rem] text-[13px] font-semibold uppercase tracking-[0.14em] sm:text-[14px]"
                        >
                          <CreditCard className="h-4 w-4" aria-hidden />
                          {checkoutLoading === persist.adsTier ? t.redirecting : t.payAds}
                        </button>
                      ) : null}
                      {!useCombinedCheckout && persist.wantSeo && persist.seoTier && !paidTiers.has(persist.seoTier) ? (
                        <button
                          type="button"
                          disabled={!!checkoutLoading}
                          onClick={() => runCheckoutForTier(persist.seoTier!)}
                          className="advero-btn-slate-solid inline-flex items-center justify-center gap-2 rounded-full px-[1.75rem] py-[0.8125rem] text-[13px] font-semibold uppercase tracking-[0.14em] sm:text-[14px]"
                        >
                          <CreditCard className="h-4 w-4" aria-hidden />
                          {checkoutLoading === persist.seoTier ? t.redirecting : t.paySeo}
                        </button>
                      ) : null}
                      {pendingPaymentTiers.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => setStep(4)}
                          className="advero-btn-slate-solid inline-flex items-center justify-center gap-2 rounded-full px-[1.75rem] py-[0.8125rem] text-[13px] font-semibold uppercase tracking-[0.14em]"
                        >
                          {t.continue}
                          <ChevronRight className="h-4 w-4" aria-hidden />
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}

                {persist.step === 4 && (
                  <div>
                    {searchParams.get('session_id') || paidTiers.size > 0 ? (
                      <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                        {t.paymentSuccess}
                        {searchParams.get('paid')
                          ? ` (${searchParams
                              .get('paid')!
                              .split(',')
                              .map((id) => tierLabel(id.trim()))
                              .join(', ')})`
                          : ''}
                      </p>
                    ) : null}
                    {pendingPaymentTiers.length > 0 ? (
                      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <p className="text-sm text-amber-950">
                          {isDa
                            ? 'Du har endnu en ydelse der skal betales.'
                            : 'You still have a service left to pay for.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="advero-btn-slate-solid mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em]"
                        >
                          {t.payRemaining}
                          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                    ) : (
                      <p className="mb-4 text-sm font-medium text-slate-700">{t.allPaid}</p>
                    )}
                    <h3 className="text-base font-semibold tracking-tight text-slate-900">{t.postTitle}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.postBody}</p>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => toast.info(t.mockToast)}
                        className="advero-btn-ghost-on-light flex-1"
                      >
                        {t.connectAds}
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.info(t.mockToast)}
                        className="advero-btn-ghost-on-light flex-1"
                      >
                        {t.connectGsc}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem(STORAGE_KEY);
                      const fresh = { ...defaultPersist };
                      setPersist(fresh);
                      setSearchParams(
                        (prev) => {
                          const next = new URLSearchParams(prev);
                          next.set('step', '1');
                          return next;
                        },
                        { replace: true }
                      );
                      toast.info(isDa ? 'Session nulstillet.' : 'Session cleared.');
                    }}
                    className="text-xs font-medium text-slate-400 underline-offset-4 hover:text-slate-600 hover:underline"
                  >
                    {t.reset}
                  </button>
                  {persist.step < 3 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="advero-btn-slate-solid inline-flex items-center gap-2 rounded-full px-[1.75rem] py-[0.8125rem] text-[14px] font-semibold uppercase tracking-[0.14em] sm:text-[15px]"
                    >
                      {t.continue}
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="advero-setup-footer">
              <input
                id="advero-hide-hints"
                type="checkbox"
                checked={hideSetupHints}
                onChange={(e) => {
                  const v = e.target.checked;
                  setHideSetupHints(v);
                  try {
                    if (v) localStorage.setItem(HIDE_HINTS_KEY, '1');
                    else localStorage.removeItem(HIDE_HINTS_KEY);
                  } catch {
                    /* ignore */
                  }
                }}
              />
              <label htmlFor="advero-hide-hints" className="cursor-pointer select-none">
                {t.dontShowHints}
              </label>
            </div>
          </div>
        ) : null}

        <p className="mt-10 text-center text-xs text-white/40 sm:text-left">
          <a href="/brand-v2/advero-contact.html" className="underline-offset-4 hover:text-white/65 hover:underline">
            {t.contact}
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdveroClientGetStartedPage;
