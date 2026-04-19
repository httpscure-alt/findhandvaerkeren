import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const latestCompany = await prisma.company.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { owner: true }
  });

  if (!latestCompany) {
    console.log("No companies found.");
    return;
  }

  console.log(`Found recently created company: ${latestCompany.name} (Email: ${latestCompany.owner.email})`);

  // To be safe, we only delete if it was created very recently (e.g. today)
  const now = new Date();
  const diff = now.getTime() - latestCompany.createdAt.getTime();
  const hoursDiff = diff / (1000 * 60 * 60);

  if (hoursDiff < 2) {
    await prisma.company.delete({ where: { id: latestCompany.id } });
    await prisma.user.delete({ where: { id: latestCompany.ownerId } });
    console.log(`Successfully deleted company '${latestCompany.name}' and user '${latestCompany.owner.email}'.`);
  } else {
    console.log(`Company '${latestCompany.name}' was created ${hoursDiff} hours ago. Not deleting automatically for safety. Please confirm if this is the right one.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
