const { PrismaClient } = require('./apps/backend/prisma/generated/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Set auto increment to 101000 for User so next is 101001
    await prisma.$executeRawUnsafe(`UPDATE sqlite_sequence SET seq = 101000 WHERE name = 'User';`);
    
    // 2. Set auto increment to 201000 for Order so next is 201001
    await prisma.$executeRawUnsafe(`UPDATE sqlite_sequence SET seq = 201000 WHERE name = 'Order';`);
    
    console.log('Set SQLite sequences to 101000 for User and 201000 for Order.');

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
