import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'httpscure@gmail.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`🚀 Creating/Resetting account: ${email}...`);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            isVerified: true
        },
        create: {
            email,
            password: hashedPassword,
            role: 'ADMIN',
            name: 'HTTPSCURE Admin',
            isVerified: true
        }
    });

    console.log(`✅ Success! ${email} is ready.`);
    console.log(`Role: ${user.role}`);
    console.log(`Password: ${password}`);
}

main()
    .catch((e) => {
        console.error('❌ Failed to create user:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
