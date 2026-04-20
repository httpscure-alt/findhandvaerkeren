import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.log('Usage: npx tsx scripts/deactivate-user-plan.ts <email>');
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
    select: { id: true, name: true, pricingTier: true },
  });

  if (!company) {
    console.log(`ℹ️ No company for user ${email}. Nothing to deactivate.`);
    process.exit(0);
  }

  const now = new Date();

  const partnerSubs = await prisma.subscription.updateMany({
    where: {
      companyId: company.id,
      status: { in: ['active', 'past_due', 'inactive'] },
    },
    data: {
      status: 'canceled',
      endDate: now,
      cancelAtPeriodEnd: false,
    },
  });

  const marketingSubs = await prisma.marketingSubscription.updateMany({
    where: {
      companyId: company.id,
      status: { in: ['active', 'past_due', 'inactive'] },
    },
    data: {
      status: 'canceled',
      endDate: now,
      cancelAtPeriodEnd: false,
    },
  });

  console.log('✅ Deactivated plans');
  console.log(
    JSON.stringify(
      {
        user,
        company,
        updated: {
          partnerSubscriptions: partnerSubs.count,
          marketingSubscriptions: marketingSubs.count,
        },
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

