import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import {
  claimAuditForUser,
  enqueueVisibilityAudit,
  getVisibilityAuditById,
} from '../services/advero/adveroAuditService';
import type { GrowthGoal, IndustryCategory } from '../lib/recommendPlan';
import { logger } from '../config/logger';

const GOALS: GrowthGoal[] = ['leads_now', 'long_term', 'both'];
const INDUSTRIES: IndustryCategory[] = [
  'local_services',
  'professional_services',
  'retail_ecommerce',
  'hospitality',
  'health_wellness',
  'other',
  'unknown',
];

export const postCreateAudit = async (req: AuthRequest, res: Response): Promise<void> => {
  const companyName = String(req.body?.companyName || '').trim();
  if (!companyName || companyName.length < 2) {
    throw new AppError('companyName is required', 400);
  }

  const growthGoal = GOALS.includes(req.body?.growthGoal) ? req.body.growthGoal : 'both';
  const industry = INDUSTRIES.includes(req.body?.industry) ? req.body.industry : 'unknown';

  const audit = await enqueueVisibilityAudit({
    companyName,
    websiteUrl: req.body?.websiteUrl,
    serviceArea: req.body?.serviceArea,
    industry,
    growthGoal,
    contactEmail: req.body?.contactEmail,
  });

  res.status(201).json({ audit });
};

export const getAuditById = async (req: AuthRequest, res: Response): Promise<void> => {
  const audit = await getVisibilityAuditById(req.params.id);
  if (!audit) {
    throw new AppError('Audit not found', 404);
  }
  res.json({ audit });
};

export const postClaimAudit = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }
  const auditId = String(req.body?.auditId || req.params.id || '').trim();
  if (!auditId) {
    throw new AppError('auditId is required', 400);
  }
  await claimAuditForUser(auditId, userId);
  const audit = await getVisibilityAuditById(auditId);
  res.json({ ok: true, audit });
};
