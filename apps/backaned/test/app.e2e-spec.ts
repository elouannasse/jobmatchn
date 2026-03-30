import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserRole } from '../src/auth/dto/register.dto';
import { ContractType, ApplicationStatus } from '@prisma/client';

interface AuthResponse {
  accessToken: string;
}

interface CreateResponse {
  id: string;
}

interface ApplicationUpdateResponse {
  status: ApplicationStatus;
}

describe('Main Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let candidateToken: string;
  let recruiterToken: string;
  let recruiterCompanyId: string | null = null;
  let testJobId: string;
  let testApplicationId: string;

  const candidateEmail = `candidate_${Date.now()}@test.com`;
  const recruiterEmail = `recruiter_${Date.now()}@test.com`;
  const password = 'Password123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { in: [candidateEmail, recruiterEmail] } },
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.warn('Cleanup warning:', e.message);
      }
    }
    await app.close();
  });

  describe('Auth Flow', () => {
    it('POST /api/auth/register (CANDIDATE)', () => {
      return request(app.getHttpServer() as string)
        .post('/api/auth/register')
        .send({
          email: candidateEmail,
          password: password,
          firstName: 'John',
          lastName: 'Candidate',
          role: UserRole.CANDIDATE,
        })
        .expect(201);
    });

    it('POST /api/auth/register (RECRUITER)', () => {
      return request(app.getHttpServer() as string)
        .post('/api/auth/register')
        .send({
          email: recruiterEmail,
          password: password,
          firstName: 'Jane',
          lastName: 'Recruiter',
          role: UserRole.RECRUITER,
          company: {
            name: 'Test E2E Corp',
            industry: 'QA',
            location: 'Paris',
          },
        })
        .expect(201);
    });

    it('POST /api/auth/login → 200 + token', async () => {
      const candResp = await request(app.getHttpServer() as string)
        .post('/api/auth/login')
        .send({ email: candidateEmail, password: password })
        .expect(200);

      const candBody = candResp.body as AuthResponse;
      candidateToken = candBody.accessToken;

      const recResp = await request(app.getHttpServer() as string)
        .post('/api/auth/login')
        .send({ email: recruiterEmail, password: password })
        .expect(200);

      const recBody = recResp.body as AuthResponse;
      recruiterToken = recBody.accessToken;

      const recruiter = await prisma.recruiterProfile.findFirst({
        where: { user: { email: recruiterEmail } },
      });
      recruiterCompanyId = recruiter?.companyId || null;
    });

    it('POST /api/auth/login (wrong password) → 401', () => {
      return request(app.getHttpServer() as string)
        .post('/api/auth/login')
        .send({ email: candidateEmail, password: 'WrongPassword' })
        .expect(401);
    });
  });

  describe('Jobs Flow', () => {
    it('GET /api/jobs → 200', async () => {
      const resp = await request(app.getHttpServer() as string)
        .get('/api/jobs')
        .expect(200);

      expect(Array.isArray(resp.body)).toBe(true);
    });

    it('POST /api/jobs (as recruiter)', async () => {
      const resp = await request(app.getHttpServer() as string)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Senior E2E Engineer',
          description: 'Help us test our backend automatically',
          location: 'Paris',
          contractType: ContractType.CDI,
          companyId: recruiterCompanyId,
          skills: ['Jest', 'Supertest'],
          isPublished: true,
        });

      expect(resp.status).toBe(201);
      const body = resp.body as CreateResponse;
      testJobId = body.id;
    });

    it('GET /api/jobs/:id → 200', async () => {
      if (!testJobId) return;
      const resp = await request(app.getHttpServer() as string)
        .get(`/api/jobs/${testJobId}`)
        .expect(200);

      const body = resp.body as CreateResponse;
      expect(body.id).toBe(testJobId);
    });
  });

  describe('Applications Flow', () => {
    it('POST /api/applications → 201', async () => {
      if (!testJobId) return;
      const resp = await request(app.getHttpServer() as string)
        .post('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobOfferId: testJobId,
          coverLetter: 'I love writing E2E tests for amazing platforms.',
        });

      expect(resp.status).toBe(201);
      const body = resp.body as CreateResponse;
      testApplicationId = body.id;
    });

    it('GET /api/applications/recruiter → 200', async () => {
      const resp = await request(app.getHttpServer() as string)
        .get('/api/applications/recruiter')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .expect(200);

      expect(Array.isArray(resp.body)).toBe(true);
    });

    it('PATCH /api/applications/:id/status → 200', async () => {
      if (!testApplicationId) return;
      const resp = await request(app.getHttpServer() as string)
        .patch(`/api/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          status: ApplicationStatus.INTERVIEW,
          interviewDate: new Date(Date.now() + 86400000).toISOString(),
          interviewMessage: 'You are selected for an E2E interview',
        })
        .expect(200);

      const body = resp.body as ApplicationUpdateResponse;
      expect(body.status).toBe(ApplicationStatus.INTERVIEW);
    });
  });
});
