import React, { useCallback, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { MARKETING_PRICING, MARKETING_TIER_LEVEL_NAMES } from '../../constants/marketingPricing';

/**
 * Mirrors `public/brand-v2/preview-advero-v3-design-system.html` (SEO ×3, Ads ×3, Growth bundle).
 */

export type GrowthTierId =
  | 'seo_basic'
  | 'seo_standard'
  | 'seo_pro'
  | 'ads_basic'
  | 'ads_standard'
  | 'ads_pro'
  | 'growth_bundle';

export type GrowthPricingSectionProps = {
  className?: string;
  onPlanCta?: (plan: GrowthTierId) => void;
};

const fmtDkk = (n: number) =>
  new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 }).format(n);

type TierCard = {
  id: GrowthTierId;
  name: string;
  label: string;
  price: number;
  features: string[];
  popular?: boolean;
};

const SEO_TIERS: TierCard[] = [
  {
    id: 'seo_basic',
    name: MARKETING_TIER_LEVEL_NAMES.basic.en,
    label: 'Local visibility',
    price: MARKETING_PRICING.SEO_BASIC,
    features: [
      'Keyword research (10 terms)',
      'On-page optimization',
      'Google Business Profile',
      'Monthly status report',
    ],
  },
  {
    id: 'seo_standard',
    name: MARKETING_TIER_LEVEL_NAMES.standard.en,
    label: 'Steady growth',
    price: MARKETING_PRICING.SEO_STANDARD,
    popular: true,
    features: [
      'Extended research (25 terms)',
      'Multi-page optimization',
      '2–3 blog posts / month',
      'Technical SEO',
      'KPI reporting',
    ],
  },
  {
    id: 'seo_pro',
    name: MARKETING_TIER_LEVEL_NAMES.pro.en,
    label: 'Scale & performance',
    price: MARKETING_PRICING.SEO_PRO,
    features: [
      'Full site analysis',
      'Whole-website optimization',
      '4+ blog posts / month',
      'Link-building strategy',
      'Close monitoring',
    ],
  },
];

const ADS_TIERS: TierCard[] = [
  {
    id: 'ads_basic',
    name: MARKETING_TIER_LEVEL_NAMES.basic.en,
    label: 'Local leads',
    price: MARKETING_PRICING.ADS_BASIC,
    features: [
      '1 search campaign',
      '5 ad groups',
      'Professional search ads',
      'Basic conversion tracking',
      'Monthly optimization',
    ],
  },
  {
    id: 'ads_standard',
    name: MARKETING_TIER_LEVEL_NAMES.standard.en,
    label: 'Steady growth',
    price: MARKETING_PRICING.ADS_STANDARD,
    popular: true,
    features: [
      '2 search campaigns',
      '15 ad groups',
      'Keyword expansion',
      'Advanced tracking',
      'Monthly reporting',
    ],
  },
  {
    id: 'ads_pro',
    name: MARKETING_TIER_LEVEL_NAMES.pro.en,
    label: 'Scale & performance',
    price: MARKETING_PRICING.ADS_PRO,
    features: [
      '5 campaigns',
      '25+ ad groups',
      'Aggressive scaling',
      'A/B ad testing',
      'Close monitoring',
    ],
  },
];

const GROWTH_SECTIONS: Array<{ title: string; items: string[]; bonus?: boolean }> = [
  {
    title: 'SEO included',
    items: [
      'Local SEO and Google Business',
      'Service pages and on-page optimization',
      'Technical SEO and monthly KPI reporting',
    ],
  },
  {
    title: 'Google Ads included',
    items: [
      '2 search campaigns and 15 ad groups',
      'Conversion tracking and monthly optimization',
      'Ad spend is still billed directly to Google',
    ],
  },
  {
    title: 'Bonus: AI Visibility Search',
    items: [
      'AI-readable structure so assistants understand your offer',
      'Optimization for ChatGPT, Gemini, and Perplexity',
      'Schema, entities, and mention tracking in your report',
    ],
    bonus: true,
  },
  {
    title: 'How we work with you',
    items: [
      'One point of contact and one monthly recap',
      'Priority onboarding and a quarterly growth check-in',
    ],
  },
];

