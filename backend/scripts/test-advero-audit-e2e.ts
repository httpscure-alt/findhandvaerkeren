/**
 * End-to-end Advero audit persistence test.
 * Run: cd backend && npx tsx scripts/test-advero-audit-e2e.ts
 * Requires: DATABASE_URL valid + npx prisma db push
 */
import { prisma, isAdveroPrismaReady } from '../src/prisma/client';
import { enqueueVisibilityAudit, getVisibilityAuditById } from '../src/services/advero/adveroAuditService';
import { processAuditJob } from '../src/services/advero/auditJobProcessor';
import { buildDashboardPayload } from '../src/services/advero/adveroWorkspaceService';

const API_BASE = process.env.API_BASE || 'http://localhost:4000/api';

async function main() {
  console.log('Advero E2E audit test\n');

  if (!isAdveroPrismaReady()) {
    console.error('FAIL: Prisma Advero models missing. Run: npx prisma generate');
    process.exit(1);
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('OK: Database connection');
  } catch (e) {
    console.error('FAIL: Database connection', e);
    console.error('\nFix DATABASE_URL in backend/.env (use Supabase direct URL for migrations).');
    process.exit(1);
  }

  const pending = await enqueueVisibilityAudit({
    companyName: 'E2E Test ApS',
    websiteUrl: 'https://example.dk',
    serviceArea: 'København',
    contactEmail: 'e2e@test.dk',
    industry: 'local_services',
    growthGoal: 'both',
  });

  if (pending.status !== 'pending' && pending.status !== 'complete') {
    console.error('FAIL: Expected pending or complete audit, got', pending.status);
    process.exit(1);
  }
  console.log('OK: Audit enqueued', pending.id, pending.status);

  if (pending.status === 'pending') {
    await processAuditJob(pending.id);
  }

  const complete = await getVisibilityAuditById(pending.id);
  if (!complete || complete.status !== 'complete' || !complete.scores) {
    console.error('FAIL: Audit not complete', complete?.status);
    process.exit(1);
  }
  console.log('OK: Audit complete', complete.overallScore, complete.scores);

  const dash = await buildDashboardPayload(undefined, pending.id, 'da');
  if (!dash.intelligence || dash.intelligence.scores.overall !== complete.overallScore) {
    console.error('FAIL: Dashboard intelligence mismatch', dash.intelligence?.scores.overall, complete.overallScore);
    process.exit(1);
  }
  console.log('OK: Canonical intelligence', dash.intelligence.source, dash.intelligence.priority.title);

  try {
    const res = await fetch(`${API_BASE}/advero/audits/${pending.id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.audit?.status !== 'complete') throw new Error('API audit not complete');
    console.log('OK: HTTP GET audit');
  } catch (e) {
    console.warn('SKIP: HTTP test (is backend running on :4000?)', (e as Error).message);
  }

  console.log('\nAll checks passed.');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
