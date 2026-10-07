/** Whitelabel themes, screens, and helpers. Tenant configs: lib/whitelabel/tenantRegistry.ts */

import { JUICEBOX_TENANT, tenantBySlug } from './whitelabel/tenantRegistry';
import type { WhitelabelScreenId, WhitelabelTheme } from './whitelabel/types';

export type { WhitelabelScreenId, WhitelabelTheme } from './whitelabel/types';

export const JUICEBOX_THEME = JUICEBOX_TENANT.theme;

export const WHITELABEL_THEMES = [JUICEBOX_THEME];

export const WHITELABEL_SCREENS: { id: WhitelabelScreenId; label: string }[] = [
  { id: 'agency-login', label: 'Agency login' },
  { id: 'agency-dashboard', label: 'Agency dashboard' },
  { id: 'agency-ops', label: 'Agency ops' },
  { id: 'client-login', label: 'Client login' },
  { id: 'client-dashboard', label: 'Client dashboard' },
  { id: 'audit-history', label: 'Audit history' },
  { id: 'reports', label: 'Reports' },
  { id: 'recommendations', label: 'Recommendations' },
];

export const MOCK_CLIENT = {
  name: 'The Summit Club',
  industry: 'Consumer goods',
  website: 'thesummitclub.com',
};

export function whitelabelThemeById(id: string): WhitelabelTheme {
  return tenantBySlug(id)?.theme ?? JUICEBOX_THEME;
}

export function whitelabelCssVars(theme: WhitelabelTheme): Record<string, string> {
  return {
    '--wl-hero-gradient': theme.heroGradient,
    '--wl-page-bg': theme.pageBg,
    '--wl-card-ice': theme.cardIce,
    '--wl-accent': theme.accent,
    '--wl-accent-soft': theme.accentSoft,
    '--wl-btn-dark': theme.btnDark,
    '--wl-text': theme.textPrimary,
    '--wl-text-muted': theme.textMuted,
    '--wl-surface': theme.surface,
    '--wl-border': theme.border,
    '--wl-metric-bg': theme.metricBg,
    '--wl-chart-muted': theme.chartMuted,
    '--wl-sidebar-bg': theme.sidebarBg,
    '--wl-sidebar-text': theme.sidebarText,
  };
}

export function formatWlIdr(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')} M`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1).replace('.0', '')} jt`;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}
