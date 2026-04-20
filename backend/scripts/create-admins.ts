import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin(email: string, name: string) {
    const password = 'admin123';
    console.log(`🚀 Creating/Resetting Admin account: ${email}...`);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'ADMIN',
                isVerified: true
            },
            create: {
                email,
                name,
                password: hashedPassword,
                role: 'ADMIN',
                isVerified: true
            }
        });

        console.log(`✅ Success! ${name} (${email}) is ready.`);
        console.log(`Role: ${user.role}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error(`❌ Error creating ${email}:`, error);
    }
}

async function main() {
    await createAdmin('superadmin@findhndvrkeren.dk', 'Super Admin');
    await createAdmin('admin@findhndvrkeren.dk', 'Administrator');
    
    console.log('\n✨ Admin account setup complete!');
    console.log('🔄 You can now log in with these credentials on the website.');
    
    await prisma.$disconnect();
}

main();
