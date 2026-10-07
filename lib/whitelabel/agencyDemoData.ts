import { formatWlIdr } from '../adveroWhitelabelThemes';
import { TOKEN_LEDGER, entryTokens, type TokenClientId, type TokenLedgerEntry } from '../adveroTokenUsage';

export type DemoClientStatus = 'Active' | 'Onboarding' | 'Audit review' | 'Paused';

export type DemoClient = {
  name: string;
  industry: string;
  website: string;
  status: DemoClientStatus;
  bundle: string;
  google: { spend: number; clicks: number; conversions: number; cpa: number };
  meta: { spend: number; reach: number; ctr: number; conversions: number };
  seo: { visibility: number; top10: number; sessions: number; pages: number };
  ai: { score: number; mentions: number; shareOfVoice: number; cited: number };
  spend: number;
  leads: number;
  roas: number;
  trend: number[];
};

type ClientInput = {
  name: string;
  industry: string;
  website: string;
  status?: DemoClientStatus;
  bundle: string;
  /** Monthly Google Ads spend (IDR). */
  g: number;
  /** Monthly Meta spend (IDR). */
  m: number;
  /** Google cost per click (IDR). */
  cpc: number;
  /** Google click → conversion rate (0–1). */
  cvr: number;
  /** Meta cost per 1,000 impressions (IDR). */
  cpm: number;
  /** Meta click-through rate (0–1). */
  ctr: number;
  /** Meta click → conversion rate (0–1). */
  mcvr: number;
  roas: number;
  visibility: number;
  ai: number;
  sessions: number;
  seed: number;
};

function trendFrom(seed: number): number[] {
  let x = seed;
  return Array.from({ length: 12 }, () => {
    x = (x * 9301 + 49297) % 233280;
    return 34 + Math.round((x / 233280) * 50);
  });
}

function client(c: ClientInput): DemoClient {
  const gClicks = c.g > 0 ? Math.round(c.g / c.cpc) : 0;
  const gConv = Math.round(gClicks * c.cvr);
  const impressions = c.m > 0 ? (c.m / c.cpm) * 1000 : 0;
  const mClicks = impressions * c.ctr;
  const mConv = Math.round(mClicks * c.mcvr);
  return {
    name: c.name,
    industry: c.industry,
    website: c.website,
    status: c.status ?? 'Active',
    bundle: c.bundle,
    google: { spend: c.g, clicks: gClicks, conversions: gConv, cpa: gConv ? Math.round(c.g / gConv) : 0 },
    meta: { spend: c.m, reach: Math.round(impressions / 2.7), ctr: c.ctr, conversions: mConv },
    seo: {
      visibility: c.visibility,
      top10: Math.round(c.visibility * 0.55 + (c.seed % 9)),
      sessions: c.sessions,
      pages: 40 + ((c.seed * 7) % 260),
    },
    ai: {
      score: c.ai,
      mentions: Math.round(c.ai * 0.8 + (c.seed % 13)),
      shareOfVoice: Math.round(c.ai * 0.38 + (c.seed % 5)),
      cited: 3 + ((c.seed * 3) % 19),
    },
    spend: c.g + c.m,
    leads: gConv + mConv,
    roas: c.roas,
    trend: trendFrom(c.seed),
  };
}

export type DemoTask = {
  id: string;
  title: string;
  client: string;
  type: 'Report' | 'Audit' | 'Creative' | 'Integration' | 'Scan';
  status: 'open' | 'in_progress' | 'blocked' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueLabel: string;
  dueDate: string;
  owner: string;
  description: string;
  checklist: { id: string; label: string; done: boolean }[];
};

export type DemoAudit = { client: string; date: string; score: number; channels: string; status: string };
export type DemoReport = {
  id: string;
  kind: 'ai' | 'weekly' | 'monthly';
  /** Share of a 30-day month the report covers. */
  coverage: number;
  issued: string;
  client: string;
  period: string;
  channels: string;
  status: 'Draft' | 'Sent' | 'Scheduled';
  tokens?: number;
};
export type DemoRunKind = 'Report' | 'Audit' | 'AI visibility scan' | 'Recommendations';
export type DemoRun = { client: string; kind: DemoRunKind; when: string; at: number; usd: number; tokens: number };
export type DemoRecommendation = {
  client: string;
  title: string;
  channel: string;
  priority: 'high' | 'med' | 'low';
  impact: string;
};

export type AgencyDemoData = {
  period: string;
  loginEmail: string;
  team: string[];
  deltas: { google: string; seo: string; ai: string };
  clients: DemoClient[];
  featured: DemoClient;
  tasks: DemoTask[];
  calendar: { date: string; item: string; type: string; taskId: string }[];
  audits: DemoAudit[];
  reports: DemoReport[];
  recommendations: DemoRecommendation[];
  runs: DemoRun[];
  usage: { since: string; tz: string; usd: number; tokens: number; byKind: Record<DemoRunKind, number> };
  totals: {
    spend: number;
    roas: number;
    visibility: number;
    activeClients: number;
    google: DemoClient['google'];
    meta: DemoClient['meta'] & { roas: number };
    seo: DemoClient['seo'];
    ai: DemoClient['ai'];
  };
};

