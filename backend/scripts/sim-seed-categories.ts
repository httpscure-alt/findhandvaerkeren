import { prisma } from '../src/prisma/client';

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  // Minimal set for 3-quotes + partner matching tests
  const names = [
    'Tømrer',
    'Maler',
    'Elektriker',
    'VVS',
    'Murer',
    'Gulvlægger',
    'Rengøring',
    'Havearbejde',
  ];

  for (const name of names) {
    const slug = slugify(name);
    await prisma.category.upsert({
      where: { name },
      update: { slug },
      create: { name, slug },
    });
  }

  const count = await prisma.category.count();
  console.log('✅ Seeded categories');
  console.log(JSON.stringify({ totalCategories: count }, null, 2));
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

