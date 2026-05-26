import { Request, Response } from 'express';
import { recommendPlan, type GrowthGoal, type IndustryCategory } from '../lib/recommendPlan';

function num(q: unknown, fallback: number): number {
  const n = Number(q);
  return Number.isFinite(n) ? n : fallback;
}

export const getRecommendPlan = async (req: Request, res: Response): Promise<void> => {
  const scores = {
    search: num(req.query.search, 70),
    local: num(req.query.local, 70),
    ai: num(req.query.ai, 70),
    web: num(req.query.web, 70),
  };
  const goal = (req.query.goal as GrowthGoal) || 'both';
  const industry = (req.query.industry as IndustryCategory) || 'unknown';

  const rec = recommendPlan({ scores, goal, industry });
  res.json({ recommendation: rec });
};
