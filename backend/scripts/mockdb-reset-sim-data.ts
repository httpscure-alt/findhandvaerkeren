import { prisma } from '../src/prisma/client';

async function main() {
  const category = process.argv[2] || 'Tømrer';
  const prefix = `SIM-${category}-`;

  // Find SIM companies
  const simCompanies = await prisma.company.findMany({
    where: { name: { startsWith: 'SIM-' } },
    select: { id: true, ownerId: true, name: true },
  });

  const simCompanyIds = simCompanies.map((c) => c.id);
  const simOwnerIds = Array.from(new Set(simCompanies.map((c) => c.ownerId)));

  const simJobIds = (
    await prisma.jobRequest.findMany({
      where: { title: { startsWith: 'SIM job' } },
      select: { id: true },
    })
  ).map((j) => j.id);

  // Delete in dependency order
  await prisma.quote.deleteMany({
    where: { match: { jobRequestId: { in: simJobIds } } },
  });

  await prisma.leadMatch.deleteMany({
    where: { companyId: { in: simCompanyIds } },
  });

  await prisma.jobRequest.deleteMany({
    where: { title: { startsWith: 'SIM job' } },
  });

  await prisma.company.deleteMany({
    where: { id: { in: simCompanyIds } },
  });

  await prisma.user.deleteMany({
    where: { id: { in: simOwnerIds }, email: { startsWith: 'sim-partner-' } },
  });

  console.log('✅ Reset simulation data');
  console.log(JSON.stringify({ deletedCompanies: simCompanyIds.length, deletedUsers: simOwnerIds.length, categoryPrefix: prefix }, null, 2));
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

