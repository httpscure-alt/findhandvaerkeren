import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { buildDashboardPayload } from '../services/advero/adveroWorkspaceService';

export const getAdveroDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  const auditId = typeof req.query.auditId === 'string' ? req.query.auditId : undefined;
  const lang = req.query.lang === 'en' ? 'en' : 'da';
  const payload = await buildDashboardPayload(userId, auditId, lang);
  res.json(payload);
};
