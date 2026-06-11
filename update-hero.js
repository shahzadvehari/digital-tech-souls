const { PrismaClient } = require('./apps/backend/prisma/generated/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.setting.upsert({
      where: { key: 'heroImage' },
      update: { value: '/images/hero_agency_hosting.png' },
      create: { key: 'heroImage', value: '/images/hero_agency_hosting.png', description: 'Hero Section Image URL' }
    });
    console.log('Hero image updated to /images/hero_agency_hosting.png');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