const AI_EXPLAIN_GRID = [
  'AI-readable content structure',
  'Conversational search optimization',
  'Advanced entity optimization',
  'AI-ready schema architecture',
  'Enhanced discoverability across AI-powered search systems',
];

const FAQ_ITEMS: Array<{ q: string; a: string }> = [
  {
    q: 'Is ad spend included?',
    a: 'Media spend for Google Ads is billed directly by Google and is separate from management fees. We help you set sensible budgets and track return on spend.',
  },
  {
    q: 'How long does SEO take?',
    a: 'Most local craft businesses see meaningful movement within 3–6 months, depending on competition and current site health. We focus on sustainable rankings, not shortcuts.',
  },
  {
    q: 'Can I switch tiers later?',
    a: 'Yes. Start with SEO, Google Ads, or Growth+, and change tier when your market shifts. We keep reporting continuous.',
  },
  {
    q: 'What is AI Visibility Optimization?',
    a: 'Included in Growth+. It structures your brand and content so AI answers and assistants can understand, cite, and recommend your business alongside classic search.',
  },
  {
    q: 'Do I need an existing website?',
    a: 'A professional site or landing page makes SEO and Ads much easier. If you do not have one yet, we help define minimum requirements and can coordinate setup during onboarding.',
  },
];

const cardShell = (variant: 'seo' | 'ads' | 'growth', highlight: boolean) =>
  [
    'group relative flex flex-col rounded-2xl border bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 ease-out sm:p-7',
    'border-slate-200/90 hover:-translate-y-0.5 hover:shadow-lg',
    'dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-white/[0.12]',
    variant === 'seo' &&
      'border-sky-200/50 bg-gradient-to-b from-white/80 to-sky-50/35 dark:border-sky-500/20 dark:from-white/[0.04] dark:to-sky-950/20',
    variant === 'ads' &&
      'border-amber-200/45 bg-gradient-to-b from-white/80 to-amber-50/40 dark:border-amber-500/15 dark:from-white/[0.04] dark:to-amber-950/15',
    variant === 'growth' &&
      'border-violet-200/50 bg-gradient-to-br from-white/85 via-violet-50/30 to-sky-50/35 dark:border-violet-400/25 dark:from-white/[0.05] dark:via-violet-950/20 dark:to-slate-900/40',
    highlight &&
      'ring-1 ring-slate-900/10 shadow-md dark:ring-white/20 lg:scale-[1.02]',
  ]
    .filter(Boolean)
    .join(' ');

function TierGrid({
  variant,
  tiers,
  onSelect,
}: {
  variant: 'seo' | 'ads';
  tiers: TierCard[];
  onSelect: (id: GrowthTierId) => void;
}) {
  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {tiers.map((tier) => {
        const wrap = tier.popular ? (
          <div key={tier.id} className="relative flex flex-col">
            <div className="absolute -top-3 left-1/2 z-[2] -translate-x-1/2">
              <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-md dark:bg-white dark:text-slate-900">
                Most popular
              </span>
            </div>
            <article className={[cardShell(variant, true), 'mt-2 flex min-h-0 flex-1 flex-col'].join(' ')}>
              <TierCardBody tier={tier} variant={variant} onSelect={onSelect} />
            </article>
          </div>
        ) : (
          <article key={tier.id} className={[cardShell(variant, false), 'flex min-h-0 flex-col'].join(' ')}>
            <TierCardBody tier={tier} variant={variant} onSelect={onSelect} />
          </article>
        );
        return wrap;
      })}
    </div>
  );
}

