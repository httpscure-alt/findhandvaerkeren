import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'SUPERADMIN'] as any } } });
  console.log('Admins found:', admins.length);
  for(const a of admins) { console.log(a.email, a.role); }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
