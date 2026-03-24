const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'raida@gmail.com' }
  });

  if (!user) {
    console.log('User raida@gmail.com not found');
    return;
  }

  const updated = await prisma.candidateProfile.update({
    where: { userId: user.id },
    data: {
      title: 'Développeur Fullstack React & Node.js',
      summary: 'Passionné par le développement web moderne avec 3 ans d experience.',
      skills: ['react', 'javascript', 'node.js', 'typescript', 'nest.js'],
      location: 'Paris, France'
    }
  });

  console.log('Updated candidate profile:', updated);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
