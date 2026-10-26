const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const seq = await prisma.$queryRawUnsafe(`SELECT pg_get_serial_sequence('"Order"', 'id') AS seq_name;`);
    console.log("Sequence info:", seq);

    // Reset sequence to 1
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Order_id_seq" RESTART WITH 1;`);
    console.log("Successfully reset Order_id_seq to 1!");
    
    // Also check OrderItem_id_seq
    try {
      await prisma.$executeRawUnsafe(`ALTER SEQUENCE "OrderItem_id_seq" RESTART WITH 1;`);
      console.log("Successfully reset OrderItem_id_seq to 1!");
    } catch (e) {
      console.log("OrderItem_id_seq notice:", e.message);
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
