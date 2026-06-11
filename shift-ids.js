const { PrismaClient } = require('./apps/backend/prisma/generated/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting ID shift...");
    // Foreign key checks off for sqlite during this
    await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = OFF;`);

    // --- USERS ---
    const users = await prisma.user.findMany();
    for (const u of users) {
      if (u.id < 101000) {
        const newId = 101000 + u.id;
        
        // Update User
        await prisma.$executeRawUnsafe(`UPDATE User SET id = ${newId}, affiliateCode = '${newId}' WHERE id = ${u.id};`);
        
        // Update FKs
        await prisma.$executeRawUnsafe(`UPDATE User SET referredById = ${newId} WHERE referredById = ${u.id};`);
        await prisma.$executeRawUnsafe(`UPDATE "Order" SET userId = ${newId} WHERE userId = ${u.id};`);
        await prisma.$executeRawUnsafe(`UPDATE "Order" SET affiliateId = ${newId} WHERE affiliateId = ${u.id};`);
        await prisma.$executeRawUnsafe(`UPDATE License SET userId = ${newId} WHERE userId = ${u.id};`);
        await prisma.$executeRawUnsafe(`UPDATE Ticket SET userId = ${newId} WHERE userId = ${u.id};`);
        await prisma.$executeRawUnsafe(`UPDATE TicketMessage SET userId = ${newId} WHERE userId = ${u.id};`);
        await prisma.$executeRawUnsafe(`UPDATE Withdrawal SET userId = ${newId} WHERE userId = ${u.id};`);
        console.log(`Shifted User ${u.id} -> ${newId}`);
      }
    }

    // --- ORDERS ---
    const orders = await prisma.order.findMany();
    for (const o of orders) {
      if (o.id < 201000) {
        const newId = 201000 + o.id;
        
        // Update Order
        await prisma.$executeRawUnsafe(`UPDATE "Order" SET id = ${newId} WHERE id = ${o.id};`);
        
        // Update FKs
        await prisma.$executeRawUnsafe(`UPDATE OrderItem SET orderId = ${newId} WHERE orderId = ${o.id};`);
        console.log(`Shifted Order ${o.id} -> ${newId}`);
      }
    }

    // Re-enable FKs
    await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON;`);
    console.log("Successfully updated all existing data accordingly!");

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
