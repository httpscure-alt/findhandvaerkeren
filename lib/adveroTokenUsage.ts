export type TokenClientId = 'juicebox' | 'skipjack' | 'suitmedia' | 'artdigital';

export type TokenClient = {
  id: TokenClientId;
  brand: string;
  legalName: string;
  remainingUsd: number;
};

export const TOKEN_CLIENTS: TokenClient[] = [
  {
    id: 'juicebox',
    brand: 'Juicebox',
    legalName: 'Juicebox',
    remainingUsd: 234,
  },
  {
    id: 'skipjack',
    brand: 'Skipjack',
    legalName: 'PT Iklan Kreatif Bangsa',
    remainingUsd: 40,
  },
  {
    id: 'suitmedia',
    brand: 'Suitmedia',
    legalName: 'PT Suitmedia Kreasi Indonesia',
    remainingUsd: 330,
  },
  {
    id: 'artdigital',
    brand: 'Art Digital',
    legalName: 'PT. Seni Kreasi Digital',
    remainingUsd: 60,
  },
];

export const TOKEN_CLIENT_COLOR: Record<TokenClientId, string> = {
  juicebox: '#7dd3fc',
  skipjack: '#38bdf8',
  suitmedia: '#94a3b8',
  artdigital: '#cbd5e1',
};

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