function channelsOf(c: DemoClient): string {
  const parts: string[] = [];
  if (c.google.spend) parts.push('Google Ads');
  if (c.meta.spend) parts.push('Meta');
  parts.push('SEO');
  if (c.ai.score >= 45) parts.push('AI');
  return parts.join(' · ');
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const HISTORY_END = Date.UTC(2026, 9, 6);
const ONBOARDING_SINCE = Date.UTC(2026, 8, 28);
const DAY = 86_400_000;

const fmtDate = (t: number) => {
  const d = new Date(t);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
};
const fmtShort = (t: number) => {
  const d = new Date(t);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
};

function buildAudits(clients: DemoClient[], historyStart: number): DemoAudit[] {
  const audits: DemoAudit[] = [];
  const steps = [3, 4, 2, 5, 3, 4];
  let t = historyStart + DAY;
  let i = 0;
  const latestFor = new Set<string>();
  const rows: { t: number; c: DemoClient }[] = [];
  while (t <= HISTORY_END) {
    const eligible = clients.filter((c) => c.status !== 'Onboarding' || t >= ONBOARDING_SINCE);
    let c = eligible[i % eligible.length];
    if (rows.length && rows[rows.length - 1].c === c) c = eligible[(i + 1) % eligible.length];
    rows.push({ t, c });
    t += steps[i % steps.length] * DAY;
    i += 1;
  }
  for (const { t: at, c } of rows.reverse()) {
    const current = Math.round((c.seo.visibility + c.ai.score) / 2);
    const weeksAgo = (HISTORY_END - at) / (7 * DAY);
    const isLatest = !latestFor.has(c.name);
    latestFor.add(c.name);
    audits.push({
      client: c.name,
      date: fmtDate(at),
      score: Math.max(18, Math.round(current - weeksAgo * 1.4)),
      channels: channelsOf(c),
      status: isLatest && c.status === 'Audit review' ? 'In review' : 'Complete',
    });
  }
  return audits;
}

const LEDGER_MONTHS: Record<string, number> = { Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

function runKind(usd: number): DemoRunKind {
  if (usd >= 12) return 'Report';
  if (usd >= 8) return 'Audit';
  return usd >= 6 ? 'Recommendations' : 'AI visibility scan';
}

const RUN_BY_ENTRY = new Map<TokenLedgerEntry, DemoRun>();

/** The portal run a token ledger usage row was spent on. */
export function ledgerRun(entry: TokenLedgerEntry): DemoRun | undefined {
  return RUN_BY_ENTRY.get(entry);
}

/** One portal run per usage row in the token ledger, so run counts and tokens match the ledger exactly. */
function buildRuns(agencyId: TokenClientId, clients: DemoClient[], tzOffsetHours: number, tz: string): DemoRun[] {
  const total = clients.reduce((a, c) => a + c.spend, 0);
  const credit = new Map(clients.map((c) => [c.name, 0]));
  return TOKEN_LEDGER.filter((r) => r.clientId === agencyId && r.kind === 'usage')
    .map((r) => {
      const [d, mon, y] = r.date.split(' ');
      const [hh, mm] = (r.time ?? '09:00').split(':').map(Number);
      const at = Date.UTC(Number(y), LEDGER_MONTHS[mon], Number(d), hh + tzOffsetHours, mm);
      return { r, at };
    })
    .sort((a, b) => a.at - b.at)
    .map(({ r, at }) => {
      for (const c of clients) credit.set(c.name, (credit.get(c.name) ?? 0) + c.spend / total);
      const pick = clients.reduce((best, c) => ((credit.get(c.name) ?? 0) > (credit.get(best.name) ?? 0) ? c : best));
      credit.set(pick.name, (credit.get(pick.name) ?? 0) - 1);
      let kind = runKind(r.usd);
      if (kind === 'Report' && pick.status === 'Onboarding') kind = 'Audit';
      const t = new Date(at);
      const when = `${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]}, ${String(t.getUTCHours()).padStart(2, '0')}:${String(t.getUTCMinutes()).padStart(2, '0')} ${tz}`;
      const run: DemoRun = { client: pick.name, kind, when, at, usd: r.usd, tokens: entryTokens(r) };
      RUN_BY_ENTRY.set(r, run);
      return run;
    })
    .reverse();
}

const slugOf = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function buildReports(clients: DemoClient[], historyStart: number, draftCount: number, runs: DemoRun[]): DemoReport[] {
  const reports: (DemoReport & { at: number })[] = [];
  const byName = new Map(clients.map((c) => [c.name, c]));
  runs
    .filter((r) => r.kind === 'Report')
    .forEach((r, i) => {
      const c = byName.get(r.client);
      reports.push({
        id: `ai-${slugOf(r.client)}-${r.at.toString(36)}`,
        kind: 'ai',
        coverage: 1,
        issued: r.when,
        at: r.at,
        client: r.client,
        period: `AI performance report · ${r.when}`,
        channels: c ? channelsOf(c) : '',
        status: i < draftCount ? 'Draft' : 'Sent',
        tokens: r.tokens,
      });
    });

  let week = HISTORY_END - ((new Date(HISTORY_END).getUTCDay() + 6) % 7) * DAY;
  let n = 0;
  while (week + 6 * DAY >= historyStart) {
    const end = Math.min(week + 6 * DAY, HISTORY_END);
    const from = Math.max(week, historyStart);
    reports.push({
      id: `digest-${new Date(end).toISOString().slice(0, 10)}`,
      kind: 'weekly',
      coverage: ((end - from) / DAY + 1) / 30,
      issued: fmtDate(end + DAY),
      at: end,
      client: 'All clients',
      period: `Weekly digest · ${fmtShort(Math.max(week, historyStart))} – ${fmtShort(end)}`,
      channels: 'Spend, leads and ROAS summary',
      status: 'Sent',
    });
    week -= 7 * DAY;
    n += 1;
  }

  const startMonth = new Date(historyStart).getUTCMonth();
  for (let m = 8; m >= startMonth; m -= 1) {
    const partial = m === startMonth && new Date(historyStart).getUTCDate() > 1;
    clients
      .filter((c) => c.status !== 'Onboarding')
      .forEach((c, i) => {
        const days = new Date(Date.UTC(2026, m + 1, 0)).getUTCDate();
        const startDay = partial ? new Date(historyStart).getUTCDate() : 1;
        reports.push({
          id: `${MONTHS[m].toLowerCase()}-2026-${slugOf(c.name)}`,
          kind: 'monthly',
          coverage: (days - startDay + 1) / 30,
          issued: fmtDate(Date.UTC(2026, m + 1, 3)),
          at: Date.UTC(2026, m + 1, 3) - i,
          client: c.name,
          period: partial
            ? `${MONTHS_LONG[m]} 2026 (from ${new Date(historyStart).getUTCDate()} ${MONTHS[m]})`
            : `${MONTHS_LONG[m]} 2026`,
          channels: channelsOf(c),
          status: 'Sent',
        });
      });
  }
  return reports.sort((a, b) => b.at - a.at).map(({ at: _at, ...r }) => r);
}

function auditsFromRuns(clients: DemoClient[], runs: DemoRun[]): DemoAudit[] {
  const byName = new Map(clients.map((c) => [c.name, c]));
  const seen = new Set<string>();
  return runs
    .filter((r) => r.kind === 'Audit')
    .map((r) => {
      const c = byName.get(r.client)!;
      const first = !seen.has(c.name);
      seen.add(c.name);
      return {
        client: c.name,
        date: r.when,
        score: Math.round((c.seo.visibility + c.ai.score) / 2),
        channels: channelsOf(c),
        status: first && c.status === 'Audit review' ? 'In review' : 'Complete',
      };
    });
}

function buildAgency(input: {
  id: TokenClientId;
  tzOffsetHours: number;
  tz: string;
  loginEmail: string;
  team: string[];
  deltas: AgencyDemoData['deltas'];
  clients: DemoClient[];
  tasks: DemoTask[];
  calendar: AgencyDemoData['calendar'];
  historyStart: number;
  draftCount: number;
  recommendations: DemoRecommendation[];
}): AgencyDemoData {
  const { clients } = input;
  const sum = (f: (c: DemoClient) => number) => clients.reduce((s, c) => s + f(c), 0);
  const avg = (f: (c: DemoClient) => number) => Math.round(sum(f) / clients.length);
  const spend = sum((c) => c.spend);
  const gSpend = sum((c) => c.google.spend);
  const gConv = sum((c) => c.google.conversions);
  const mSpend = sum((c) => c.meta.spend);
  const mReach = sum((c) => c.meta.reach);
  const weightedRoas = sum((c) => c.roas * c.spend) / spend;
  const metaRoas = sum((c) => c.roas * c.meta.spend) / (mSpend || 1);

  const bySpend = [...clients].sort((a, b) => b.spend - a.spend);

  const runs = buildRuns(input.id, bySpend, input.tzOffsetHours, input.tz);
  const runAudits = auditsFromRuns(bySpend, runs);
  const runClients = new Set(runAudits.map((a) => a.client));
  const audits = [
    ...runAudits,
    ...buildAudits(bySpend, input.historyStart).map((a) =>
      a.status === 'In review' && runClients.has(a.client) ? { ...a, status: 'Complete' } : a,
    ),
  ];
  const reports = buildReports(bySpend, input.historyStart, input.draftCount, runs);
  const byKind = { Report: 0, Audit: 0, 'AI visibility scan': 0, Recommendations: 0 } as Record<DemoRunKind, number>;
  runs.forEach((r) => (byKind[r.kind] += 1));
  const oldest = runs[runs.length - 1];

  return {
    period: 'October 2026',
    loginEmail: input.loginEmail,
    team: input.team,
    deltas: input.deltas,
    clients: bySpend,
    featured: bySpend[0],
    tasks: input.tasks,
    calendar: input.calendar,
    audits,
    reports,
    recommendations: input.recommendations,
    runs,
    usage: {
      since: oldest ? oldest.when.split(',')[0] : '',
      tz: input.tz,
      usd: runs.reduce((a, r) => a + r.usd, 0),
      tokens: runs.reduce((a, r) => a + r.tokens, 0),
      byKind,
    },
    totals: {
      spend,
      roas: Math.round(weightedRoas * 10) / 10,
      visibility: avg((c) => c.seo.visibility),
      activeClients: clients.filter((c) => c.status === 'Active').length,
      google: {
        spend: gSpend,
        clicks: sum((c) => c.google.clicks),
        conversions: gConv,
        cpa: gConv ? Math.round(gSpend / gConv) : 0,
      },
      meta: {
        spend: mSpend,
        reach: mReach,
        ctr: sum((c) => c.meta.ctr * c.meta.spend) / (mSpend || 1),
        conversions: sum((c) => c.meta.conversions),
        roas: Math.round(metaRoas * 10) / 10,
      },
      seo: {
        visibility: avg((c) => c.seo.visibility),
        top10: sum((c) => c.seo.top10),
        sessions: sum((c) => c.seo.sessions),
        pages: sum((c) => c.seo.pages),
      },
      ai: {
        score: avg((c) => c.ai.score),
        mentions: sum((c) => c.ai.mentions),
        shareOfVoice: avg((c) => c.ai.shareOfVoice),
        cited: sum((c) => c.ai.cited),
      },
    },
  };
}

const jt = (n: number) => Math.round(n * 1_000_000);

/** Scales budget-driven metrics; rates (CPA, CTR, ROAS) stay the same. */
function scaled(f: number, c: DemoClient): DemoClient {
  const r = (n: number) => Math.round(n * f);
  const google = { ...c.google, spend: r(c.google.spend), clicks: r(c.google.clicks), conversions: r(c.google.conversions) };
  const meta = { ...c.meta, spend: r(c.meta.spend), reach: r(c.meta.reach), conversions: r(c.meta.conversions) };
  return { ...c, google, meta, spend: google.spend + meta.spend, leads: google.conversions + meta.conversions };
}

const JUICEBOX_CLIENTS = [
  client({ name: 'Halo Properti', industry: 'Real estate', website: 'haloproperti.co.id', bundle: 'Growth bundle', g: jt(118.6), m: jt(44.0), cpc: 6_850, cvr: 0.021, cpm: 38_000, ctr: 0.011, mcvr: 0.018, roas: 5.2, visibility: 71, ai: 58, sessions: 24_310, seed: 11 }),
  client({ name: 'Tenang Finance', industry: 'Fintech', website: 'tenang.finance', bundle: 'Full stack', g: jt(89.1), m: jt(67.3), cpc: 5_420, cvr: 0.064, cpm: 31_500, ctr: 0.014, mcvr: 0.052, roas: 3.9, visibility: 66, ai: 62, sessions: 18_920, seed: 23 }),
  client({ name: 'Lumen Skin Clinic', industry: 'Health & beauty', website: 'lumenskin.id', bundle: 'Ads + SEO', g: jt(72.4), m: jt(38.9), cpc: 3_980, cvr: 0.047, cpm: 27_000, ctr: 0.017, mcvr: 0.039, roas: 4.4, visibility: 63, ai: 49, sessions: 11_480, seed: 31 }),
  client({ name: 'Kopi Rimba', industry: 'F&B chain', website: 'kopirimba.com', bundle: 'Social first', g: jt(48.2), m: jt(61.5), cpc: 1_920, cvr: 0.058, cpm: 18_500, ctr: 0.021, mcvr: 0.044, roas: 3.1, visibility: 54, ai: 41, sessions: 9_760, seed: 47 }),
  client({ name: 'Arunika Hotels', industry: 'Hospitality', website: 'arunikahotels.com', bundle: 'Growth bundle', g: jt(54.9), m: jt(21.7), cpc: 4_310, cvr: 0.031, cpm: 29_000, ctr: 0.013, mcvr: 0.022, roas: 6.1, visibility: 69, ai: 55, sessions: 15_240, seed: 53 }),
  client({ name: 'Batik Sekar', industry: 'Fashion e-commerce', website: 'batiksekar.id', bundle: 'Social first', g: jt(14.6), m: jt(52.4), cpc: 1_650, cvr: 0.036, cpm: 16_000, ctr: 0.024, mcvr: 0.031, roas: 4.8, visibility: 47, ai: 33, sessions: 6_890, seed: 61 }),
  client({ name: 'EduPintar', industry: 'Education', website: 'edupintar.id', status: 'Audit review', bundle: 'SEO + AI', g: jt(31.2), m: jt(18.5), cpc: 2_740, cvr: 0.052, cpm: 21_000, ctr: 0.016, mcvr: 0.041, roas: 2.7, visibility: 42, ai: 38, sessions: 7_310, seed: 71 }),
  client({ name: 'Sabana Outdoor', industry: 'Retail', website: 'sabanaoutdoor.com', status: 'Onboarding', bundle: 'Ads only', g: jt(26.3), m: jt(33.8), cpc: 2_180, cvr: 0.029, cpm: 19_500, ctr: 0.019, mcvr: 0.027, roas: 3.3, visibility: 38, ai: 24, sessions: 4_120, seed: 83 }),
];

const SKIPJACK_CLIENTS = [
  client({ name: 'Warung Nusantara Group', industry: 'F&B', website: 'warungnusantara.id', bundle: 'Social first', g: jt(22.8), m: jt(31.4), cpc: 1_740, cvr: 0.061, cpm: 15_500, ctr: 0.023, mcvr: 0.047, roas: 3.6, visibility: 52, ai: 36, sessions: 5_830, seed: 14 }),
  client({ name: 'Saka Logistics', industry: 'B2B logistics', website: 'sakalogistics.co.id', bundle: 'Ads + SEO', g: jt(27.5), m: jt(4.3), cpc: 8_920, cvr: 0.038, cpm: 42_000, ctr: 0.007, mcvr: 0.012, roas: 7.4, visibility: 58, ai: 29, sessions: 3_410, seed: 26 }),
  client({ name: 'Prima Dental Care', industry: 'Healthcare', website: 'primadental.id', bundle: 'Ads + SEO', g: jt(18.4), m: jt(9.6), cpc: 3_260, cvr: 0.072, cpm: 24_000, ctr: 0.015, mcvr: 0.035, roas: 4.9, visibility: 61, ai: 44, sessions: 4_970, seed: 38 }),
  client({ name: 'Kirana Interior', industry: 'Home & living', website: 'kiranainterior.com', status: 'Audit review', bundle: 'Growth bundle', g: jt(12.7), m: jt(16.2), cpc: 2_380, cvr: 0.024, cpm: 17_500, ctr: 0.018, mcvr: 0.019, roas: 2.8, visibility: 44, ai: 27, sessions: 2_860, seed: 42 }),
  client({ name: 'Velo Bike Rental Bali', industry: 'Travel', website: 'velobali.com', status: 'Onboarding', bundle: 'Ads only', g: jt(8.9), m: jt(11.5), cpc: 1_480, cvr: 0.043, cpm: 13_000, ctr: 0.026, mcvr: 0.033, roas: 3.2, visibility: 35, ai: 18, sessions: 1_940, seed: 57 }),
].map((c) => scaled(3.4, c));

const SUITMEDIA_CLIENTS = [
  client({ name: 'Bank Mitra Digital', industry: 'Banking', website: 'bankmitra.co.id', bundle: 'Enterprise', g: jt(186.0), m: jt(94.5), cpc: 7_340, cvr: 0.044, cpm: 36_000, ctr: 0.012, mcvr: 0.029, roas: 3.7, visibility: 78, ai: 71, sessions: 61_420, seed: 17 }),
  client({ name: 'Sentosa Motor', industry: 'Automotive', website: 'sentosamotor.co.id', bundle: 'Enterprise', g: jt(142.3), m: jt(77.8), cpc: 5_910, cvr: 0.026, cpm: 33_000, ctr: 0.013, mcvr: 0.017, roas: 6.8, visibility: 74, ai: 63, sessions: 38_760, seed: 29 }),
  client({ name: 'Nusa Telco Prepaid', industry: 'Telco', website: 'nusatelco.id', bundle: 'Full stack', g: jt(98.7), m: jt(121.4), cpc: 1_260, cvr: 0.083, cpm: 14_500, ctr: 0.022, mcvr: 0.061, roas: 2.9, visibility: 81, ai: 69, sessions: 92_180, seed: 33 }),
  client({ name: 'Cahaya Insurance', industry: 'Insurance', website: 'cahayainsurance.co.id', bundle: 'Full stack', g: jt(88.5), m: jt(41.2), cpc: 9_480, cvr: 0.037, cpm: 39_000, ctr: 0.009, mcvr: 0.021, roas: 4.1, visibility: 67, ai: 52, sessions: 21_340, seed: 49 }),
  client({ name: 'Medika Hospital Group', industry: 'Healthcare', website: 'medikahospital.co.id', status: 'Audit review', bundle: 'SEO + AI', g: jt(64.2), m: jt(19.8), cpc: 4_870, cvr: 0.049, cpm: 28_500, ctr: 0.012, mcvr: 0.026, roas: 5.3, visibility: 72, ai: 57, sessions: 33_090, seed: 67 }),
].map((c) => scaled(0.21, c));

const ART_DIGITAL_CLIENTS = [
  client({ name: 'Rona Cosmetics', industry: 'Beauty', website: 'ronacosmetics.id', bundle: 'Social first', g: jt(24.6), m: jt(78.3), cpc: 1_870, cvr: 0.048, cpm: 17_500, ctr: 0.025, mcvr: 0.038, roas: 4.6, visibility: 55, ai: 46, sessions: 14_260, seed: 19 }),
  client({ name: 'Ritme Music Festival', industry: 'Events', website: 'ritmefest.id', bundle: 'Campaign', g: jt(15.4), m: jt(58.6), cpc: 1_340, cvr: 0.067, cpm: 12_500, ctr: 0.031, mcvr: 0.052, roas: 8.2, visibility: 49, ai: 37, sessions: 22_840, seed: 27 }),
  client({ name: 'Pulau Villas', industry: 'Hospitality', website: 'pulauvillas.com', bundle: 'Growth bundle', g: jt(33.5), m: jt(27.1), cpc: 4_620, cvr: 0.028, cpm: 26_000, ctr: 0.014, mcvr: 0.019, roas: 7.1, visibility: 64, ai: 51, sessions: 8_930, seed: 37 }),
  client({ name: 'Atelier Ivana', industry: 'Fashion', website: 'atelierivana.com', bundle: 'Social first', g: jt(11.2), m: jt(46.9), cpc: 2_110, cvr: 0.033, cpm: 19_000, ctr: 0.021, mcvr: 0.028, roas: 5.4, visibility: 43, ai: 34, sessions: 5_410, seed: 41 }),
  client({ name: 'Sehat Organik', industry: 'Grocery', website: 'sehatorganik.id', status: 'Audit review', bundle: 'Ads + SEO', g: jt(19.7), m: jt(14.8), cpc: 1_590, cvr: 0.056, cpm: 14_000, ctr: 0.018, mcvr: 0.036, roas: 3.0, visibility: 51, ai: 29, sessions: 6_720, seed: 53 }),
  client({ name: 'Teduh Coffee Roasters', industry: 'F&B', website: 'teduhcoffee.com', status: 'Onboarding', bundle: 'Ads only', g: jt(9.8), m: jt(22.4), cpc: 1_420, cvr: 0.062, cpm: 13_500, ctr: 0.023, mcvr: 0.041, roas: 3.8, visibility: 39, ai: 22, sessions: 3_180, seed: 63 }),
].map((c) => scaled(0.823, c));

function task(
  id: string,
  title: string,
  clientName: string,
  type: DemoTask['type'],
  status: DemoTask['status'],
  priority: DemoTask['priority'],
  dueLabel: string,
  dueDate: string,
  owner: string,
  description: string,
  checklist: [string, boolean][],
): DemoTask {
  return {
    id,
    title,
    client: clientName,
    type,
    status,
    priority,
    dueLabel,
    dueDate,
    owner,
    description,
    checklist: checklist.map(([label, done], i) => ({ id: `c${i + 1}`, label, done })),
  };
}

const JUICEBOX = buildAgency({
  id: 'juicebox',
  tzOffsetHours: 4,
  tz: 'AEDT',
  loginEmail: 'team@juicebox.co.id',
  team: ['Mia', 'Josh', 'Putri', 'Liam'],
  deltas: { google: '+11%', seo: '+7%', ai: '+13%' },
  clients: JUICEBOX_CLIENTS,
  tasks: [
    task('t1', 'Finalise September performance report', 'Halo Properti', 'Report', 'in_progress', 'high', 'Due in 2 days', 'Oct 9', 'Mia', 'Google Ads lead cost dropped 9% after the new listing feed. Summarise and send to the marketing director.', [['Pull channel metrics', true], ['Write executive summary', true], ['Add October plan', false], ['Client sign-off', false]]),
    task('t2', 'Fix broken conversion tag on loan calculator', 'Tenang Finance', 'Integration', 'blocked', 'high', 'Blocked', 'Oct 8', 'Josh', 'Calculator submits stopped firing after their site release on 3 Oct. Waiting on their dev team for GTM access.', [['Reproduce in Tag Assistant', true], ['Request GTM publish access', true], ['Re-test and backfill', false]]),
    task('t3', 'Refresh Meta creatives — frequency 4.6', 'Kopi Rimba', 'Creative', 'in_progress', 'medium', 'Due in 4 days', 'Oct 11', 'Putri', 'Pumpkin spice launch set is fatigued. Brief 6 new UGC cuts.', [['Export fatigued ads', true], ['Brief UGC creators', false], ['Launch A/B test', false]]),
    task('t4', 'Technical SEO audit for new course pages', 'EduPintar', 'Audit', 'open', 'high', 'Due today', 'Oct 7', 'Liam', '140 new course pages launched without canonical tags. Audit before indexing spreads duplicates.', [['Crawl staging site', true], ['List canonical issues', false], ['Share fix list', false]]),
    task('t5', 'Monthly AI visibility scan', 'Lumen Skin Clinic', 'Scan', 'open', 'low', 'Scheduled', 'Oct 14', 'Mia', 'Track mentions across ChatGPT, Perplexity and Gemini for “acne clinic Jakarta”.', [['Run scan', false], ['Compare vs September', false]]),
  ],
  calendar: [
    { date: 'Oct 9', item: 'September report — Halo Properti', type: 'Report', taskId: 't1' },
    { date: 'Oct 11', item: 'Creative refresh go-live — Kopi Rimba', type: 'Launch', taskId: 't3' },
    { date: 'Oct 14', item: 'AI visibility review — Lumen Skin Clinic', type: 'Scan', taskId: 't5' },
    { date: 'Oct 16', item: 'Q4 planning — Tenang Finance', type: 'Meeting', taskId: 't2' },
  ],
  historyStart: Date.UTC(2026, 7, 15),
  draftCount: 2,
  recommendations: [
    { client: 'Halo Properti', title: 'Shift 12% of Search budget to Performance Max listings', channel: 'Google Ads', priority: 'high', impact: `Est. +38 leads/month at ~${formatWlIdr(330_000)} CPA` },
    { client: 'Kopi Rimba', title: 'Cap Meta frequency at 3 for prospecting', channel: 'Meta Ads', priority: 'high', impact: `Save ~${formatWlIdr(7_400_000)} / month in wasted reach` },
    { client: 'Tenang Finance', title: 'Restore loan-calculator conversion tag', channel: 'Google Ads', priority: 'high', impact: 'Smart bidding is optimising blind since 3 Oct' },
    { client: 'EduPintar', title: 'Add canonical tags to 140 course pages', channel: 'SEO', priority: 'med', impact: 'Stop duplicate-content dilution' },
    { client: 'Batik Sekar', title: 'Launch Advantage+ catalogue for best-sellers', channel: 'Meta Ads', priority: 'med', impact: 'Est. ROAS 4.8× → 5.5×' },
  ],
});

const SKIPJACK = buildAgency({
  id: 'skipjack',
  tzOffsetHours: 0,
  tz: 'WIB',
  loginEmail: 'team@skipjack.id',
  team: ['Denny', 'Ayu', 'Fajar'],
  deltas: { google: '+6%', seo: '+12%', ai: '+4%' },
  clients: SKIPJACK_CLIENTS,
  tasks: [
    task('t1', 'Set up Google Ads for Bali rental season', 'Velo Bike Rental Bali', 'Integration', 'in_progress', 'high', 'Due in 3 days', 'Oct 10', 'Fajar', 'New account. Build search campaigns for Canggu and Ubud before the Q4 tourist peak.', [['Create account + billing', true], ['Install conversion tracking', false], ['Launch search campaigns', false]]),
    task('t2', 'Lead quality review with sales team', 'Saka Logistics', 'Audit', 'open', 'medium', 'Due in 5 days', 'Oct 12', 'Denny', '30% of form leads are job seekers. Add negative keywords and a qualifier question.', [['Export September leads', true], ['Tag junk leads', false], ['Add negatives', false]]),
    task('t3', 'September report — Warung Nusantara', 'Warung Nusantara Group', 'Report', 'in_progress', 'high', 'Due tomorrow', 'Oct 8', 'Ayu', 'GoFood promo drove a 22% jump in Meta conversions. Include outlet-level breakdown.', [['Pull channel metrics', true], ['Outlet breakdown', true], ['Client sign-off', false]]),
    task('t4', 'Homepage SEO audit', 'Kirana Interior', 'Audit', 'blocked', 'medium', 'Blocked', 'Oct 9', 'Denny', 'Waiting on Search Console access from the client.', [['Request GSC access', true], ['Run crawl', false]]),
  ],
  calendar: [
    { date: 'Oct 8', item: 'September report — Warung Nusantara Group', type: 'Report', taskId: 't3' },
    { date: 'Oct 10', item: 'Campaign launch — Velo Bike Rental Bali', type: 'Launch', taskId: 't1' },
    { date: 'Oct 12', item: 'Lead review call — Saka Logistics', type: 'Meeting', taskId: 't2' },
  ],
  historyStart: Date.UTC(2026, 7, 1),
  draftCount: 1,
  recommendations: [
    { client: 'Saka Logistics', title: 'Add 46 job-seeker negative keywords', channel: 'Google Ads', priority: 'high', impact: `Save ~${formatWlIdr(6_200_000)} / month` },
    { client: 'Warung Nusantara Group', title: 'Run outlet-radius Meta ads around 12 branches', channel: 'Meta Ads', priority: 'med', impact: 'Est. +18% store-visit conversions' },
    { client: 'Prima Dental Care', title: 'Publish treatment price pages (scaling, braces)', channel: 'SEO', priority: 'med', impact: 'Target 2,400 monthly searches' },
    { client: 'Kirana Interior', title: 'Compress hero images — LCP 5.8s', channel: 'SEO', priority: 'low', impact: 'Core Web Vitals pass on mobile' },
  ],
});

const SUITMEDIA = buildAgency({
  id: 'suitmedia',
  tzOffsetHours: 0,
  tz: 'WIB',
  loginEmail: 'performance@suitmedia.com',
  team: ['Raka', 'Nadia', 'Bima', 'Citra', 'Yoga'],
  deltas: { google: '+9%', seo: '+5%', ai: '+16%' },
  clients: SUITMEDIA_CLIENTS,
  tasks: [
    task('t1', 'Q3 business review deck', 'Bank Mitra Digital', 'Report', 'in_progress', 'high', 'Due in 2 days', 'Oct 9', 'Nadia', 'Board-level QBR. Cover account-opening funnel, CPA by product, and Q4 budget ask.', [['Funnel data by product', true], ['Q4 budget scenarios', false], ['Review with Raka', false], ['Send to CMO', false]]),
    task('t2', 'Model launch campaign build', 'Sentosa Motor', 'Creative', 'in_progress', 'high', 'Due in 6 days', 'Oct 13', 'Bima', 'New SUV launch on 20 Oct. YouTube + Meta video, plus test-drive lead forms.', [['Storyboard approved', true], ['Video cut-downs', false], ['Lead form QA', false]]),
    task('t3', 'Consent mode v2 rollout', 'Cahaya Insurance', 'Integration', 'blocked', 'high', 'Blocked', 'Oct 8', 'Yoga', 'Legal has not approved the cookie banner copy. Conversion modelling paused until then.', [['Draft banner copy', true], ['Legal approval', false], ['Deploy via GTM', false]]),
    task('t4', 'Hospital SEO + AI visibility audit', 'Medika Hospital Group', 'Audit', 'open', 'medium', 'Due in 4 days', 'Oct 11', 'Citra', 'Doctor profile pages are missing from AI answers. Check schema and E-E-A-T signals.', [['Crawl 3 hospital sites', true], ['AI answer sampling', false], ['Findings deck', false]]),
    task('t5', 'Weekly AI visibility scan', 'Nusa Telco Prepaid', 'Scan', 'open', 'low', 'Scheduled', 'Oct 10', 'Citra', 'Track share of voice vs two competitors for “paket data murah”.', [['Run scan', false], ['Update dashboard', false]]),
  ],
  calendar: [
    { date: 'Oct 9', item: 'QBR — Bank Mitra Digital', type: 'Meeting', taskId: 't1' },
    { date: 'Oct 10', item: 'AI visibility scan — Nusa Telco Prepaid', type: 'Scan', taskId: 't5' },
    { date: 'Oct 11', item: 'Audit findings — Medika Hospital Group', type: 'Audit', taskId: 't4' },
    { date: 'Oct 20', item: 'SUV launch go-live — Sentosa Motor', type: 'Launch', taskId: 't2' },
  ],
  historyStart: Date.UTC(2026, 8, 1),
  draftCount: 3,
  recommendations: [
    { client: 'Bank Mitra Digital', title: 'Split brand vs. product search budgets', channel: 'Google Ads', priority: 'high', impact: `Est. CPA ${formatWlIdr(167_000)} → ${formatWlIdr(141_000)}` },
    { client: 'Nusa Telco Prepaid', title: 'Shift 15% of Meta to Reels placements', channel: 'Meta Ads', priority: 'med', impact: 'Reels CPM is 31% lower this month' },
    { client: 'Medika Hospital Group', title: 'Add Physician schema to 420 doctor pages', channel: 'AI visibility', priority: 'high', impact: 'Close gap vs. top 2 hospital groups in AI answers' },
    { client: 'Sentosa Motor', title: 'Retarget configurator users with test-drive offer', channel: 'Meta Ads', priority: 'med', impact: 'Est. +60 test-drive leads/month' },
    { client: 'Cahaya Insurance', title: 'Ship consent mode v2 before Q4 push', channel: 'Google Ads', priority: 'high', impact: 'Recover ~18% of unmeasured conversions' },
  ],
});

const ART_DIGITAL = buildAgency({
  id: 'artdigital',
  tzOffsetHours: 0,
  tz: 'WIB',
  loginEmail: 'studio@artdigital.id',
  team: ['Sekar', 'Dimas', 'Laras'],
  deltas: { google: '+3%', seo: '+9%', ai: '+11%' },
  clients: ART_DIGITAL_CLIENTS,
  tasks: [
    task('t1', 'Festival early-bird push', 'Ritme Music Festival', 'Creative', 'in_progress', 'high', 'Due tomorrow', 'Oct 8', 'Laras', 'Early-bird closes 15 Oct. Lineup reveal reels + countdown stories.', [['Lineup reveal edit', true], ['Countdown stories', false], ['Launch', false]]),
    task('t2', 'Holiday shade launch report', 'Rona Cosmetics', 'Report', 'open', 'medium', 'Due in 3 days', 'Oct 10', 'Sekar', 'Recap the 3 new lip shades: creator content vs. paid performance.', [['Pull Meta + TikTok data', true], ['Creator breakdown', false], ['Send to brand team', false]]),
    task('t3', 'Booking engine tracking', 'Pulau Villas', 'Integration', 'blocked', 'high', 'Blocked', 'Oct 9', 'Dimas', 'Third-party booking engine strips UTM parameters. Waiting on vendor fix.', [['Raise vendor ticket', true], ['Cross-domain tracking', false], ['Verify revenue in GA4', false]]),
    task('t4', 'Organic grocery SEO audit', 'Sehat Organik', 'Audit', 'in_progress', 'medium', 'Due in 5 days', 'Oct 12', 'Dimas', '1,200 product pages with thin descriptions. Prioritise top 100 by revenue.', [['Export product list', true], ['Rank by revenue', true], ['Rewrite brief', false]]),
  ],
  calendar: [
    { date: 'Oct 8', item: 'Early-bird push — Ritme Music Festival', type: 'Launch', taskId: 't1' },
    { date: 'Oct 10', item: 'Shade launch recap — Rona Cosmetics', type: 'Report', taskId: 't2' },
    { date: 'Oct 12', item: 'SEO audit readout — Sehat Organik', type: 'Audit', taskId: 't4' },
  ],
  historyStart: Date.UTC(2026, 8, 1),
  draftCount: 1,
  recommendations: [
    { client: 'Ritme Music Festival', title: 'Move 20% budget to Reels before early-bird ends', channel: 'Meta Ads', priority: 'high', impact: 'Est. +1,100 ticket sales' },
    { client: 'Rona Cosmetics', title: 'Whitelist top 5 creators as Partnership Ads', channel: 'Meta Ads', priority: 'high', impact: 'Creator ads ran 2.1× ROAS vs brand' },
    { client: 'Pulau Villas', title: 'Fix cross-domain tracking on booking engine', channel: 'Google Ads', priority: 'high', impact: 'Revenue currently under-reported ~35%' },
    { client: 'Atelier Ivana', title: 'Add size-guide FAQ for AI shopping answers', channel: 'AI visibility', priority: 'low', impact: 'Appear in “where to buy kebaya modern” answers' },
  ],
});

const AGENCY_DATA: Record<string, AgencyDemoData> = {
  juicebox: JUICEBOX,
  'juicebox-au': JUICEBOX,
  skipjack: SKIPJACK,
  suitmedia: SUITMEDIA,
  artdigital: ART_DIGITAL,
};

export function agencyDemoData(themeId: string): AgencyDemoData {
  return AGENCY_DATA[themeId] ?? JUICEBOX;
}
