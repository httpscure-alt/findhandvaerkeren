import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToAdmin(email: string) {
    console.log(`🔍 Searching for user: ${email}...`);

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.error(`❌ Error: User with email "${email}" not found.`);
            console.log('💡 Note: You must first SIGN UP on the website before you can be promoted.');
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
        });

        console.log(`✅ Success! User "${email}" has been promoted to ADMIN.`);
        console.log(`Current Role: ${updatedUser.role}`);
        console.log('🔄 Please log out and log back in on the website for changes to take effect.');

    } catch (error) {
        console.error('❌ Error promoting user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

const email = process.argv[2];

if (!email) {
    console.log('Usage: npx ts-node scripts/setup-admin.ts <email>');
    process.exit(1);
}

promoteToAdmin(email);
