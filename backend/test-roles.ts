import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ select: { email: true, role: true } });
  console.log(users.filter(u => u.role.includes('ADMIN')));
}
main().catch(console.error).finally(() => prisma.$disconnect());