function TierCardBody({
  tier,
  variant,
  onSelect,
}: {
  tier: TierCard;
  variant: 'seo' | 'ads';
  onSelect: (id: GrowthTierId) => void;
}) {
  return (
    <>
      <div>
        <p
          className={[
            'text-[11px] font-semibold uppercase tracking-wider',
            variant === 'seo' ? 'text-sky-700 dark:text-sky-300' : 'text-amber-800 dark:text-amber-200',
          ].join(' ')}
        >
          {tier.name}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">{tier.label}</p>
      </div>
      <ul className="mt-6 flex flex-1 flex-col space-y-3">
        {tier.features.map((f) => (
          <li key={f} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900/[0.04] text-slate-900 dark:bg-white/10 dark:text-sky-200">
              <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
            </span>
            <span>{f}</span>
          </li>
        ))}
        <li className="flex-1" aria-hidden />
      </ul>
      <div className="mt-8 border-t border-slate-200/80 pt-6 dark:border-white/[0.08]">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Management</p>
        <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {fmtDkk(tier.price)}/mo
        </p>
        {variant === 'ads' ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ad spend billed separately by Google</p>
        ) : null}
        <button
          type="button"
          onClick={() => onSelect(tier.id)}
          className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-slate-200/90 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/[0.06]"
        >
          {variant === 'seo' ? 'Choose SEO plan' : 'Choose Ads plan'}
        </button>
      </div>
    </>
  );
}

