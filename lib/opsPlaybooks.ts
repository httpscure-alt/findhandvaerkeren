export type OpsPlaybookKey = 'triage' | 'seo' | 'ads' | 'combined';

export type OpsPlaybook = {
  key: OpsPlaybookKey;
  titleDa: string;
  titleEn: string;
  markdownDa: string;
  markdownEn: string;
};

const TRIAGE_DA = `### Ops triage (før I går i gang)
- **1) Bekræft scope**: SEO, Google Ads eller begge? Hvilken geografi? Hvilke ydelser sælger de?
- **2) Afklar mål**: flere henvendelser nu (Ads) vs. langsigtet synlighed (SEO) vs. begge.
- **3) Afklar adgang**: hvem kan give adgang til:
  - Google Business Profile (GBP)
  - Search Console (GSC)
  - Google Ads
  - CMS (WordPress/Webflow/andet) + analytics/GA4
- **4) Håndter ‘haster’**: hvis de vil leads nu → Ads først, ellers SEO først.
- **5) Sæt rytme**: “Vi arbejder i en månedlig rytme: opsætning → stabil drift → rapport.”

### Skabeloner (copy/paste)
**Adgang til Google (kort mail)**
Hej {{navn}}

For at komme i gang skal vi have adgang til:
- Google Business Profile (Manager)
- Search Console (fuld adgang)
${'```'}
Tilføj os på: {{agencyEmail}}
${'```'}
Når det er på plads, starter vi opsætning og sender første status i dashboardet.

Vh
Advero

**Hurtig opsummering (til noter)**
- Mål: {{mål}}
- Scope: {{seo/ads/begge}} / {{tier}}
- Geografi: {{by/region}}
- Adgange: GBP={{ja/nej}}, GSC={{ja/nej}}, Ads={{ja/nej}}, CMS={{ja/nej}}
`;

const TRIAGE_EN = `### Ops triage (before you start)
- **1) Confirm scope**: SEO, Google Ads, or both? Geography? What do they sell?
- **2) Clarify goal**: leads now (Ads) vs long-term visibility (SEO) vs both.
- **3) Access checklist** (who can grant access):
  - Google Business Profile (GBP)
  - Search Console (GSC)
  - Google Ads
  - CMS (WordPress/Webflow/etc) + analytics/GA4
- **4) Handle urgency**: if they need leads now → Ads first; otherwise SEO first.
- **5) Set rhythm**: “We work in a monthly rhythm: setup → steady optimization → reporting.”

### Templates (copy/paste)
**Google access request (short email)**
Hi {{name}}

To get started we need access to:
- Google Business Profile (Manager)
- Search Console (Full access)
\`\`\`
Invite: {{agencyEmail}}
\`\`\`
Once granted, we’ll start setup and post the first status update in the dashboard.

Best,
Advero

**Quick summary (internal notes)**
- Goal: {{goal}}
- Scope: {{seo/ads/both}} / {{tier}}
- Geography: {{city/region}}
- Access: GBP={{yes/no}}, GSC={{yes/no}}, Ads={{yes/no}}, CMS={{yes/no}}
`;

const SEO_DA = `### SEO playbook (praktisk ops)
**Mål**: stabilt flow af henvendelser fra organisk + lokal synlighed.

#### Fase 1 — adgang + baseline (Dag 0–3)
- Bekræft GBP adgang (Manager) og at profil er verificeret.
- Bekræft GSC adgang (Property owner eller fuld).
- Find “money pages”: ydelser + by/område.
- Notér baseline:
  - Brand søgninger vs. non-brand
  - Top 10 sider (trafik / konvertering)
  - 3 vigtigste konkurrenter lokalt

#### Fase 2 — plan (Dag 3–7)
- Vælg 5–12 primære søgeord (intent: køb/booking).
- Vælg 3–6 “support topics” (FAQ/viden).
- Plan for lokale landingssider (hvis relevant): 1 side pr. vigtig serviceområde.

#### Fase 3 — eksekvering (Uge 2–4)
- On-page: titel, meta, H‑struktur, intern linking.
- GBP: kategori, services, billeder, beskrivelse, posts.
- Teknisk: indeks, hastighed, mobil, schema (LocalBusiness/Service).

#### Rapportering (månedligt)
- Hvad blev lavet (3 bullets)
- Hvad ændrede sig (GSC: impressions/clicks + top queries)
- Næste skridt (3 bullets)

### Output skabeloner
**90‑dages plan (kort)**
1) Adgang + baseline
2) 3–5 service‑sider optimeres
3) Lokal synlighed (GBP + citations + reviews)
4) 2 artikler/måned der støtter service‑sider

**“Need from client”**
- Login/adgang til: GSC, GBP, CMS, GA4
- Liste over ydelser og vigtigste byer/områder
- 5 eksempler på opgaver/henvendelser de ønsker flere af
`;

const SEO_EN = `### SEO playbook (practical ops)
**Goal**: steady lead flow from organic + local visibility.

#### Phase 1 — access + baseline (Day 0–3)
- Confirm GBP access (Manager) and that the profile is verified.
- Confirm GSC access (full).
- Identify “money pages”: services + city/area pages.
- Record baseline:
  - Brand vs non-brand demand
  - Top 10 pages (traffic / conversions)
  - 3 key local competitors

#### Phase 2 — plan (Day 3–7)
- Pick 5–12 primary intent keywords (buy/book).
- Pick 3–6 supporting topics (FAQ/knowledge).
- Local landing page plan if needed (1 per main service area).

#### Phase 3 — execution (Week 2–4)
- On-page: titles, meta, headings, internal linking.
- GBP: category, services, photos, description, posts.
- Technical: indexing, speed, mobile, schema (LocalBusiness/Service).

#### Reporting (monthly)
- What we shipped (3 bullets)
- What changed (GSC: impressions/clicks + top queries)
- Next steps (3 bullets)

### Templates
**90-day plan (short)**
1) Access + baseline
2) Optimize 3–5 service pages
3) Local visibility (GBP + citations + reviews)
4) 2 posts/month supporting service pages

**Client inputs needed**
- Access to: GSC, GBP, CMS, GA4
- Service list + target areas
- 5 examples of the leads they want more of
`;

