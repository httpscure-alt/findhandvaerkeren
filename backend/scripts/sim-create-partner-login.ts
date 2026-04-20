import { prisma } from '../src/prisma/client';
import { hashPassword } from '../src/utils/password';

async function main() {
  const email = process.argv[2] || 'httpscure@gmail.com';
  const password = process.argv[3] || 'sim123456';
  const category = process.argv[4] || 'Tømrer';
  const postal = process.argv[5] || '2100';

  const hashed = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'PARTNER',
      password: hashed,
      isVerified: true,
      location: `Copenhagen ${postal}`,
      otpCode: null,
      otpExpiresAt: null,
    },
    create: {
      email,
      password: hashed,
      role: 'PARTNER',
      name: 'SIM Partner Login',
      isVerified: true,
      location: `Copenhagen ${postal}`,
    },
    select: { id: true, email: true, role: true },
  });

  const existingCompany = await prisma.company.findUnique({
    where: { ownerId: user.id },
    select: { id: true },
  });

  const company =
    existingCompany ??
    (await prisma.company.create({
      data: {
        ownerId: user.id,
        name: `SIM-LOGIN-${category}-${postal}`,
        description: 'SIM login company',
        shortDescription: 'SIM login company',
        category,
        location: `Copenhagen ${postal}`,
        businessAddress: `Sim Login Street 1, ${postal} København`,
        tags: [],
        pricingTier: 'Basic',
        isVerified: true,
        rating: 4.6,
        reviewCount: 99,
        contactEmail: email,
        website: 'https://example.com',
        companyCreated: true,
        onboardingCompleted: true,
        profileCompleted: true,
      },
      select: { id: true, name: true },
    }));

  console.log('✅ SIM partner login ready');
  console.log(JSON.stringify({ email, password, user, company }, null, 2));
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

