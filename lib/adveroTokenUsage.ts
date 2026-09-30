/** Advero AI token metering — USD 10.00 per 1M tokens, billed actual per client. */

export const TOKEN_RATE_USD_PER_MILLION = 10;

export type TokenClientId = 'juicebox' | 'skipjack' | 'suitmedia' | 'artdigital';
export type TokenPeriodId = '2026-08' | '2026-09';

export type TokenClient = {
  id: TokenClientId;
  brand: string;
  legalName: string;
  invoiceCode: string;
  website: string;
  city: string;
  goLive: string;
  status: 'live' | 'ramping';
};

export const TOKEN_CLIENTS: TokenClient[] = [
  {
    id: 'juicebox',
    brand: 'Juicebox',
    legalName: 'Juicebox',
    invoiceCode: 'INV-JB-TOK',
    website: 'portal.juicebox.co.id',
    city: 'Bali · Jakarta · Australia',
    goLive: '2026-08-01',
    status: 'live',
  },
  {
    id: 'skipjack',
    brand: 'Skipjack',
    legalName: 'PT Iklan Kreatif Bangsa',
    invoiceCode: 'INV-SJ-TOK',
    website: 'skipjack.id',
    city: 'Jakarta Pusat',
    goLive: '2026-08-01',
    status: 'live',
  },
  {
    id: 'suitmedia',
    brand: 'Suitmedia',
    legalName: 'PT Suitmedia Kreasi Indonesia',
    invoiceCode: 'INV-SM-TOK',
    website: 'suitmedia.com',
    city: 'Jakarta Selatan',
    goLive: '2026-08-18',
    status: 'ramping',
  },
  {
    id: 'artdigital',
    brand: 'Art Digital',
    legalName: 'PT. Seni Kreasi Digital',
    invoiceCode: 'INV-SKD-TOK',
    website: 'artdigital.co.id',
    city: 'BSD City, Tangerang',
    goLive: '2026-09-08',
    status: 'ramping',
  },
];

export const TOKEN_PERIODS: { id: TokenPeriodId; label: string; days: number; year: number; month: number }[] = [
  { id: '2026-08', label: 'August 2026', days: 31, year: 2026, month: 8 },
  { id: '2026-09', label: 'September 2026', days: 30, year: 2026, month: 9 },
];

export const DEFAULT_TOKEN_PERIOD: TokenPeriodId = '2026-09';

/** Chart series — same family, not a rainbow. */
export const TOKEN_CLIENT_COLOR: Record<TokenClientId, string> = {
  juicebox: '#7dd3fc',
  skipjack: '#38bdf8',
  suitmedia: '#94a3b8',
  artdigital: '#cbd5e1',
};

type DailySpec = {
  weekday: number;
  weekend: number;
  /** Multiply day n (1-based) by this ramp, then + jitter. */
  rampStart?: number;
  rampEnd?: number;
  liveFromDay?: number;
};

