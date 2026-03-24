const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const email = 'elouannassez@gmail.com';
  const firstName = 'Zakaria';
  const lastName = 'Zakaria';
  const password = 'Password123!';
  
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'RECRUITER',
        recruiterProfile: {
          create: {
            isApproved: true,
            approvedAt: new Date(),
          }
        }
      },
      include: { recruiterProfile: true }
    });
    console.log('Recruiter user created:', user);
  } else {
    console.log('User already exists, updating to RECRUITER and approving...');
    const user = await prisma.user.update({
      where: { email },
      data: {
        role: 'RECRUITER',
        recruiterProfile: {
          upsert: {
            create: {
              isApproved: true,
              approvedAt: new Date(),
            },
            update: {
              isApproved: true,
              approvedAt: new Date(),
            }
          }
        }
      },
      include: { recruiterProfile: true }
    });
    console.log('User updated:', user);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
