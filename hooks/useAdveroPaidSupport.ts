import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { AdveroDashboardApiPayload } from '../lib/adveroDashboardApi';
import {
  getAdveroCrispWebsiteId,
  hasAdveroPaidSupport,
  hideAdveroSupportWidget,
  loadAdveroCrisp,
  showAdveroSupportWidget,
} from '../lib/adveroCrisp';

/** Loads Crisp for active subscribers; hides duplicate FAB on dashboard. */
export function useAdveroPaidSupport(enabled: boolean): {
  hasPaidSupport: boolean;
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
  }, [enabled]);

  const hasPaidSupport = hasAdveroPaidSupport(payload?.subscription);

  useEffect(() => {
    if (!enabled) return;

    hideAdveroSupportWidget();

    if (!hasPaidSupport || !getAdveroCrispWebsiteId()) {
      return;
    }

    loadAdveroCrisp({
      email: user?.email,
      name: user?.name,
      companyName: payload?.workspace?.companyName ?? user?.ownedCompany?.name,
    });
  }, [enabled, hasPaidSupport, user?.email, user?.name, user?.ownedCompany?.name, payload?.workspace?.companyName]);

  useEffect(() => {
    return () => {
      if (enabled) showAdveroSupportWidget();
    };
  }, [enabled]);

  return { hasPaidSupport, loading };
}
