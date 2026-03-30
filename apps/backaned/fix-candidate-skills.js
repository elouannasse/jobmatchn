const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'candidat@gmail.com' },
    include: { candidateProfile: true },
  });

  if (!user || !user.candidateProfile) {
    console.log('Candidate not found');
    return;
  }

  const updatedProfile = await prisma.candidateProfile.update({
    where: { id: user.candidateProfile.id },
    data: {
      skills: ['react', 'node.js', 'javascript'],
    },
  });

  console.log('Updated Profile Skills:', updatedProfile.skills);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
