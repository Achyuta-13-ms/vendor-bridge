import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding platforms...');
  
  const platforms = [
    { name: 'swiggy', displayName: 'Swiggy' },
    { name: 'zomato', displayName: 'Zomato' },
    { name: 'amazon', displayName: 'Amazon' },
    { name: 'shopify', displayName: 'Shopify' },
    { name: 'generic', displayName: 'Custom Marketplace' },
  ];

  for (const platform of platforms) {
    await prisma.platform.upsert({
      where: { name: platform.name },
      update: {},
      create: platform,
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
