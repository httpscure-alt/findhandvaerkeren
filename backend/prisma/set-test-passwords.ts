import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🔐 Setting simple passwords for test accounts...\n');

    const password = 'password123'; // Simple password for all test accounts
    const hashedPassword = await bcrypt.hash(password, 10);

    const testEmails = [
        'consumer@test.com',
        'electrician@test.com',
        'plumber@test.com',
        'carpenter@test.com',
    ];

    for (const email of testEmails) {
        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            await prisma.user.update({
                where: { email },
                data: { password: hashedPassword }
            });
            console.log(`✅ ${email} → password: ${password}`);
        } else {
            console.log(`⚠️  ${email} → not found, skipping`);
        }
    }

    console.log('\n🎉 Done! All test accounts now use password: password123');
    console.log('\n📝 Test Accounts:');
    console.log('   Consumer:    consumer@test.com    / password123');
    console.log('   Electrician: electrician@test.com / password123');
    console.log('   Plumber:     plumber@test.com     / password123');
    console.log('   Carpenter:   carpenter@test.com   / password123');
}

main()
    .catch((e) => {
        console.error('❌ Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
