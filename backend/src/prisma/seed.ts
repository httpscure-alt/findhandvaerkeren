import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  await prisma.user.upsert({
    where: { email: 'admin@findhandvaerkeren.dk' },
    update: {},
    create: {
      email: 'admin@findhandvaerkeren.dk',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  // Create superadmin user (requested)
  const superAdminPassword = await hashPassword('superadmin123');
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@findhandvaerkeren.dk' },
    update: {},
    create: {
      email: 'superadmin@findhandvaerkeren.dk',
      password: superAdminPassword,
      name: 'Super Admin',
      role: 'ADMIN', // Highest role available
      isVerified: true,
    },
  });

  // Create test consumer
  const consumerPassword = await hashPassword('consumer123');
  const consumer = await prisma.user.upsert({
    where: { email: 'consumer@example.com' },
    update: {},
    create: {
      email: 'consumer@example.com',
      password: consumerPassword,
      name: 'Anders Jensen',
      location: 'København',
      avatarUrl: 'https://i.pravatar.cc/150?img=11',
      role: 'CONSUMER',
      isVerified: true,
    },
  });

  // Create test partner
  const partnerPassword = await hashPassword('partner123');
  const partner = await prisma.user.upsert({
    where: { email: 'partner@nexussolutions.com' },
    update: {},
    create: {
      email: 'partner@nexussolutions.com',
      password: partnerPassword,
      name: 'Nexus Solutions',
      role: 'PARTNER',
      isVerified: true,
    },
  });

  // Create categories
  const categories = [
    { name: 'Tømrer', slug: 'tomrer', description: 'Alt inden for tømrer- og snedkerarbejde' },
    { name: 'Murer', slug: 'murer', description: 'Murerarbejde, fliser og facaderenovering' },
    { name: 'VVS-installatør', slug: 'vvs-installator', description: 'Vand, varme og sanitet' },
    { name: 'Elektriker', slug: 'elektriker', description: 'Elarbejde og installationer' },
    { name: 'Maler', slug: 'maler', description: 'Indvendigt og udvendigt malerarbejde' },
    { name: 'Haveservice', slug: 'haveservice', description: 'Havearbejde og vedligeholdelse' },
    { name: 'Anlægsgartner', slug: 'anlaegsgartner', description: 'Anlæg af haver og belægning' },
    { name: 'Brolægger', slug: 'brolaegger', description: 'Belægning af indkørsler og terrasser' },
    { name: 'Tagdækker', slug: 'tagdaekker', description: 'Tagarbejde og tagpap' },
    { name: 'Glarmester', slug: 'glarmester', description: 'Glas- og vinduesarbejde' },
    { name: 'Gulvlægger', slug: 'gulvlaegger', description: 'Lægning af alle typer gulve' },
    { name: 'Snedker', slug: 'snedker', description: 'Specialfremstillede møbler og inventar' },
    { name: 'Mekaniker', slug: 'mekaniker', description: 'Reparation og service af biler' },
    { name: 'Entreprenør', slug: 'entreprenor', description: 'Større bygge- og anlægsopgaver' },
    { name: 'Låsesmed', slug: 'laasesmed', description: 'Sikkerhed og oplukning' },
    { name: 'Autohjælp', slug: 'autohjaelp' },
    { name: 'Vinduespudser', slug: 'vinduespudser', description: 'Rene ruder til private og erhverv' },
    { name: 'Flyttefirma', slug: 'flyttefirma', description: 'Hjælp til flytning' },
    { name: 'Rengøring', slug: 'rengoering', description: 'Privat og erhvervsrengøring' },
    { name: 'Skadedyrsbekæmpelse', slug: 'skadedyrsbekaempelse', description: 'Bekæmpelse af skadedyr' },
    { name: 'Kloakmester', slug: 'kloakmester' },
    { name: 'Alt-mulig-mand', slug: 'alt-mulig-mand' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Create locations
  const locations = [
    { name: 'København', slug: 'kobenhavn' },
    { name: 'Aarhus', slug: 'aarhus' },
    { name: 'Odense', slug: 'odense' },
    { name: 'Aalborg', slug: 'aalborg' },
    { name: 'Roskilde', slug: 'roskilde' },
  ];

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { slug: loc.slug },
      update: {},
      create: loc,
    });
  }

  // Create test company
  await prisma.company.upsert({
    where: { ownerId: partner.id },
    update: {},
    create: {
      name: 'Nexus Solutions',
      description: 'Enterprise-grade cloud architecture and AI integration services.',
      shortDescription: 'Enterprise-grade cloud architecture and AI integration services.',
      logoUrl: 'https://picsum.photos/id/42/200/200',
      bannerUrl: 'https://picsum.photos/id/48/1200/400',
      isVerified: true,
      rating: 4.9,
      reviewCount: 124,
      category: 'Technology',
      location: 'København',
      tags: ['Cloud', 'AI', 'Enterprise'],
      pricingTier: 'Gold' as any,
      contactEmail: 'hello@nexussolutions.com',
      website: 'nexussolutions.com',
      ownerId: partner.id,
      services: {
        create: [
          {
            title: 'Cloud Migration',
            description: 'Seamless transition of on-premise infrastructure to AWS, Azure, or GCP.',
          },
          {
            title: 'AI Integration',
            description: 'Custom machine learning models integrated into your existing business workflows.',
          },
        ],
      },
      portfolio: {
        create: [
          {
            title: 'FinTech Core Overhaul',
            category: 'Development',
            imageUrl: 'https://picsum.photos/id/6/600/400',
          },
        ],
      },
      testimonials: {
        create: [
          {
            author: 'Lars Hansen',
            role: 'CTO',
            company: 'Nordic Bank',
            content: 'Nexus Solutions transformed our infrastructure. Highly recommended.',
            rating: 5,
          },
        ],
      },
    },
  });

  // Create Showcase Company for Super Admin
  await prisma.company.upsert({
    where: { ownerId: superAdmin.id },
    update: {},
    create: {
      name: 'SuperAdmin Pro Services',
      description: 'Professional consulting and management services provided directly by the platform administration.',
      shortDescription: 'Platform-backed professional services.',
      logoUrl: 'https://picsum.photos/id/60/200/200',
      bannerUrl: 'https://picsum.photos/id/61/1200/400',
      isVerified: true,
      rating: 5.0,
      reviewCount: 50,
      category: 'Consulting',
      location: 'København',
      tags: ['Management', 'Strategy', 'Admin'],
      pricingTier: 'Gold' as any,
      contactEmail: 'admin@findhandvaerkeren.dk',
      website: 'findhandvaerkeren.dk',
      ownerId: superAdmin.id,
      onboardingCompleted: true,
      profileCompleted: true,
      services: {
        create: [
          {
            title: 'Platform Strategy',
            description: 'We help you scale your business using our platform features.',
          },
        ],
      },
    },
  });

  console.log('✅ Seeding completed!');
  console.log('📝 Test credentials:');
  console.log('   SuperAdmin: superadmin@findhandvaerkeren.dk / superadmin123');
  console.log('   Admin: admin@findhandvaerkeren.dk / admin123');
  console.log('   Consumer: consumer@example.com / consumer123');
  console.log('   Partner: partner@nexussolutions.com / partner123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
