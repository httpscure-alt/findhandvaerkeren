/** Client/admin copy for manual SEO & Ads delivery until autonomous engine ships. */
export function manualFulfillmentTasks(serviceLine: string, lang: 'da' | 'en' = 'da'): string[] {
  const line = serviceLine.toLowerCase();
  const isDa = lang === 'da';

  if (line === 'seo') {
    return isDa
      ? [
          'Gennemgå audit + prioriter søgeord og lokale muligheder',
          'Forbind Search Console og Google Business Profile',
          'On-page SEO: titler, meta, H-struktur og intern linking',
          'Teknisk gennemgang (indeksering, hastighed, mobil)',
          'Lokal synlighed / NAP og citations',
          'Månedlig rapportering i dashboard',
        ]
      : [
          'Review audit and prioritize keywords and local opportunities',
          'Connect Search Console and Google Business Profile',
          'On-page SEO: titles, meta, headings, and internal linking',
          'Technical review (indexing, speed, mobile)',
          'Local visibility / NAP and citations',
          'Monthly reporting in the dashboard',
        ];
  }

  if (line === 'ads') {
    return isDa
      ? [
          'Gennemgå audit og konverteringsmål',
          'Opret/forbind Google Ads-konto',
          'Kampagnestruktur og budstrategi',
          'Konverteringssporing (GA4 / tags)',
          'Launch + optimering efter 7–14 dage',
        ]
      : [
          'Review audit and conversion goals',
          'Create/connect Google Ads account',
          'Campaign structure and bidding',
          'Conversion tracking (GA4 / tags)',
          'Launch and optimization after 7–14 days',
        ];
  }

  if (line === 'growth') {
    const seoLabel = isDa ? 'SEO-delen' : 'SEO workstream';
    const adsLabel = isDa ? 'Ads-delen' : 'Ads workstream';
    return [
      `[${seoLabel}]`,
      ...manualFulfillmentTasks('seo', lang),
      `[${adsLabel}]`,
      ...manualFulfillmentTasks('ads', lang),
    ];
  }

  return [];
}
