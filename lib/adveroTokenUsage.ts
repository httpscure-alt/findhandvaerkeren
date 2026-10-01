export type TokenClientId = 'juicebox' | 'skipjack' | 'suitmedia' | 'artdigital';

export type TokenClient = {
  id: TokenClientId;
  brand: string;
  legalName: string;
  remainingUsd: number;
};

export type TokenLedgerKind = 'topup' | 'usage';

export type TokenLedgerEntry = {
  date: string;
  clientId: TokenClientId;
  kind: TokenLedgerKind;
  usd: number;
  note: string;
};

export const TOKEN_PACK_USD = 750;
export const TOKEN_PACK_TOKENS = 333_000_000;
export const TOKENS_PER_USD = TOKEN_PACK_TOKENS / TOKEN_PACK_USD;

export const TOKEN_CLIENTS: TokenClient[] = [
  {
    id: 'juicebox',
    brand: 'Juicebox',
    legalName: 'Juicebox',
    remainingUsd: 650,
  },
  {
    id: 'skipjack',
    brand: 'Skipjack',
    legalName: 'PT Iklan Kreatif Bangsa',
    remainingUsd: 624,
  },
  {
    id: 'suitmedia',
    brand: 'Suitmedia',
    legalName: 'PT Suitmedia Kreasi Indonesia',
    remainingUsd: 41,
  },
  {
    id: 'artdigital',
    brand: 'Art Digital',
    legalName: 'PT. Seni Kreasi Digital',
    remainingUsd: 624,
  },
];

export const TOKEN_CLIENT_COLOR: Record<TokenClientId, string> = {
  juicebox: '#7dd3fc',
  skipjack: '#38bdf8',
  suitmedia: '#94a3b8',
  artdigital: '#cbd5e1',
};

export const TOKEN_LEDGER: TokenLedgerEntry[] = [
  {
    date: '30 Sep 2026',
    clientId: 'juicebox',
    kind: 'topup',
    usd: 750,
    note: 'Token pack',
  },
  {
    date: '30 Sep 2026',
    clientId: 'juicebox',
    kind: 'usage',
    usd: 14,
    note: 'Usage',
  },
  {
    date: '30 Sep 2026',
    clientId: 'suitmedia',
    kind: 'usage',
    usd: 20,
    note: 'Usage',
  },
  {
    date: '30 Sep 2026',
    clientId: 'artdigital',
    kind: 'usage',
    usd: 20,
    note: 'Usage',
  },
  {
    date: '30 Sep 2026',
    clientId: 'suitmedia',
    kind: 'usage',
    usd: 5,
    note: 'Usage',
  },
  {
    date: '30 Sep 2026',
    clientId: 'skipjack',
    kind: 'usage',
    usd: 20,
    note: 'Synced with Art Digital',
  },
  {
    date: '1 Oct 2026',
    clientId: 'juicebox',
    kind: 'usage',
    usd: 150,
    note: 'Usage',
  },
  {
    date: '1 Oct 2026',
    clientId: 'skipjack',
    kind: 'usage',
    usd: 80,
    note: 'Usage',
  },
  {
    date: '1 Oct 2026',
    clientId: 'artdigital',
    kind: 'usage',
    usd: 80,
    note: 'Usage',
  },
  {
    date: '1 Oct 2026',
    clientId: 'suitmedia',
    kind: 'usage',
    usd: 164,
    note: 'Usage',
  },
];

export function usdToTokens(usd: number): number {
  return usd * TOKENS_PER_USD;
}

export function usedUsdFor(clientId: TokenClientId): number {
  return TOKEN_LEDGER
    .filter((row) => row.clientId === clientId && row.kind === 'usage')
    .reduce((sum, row) => sum + row.usd, 0);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTokens(amount: number): string {
  const millions = amount / 1_000_000;
  const rounded = Math.round(millions * 10) / 10;
  const label = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${label}M`;
}
