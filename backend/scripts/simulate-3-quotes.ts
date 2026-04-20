import { selectCompaniesForJobRequest, inferCompanyPostal } from '../src/services/leadMatching';
import { prisma } from '../src/prisma/client';

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function ensureSimPartners(category: string) {
  // Seed a predictable set of companies so "closest postal" can be validated.
  // If some already exist, top up to 12.
  const existingCount = await prisma.company.count({
    where: { name: { startsWith: 'SIM-' }, category },
  });
  if (existingCount >= 12) return;

  const postals = ['1000', '2100', '2200', '2300', '2400', '2600', '4000', '5000'];

  for (let i = existingCount; i < 12; i++) {
    const postal = postals[i % postals.length];
    const tier = i % 4 === 0 ? 'Gold' : 'Basic';

    // Company.ownerId is unique, so each simulated company needs its own user.
    const email = `sim-partner-${category.toLowerCase().replace(/\W+/g, '-')}-${postal}-${i + 1}@example.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: 'PARTNER', location: `Copenhagen ${postal}` },
      create: {
        email,
        password: 'simulated-user', // only for local simulation
        role: 'PARTNER',
        name: `SIM Partner ${i + 1}`,
        location: `Copenhagen ${postal}`,
      },
      select: { id: true },
    });

    await prisma.company.create({
      data: {
        name: `SIM-${category}-${postal}-${i + 1}`,
        description: 'Simulation partner',
        shortDescription: 'Simulation partner',
        category,
        location: `Copenhagen ${postal}`,
        businessAddress: `Sim Street ${i + 1}, ${postal} København`,
        tags: [],
        pricingTier: tier as any,
        isVerified: i % 3 === 0,
        rating: randInt(35, 50) / 10,
        reviewCount: randInt(0, 250),
        contactEmail: `sim-${category}-${postal}-${i + 1}@example.com`,
        website: 'https://example.com',
        ownerId: user.id,
        companyCreated: true,
        onboardingCompleted: true,
        profileCompleted: true,
      },
    });
  }
}

async function main() {
  const category = process.argv[2] || 'Tømrer';
  const postalCode = process.argv[3] || '2100';

  await ensureSimPartners(category);

  const simCount = await prisma.company.count({ where: { name: { startsWith: 'SIM-' }, category } });
  const onboardedCount = await prisma.company.count({
    where: { name: { startsWith: 'SIM-' }, category, companyCreated: true, onboardingCompleted: true },
  });
  console.log('ℹ️ SIM partners:', { simCount, onboardedCount });

  const job = await prisma.jobRequest.create({
    data: {
      consumerId: null,
      title: `SIM job in ${postalCode}`,
      description: 'Simulation job request',
      category,
      postalCode,
      images: [],
      status: 'open',
      guestName: 'Sim Consumer',
      guestEmail: 'sim-consumer@example.com',
      guestPhone: '00000000',
    },
  });

  const selected = await selectCompaniesForJobRequest({ category, postalCode, min: 3, max: 5 });

  await prisma.leadMatch.createMany({
    data: selected.map((c) => ({ jobRequestId: job.id, companyId: c.id, status: 'pending' })),
    skipDuplicates: true,
  });

  const matches = await prisma.leadMatch.findMany({
    where: { jobRequestId: job.id },
    include: { company: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log('✅ Simulation created');
  console.log(JSON.stringify({ jobRequestId: job.id, category, postalCode, matchCount: matches.length }, null, 2));
  console.log('\nSelected companies (best first):');
  selected.forEach((c, idx) => {
    console.log(
      `${idx + 1}. ${c.id} | postal=${inferCompanyPostal(c) || 'n/a'} | tier=${c.pricingTier} | verified=${c.isVerified} | rating=${c.rating} | reviews=${c.reviewCount}`
    );
  });
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

