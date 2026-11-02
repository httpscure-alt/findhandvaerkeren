import { useEffect, useState } from 'react';
import type { AgencyDemoData, DemoClient } from './agencyDemoData';

export type {
  AgencyDemoData,
  DemoClient,
  DemoReport,
  DemoRun,
  DemoRunKind,
  DemoTask,
  DemoAudit,
  DemoRecommendation,
} from './agencyDemoData';

const DATA_KEY_BY_THEME: Record<string, string> = {
  juicebox: 'juicebox',
  'juicebox-au': 'juicebox',
  skipjack: 'skipjack',
  suitmedia: 'suitmedia',
  artdigital: 'artdigital',
};

const store = new Map<string, AgencyDemoData>();

export function agencyDataKey(themeId: string): string | undefined {
  return DATA_KEY_BY_THEME[themeId];
}

/** Data for a theme. Only call once `useAgencyData` has reported `ready`. */
export function agencyDemoData(themeId: string): AgencyDemoData {
  const key = agencyDataKey(themeId);
  const data = key ? store.get(key) : undefined;
  if (!data) throw new Error(`Agency data for "${themeId}" is not loaded`);
  return data;
}

export type AgencyDataState = 'loading' | 'ready' | 'unauthorized' | 'unavailable' | 'error';

export function useAgencyData(themeId: string): { state: AgencyDataState; retry: () => void } {
  const key = agencyDataKey(themeId);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<AgencyDataState>(() => {
    if (!key) return 'unavailable';
    return store.has(key) ? 'ready' : 'loading';
  });

  useEffect(() => {
    if (!key) {
      setState('unavailable');
      return;
    }
    if (store.has(key)) {
      setState('ready');
      return;
    }
    let cancelled = false;
    setState('loading');
    fetch(`/wl-data/${key}.json`, { credentials: 'same-origin', cache: 'no-store' })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 401) return setState('unauthorized');
        if (!res.ok) return setState('error');
        store.set(key, (await res.json()) as AgencyDemoData);
        if (!cancelled) setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [key, attempt]);

  return { state, retry: () => setAttempt((n) => n + 1) };
}

export function clearAgencyData(): void {
  store.clear();
}

/** Session-only add — demo portals keep portfolio in memory after login. */
export function addAgencyClient(themeId: string, client: DemoClient): DemoClient {
  const key = agencyDataKey(themeId);
  const data = key ? store.get(key) : undefined;
  if (!key || !data) throw new Error(`Agency data for "${themeId}" is not loaded`);
  const name = client.name.trim();
  if (!name) throw new Error('Client name is required');
  if (data.clients.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
    throw new Error('A client with that name already exists');
  }
  const next: DemoClient = { ...client, name };
  store.set(key, {
    ...data,
    clients: [next, ...data.clients],
    totals: {
      ...data.totals,
      activeClients:
        next.status === 'Active' ? data.totals.activeClients + 1 : data.totals.activeClients,
    },
  });
  return next;
}

export function createOnboardingClient(input: {
  name: string;
  industry?: string;
  website?: string;
  bundle?: string;
}): DemoClient {
  const website = (input.website || '').replace(/^https?:\/\//i, '').replace(/\/$/, '');
  return {
    name: input.name.trim(),
    industry: (input.industry || 'General').trim() || 'General',
    website: website || 'pending.setup',
    status: 'Onboarding',
    bundle: (input.bundle || 'Ads only').trim() || 'Ads only',
    google: { spend: 0, clicks: 0, conversions: 0, cpa: 0 },
    meta: { spend: 0, reach: 0, ctr: 0, conversions: 0 },
    seo: { visibility: 0, top10: 0, sessions: 0, pages: 0 },
    ai: { score: 0, mentions: 0, shareOfVoice: 0, cited: 0 },
    spend: 0,
    leads: 0,
    roas: 0,
    trend: Array.from({ length: 12 }, () => 18),
  };
}
