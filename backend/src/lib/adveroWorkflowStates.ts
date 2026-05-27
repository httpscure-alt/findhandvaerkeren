/** Keep in sync with `/lib/adveroWorkflowStates.ts`. */

export const SEO_WORKFLOW_STATES = [
  'pending_audit',
  'scanning',
  'generating_recommendations',
  'awaiting_review',
  'completed',
] as const;

export type SeoWorkflowState = (typeof SEO_WORKFLOW_STATES)[number];

export const ADS_WORKFLOW_STATES = [
  'onboarding',
  'awaiting_campaign_setup',
  'active',
  'optimizing',
  'reporting',
] as const;

export type AdsWorkflowState = (typeof ADS_WORKFLOW_STATES)[number];

export const AI_VISIBILITY_WORKFLOW_STATES = [
  'semantic_scan_pending',
  'ai_readiness_analyzing',
  'recommendations_generated',
  'awaiting_review',
] as const;

export type AiVisibilityWorkflowState = (typeof AI_VISIBILITY_WORKFLOW_STATES)[number];

export type OpsQueueId = 'seo' | 'ads' | 'ai_visibility';

export const OPS_QUEUES: { id: OpsQueueId; entitlement: 'seo' | 'ads' | 'aiVisibility' }[] = [
  { id: 'seo', entitlement: 'seo' },
  { id: 'ads', entitlement: 'ads' },
  { id: 'ai_visibility', entitlement: 'aiVisibility' },
];
