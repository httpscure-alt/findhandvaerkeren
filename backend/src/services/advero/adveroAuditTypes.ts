import type { AuditInterpretation } from '../../lib/auditInterpretation';
import type { GrowthGoal, IndustryCategory, PlanRecommendation } from '../../lib/recommendPlan';

export type AuditJobStatus = 'pending' | 'processing' | 'complete' | 'failed';

export interface CreateAuditPayload {
  companyName: string;
  websiteUrl?: string;
  serviceArea?: string;
  industry?: IndustryCategory;
  growthGoal?: GrowthGoal;
  contactEmail?: string;
}

export interface PublicVisibilityAudit {
  id: string;
  status: AuditJobStatus;
  companyName: string;
  websiteUrl?: string;
  serviceArea?: string;
  industry: IndustryCategory;
  growthGoal: GrowthGoal;
  contactEmail?: string;
  engine?: 'toprank' | 'mock';
  scores?: { search: number; local: number; ai: number; web: number };
  overallScore?: number;
  delta?: string;
  topRecommendation?: string;
  recommendation?: PlanRecommendation;
  interpretation?: AuditInterpretation;
  errorMessage?: string;
  progress?: number;
  createdAt: string;
}
