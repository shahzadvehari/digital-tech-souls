const { PrismaClient } = require('./prisma/generated/client');
const prisma = new PrismaClient();

async function main() {
  const usd = await prisma.currency.upsert({
    where: { code: 'USD' },
    update: {},
    create: { code: 'USD', symbol: '$', rate: 1.0, mode: 'MANUAL', isBase: true, isActive: true },
  });

  const pkr = await prisma.currency.upsert({
    where: { code: 'PKR' },
    update: {},
    create: { code: 'PKR', symbol: 'Rs.', rate: 278.50, mode: 'MANUAL', isBase: false, isActive: true },
  });

  console.log('Seeded currencies:', usd.code, pkr.code);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
