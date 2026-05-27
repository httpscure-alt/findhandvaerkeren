import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { AdveroDashboardApiPayload } from '../lib/adveroDashboardApi';
import {
  entitlementsFromSubscription,
  type WorkspaceEntitlements,
} from '../lib/workspaceEntitlements';

const EMPTY_ENTITLEMENTS: WorkspaceEntitlements = entitlementsFromSubscription(null, null);

/** Shared dashboard payload for layout gating (nav modules, support, etc.). */
export function useAdveroDashboard(enabled: boolean): {
  payload: AdveroDashboardApiPayload | null;
  entitlements: WorkspaceEntitlements;
  loading: boolean;
} {
  const { user } = useAuth();
  const [payload, setPayload] = useState<AdveroDashboardApiPayload | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    api
      .getAdveroDashboard(undefined, 'da')
      .then((data) => {
        if (!cancelled) setPayload(data);
      })
      .catch(() => {
        if (!cancelled) setPayload(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, user?.id]);

  const entitlements = payload?.entitlements ?? EMPTY_ENTITLEMENTS;

  return { payload, entitlements, loading };
}