const SPECS: Record<TokenPeriodId, Record<TokenClientId, DailySpec>> = {
  '2026-08': {
    juicebox: { weekday: 1_520_000, weekend: 780_000 },
    skipjack: { weekday: 680_000, weekend: 310_000 },
    suitmedia: { weekday: 420_000, weekend: 180_000, liveFromDay: 18, rampStart: 0.55, rampEnd: 1 },
    artdigital: { weekday: 0, weekend: 0, liveFromDay: 99 },
  },
  '2026-09': {
    juicebox: { weekday: 1_820_000, weekend: 920_000 },
    skipjack: { weekday: 810_000, weekend: 360_000 },
    suitmedia: { weekday: 610_000, weekend: 250_000, rampStart: 0.72, rampEnd: 1.08 },
    artdigital: { weekday: 480_000, weekend: 190_000, liveFromDay: 8, rampStart: 0.45, rampEnd: 1.12 },
  },
};

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashId(id: string, period: string) {
  let h = 2166136261;
  const s = `${id}:${period}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function dailyTokens(clientId: TokenClientId, period: TokenPeriodId): number[] {
  const meta = TOKEN_PERIODS.find((p) => p.id === period)!;
  const spec = SPECS[period][clientId];
  const rand = mulberry32(hashId(clientId, period));
  const out: number[] = [];
  for (let day = 1; day <= meta.days; day++) {
    if (spec.liveFromDay && day < spec.liveFromDay) {
      out.push(0);
      continue;
    }
    const weekday = new Date(Date.UTC(meta.year, meta.month - 1, day)).getUTCDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const base = isWeekend ? spec.weekend : spec.weekday;
    const liveDay = spec.liveFromDay ?? 1;
    const span = Math.max(1, meta.days - liveDay);
    const t = (day - liveDay) / span;
    const rampStart = spec.rampStart ?? 1;
    const rampEnd = spec.rampEnd ?? 1;
    const ramp = rampStart + (rampEnd - rampStart) * t;
    const jitter = 0.88 + rand() * 0.24;
    out.push(Math.round(base * ramp * jitter));
  }
  return out;
}

const DAILY_CACHE: Record<TokenPeriodId, Record<TokenClientId, number[]>> = {
  '2026-08': {
    juicebox: dailyTokens('juicebox', '2026-08'),
    skipjack: dailyTokens('skipjack', '2026-08'),
    suitmedia: dailyTokens('suitmedia', '2026-08'),
    artdigital: dailyTokens('artdigital', '2026-08'),
  },
  '2026-09': {
    juicebox: dailyTokens('juicebox', '2026-09'),
    skipjack: dailyTokens('skipjack', '2026-09'),
    suitmedia: dailyTokens('suitmedia', '2026-09'),
    artdigital: dailyTokens('artdigital', '2026-09'),
  },
};

export type FeatureShare = { key: string; label: string; share: number };

const FEATURE_MIX: Record<TokenClientId, FeatureShare[]> = {
  juicebox: [
    { key: 'reports', label: 'Client reports', share: 0.38 },
    { key: 'ai', label: 'AI visibility', share: 0.27 },
    { key: 'copilot', label: 'Workspace copilot', share: 0.21 },
    { key: 'embed', label: 'Indexing / embeddings', share: 0.14 },
  ],
  skipjack: [
    { key: 'reports', label: 'Client reports', share: 0.32 },
    { key: 'ai', label: 'AI visibility', share: 0.22 },
    { key: 'copilot', label: 'Workspace copilot', share: 0.28 },
    { key: 'embed', label: 'Indexing / embeddings', share: 0.18 },
  ],
  suitmedia: [
    { key: 'reports', label: 'Client reports', share: 0.41 },
    { key: 'ai', label: 'AI visibility', share: 0.31 },
    { key: 'copilot', label: 'Workspace copilot', share: 0.16 },
    { key: 'embed', label: 'Indexing / embeddings', share: 0.12 },
  ],
  artdigital: [
    { key: 'reports', label: 'Client reports', share: 0.29 },
    { key: 'ai', label: 'AI visibility', share: 0.24 },
    { key: 'copilot', label: 'Workspace copilot', share: 0.19 },
    { key: 'embed', label: 'Indexing / embeddings', share: 0.28 },
  ],
};

export const MODEL_MIX: { key: string; label: string; share: number }[] = [
  { key: 'gpt-4.1', label: 'gpt-4.1', share: 0.46 },
  { key: 'gpt-4.1-mini', label: 'gpt-4.1-mini', share: 0.33 },
  { key: 'text-embedding-3-small', label: 'text-embedding-3-small', share: 0.21 },
];

export function tokensToUsd(tokens: number): number {
  return (tokens / 1_000_000) * TOKEN_RATE_USD_PER_MILLION;
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    const m = tokens / 1_000_000;
    return `${m >= 10 ? m.toFixed(1) : m.toFixed(2)}M`;
  }
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}k`;
  return String(tokens);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function periodMeta(period: TokenPeriodId) {
  return TOKEN_PERIODS.find((p) => p.id === period)!;
}

export function clientById(id: TokenClientId) {
  return TOKEN_CLIENTS.find((c) => c.id === id)!;
}

export function dailySeries(clientId: TokenClientId, period: TokenPeriodId): number[] {
  return DAILY_CACHE[period][clientId];
}

export function periodTotal(clientId: TokenClientId, period: TokenPeriodId): number {
  return dailySeries(clientId, period).reduce((sum, n) => sum + n, 0);
}

export function stackedDaily(period: TokenPeriodId, clientIds: TokenClientId[] = TOKEN_CLIENTS.map((c) => c.id)) {
  const days = periodMeta(period).days;
  return Array.from({ length: days }, (_, i) => {
    const row: Record<string, number> & { day: number; total: number } = { day: i + 1, total: 0 };
    for (const id of clientIds) {
      const v = dailySeries(id, period)[i] ?? 0;
      row[id] = v;
      row.total += v;
    }
    return row;
  });
}

export function featureBreakdown(clientId: TokenClientId, tokens: number) {
  return FEATURE_MIX[clientId].map((f) => ({
    ...f,
    tokens: Math.round(tokens * f.share),
    usd: tokensToUsd(tokens * f.share),
  }));
}

export function modelBreakdown(tokens: number) {
  return MODEL_MIX.map((m) => ({
    ...m,
    tokens: Math.round(tokens * m.share),
    usd: tokensToUsd(tokens * m.share),
  }));
}

export function promptCompletionSplit(tokens: number) {
  const prompt = Math.round(tokens * 0.68);
  const completion = tokens - prompt;
  return { prompt, completion };
}

export function previousPeriod(period: TokenPeriodId): TokenPeriodId | null {
  return period === '2026-09' ? '2026-08' : null;
}

export function deltaPct(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}
