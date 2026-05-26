import type { AuditScores, GrowthGoal, IndustryCategory } from '../../lib/recommendPlan';

/** Payload we send to TopRank (adjust field names to match real API). */
export interface TopRankAuditRequest {
  companyName: string;
  websiteUrl?: string;
  serviceArea?: string;
  industry?: IndustryCategory;
  growthGoal?: GrowthGoal;
  externalId?: string;
}

/**
 * Expected TopRank audit response (normalize in adapter if your API differs).
 * Map TopRank channel names → search | local | ai | web in toprankAuditAdapter.ts
 */
export interface TopRankAuditResponse {
  status?: 'complete' | 'pending' | 'failed';
  overallScore?: number;
  delta?: string;
  scores?: Partial<Record<'search' | 'local' | 'ai' | 'web' | 'organic' | 'maps' | 'llm', number>>;
  topInsight?: string;
  insights?: string[];
}

export interface TopRankNormalizedResult {
  scores: AuditScores;
  overallScore?: number;
  delta?: string;
  topRecommendation: string;
  raw?: TopRankAuditResponse;
}
