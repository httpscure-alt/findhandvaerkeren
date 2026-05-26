import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const baseUrl = process.env.DATABASE_URL || '';
  const sep = baseUrl.includes('?') ? '&' : '?';
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: `${baseUrl}${sep}connection_limit=5`,
      },
    },
  });
}

// tsx watch can keep a stale global client from before `prisma generate` — refresh if Advero delegates are missing.
const cached = globalForPrisma.prisma;
if (cached && typeof (cached as PrismaClient & { adveroAudit?: unknown }).adveroAudit === 'undefined') {
  void cached.$disconnect().catch(() => {});
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/** True when Advero P0 models exist on the generated client (after `npx prisma generate`). */
export function isAdveroPrismaReady(): boolean {
  return typeof (prisma as PrismaClient & { adveroAudit?: { findMany: unknown } }).adveroAudit?.findMany ===
    'function';
}
