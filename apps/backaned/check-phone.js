const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'elouannassez@gmail.com' },
    include: { recruiterProfile: true }
  });
  
  console.log('User:', user.email);
  console.log('Phone in Profile:', user.recruiterProfile?.phone);
}

main().catch(console.error).finally(() => prisma.$disconnect());
