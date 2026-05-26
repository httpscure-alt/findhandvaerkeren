import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { prisma, isAdveroPrismaReady } from '../prisma/client';
import {
  getGoogleSearchConsoleAuthUrl,
  getSearchConsoleSnapshot,
  syncSearchConsoleForWorkspace,
} from '../services/google/searchConsoleService';

async function requireWorkspace(userId: string) {
  if (!isAdveroPrismaReady()) throw new AppError('Database not ready', 503);
  const ws = await prisma.adveroWorkspace.findUnique({ where: { userId } });
  if (!ws) throw new AppError('Workspace not found — complete an audit or subscribe first', 404);
  return ws;
}

export const getSearchConsoleStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) throw new AppError('Unauthorized', 401);
  const ws = await requireWorkspace(userId);
  const snapshot = await getSearchConsoleSnapshot(ws.id);
  const authUrl = getGoogleSearchConsoleAuthUrl({ provider: 'gsc', workspaceId: ws.id, userId });
  res.json({ snapshot, authUrl });
};

export const postSearchConsoleSync = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) throw new AppError('Unauthorized', 401);
  const ws = await requireWorkspace(userId);
  const snapshot = await syncSearchConsoleForWorkspace(ws.id);
  res.json({ snapshot });
};

/** Dev only — disabled in production (see integrations controller). */
export const postSearchConsoleConnectDemo = async (req: AuthRequest, res: Response): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    throw new AppError('Demo connect is disabled in production', 403);
  }
  const userId = req.userId;
  if (!userId) throw new AppError('Unauthorized', 401);
  const ws = await requireWorkspace(userId);
  const snapshot = await syncSearchConsoleForWorkspace(ws.id);
  res.json({ snapshot, mode: 'demo' });
};
