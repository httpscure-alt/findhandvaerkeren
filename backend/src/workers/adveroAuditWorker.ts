import { isAdveroPrismaReady, prisma } from '../prisma/client';
import { logger } from '../config/logger';
import { processAuditJob } from '../services/advero/auditJobProcessor';
import { onAuditJobComplete } from '../services/advero/adveroAuditService';

const POLL_MS = Number(process.env.ADVERO_AUDIT_POLL_MS || 2500);
const BATCH = Number(process.env.ADVERO_AUDIT_BATCH_SIZE || 2);
let timer: ReturnType<typeof setInterval> | null = null;
let running = false;
let warnedNotReady = false;

async function tick(): Promise<void> {
  if (running) return;
  if (!isAdveroPrismaReady()) {
    if (!warnedNotReady) {
      warnedNotReady = true;
      logger.warn(
        'Advero audit worker paused: Prisma client missing Advero models. Run `cd backend && npx prisma generate && npx prisma db push` then restart `npm run dev:all`.'
      );
    }
    return;
  }
  running = true;
  try {
    const pending = await prisma.adveroAudit.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: BATCH,
      select: { id: true, status: true, jobAttempts: true },
    });

    for (const job of pending) {
      if (job.status === 'PROCESSING' && job.jobAttempts >= 3) continue;
      try {
        await processAuditJob(job.id);
        await onAuditJobComplete(job.id);
      } catch {
        /* logged in processor */
      }
    }
  } catch (err) {
    logger.error('Advero audit worker tick failed', err);
  } finally {
    running = false;
  }
}

/**
 * App-native audit worker (P0).
 * Replace with Trigger.dev task `advero.process-audit` when TRIGGER_SECRET_KEY is set.
 */
export function startAdveroAuditWorker(): void {
  if (process.env.ADVERO_AUDIT_WORKER_ENABLED === 'false') {
    logger.info('Advero audit worker disabled');
    return;
  }
  if (!isAdveroPrismaReady()) {
    logger.warn(
      'Advero audit worker not started: run `cd backend && npx prisma generate && npx prisma db push`, then restart the backend.'
    );
    return;
  }
  if (timer) return;

  logger.info('Advero audit worker started', { pollMs: POLL_MS, batch: BATCH });
  void tick();
  timer = setInterval(() => {
    void tick();
  }, POLL_MS);
}

export function stopAdveroAuditWorker(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
