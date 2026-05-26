/**
 * Customer journey: one story from first visit to live dashboard.
 * Copy avoids em dashes; never mention internal engine vendors to customers.
 */

export type AdveroJourneyPhase =
  | 'business'
  | 'results'
  | 'plan'
  | 'account'
  | 'payment'
  | 'dashboard';

export type JourneyPhaseDef = {
  id: AdveroJourneyPhase;
  labelDa: string;
  labelEn: string;
  summaryDa: string;
  summaryEn: string;
};

export const ADVERO_CUSTOMER_JOURNEY: JourneyPhaseDef[] = [
  {
    id: 'business',
    labelDa: 'Virksomhed',
    labelEn: 'Business',
    summaryDa: 'I fortæller os hvem I er og hvad I vil opnå.',
    summaryEn: 'You tell us who you are and what you want to achieve.',
  },
  {
    id: 'results',
    labelDa: 'Resultater',
    labelEn: 'Results',
    summaryDa: 'I får score, gaps og konkrete fund på tværs af søgning, lokalt og AI.',
    summaryEn: 'You get scores, gaps, and findings across search, local, and AI.',
  },
  {
    id: 'plan',
    labelDa: 'Plan',
    labelEn: 'Plan',
    summaryDa: 'Vi anbefaler en pakke og forklarer hvorfor den passer til jer.',
    summaryEn: 'We recommend a package and explain why it fits you.',
  },
  {
    id: 'account',
    labelDa: 'Konto',
    labelEn: 'Account',
    summaryDa: 'I opretter en konto, så vi kan knytte plan og betaling til jer.',
    summaryEn: 'You create an account so we can link your plan and billing.',
  },
  {
    id: 'payment',
    labelDa: 'Betaling',
    labelEn: 'Payment',
    summaryDa: 'I bekræfter pakken og betaler sikkert via Stripe.',
    summaryEn: 'You confirm the package and pay securely via Stripe.',
  },
  {
    id: 'dashboard',
    labelDa: 'Dashboard',
    labelEn: 'Dashboard',
    summaryDa: 'I arbejder videre med synlighed, kampagner og rapporter ét sted.',
    summaryEn: 'You continue with visibility, campaigns, and reports in one place.',
  },
];

export type JourneyStoryCopy = {
  promiseDa: string;
  promiseEn: string;
  engineNoteDa: string;
  engineNoteEn: string;
};

export function getJourneyStoryCopy(): JourneyStoryCopy {
  return {
    promiseDa:
      'Fortæl os om jeres virksomhed. Vi måler jeres synlighed online, anbefaler en plan der passer til jeres mål, og guider jer hele vejen til et aktivt dashboard.',
    promiseEn:
      'Tell us about your business. We measure your online visibility, recommend a plan that fits your goals, and guide you all the way to an active dashboard.',
    engineNoteDa: 'Vi analyserer jeres synlighed online. Typisk klar på under et minut.',
    engineNoteEn: 'We analyze your online visibility. Usually ready in about a minute.',
  };
}

export function journeyPhaseIndex(phase: AdveroJourneyPhase): number {
  return ADVERO_CUSTOMER_JOURNEY.findIndex((p) => p.id === phase);
}

export function getStartedJourneyPhase(step: number): AdveroJourneyPhase {
  if (step <= 2) return 'plan';
  if (step === 3) return 'account';
  if (step <= 4) return 'payment';
  return 'dashboard';
}

export function resultsNextCopy(isDa: boolean): string {
  return isDa
    ? 'Næste: vælg plan (allerede forudvalgt fra audit), opret konto, og betal sikkert.'
    : 'Next: choose your plan (pre-selected from the audit), create an account, and pay securely.';
}

export function getStartedIntroCopy(isDa: boolean, hasAudit: boolean): { title: string; subtitle: string } {
  if (hasAudit) {
    return isDa
      ? {
          title: 'Vælg jeres plan',
          subtitle:
            'Her ser I hvad analysen anbefaler, hvorfor det giver mening, og hvad I køber. Derefter konto og betaling.',
        }
      : {
          title: 'Choose your plan',
          subtitle:
            'See what your analysis recommends, why it makes sense, and what you are buying. Then account and payment.',
        };
  }
  return isDa
    ? {
        title: 'Konto og betaling',
        subtitle: 'Vælg ydelser og plan. Kør en gratis audit først for en personlig anbefaling.',
      }
    : {
        title: 'Account and payment',
        subtitle: 'Pick services and plans. Run a free audit first for a personalized recommendation.',
      };
}
