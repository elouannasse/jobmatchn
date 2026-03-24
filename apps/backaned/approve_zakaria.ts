import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'elouannassez@gmail.com' },
    include: { recruiterProfile: true }
  });

  if (user && user.role === 'RECRUITER' && user.recruiterProfile) {
    await prisma.recruiterProfile.update({
      where: { userId: user.id },
      data: { isApproved: true, approvedAt: new Date() }
    });
    console.log('User elouannassez@gmail.com approved successfully.');
  } else {
    console.log('User not found or not a recruiter.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
