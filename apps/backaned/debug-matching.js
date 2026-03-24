const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const candidate = await prisma.candidateProfile.findFirst({
    where: {
      user: {
        OR: [
          { firstName: { contains: 'raida', mode: 'insensitive' } },
          { lastName: { contains: 'raida', mode: 'insensitive' } }
        ]
      }
    },
    include: {
      user: true
    }
  });

  if (!candidate) {
    console.log('Candidate not found');
  } else {
    console.log('Candidate found:', candidate);
  }

  const jobs = await prisma.jobOffer.findMany({
    take: 5,
    where: { isPublished: true }
  });
  console.log('Sample Jobs:', jobs.map(j => ({ title: j.title, skills: j.skills })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
