const { PrismaClient } = require('./prisma/generated/client');
const prisma = new PrismaClient();

const oldClients = [
  { name: 'Acme Corp', iconName: 'Box' },
  { name: 'GlobalX', iconName: 'Hexagon' },
  { name: 'NexGen', iconName: 'Triangle' },
  { name: 'Apex Tech', iconName: 'Circle' },
  { name: 'Star Labs', iconName: 'Star' },
  { name: 'Vertex', iconName: 'Layers' },
  { name: 'Pulse', iconName: 'Activity' },
  { name: 'Prism', iconName: 'Aperture' }
];

async function main() {
  const count = await prisma.clientLogo.count();
  if (count === 0) {
    console.log("Seeding old clients...");
    await prisma.clientLogo.createMany({ data: oldClients });
    console.log("Seeding complete.");
  } else {
    console.log("Clients already exist. Skipping seed.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
