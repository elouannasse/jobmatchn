const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const email = 'elouannassez@gmail.com';
  const password = 'DYABLO2009';
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'RECRUITER'
    },
    create: {
      email,
      password: hashedPassword,
      firstName: 'Zakaria',
      lastName: 'Zakaria',
      role: 'RECRUITER',
      recruiterProfile: {
        create: {
          isApproved: true,
          approvedAt: new Date(),
        }
      }
    }
  });
  
  console.log(`User ${email} updated/created with password ${password} (hashed).`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