function GrowthBundleCard({ onSelect }: { onSelect: (id: GrowthTierId) => void }) {
  return (
    <div className="relative mx-auto mt-6 max-w-2xl">
      <div className="absolute -top-3 left-1/2 z-[2] -translate-x-1/2">
        <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-md dark:bg-white dark:text-slate-900">
          Most popular
        </span>
      </div>
      <article className={[cardShell('growth', true), 'mt-2 flex flex-col'].join(' ')}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-200">
          Complete growth package
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Growth+</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Everything in SEO Standard and Google Ads Standard, in one monthly delivery.
        </p>
        {GROWTH_SECTIONS.map((section) => (
          <div
            key={section.title}
            className={[
              'mt-6',
              section.bonus
                ? 'rounded-xl border border-violet-200/80 bg-violet-50/60 p-4 dark:border-violet-500/25 dark:bg-violet-500/10'
                : '',
            ].join(' ')}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {section.title}
            </p>
            <ul className="mt-3 space-y-2">
              {section.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900/[0.04] text-slate-900 dark:bg-white/10 dark:text-violet-200">
                    <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="mt-8 border-t border-slate-200/80 pt-6 dark:border-white/[0.08]">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Management</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {fmtDkk(MARKETING_PRICING.GROWTH_BUNDLE)}/mo
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Bundle price. SEO Growth + Google Ads Growth, with AI visibility on top.
          </p>
          <button
            type="button"
            onClick={() => onSelect('growth_bundle')}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl dark:from-white dark:to-slate-100 dark:text-slate-900"
          >
            Start with Growth+
          </button>
        </div>
      </article>
    </div>
  );
}

type PricingChannel = 'seo' | 'ads' | 'growth';

const CHANNEL_DESC: Record<PricingChannel, string> = {
  seo: 'Build visibility over time, without paying per click.',
  ads: 'Reach people actively searching. Your ad budget goes straight to Google.',
  growth: 'SEO and Google Ads together, with AI visibility as a bonus. One partner, one rhythm.',
};

export function GrowthPricingSection({ className = '', onPlanCta }: GrowthPricingSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [channel, setChannel] = useState<PricingChannel>('growth');

  const handlePlan = useCallback(
    (id: GrowthTierId) => {
      onPlanCta?.(id);
    },
    [onPlanCta],
  );

  return (
    <section
      className={[
        'relative isolate overflow-hidden',
        'bg-gradient-to-b from-slate-50 via-white to-slate-50',
        'dark:from-slate-950 dark:via-slate-900 dark:to-slate-950',
        className,
      ].join(' ')}
      aria-labelledby="growth-pricing-heading"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-50 dark:opacity-35" aria-hidden>
        <div className="absolute -left-1/4 top-0 h-[420px] w-[70%] rounded-full bg-gradient-to-br from-sky-100/80 via-transparent to-transparent blur-3xl dark:from-sky-500/10" />
        <div className="absolute -right-1/4 top-32 h-[380px] w-[65%] rounded-full bg-gradient-to-bl from-violet-100/70 via-transparent to-transparent blur-3xl dark:from-violet-500/10" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Plans</p>
          <h2
            id="growth-pricing-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
          >
            Pricing by channel
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
            Choose <strong className="font-semibold text-slate-800 dark:text-white">SEO</strong>,{' '}
            <strong className="font-semibold text-slate-800 dark:text-white">Google Ads</strong>, or the{' '}
            <strong className="font-semibold text-slate-800 dark:text-white">Growth+</strong> package. Two channels with
            three tiers each, or everything combined with AI visibility as a bonus.
          </p>
        </header>

        <div className="mx-auto mt-10 flex w-full max-w-3xl flex-col items-center lg:mt-12">
          <div
            className="inline-flex justify-center rounded-full border border-slate-200/90 bg-slate-100/80 p-1 shadow-sm dark:border-white/15 dark:bg-white/[0.06]"
            role="tablist"
            aria-label="Pricing channel"
          >
            <button
              type="button"
              role="tab"
              aria-selected={channel === 'seo'}
              onClick={() => setChannel('seo')}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold transition-all sm:px-5',
                channel === 'seo'
                  ? 'bg-white text-sky-900 shadow-sm dark:bg-sky-500/20 dark:text-sky-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
              ].join(' ')}
            >
              SEO
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={channel === 'ads'}
              onClick={() => setChannel('ads')}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold transition-all sm:px-5',
                channel === 'ads'
                  ? 'bg-white text-amber-950 shadow-sm dark:bg-amber-500/15 dark:text-amber-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
              ].join(' ')}
            >
              Google Ads
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={channel === 'growth'}
              onClick={() => setChannel('growth')}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold transition-all sm:px-5',
                channel === 'growth'
                  ? 'bg-white text-violet-900 shadow-sm dark:bg-violet-500/20 dark:text-violet-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
              ].join(' ')}
            >
              Growth+
            </button>
          </div>
          <p className="mt-4 max-w-md text-center text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {CHANNEL_DESC[channel]}
          </p>
        </div>

        <div
          className="mx-auto mt-8 w-full max-w-6xl lg:mt-10"
          role="tabpanel"
          aria-label={
            channel === 'seo' ? 'SEO pricing' : channel === 'ads' ? 'Google Ads pricing' : 'Growth+ package'
          }
        >
          {channel === 'seo' && <TierGrid variant="seo" tiers={SEO_TIERS} onSelect={handlePlan} />}
          {channel === 'ads' && <TierGrid variant="ads" tiers={ADS_TIERS} onSelect={handlePlan} />}
          {channel === 'growth' && <GrowthBundleCard onSelect={handlePlan} />}
        </div>

        <div
          id="ai-visibility-pricing"
          className="relative mx-auto mt-12 overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:p-10 lg:mt-14 dark:border-white/10"
        >
          <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-sky-400/25 to-violet-500/20 blur-3xl" />
          </div>
          <div className="relative z-[1]">
            <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">What is AI Visibility Search?</h3>
            <p className="mt-4 max-w-[48rem] text-sm leading-relaxed text-white/75 sm:text-[15px]">
              Included in Growth+. Traditional SEO helps your business rank on Google. AI Visibility Search helps modern
              AI-powered systems understand, summarize, and recommend your business across conversational search.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {AI_EXPLAIN_GRID.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-white/85">
                  <span className="mt-[0.35em] h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-2xl lg:mt-20">
          <h3 className="text-center text-lg font-semibold text-slate-900 dark:text-white">FAQ</h3>
          <div className="mt-6 divide-y divide-slate-200/90 rounded-2xl border border-slate-200/90 bg-white/60 px-1 backdrop-blur-sm dark:divide-white/[0.08] dark:border-white/[0.08] dark:bg-white/[0.03]">
            {FAQ_ITEMS.map((item, i) => {
              const open = openFaq === i;
              return (
                <div key={item.q} className="px-4 py-1">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-3 py-4 text-left text-sm font-medium text-slate-900 transition-colors hover:text-sky-800 dark:text-white dark:hover:text-sky-200"
                    aria-expanded={open}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={['h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ease-out', open ? 'rotate-180' : ''].join(' ')}
                      aria-hidden
                    />
                  </button>
                  <div
                    className={['grid transition-[grid-template-rows] duration-300 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'].join(' ')}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <p className="pb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default GrowthPricingSection;
