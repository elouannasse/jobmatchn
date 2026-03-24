const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { 
      recruiterProfile: true,
      candidateProfile: true
    }
  });
  console.log('--- ALL USERS ---');
  console.log(JSON.stringify(users, null, 2));
  
  const profiles = await prisma.recruiterProfile.findMany({
    include: { user: true }
  });
  console.log('--- ALL RECRUITER PROFILES ---');
  console.log(JSON.stringify(profiles, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
