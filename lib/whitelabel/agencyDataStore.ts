import { useEffect, useState } from 'react';
import type { AgencyDemoData } from './agencyDemoData';

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
