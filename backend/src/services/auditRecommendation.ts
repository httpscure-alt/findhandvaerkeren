import type { AuditReportEmailData } from '../emails/adveroEmails';
import {
  recommendPlan,
  type AuditScores,
  type GrowthGoal,
  type IndustryCategory,
  type PlanRecommendation,
} from '../lib/recommendPlan';

const CHANNEL_ALIASES: Record<string, keyof AuditScores> = {
  søg: 'search',
  sog: 'search',
  search: 'search',
  lokal: 'local',
  local: 'local',
  ai: 'ai',
  web: 'web',
};

export function scoresFromChannelRows(channels: { k: string; v: number | string }[]): AuditScores {
  const scores: AuditScores = { search: 70, local: 70, ai: 70, web: 70 };
  for (const ch of channels) {
    const raw = ch.k.trim().toLowerCase();
    const key = CHANNEL_ALIASES[raw];
    if (key) scores[key] = Number(ch.v) || 0;
  }
  return scores;
}

export function enrichPreviewEmailWithRecommendation(
  data: AuditReportEmailData,
  opts?: { goal?: GrowthGoal; industry?: IndustryCategory }
): AuditReportEmailData & { planRecommendation: PlanRecommendation } {
  const scores = scoresFromChannelRows(data.channels);
  const rec = recommendPlan({ scores, goal: opts?.goal, industry: opts?.industry });
  const site = (process.env.ADVERO_SITE_URL || process.env.FRONTEND_URL || 'https://advero.dk').replace(/\/$/, '');
  const planCtaUrl = `${site}${rec.ctaPath}`;

  return {
    ...data,
    planHeadline: rec.headlineDa,
    planReason: rec.reasonDa,
    planCtaUrl,
    planRecommendation: rec,
  };
}
