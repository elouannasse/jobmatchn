import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from './matching.service';

describe('MatchingService', () => {
  let service: MatchingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchingService],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateSkillsScore', () => {
    it('should return 100% when all skills match', () => {
      const candidateSkills = ['React', 'NodeJS', 'TypeScript'];
      const jobSkills = ['React', 'NodeJS'];
      const score = service.calculateSkillsScore(candidateSkills, jobSkills);
      expect(score).toBe(100);
    });

    it('should return 0% when no skills match', () => {
      const candidateSkills = ['Java', 'PHP'];
      const jobSkills = ['React', 'NodeJS'];
      const score = service.calculateSkillsScore(candidateSkills, jobSkills);
      expect(score).toBe(0);
    });

    it('should return 50% when half of the job skills match', () => {
      const candidateSkills = ['React', 'Python'];
      const jobSkills = ['React', 'NodeJS'];
      const score = service.calculateSkillsScore(candidateSkills, jobSkills);
      expect(score).toBe(50);
    });

    it('should be case insensitive', () => {
      const candidateSkills = ['react', 'nodejs'];
      const jobSkills = ['REACT', 'NodeJS'];
      const score = service.calculateSkillsScore(candidateSkills, jobSkills);
      expect(score).toBe(100);
    });

    it('should return 0 when candidate has no skills', () => {
      const candidateSkills: string[] = [];
      const jobSkills = ['React'];
      const score = service.calculateSkillsScore(candidateSkills, jobSkills);
      expect(score).toBe(0);
    });

    it('should return 100 when job has no skills requirements', () => {
      const candidateSkills = ['React'];
      const jobSkills: string[] = [];
      const score = service.calculateSkillsScore(candidateSkills, jobSkills);
      expect(score).toBe(100);
    });
  });

  describe('calculateLocationScore', () => {
    it('should return 100 for exact location match', () => {
      expect(service.calculateLocationScore('Paris', 'Paris')).toBe(100);
    });

    it('should return 100 if job is remote', () => {
      expect(service.calculateLocationScore('Paris', 'Remote')).toBe(100);
      expect(service.calculateLocationScore('Paris', 'Télétravail')).toBe(100);
    });

    it('should return 80 for partial location match', () => {
      expect(service.calculateLocationScore('Paris, France', 'Paris')).toBe(80);
    });

    it('should return 0 for no match', () => {
      expect(service.calculateLocationScore('Paris', 'Lyon')).toBe(0);
    });
  });

  describe('calculateComprehensiveScore', () => {
    it('should calculate a weighted score', () => {
      const candidate = {
        skills: ['React', 'NodeJS'],
        title: 'Fullstack Developer',
        location: 'Paris',
        summary: 'Experienced developer with React and Node',
      };
      const job = {
        skills: ['React', 'NodeJS'],
        title: 'Fullstack Developer',
        location: 'Paris',
        description:
          'We are looking for a Fullstack Developer experienced in React',
      };

      const score = service.calculateComprehensiveScore(candidate, job);
      // Skills: 100, Title: 100, Location: 100, Summary: ~50
      // (100*0.6) + (100*0.2) + (100*0.1) + (50*0.1) = 60 + 20 + 10 + 5 = 95
      expect(score).toBe(95);
    });

    it('should handle missing data gracefully', () => {
      const candidate = { skills: [], title: '', location: '', summary: '' };
      const job = {
        skills: ['React'],
        title: 'Dev',
        location: 'Paris',
        description: 'Desc',
      };

      const score = service.calculateComprehensiveScore(candidate, job);
      expect(score).toBeLessThan(100);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });
});
