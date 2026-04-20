import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type State = 'none' | 'active' | 'past_due' | 'canceled';

async function main() {
  const email = process.argv[2];
  const state = (process.argv[3] as State | undefined) || 'none';
  const tier = (process.argv[4] as 'Basic' | 'Gold' | undefined) || 'Basic';
  const billingCycle = (process.argv[5] as 'monthly' | 'annual' | undefined) || 'monthly';

  if (!email) {
    console.log('Usage: npx tsx scripts/set-user-subscription-state.ts <email> <none|active|past_due|canceled> [Basic|Gold] [monthly|annual]');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });
  if (!user) throw new Error(`User not found: ${email}`);

  const company = await prisma.company.findUnique({
    where: { ownerId: user.id },
    select: { id: true, name: true, pricingTier: true },
  });
  if (!company) throw new Error(`Company not found for: ${email}`);

  const now = new Date();
  const periodStart = now;
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (state === 'none') {
    await prisma.subscription.deleteMany({ where: { companyId: company.id } });
    await prisma.marketingSubscription.deleteMany({ where: { companyId: company.id } });
    await prisma.company.update({ where: { id: company.id }, data: { pricingTier: 'Basic' } });
    console.log('✅ Set state=none (deleted subscription rows)');
    return;
  }

  // Create a fake subscription row to drive UI states (does not touch Stripe).
  await prisma.subscription.deleteMany({ where: { companyId: company.id } });
  const created = await prisma.subscription.create({
    data: {
      companyId: company.id,
      tier,
      status: state,
      billingCycle,
      startDate: now,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: state === 'canceled',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: null,
    },
    select: { id: true, status: true, tier: true, billingCycle: true },
  });

  await prisma.company.update({
    where: { id: company.id },
    data: { pricingTier: tier },
  });

  console.log('✅ Set subscription state');
  console.log(JSON.stringify({ email, companyId: company.id, subscription: created }, null, 2));
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

