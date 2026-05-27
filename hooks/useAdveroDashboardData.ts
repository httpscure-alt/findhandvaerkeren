import { useEffect, useState } from 'react';
import { useAdveroDashboardPreview } from '../contexts/AdveroDashboardPreviewContext';
import { api } from '../services/api';
import type { AdveroDashboardApiPayload } from '../lib/adveroDashboardApi';
import { getLastDashboardAudit } from '../lib/adveroDashboardIntelligence';

/** Dashboard payload from API or local preview fixtures. */
export function useAdveroDashboardData(lang: 'da' | 'en'): {
  payload: AdveroDashboardApiPayload | null;
  loading: boolean;
} {
  const preview = useAdveroDashboardPreview();
  const [payload, setPayload] = useState<AdveroDashboardApiPayload | null>(null);
  const [loading, setLoading] = useState(!preview);

  useEffect(() => {
    if (preview) {
      setPayload(preview.payload);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const last = getLastDashboardAudit();
    api
      .getAdveroDashboard(last?.id, lang)
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
  }, [preview, lang]);

  return {
    payload: preview?.payload ?? payload,
    loading,
  };
}
