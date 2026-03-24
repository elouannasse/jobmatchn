const { MatchingService } = require('./src/matching/matching.service');

const ms = new MatchingService();

const candidate = {
  user: { firstName: 'raida', lastName: 'raida' },
  title: 'Développeur Fullstack React & Node.js',
  summary: 'Passionné par le développement web moderne avec 3 ans d experience.',
  skills: ['react', 'javascript', 'node.js', 'typescript', 'nest.js'],
  location: 'Paris, France'
};

const job = {
  title: 'Développeur React Junior',
  description: 'Nous cherchons un développeur passionné par react et javascript pour notre équipe à Paris.',
  skills: ['react', 'javascript', 'nest.js'],
  location: 'Paris'
};

const score = ms.calculateComprehensiveScore(candidate, job);
console.log('Final Score:', score);
