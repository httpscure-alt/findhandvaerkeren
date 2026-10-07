export type WhitelabelScreenId =
  | 'agency-login'
  | 'agency-my-work'
  | 'agency-dashboard'
  | 'agency-ops'
  | 'agency-settings'
  | 'agency-integrations'
  | 'agency-integration-setup'
  | 'client-login'
  | 'client-portal'
  | 'client-dashboard'
  | 'client-google-ads'
  | 'client-seo'
  | 'client-meta'
  | 'client-ga4'
  | 'client-ai-visibility'
  | 'client-timeline'
  | 'client-team'
  | 'client-settings'
  | 'audit-history'
  | 'reports'
  | 'recommendations';

export type WhitelabelTheme = {
  id: string;
  name: string;
  tagline: string;
  website: string;
  market: 'dk' | 'id';
  initials: string;
  logoUrl?: string;
  logoUrlDark?: string;
  legalEntity: string;
  supportEmail: string;
  supportPhone: string;
  showPoweredBy: boolean;
  currency: 'DKK' | 'IDR';
  lang: 'da' | 'en' | 'id';
  heroGradient: string;
  pageBg: string;
  cardIce: string;
  accent: string;
  accentSoft: string;
  btnDark: string;
  textPrimary: string;
  textMuted: string;
  surface: string;
  border: string;
  metricBg: string;
  chartMuted: string;
  sidebarBg: string;
  sidebarText: string;
};

export type WhitelabelTenantMode = 'production' | 'demo';

export type WhitelabelTenant = {
  slug: string;
  mode: WhitelabelTenantMode;
  portalHost?: string;
  theme: WhitelabelTheme;
};
