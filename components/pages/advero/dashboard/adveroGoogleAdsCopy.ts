import { Language } from '../../../../types';

export function getGoogleAdsCopy(lang: Language) {
  const isDa = lang === 'da';

  return {
    eyebrow: isDa ? 'Vækst' : 'Growth',
    title: isDa ? 'Google Ads performance' : 'Google Ads Performance',
    subtitle: isDa
      ? 'Følg kampagnesynlighed, kundehenvendelser og løbende optimering.'
      : 'Track campaign visibility, customer inquiries, and ongoing optimization.',
    statusActive: isDa ? 'Aktiv' : 'Active',
    statusDetail: isDa ? 'Optimeres løbende' : 'Optimizing ongoing',
    monthlyTrend: isDa ? '+18% synlighed denne måned' : '+18% visibility this month',

    metrics: [
      {
        key: 'visibility',
        label: isDa ? 'Annoncesynlighed' : 'Ad visibility',
        value: isDa ? '+24% denne måned' : '+24% this month',
        hint: isDa ? 'Stærkere dækning i lokale søgninger' : 'Stronger coverage in local search',
        tone: 'sky' as const,
      },
      {
        key: 'inquiries',
        label: isDa ? 'Genererede henvendelser' : 'Inquiries generated',
        value: '18',
        suffix: isDa ? 'henvendelser' : 'inquiries',
        hint: isDa ? '+4 vs. sidste måned' : '+4 vs. last month',
        tone: 'violet' as const,
      },
      {
        key: 'efficiency',
        label: isDa ? 'Omkostningseffektivitet' : 'Cost efficiency',
        value: isDa ? 'Stabil performance' : 'Stable performance',
        hint: isDa ? 'Balanceret rækkevidde og henvendelser' : 'Balanced reach and inquiries',
        tone: 'emerald' as const,
      },
      {
        key: 'health',
        label: isDa ? 'Kampagnehelbred' : 'Campaign health',
        value: isDa ? 'Optimeret' : 'Optimized',
        hint: isDa ? 'Ingen kritiske advarsler' : 'No critical alerts',
        tone: 'amber' as const,
      },
    ],

    overview: {
      title: isDa ? 'Kampagneoverblik' : 'Campaign overview',
      subtitle: isDa
        ? 'Forretningsorienteret — ikke et PPC-kontrolpanel.'
        : 'Business-oriented — not a PPC control panel.',
      items: [
        {
          label: isDa ? 'Aktive kampagner' : 'Active campaigns',
          value: '3',
          detail: isDa ? 'Lokale + service-fokus' : 'Local + service focus',
        },
        {
          label: isDa ? 'Bedst præsterende ydelser' : 'Top-performing services',
          value: isDa ? 'Akut VVS · Varmepumpe' : 'Emergency plumbing · Heat pump',
          detail: isDa ? 'Baseret på henvendelser' : 'Based on inquiries',
        },
        {
          label: isDa ? 'Synlighedstrend' : 'Visibility trend',
          value: isDa ? 'Stigende' : 'Rising',
          detail: isDa ? 'Stabil vækst over 90 dage' : 'Steady growth over 90 days',
        },
        {
          label: isDa ? 'Henvendelsestrend' : 'Inquiry trend',
          value: isDa ? 'Stigende' : 'Rising',
          detail: isDa ? 'Flere kvalificerede leads' : 'More qualified leads',
        },
      ],
    },

    opportunities: {
      title: isDa ? 'Top søgemuligheder' : 'Top search opportunities',
      subtitle: isDa
        ? 'Strategiske anbefalinger — ikke teknisk støj.'
        : 'Strategic recommendations — not technical noise.',
      items: [
        {
          title: isDa ? 'Udvid akut-service målretning' : 'Expand emergency service targeting',
          impact: isDa ? 'Høj impact' : 'High impact',
          impactKey: 'high' as const,
          body: isDa
            ? 'Efterspørgsel stiger uden for arbejdstid — øg synlighed i disse vinduer.'
            : 'Demand rises outside business hours — increase visibility in those windows.',
          cta: isDa ? 'Se plan' : 'View plan',
        },
        {
          title: isDa ? 'Forbedr lokal søgedækning' : 'Improve local search coverage',
          impact: isDa ? 'Medium impact' : 'Medium impact',
          impactKey: 'medium' as const,
          body: isDa
            ? 'Udvid radius og serviceområder med tydelige landingssider.'
            : 'Expand radius and service areas with clear landing pages.',
          cta: isDa ? 'Gennemgå' : 'Review',
        },
        {
          title: isDa ? 'Tilføj landingsside-variationer' : 'Add landing page variations',
          impact: isDa ? 'Medium impact' : 'Medium impact',
          impactKey: 'medium' as const,
          body: isDa
            ? 'Match annoncebudskab tættere til hver ydelse for bedre henvendelser.'
            : 'Match ad messaging closer to each service for better inquiries.',
          cta: isDa ? 'Planlæg' : 'Plan',
        },
        {
          title: isDa ? 'Øg synlighed i peak-timer' : 'Increase visibility during peak hours',
          impact: isDa ? 'Løbende' : 'Ongoing',
          impactKey: 'low' as const,
          body: isDa
            ? 'Juster budstrategi omkring høj efterspørgsel uden at miste ro.'
            : 'Adjust bid strategy around high demand without losing calm pacing.',
          cta: isDa ? 'Læs mere' : 'Learn more',
        },
      ],
    },

    trend: {
      title: isDa ? 'Performance-trend' : 'Ad performance trend',
      subtitle: isDa ? 'Synlighed og henvendelser over tid.' : 'Visibility and inquiries over time.',
      visibility: isDa ? 'Synlighed' : 'Visibility',
      inquiries: isDa ? 'Henvendelser' : 'Inquiries',
      growth: isDa ? 'Månedlig vækst stabil' : 'Monthly growth steady',
    },

    landing: {
      title: isDa ? 'Landingsside-indsigter' : 'Landing page insights',
      subtitle: isDa ? 'Hvilke sider driver henvendelser — og hvad kan forbedres.' : 'Which pages drive inquiries — and what to improve.',
      highlight: isDa
        ? 'Jeres akut-VVS-side genererede flest henvendelser denne måned.'
        : 'Your emergency plumbing page generated the highest inquiry volume this month.',
      tags: [
        { label: isDa ? 'Stærkest' : 'Top performer', tone: 'success' as const },
        { label: isDa ? 'Mobil-klar' : 'Mobile-ready', tone: 'neutral' as const },
      ],
      suggestions: [
        isDa ? 'Tilføj tydelig responstid øverst på varmepumpe-siden' : 'Add clear response time at top of heat pump page',
        isDa ? 'Udvid FAQ på lokale service-sider' : 'Expand FAQ on local service pages',
        isDa ? 'Ensart CTA på tværs af mobil og desktop' : 'Align CTAs across mobile and desktop',
      ],
    },

    ai: {
      title: isDa ? 'AI-forstærkede annonce-indsigter' : 'AI-enhanced ad insights',
      subtitle: isDa ? 'Rolige signaler fra samtale-søgning og lokale huller.' : 'Calm signals from conversational search and local gaps.',
      cards: [
        {
          title: isDa
            ? 'Samtale-søgemuligheder registreret'
            : 'Conversational search opportunities detected',
          body: isDa
            ? 'Naturlige spørgsmål om akut hjælp matcher jeres ydelser.'
            : 'Natural questions about urgent help match your services.',
        },
        {
          title: isDa ? 'Lokale synlighedshuller identificeret' : 'Local visibility gaps identified',
          body: isDa
            ? 'To postnumre har lavere dækning — kan udvides kontrolleret.'
            : 'Two postal areas have lower coverage — expandable in a controlled way.',
        },
        {
          title: isDa ? 'AI-søgetrends forbedres' : 'AI-generated search trends improving',
          body: isDa
            ? 'Flere overvågede svar nævner jeres serviceområde.'
            : 'More monitored responses mention your service area.',
        },
        {
          title: isDa ? 'Anbefalet serviceudvidelse' : 'Recommended service expansion',
          body: isDa
            ? 'Efterspørgsel på varmepumpeservice stiger — overvej dedikeret landingsside.'
            : 'Heat pump service demand is rising — consider a dedicated landing page.',
        },
      ],
    },

    timeline: {
      title: isDa ? 'Månedlig optimering' : 'Monthly optimization',
      subtitle: isDa
        ? 'Det arbejde der løbende udføres på jeres vegne.'
        : 'The work performed on your behalf each month.',
      items: [
        isDa ? 'Forbedret keyword-målretning' : 'Improved keyword targeting',
        isDa ? 'Udvidet lokal søgedækning' : 'Expanded local search coverage',
        isDa ? 'Optimeret mobil landingoplevelse' : 'Optimized mobile landing experience',
        isDa ? 'Finpudset annoncebudskaber' : 'Refined ad messaging',
        isDa ? 'Forbedret konverteringssporing' : 'Improved conversion tracking',
      ],
    },
  };
}
