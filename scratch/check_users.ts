import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    const userCount = await prisma.user.count();
    console.log(`User count in database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: { email: true, role: true }
      });
      console.log('Users found:', users);
    } else {
      console.log('Database is empty (no users).');
    }
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
