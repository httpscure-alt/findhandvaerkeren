/**
 * Delete specific users by email (and owned company data). Usage:
 *   npx tsx scripts/delete-users-by-email.ts
 */
import { PrismaClient } from '@prisma/client';

const EMAILS_TO_DELETE = [
  'partner@nexussolutions.com',
  'consumer@example.com',
  'superadmin@findhandvaerkeren.dk',
  'admin@findhandvaerkeren.dk',
  'admin@findhndvrkeren.dk',
  'superadmin@findhndvrkeren.dk',
  'httpscure@gmail.com',
].map((e) => e.toLowerCase());

const PROTECTED = new Set(['admin@advero.dk']);

const prisma = new PrismaClient();

async function deleteUserWithRelations(userId: string, companyId: string | null | undefined) {
  if (companyId) {
    await prisma.growthRequest.deleteMany({ where: { companyId } });
    await prisma.company.delete({ where: { id: companyId } });
  }
  await prisma.user.delete({ where: { id: userId } });
}

async function main() {
  const found = await prisma.user.findMany({
    where: { email: { in: EMAILS_TO_DELETE } },
    select: {
      id: true,
      email: true,
      role: true,
      ownedCompany: { select: { id: true } },
    },
  });

  const missing = EMAILS_TO_DELETE.filter((e) => !found.some((u) => u.email.toLowerCase() === e));
  if (missing.length) {
    console.log('Not found (skipped):', missing.join(', '));
  }

  for (const user of found) {
    if (PROTECTED.has(user.email.toLowerCase())) {
      console.log('Protected, skipped:', user.email);
      continue;
    }

    await deleteUserWithRelations(user.id, user.ownedCompany?.id);
    console.log('Deleted:', user.email, `(${user.role})`);
  }

  console.log('Done.', found.length, 'processed.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
