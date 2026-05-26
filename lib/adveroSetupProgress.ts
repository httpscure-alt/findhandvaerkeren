export type SetupItemId =
  | 'audit'
  | 'dashboard'
  | 'gbp'
  | 'ads'
  | 'gsc'
  | 'analytics';

const KEYS: Record<SetupItemId, string> = {
  audit: 'advero.setup.auditComplete',
  dashboard: 'advero.setup.dashboardInit',
  gbp: 'advero.setup.gbp',
  ads: 'advero.setup.ads',
  gsc: 'advero.setup.gsc',
  analytics: 'advero.setup.analytics',
};

export function markSetupComplete(id: SetupItemId): void {
  try {
    localStorage.setItem(KEYS[id], '1');
  } catch {
    /* ignore */
  }
}

export function isSetupComplete(id: SetupItemId): boolean {
  try {
    return localStorage.getItem(KEYS[id]) === '1';
  } catch {
    return false;
  }
}

export interface SetupChecklistItem {
  id: SetupItemId;
  labelDa: string;
  labelEn: string;
  done: boolean;
  optional?: boolean;
  actionHref?: string;
  actionLabelDa?: string;
  actionLabelEn?: string;
}

export function getSetupChecklist(): SetupChecklistItem[] {
  return [
    {
      id: 'audit',
      labelDa: 'Synlighedsaudit gennemført',
      labelEn: 'Visibility audit completed',
      done: isSetupComplete('audit'),
      actionHref: '/advero/audit',
      actionLabelDa: 'Kør audit',
      actionLabelEn: 'Run audit',
    },
    {
      id: 'dashboard',
      labelDa: 'Dashboard initialiseret',
      labelEn: 'Dashboard initialized',
      done: isSetupComplete('dashboard'),
    },
    {
      id: 'gbp',
      labelDa: 'Google Business Profile forbundet',
      labelEn: 'Google Business Profile connected',
      done: isSetupComplete('gbp'),
      optional: true,
      actionHref: '/advero/dashboard/settings',
      actionLabelDa: 'Forbind',
      actionLabelEn: 'Connect',
    },
    {
      id: 'ads',
      labelDa: 'Google Ads forbundet',
      labelEn: 'Google Ads connected',
      done: isSetupComplete('ads'),
      optional: true,
      actionHref: '/advero/dashboard/settings',
      actionLabelDa: 'Forbind',
      actionLabelEn: 'Connect',
    },
    {
      id: 'gsc',
      labelDa: 'Search Console forbundet',
      labelEn: 'Search Console connected',
      done: isSetupComplete('gsc'),
      optional: true,
      actionHref: '/advero/dashboard/settings',
      actionLabelDa: 'Forbind',
      actionLabelEn: 'Connect',
    },
    {
      id: 'analytics',
      labelDa: 'Analytics forbundet',
      labelEn: 'Analytics connected',
      done: isSetupComplete('analytics'),
      optional: true,
      actionHref: '/advero/dashboard/settings',
      actionLabelDa: 'Forbind',
      actionLabelEn: 'Connect',
    },
  ];
}

export function setupProgressCounts(items: SetupChecklistItem[]): {
  done: number;
  total: number;
  requiredDone: number;
  requiredTotal: number;
} {
  const required = items.filter((i) => !i.optional);
  return {
    done: items.filter((i) => i.done).length,
    total: items.length,
    requiredDone: required.filter((i) => i.done).length,
    requiredTotal: required.length,
  };
}
