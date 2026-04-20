import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.log('Usage: npx tsx scripts/reset-user-plan-badge.ts <email>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    console.error(`❌ User not found: ${email}`);
    process.exit(1);
  }

  const company = await prisma.company.findUnique({
    where: { ownerId: user.id },
    select: { id: true, name: true, pricingTier: true, onboardingCompleted: true, profileCompleted: true },
  });

  if (!company) {
    console.log(`ℹ️ No company for user ${email}. Nothing to reset.`);
    process.exit(0);
  }

  // Reset B: only reset plan display state, keep onboarding intact.
  const updatedCompany = await prisma.company.update({
    where: { id: company.id },
    data: {
      pricingTier: 'Basic',
    },
    select: { id: true, name: true, pricingTier: true, onboardingCompleted: true, profileCompleted: true },
  });

  const now = new Date();
  await prisma.subscription.updateMany({
    where: { companyId: company.id, status: { in: ['active', 'past_due'] } },
    data: { status: 'canceled', endDate: now, cancelAtPeriodEnd: false },
  });
  await prisma.marketingSubscription.updateMany({
    where: { companyId: company.id, status: { in: ['active', 'past_due'] } },
    data: { status: 'canceled', endDate: now, cancelAtPeriodEnd: false },
  });

  console.log('✅ Reset B applied (badge only)');
  console.log(JSON.stringify({ user, companyBefore: company, companyAfter: updatedCompany }, null, 2));
  console.log('ℹ️ To replay checkout: go to /dashboard/billing → "Choose plan again"');
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

