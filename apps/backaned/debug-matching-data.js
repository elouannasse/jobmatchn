const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'candidat@gmail.com' },
    include: {
      candidateProfile: {
        include: {
          applications: {
            include: {
              jobOffer: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('--- Candidate Info ---');
  console.log('Email:', user.email);
  console.log('Skills:', user.candidateProfile?.skills);
  console.log('Title:', user.candidateProfile?.title);

  console.log('\n--- Applications ---');
  if (user.candidateProfile?.applications) {
    user.candidateProfile.applications.forEach((app, i) => {
      console.log(`Application ${i + 1}:`);
      console.log('  Job Title:', app.jobOffer.title);
      console.log('  Job Skills:', app.jobOffer.skills);
      console.log('  App Score:', app.score);
      console.log('  ---');
    });
  } else {
    console.log('No applications found');
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
