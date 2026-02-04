import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Seed Categories
    const categories = [
        { name: 'Tømrer', slug: 'tomrer' },
        { name: 'Murer', slug: 'murer' },
        { name: 'VVS-installatør', slug: 'vvs-installator' },
        { name: 'Elektriker', slug: 'elektriker' },
        { name: 'Maler', slug: 'maler' },
        { name: 'Haveservice', slug: 'haveservice' },
        { name: 'Anlægsgartner', slug: 'anlaegsgartner' },
        { name: 'Brolægger', slug: 'brolaegger' },
        { name: 'Tagdækker', slug: 'tagdaekker' },
        { name: 'Glarmester', slug: 'glarmester' },
        { name: 'Gulvlægger', slug: 'gulvlaegger' },
        { name: 'Snedker', slug: 'snedker' },
        { name: 'Mekaniker', slug: 'mekaniker' },
        { name: 'Entreprenør', slug: 'entreprenor' },
        { name: 'Låsesmed', slug: 'laasesmed' },
        { name: 'Autohjælp', slug: 'autohjaelp' },
        { name: 'Vinduespudser', slug: 'vinduespudser' },
        { name: 'Flyttefirma', slug: 'flyttefirma' },
        { name: 'Rengøring', slug: 'rengoering' },
        { name: 'Skadedyrsbekæmpelse', slug: 'skadedyrsbekaempelse' },
        { name: 'Kloakmester', slug: 'kloakmester' },
        { name: 'Alt-mulig-mand', slug: 'alt-mulig-mand' },
    ];

    for (const category of categories) {
        await prisma.category.upsert({
            where: { slug: category.slug },
            update: {},
            create: category,
        });
    }

    console.log('✅ Categories seeded!');

    // Seed Locations (Danish cities)
    const locations = [
        { name: 'København', slug: 'kobenhavn' },
        { name: 'Aarhus', slug: 'aarhus' },
        { name: 'Odense', slug: 'odense' },
        { name: 'Aalborg', slug: 'aalborg' },
        { name: 'Esbjerg', slug: 'esbjerg' },
        { name: 'Randers', slug: 'randers' },
        { name: 'Kolding', slug: 'kolding' },
        { name: 'Horsens', slug: 'horsens' },
    ];

    for (const location of locations) {
        await prisma.location.upsert({
            where: { slug: location.slug },
            update: {},
            create: location,
        });
    }

    console.log('✅ Locations seeded!');
    console.log('🎉 Database seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
