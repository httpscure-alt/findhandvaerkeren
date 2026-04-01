import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Creating test partner account...');

    const email = 'test@findhandvaerkeren.dk';
    const password = 'password123';
    const name = 'Test Partner';
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password: hashedPassword,
            name,
            role: 'PARTNER',
            isVerified: true
        }
    });

    console.log(`✅ User created/checked: ${user.email}`);

    const company = await prisma.company.upsert({
        where: { ownerId: user.id },
        update: {},
        create: {
            name: 'Test Growth Solutions',
            ownerId: user.id,
            contactEmail: email,
            location: 'København',
            pricingTier: 'Basic',
            isVerified: true
        }
    });

    console.log(`✅ Company created/checked: ${company.name}`);
    console.log('\n--- LOGIN DETAILS ---');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('--- --- --- --- --- ---\n');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
