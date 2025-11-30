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
  const admin = await prisma.user.upsert({
    where: { email: 'admin@findhandvaerkeren.dk' },
    update: {},
    create: {
      email: 'admin@findhandvaerkeren.dk',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
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
    },
  });

  // Create categories
  const categories = [
    { name: 'Technology', slug: 'technology', description: 'Tech companies and services' },
    { name: 'Finance', slug: 'finance', description: 'Financial services' },
    { name: 'Marketing', slug: 'marketing', description: 'Marketing and advertising' },
    { name: 'Logistics', slug: 'logistics', description: 'Logistics and supply chain' },
    { name: 'Consulting', slug: 'consulting', description: 'Business consulting' },
    { name: 'Legal', slug: 'legal', description: 'Legal services' },
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
  const company = await prisma.company.upsert({
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
      pricingTier: 'Elite',
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

  console.log('✅ Seeding completed!');
  console.log('📝 Test credentials:');
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
