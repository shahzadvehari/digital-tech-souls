const { PrismaClient } = require('./prisma/generated/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.lead.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      serviceNeeded: 'Web Development',
      message: 'I need a new e-commerce website for my business.',
      status: 'NEW'
    }
  });

  await prisma.lead.create({
    data: {
      name: 'Sarah Smith',
      email: 'sarah@designco.com',
      phone: '+1987654321',
      serviceNeeded: 'Digital Marketing',
      message: 'Looking for SEO and social media marketing services.',
      status: 'CONTACTED'
    }
  });

  console.log('Dummy leads seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
