const { PrismaClient } = require('./prisma/generated/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Allah@786', 10);
  await prisma.user.updateMany({
    where: { role: 'SUPER_USER' },
    data: { password: hashedPassword }
  });
  console.log('Password updated successfully for ALL Admin/Super Users!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
