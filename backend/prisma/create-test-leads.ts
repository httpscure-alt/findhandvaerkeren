import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Creating test leads for electrician...\n');

    // Find the electrician user
    const electrician = await prisma.user.findUnique({
        where: { email: 'electrician@test.com' }
    });

    if (!electrician) {
        console.log('❌ Electrician account not found!');
        return;
    }

    // Find or create the electrician's company
    let company = await prisma.company.findFirst({
        where: { ownerId: electrician.id }
    });

    if (!company) {
        console.log('⚠️  No company found for electrician. Creating one...');
        company = await prisma.company.create({
            data: {
                name: 'Pro Electrician Services',
                shortDescription: 'Expert electrical work',
                description: 'Professional electrical services for homes and businesses',
                category: 'electrician',
                location: '2100',
                contactEmail: 'electrician@test.com',
                ownerId: electrician.id,
                rating: 4.8,
            }
        });
        console.log('✅ Created company:', company.name);
    }

    // Create a test consumer
    let consumer = await prisma.user.findFirst({
        where: { email: 'test.consumer@example.com' }
    });

    if (!consumer) {
        consumer = await prisma.user.create({
            data: {
                email: 'test.consumer@example.com',
                password: '$2a$10$dummyhash',
                role: 'CONSUMER',
                name: 'Test Consumer',
            }
        });
        console.log('✅ Created test consumer');
    }

    // Create test job requests
    const jobs = [
        {
            title: 'Kitchen Electrical Upgrade',
            description: 'Need to install new outlets and upgrade the electrical panel in my kitchen. Also need some LED lighting installed.',
            category: 'electrician',
            postalCode: '2100',
            budget: '8000-12000',
        },
        {
            title: 'Fix Faulty Wiring',
            description: 'Some outlets in the living room stopped working. Need an electrician to diagnose and fix the issue.',
            category: 'electrician',
            postalCode: '2150',
            budget: '2000-4000',
        },
        {
            title: 'Install Smart Home System',
            description: 'Want to install smart switches, dimmers, and a central control system throughout the house.',
            category: 'electrician',
            postalCode: '2100',
            budget: '15000-20000',
        }
    ];

    for (const jobData of jobs) {
        const job = await prisma.jobRequest.create({
            data: {
                ...jobData,
                consumerId: consumer.id,
                images: [],
                status: 'open',
            }
        });

        // Create lead match for the electrician company
        await prisma.leadMatch.create({
            data: {
                jobRequestId: job.id,
                companyId: company.id,
                status: 'pending',
            }
        });

        console.log(`✅ Created job: "${job.title}"`);
    }

    console.log('\n🎉 Test leads created successfully!');
    console.log('\n📝 Login as:');
    console.log('   Email: electrician@test.com');
    console.log('   Password: password123');
    console.log('\n🔗 Then go to: http://localhost:3001/dashboard/leads');
}

main()
    .catch((e) => {
        console.error('❌ Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
