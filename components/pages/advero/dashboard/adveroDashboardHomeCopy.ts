import { Language } from '../../../../types';

export function getDashboardHomeCopy(lang: Language) {
  const isDa = lang === 'da';

  return {
    eyebrow: isDa ? 'Synlighedsoverblik' : 'Visibility overview',
    title: isDa ? 'Velkommen tilbage' : 'Welcome back',
    lead: isDa
      ? 'Et roligt overblik over synlighed, henvendelser og det arbejde vi løbende optimerer for jer.'
      : 'A calm view of visibility, inquiries, and the work we continuously optimize for you.',

    metrics: [
      {
        key: 'score',
        label: isDa ? 'Synlighedsscore' : 'Visibility score',
        value: '78',
        suffix: isDa ? '/ 100' : '/ 100',
        delta: isDa ? '+12 denne måned' : '+12 this month',
        tone: 'sky' as const,
      },
      {
        key: 'leads',
        label: isDa ? 'Leads / henvendelser' : 'Leads / inquiries',
        value: '18',
        suffix: isDa ? 'nye henvendelser' : 'new inquiries',
        delta: isDa ? '+4 vs. sidste måned' : '+4 vs. last month',
        tone: 'violet' as const,
      },
      {
        key: 'search',
        label: isDa ? 'Søge-tilstedeværelse' : 'Search presence',
        value: isDa ? 'Stabil fremgang' : 'Improving steadily',
        suffix: '',
        delta: isDa ? 'Organisk momentum' : 'Organic momentum',
        tone: 'emerald' as const,
      },
      {
        key: 'ai',
        label: isDa ? 'AI-synlighed' : 'AI visibility',
        value: isDa ? 'Overvåget' : 'Monitored',
        suffix: '',
        delta: isDa
          ? 'Set i overvågede AI-søgesvar'
          : 'Detected in monitored AI-powered search responses',
        tone: 'indigo' as const,
        highlight: true,
      },
    ],

    visibilitySection: {
      title: isDa ? 'Synlighedsstatus' : 'Visibility status',
      subtitle: isDa
        ? 'Hvor I står på tværs af søgning, lokalt og AI — uden teknisk støj.'
        : 'Where you stand across search, local, and AI — without technical noise.',
      categories: [
        {
          name: isDa ? 'Søge-synlighed' : 'Search visibility',
          status: isDa ? 'Stigende' : 'Growing',
          trend: 'up' as const,
          insight: isDa
            ? 'Flere relevante sider begynder at rangere stabilt.'
            : 'More relevant pages are ranking steadily.',
        },
        {
          name: isDa ? 'Lokal opdagelse' : 'Local discovery',
          status: isDa ? 'Stabil' : 'Stable',
          trend: 'flat' as const,
          insight: isDa
            ? 'Profil og kategorier er konsistente på tværs af kanaler.'
            : 'Profile and categories stay consistent across channels.',
        },
        {
          name: isDa ? 'Kort-synlighed' : 'Maps visibility',
          status: isDa ? 'Forbedres' : 'Improving',
          trend: 'up' as const,
          insight: isDa
            ? 'Lokale signaler styrkes gradvist denne måned.'
            : 'Local signals are strengthening gradually this month.',
        },
        {
          name: isDa ? 'AI-søgesynlighed' : 'AI search visibility',
          status: isDa ? 'Vokser' : 'Growing',
          trend: 'up' as const,
          insight: isDa
            ? 'AI-søgesynlighed — vokser'
            : 'AI search visibility — growing',
        },
      ],
    },

    actionsSection: {
      title: isDa ? 'Anbefalede handlinger' : 'Recommended actions',
      subtitle: isDa
        ? 'Strategiske næste skridt baseret på jeres synlighed og indhold.'
        : 'Strategic next steps based on your visibility and content.',
      items: [
        {
          title: isDa ? 'Udvid dækning på ydelsessider' : 'Improve service page coverage',
          body: isDa
            ? 'Sørg for at centrale ydelser har tydelige, dedikerede landingssider.'
            : 'Ensure core services have clear, dedicated landing pages.',
          priority: isDa ? 'Høj' : 'High',
          priorityKey: 'high' as const,
          cta: isDa ? 'Se anbefaling' : 'View recommendation',
        },
        {
          title: isDa ? 'Tilføj FAQ i samtale-tone' : 'Add conversational FAQ sections',
          body: isDa
            ? 'Korte svar i naturligt sprog hjælper både besøgende og AI-forståelse.'
            : 'Short answers in natural language help visitors and AI comprehension.',
          priority: isDa ? 'Medium' : 'Medium',
          priorityKey: 'medium' as const,
          cta: isDa ? 'Planlæg indhold' : 'Plan content',
        },
        {
          title: isDa ? 'Optimér lokale kategorier' : 'Optimize local business categories',
          body: isDa
            ? 'Præcise kategorier gør det lettere at blive fundet lokalt.'
            : 'Precise categories make local discovery easier.',
          priority: isDa ? 'Medium' : 'Medium',
          priorityKey: 'medium' as const,
          cta: isDa ? 'Gennemgå profil' : 'Review profile',
        },
        {
          title: isDa ? 'Forbedr AI-læsbar struktur' : 'Improve AI-readable structure',
          body: isDa
            ? 'Tydelige overskrifter og fakta-blokke gør indhold lettere at citere.'
            : 'Clear headings and fact blocks make content easier to cite.',
          priority: isDa ? 'Løbende' : 'Ongoing',
          priorityKey: 'low' as const,
          cta: isDa ? 'Læs mere' : 'Learn more',
        },
      ],
    },

    leadsSection: {
      title: isDa ? 'Leads og performance' : 'Leads & performance',
      subtitle: isDa ? 'Forretningsorienteret — uden SEO-jargon.' : 'Business-oriented — no SEO jargon.',
      stats: [
        { label: isDa ? 'Henvendelser' : 'Inquiries', value: '18' },
        { label: isDa ? 'Opkald' : 'Calls', value: '9' },
        { label: isDa ? 'Bookede leads' : 'Booked leads', value: '5' },
        { label: isDa ? 'Synlighedstrend' : 'Visibility trend', value: isDa ? '↑ Stigende' : '↑ Rising' },
      ],
    },

    aiSection: {
      title: isDa ? 'AI-synlighed' : 'AI visibility',
      subtitle: isDa
        ? 'Premium overblik over tilstedeværelse i samtale-baserede søgninger.'
        : 'Premium view of presence in conversational search.',
      headline: isDa
        ? 'Din virksomhed blev set i overvågede AI-genererede søgesvar denne uge.'
        : 'Your business appeared in monitored AI-generated search responses this week.',
      opportunityLabel: isDa ? 'AI-mulighedsscore' : 'AI opportunity score',
      opportunityValue: '72',
      suggestionsTitle: isDa ? 'Samtale-søgeforslag' : 'Conversational search suggestions',
      suggestions: [
        isDa ? 'Tilføj korte “hvem passer til”-svar på ydelsessider' : 'Add short “who this is for” answers on service pages',
        isDa ? 'Udvid lokale FAQ med naturlige spørgsmål' : 'Expand local FAQ with natural questions',
        isDa ? 'Fremhæv tydelige serviceområder og responstider' : 'Highlight clear service areas and response times',
      ],
    },

    activitySection: {
      title: isDa ? 'Aktivitetstidslinje' : 'Activity timeline',
      subtitle: isDa
        ? 'Løbende optimering — så I kan se fremdriften måned for måned.'
        : 'Ongoing optimization — see progress month by month.',
      items: [
        isDa ? 'Forbedret lokal schema-struktur' : 'Improved local schema structure',
        isDa ? 'Tilføjet AI-læsbare FAQ-sektioner' : 'Added AI-readable FAQ sections',
        isDa ? 'Optimeret lokale søgeord' : 'Optimized local search keywords',
        isDa ? 'Opdateret Google Ads-målretning' : 'Updated Google Ads targeting',
      ],
    },

    reportsSection: {
      title: isDa ? 'Rapporter' : 'Reports',
      subtitle: isDa ? 'Hent overblik når det passer jer.' : 'Download summaries when you need them.',
      items: [
        {
          title: isDa ? 'Månedlig synlighedsrapport' : 'Monthly visibility report',
          date: isDa ? 'Genereret 1. maj 2026' : 'Generated May 1, 2026',
        },
        {
          title: isDa ? 'AI-synlighedsresume' : 'AI visibility summary',
          date: isDa ? 'Genereret 28. apr. 2026' : 'Generated Apr 28, 2026',
        },
        {
          title: isDa ? 'Søge-performance resume' : 'Search performance summary',
          date: isDa ? 'Genereret 15. apr. 2026' : 'Generated Apr 15, 2026',
        },
      ],
      download: isDa ? 'Download' : 'Download',
      viewAll: isDa ? 'Alle rapporter' : 'All reports',
    },
  };
}