const ADS_DA = `### Google Ads playbook (praktisk ops)
**Mål**: leads nu, med målbart CPA/ROAS.

#### Fase 1 — adgang + tracking (Dag 0–3)
- Bekræft Google Ads adgang (Admin) + fakturering.
- Konverteringssporing:
  - GA4 + relevante events
  - Call tracking (hvis muligt)
  - Formular tracking
- Afklar tilbud: hvilke ydelser, prisniveau, geografi, åbningstider.

#### Fase 2 — konto struktur (Dag 3–7)
- 1–3 kampagner (Search) baseret på intent:
  - “service + by”
  - “problem + løsning”
- 5–20 ad groups max, 1 tema pr. ad group.
- Negativliste: job, gratis, kursus, DIY, template, mm.

#### Fase 3 — launch + læring (Uge 2)
- Start konservativt (bud + geografi).
- 3 RSA pr. ad group (min 8–10 headlines / 3–4 descriptions).
- 1 landing pr. intent (helst samme CTA: gratis analyse).

#### Fase 4 — optimering (Uge 3–4)
- Søgninger → negatives
- Budget flyttes til det der konverterer
- Split brand vs non‑brand

### Output skabeloner
**Launch checklist**
- Tracking live
- Kampagner live
- Negatives lagt på
- Callout/structured snippets
- Første rapport efter 7 dage

**“Need from client”**
- Adgang til Google Ads + GA4
- Top 3 ydelser + top 3 byer/områder
- 5 eksempler på gode leads
- Hvad er en “god henvendelse” (kvalitet)
`;

const ADS_EN = `### Google Ads playbook (practical ops)
**Goal**: leads now with measurable CPA/ROAS.

#### Phase 1 — access + tracking (Day 0–3)
- Confirm Google Ads access (Admin) + billing.
- Conversion tracking:
  - GA4 + events
  - Call tracking (if possible)
  - Form tracking
- Clarify offer: services, pricing, geography, hours.

#### Phase 2 — account structure (Day 3–7)
- 1–3 Search campaigns by intent:
  - “service + city”
  - “problem + solution”
- 5–20 ad groups max, 1 theme per ad group.
- Negative list: jobs, free, course, DIY, template, etc.

#### Phase 3 — launch + learning (Week 2)
- Start conservative (bids + geo).
- 3 RSAs per ad group (8–10 headlines / 3–4 descriptions).
- One landing per intent (prefer same CTA: free analysis).

#### Phase 4 — optimization (Week 3–4)
- Search terms → negatives
- Reallocate budget to winners
- Split brand vs non-brand

### Templates
**Launch checklist**
- Tracking live
- Campaigns live
- Negatives applied
- Extensions configured
- First report after 7 days

**Client inputs needed**
- Access to Google Ads + GA4
- Top 3 services + top 3 areas
- 5 examples of good leads
- What “good lead” means (quality)
`;

const COMBINED_DA = `### Kombineret (SEO + Ads)
Brug **triage** først, og kør derefter to workstreams parallelt:
- SEO: baseline + service‑sider + lokal synlighed
- Ads: tracking + launch + negatives + optimering

**Delmål**:
- Uge 1: adgang + tracking + baseline
- Uge 2: Ads live + 2–3 SEO quick wins
- Uge 4: første “stabil” CPA + tydelig SEO‑fremgang i impressions/queries
`;

const COMBINED_EN = `### Combined (SEO + Ads)
Run **triage** first, then execute two workstreams in parallel:
- SEO: baseline + service pages + local visibility
- Ads: tracking + launch + negatives + optimization

**Milestones**:
- Week 1: access + tracking + baseline
- Week 2: Ads live + 2–3 SEO quick wins
- Week 4: stable CPA trend + clear SEO lift in impressions/queries
`;

export const OPS_PLAYBOOKS: OpsPlaybook[] = [
  {
    key: 'triage',
    titleDa: 'Triage & skabeloner',
    titleEn: 'Triage & templates',
    markdownDa: TRIAGE_DA,
    markdownEn: TRIAGE_EN,
  },
  {
    key: 'seo',
    titleDa: 'SEO playbook',
    titleEn: 'SEO playbook',
    markdownDa: SEO_DA,
    markdownEn: SEO_EN,
  },
  {
    key: 'ads',
    titleDa: 'Google Ads playbook',
    titleEn: 'Google Ads playbook',
    markdownDa: ADS_DA,
    markdownEn: ADS_EN,
  },
  {
    key: 'combined',
    titleDa: 'Kombineret (SEO + Ads)',
    titleEn: 'Combined (SEO + Ads)',
    markdownDa: COMBINED_DA,
    markdownEn: COMBINED_EN,
  },
];

export function playbookForServiceLine(line: string): OpsPlaybookKey {
  const v = (line || '').toLowerCase();
  if (v === 'growth' || v === 'combined') return 'combined';
  if (v === 'seo') return 'seo';
  if (v === 'ads') return 'ads';
  return 'triage';
}

