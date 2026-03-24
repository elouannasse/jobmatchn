const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: 'elouannassez@gmail.com' },
    include: { 
      recruiterProfile: {
        include: {
          company: true
        }
      } 
    }
  });
  console.log('--- USER DATA ---');
  console.log(JSON.stringify(users, null, 2));
  
  const allRecruiters = await prisma.user.findMany({
    where: { role: 'RECRUITER' },
    include: { recruiterProfile: true }
  });
  console.log('--- ALL RECRUITERS ---');
  console.log(JSON.stringify(allRecruiters, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
