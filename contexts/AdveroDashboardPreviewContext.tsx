import React, { createContext, useContext, useMemo } from 'react';
import type { AdveroDashboardApiPayload } from '../lib/adveroDashboardApi';
import {
  buildDashboardPreviewPayload,
  type DashboardPreviewModeId,
} from '../lib/adveroDashboardPreviewFixtures';

type AdveroDashboardPreviewContextValue = {
  mode: DashboardPreviewModeId;
  payload: AdveroDashboardApiPayload;
  dashboardBasePath: string;
};

const AdveroDashboardPreviewContext = createContext<AdveroDashboardPreviewContextValue | null>(null);

export function AdveroDashboardPreviewProvider({
  mode,
  lang,
  children,
}: {
  mode: DashboardPreviewModeId;
  lang: 'da' | 'en';
  children: React.ReactNode;
}) {
  const value = useMemo(() => {
    const dashboardBasePath = `/advero/dev/dashboard-preview/${mode}`;
    return {
      mode,
      payload: buildDashboardPreviewPayload(mode, lang),
      dashboardBasePath,
    };
  }, [mode, lang]);

  return (
    <AdveroDashboardPreviewContext.Provider value={value}>{children}</AdveroDashboardPreviewContext.Provider>
  );
}

export function useAdveroDashboardPreview(): AdveroDashboardPreviewContextValue | null {
  return useContext(AdveroDashboardPreviewContext);
}
