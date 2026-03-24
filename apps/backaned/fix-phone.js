const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.recruiterProfile.update({
    where: { userId: (await prisma.user.findUnique({ where: { email: 'elouannassez@gmail.com' } })).id },
    data: { phone: '+212 661-123456' }
  });
  console.log('Phone updated for elouannassez@gmail.com');
}

main().catch(console.error).finally(() => prisma.$disconnect());
