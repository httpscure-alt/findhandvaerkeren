import type { VisibilityAuditResult } from './mockAnalyzeVisibility';
import type { GoogleAdsSnapshot, SearchConsoleSnapshot, VisibilityIntelligence } from './visibilityIntelligence';
import type { WorkspaceEntitlements } from './workspaceEntitlements';

export interface AdveroDashboardApiPayload {
  workspace: {
    id: string;
    companyName: string;
    setupState: Record<string, unknown>;
    initializedAt: string | null;
  } | null;
  latestAudit: VisibilityAuditResult | null;
  /** Canonical visibility OS object — prefer this over client-side rebuilds. */
  intelligence: VisibilityIntelligence;
  searchConsole: SearchConsoleSnapshot;
  googleAds: GoogleAdsSnapshot;
  activity: { type: string; titleDa: string; titleEn: string; createdAt: string }[];
  subscription: { tierId: string; serviceLine: string; status: string } | null;
  entitlements: WorkspaceEntitlements;
  manualFulfillment: {
    status: string;
    serviceLine: string;
    titleDa: string;
    titleEn: string;
    bodyDa: string;
    bodyEn: string;
  } | null;
}

export interface AdveroIntegrationsPayload {
  searchConsole: SearchConsoleSnapshot;
  googleAds: GoogleAdsSnapshot;
  authUrls: { gsc: string | null; ads: string | null };
  configured: { googleOAuth: boolean; googleAdsApi: boolean };
}
