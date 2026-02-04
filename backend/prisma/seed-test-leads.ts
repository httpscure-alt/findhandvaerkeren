import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding test data for "3 Quotes" feature...');

    // 1. Find or create a test consumer
    let consumer = await prisma.user.findFirst({
        where: { role: 'CONSUMER' }
    });

    if (!consumer) {
        consumer = await prisma.user.create({
            data: {
                email: 'consumer@test.com',
                password: '$2b$10$dummyhash', // Won't be used for login
                role: 'CONSUMER',
                name: 'Test Consumer',
                isVerified: true,
            }
        });
        console.log('✅ Created test consumer');
    }

    // 2. Find or create test companies
    const categories = ['electrician', 'plumber', 'carpenter'];
    const companies = [];

    for (const category of categories) {
        let company = await prisma.company.findFirst({
            where: { category }
        });

        if (!company) {
            // Create a partner user for this company
            const partner = await prisma.user.create({
                data: {
                    email: `${category}@test.com`,
                    password: '$2b$10$dummyhash',
                    role: 'PARTNER',
                    name: `Test ${category.charAt(0).toUpperCase() + category.slice(1)}`,
                    isVerified: true,
                }
            });

            company = await prisma.company.create({
                data: {
                    name: `${category.charAt(0).toUpperCase() + category.slice(1)} Pro`,
                    category,
                    location: '2100',
                    ownerId: partner.id,
                    description: `Professional ${category} services`,
                    rating: 4.5,
                }
            });
            console.log(`✅ Created ${category} company`);
        }
        companies.push(company);
    }

    // 3. Create test job requests with leads
    const jobRequests = [
        {
            title: 'Bathroom Renovation',
            description: 'Need complete bathroom remodel including plumbing and electrical work',
            category: 'plumber',
            postalCode: '2100',
            budget: '15000-20000',
        },
        {
            title: 'Kitchen Electrical Upgrade',
            description: 'Install new outlets and lighting in kitchen',
            category: 'electrician',
            postalCode: '2150',
            budget: '5000-8000',
        },
        {
            title: 'Custom Shelving',
            description: 'Build custom wooden shelves for living room',
            category: 'carpenter',
            postalCode: '2100',
            budget: '3000-5000',
        }
    ];

    for (const jobData of jobRequests) {
        const job = await prisma.jobRequest.create({
            data: {
                ...jobData,
                consumerId: consumer.id,
                images: [],
                status: 'open',
            }
        });

        // Create lead matches for companies in same category
        const matchingCompanies = companies.filter(c => c.category === jobData.category);
        for (const company of matchingCompanies) {
            await prisma.leadMatch.create({
                data: {
                    jobRequestId: job.id,
                    companyId: company.id,
                    status: 'pending',
                }
            });
        }

        console.log(`✅ Created job: "${job.title}" with ${matchingCompanies.length} lead(s)`);
    }

    console.log('\n🎉 Test data seeding complete!');
    console.log('\n📝 Test Accounts Created:');
    console.log('   Consumer: consumer@test.com');
    console.log('   Electrician: electrician@test.com');
    console.log('   Plumber: plumber@test.com');
    console.log('   Carpenter: carpenter@test.com');
    console.log('\n💡 Password for all: Use your registration flow or update manually');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
