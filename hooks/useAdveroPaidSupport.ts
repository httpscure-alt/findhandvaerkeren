import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getAdveroCrispWebsiteId,
  hasAdveroPaidSupport,
  hideAdveroSupportWidget,
  loadAdveroCrisp,
  showAdveroSupportWidget,
} from '../lib/adveroCrisp';
import { useAdveroDashboard } from './useAdveroDashboard';

/** Loads Crisp for active subscribers; hides duplicate FAB on dashboard. */
export function useAdveroPaidSupport(enabled: boolean): {
  hasPaidSupport: boolean;
  loading: boolean;
  payload: ReturnType<typeof useAdveroDashboard>['payload'];
  entitlements: ReturnType<typeof useAdveroDashboard>['entitlements'];
} {
  const { user } = useAuth();
  const { payload, entitlements, loading } = useAdveroDashboard(enabled);

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

  return { hasPaidSupport, loading, payload, entitlements };
}
