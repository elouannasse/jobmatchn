import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationService } from './application.service';
import { PrismaService } from '../prisma/prisma.service';
import { MatchingService } from '../matching/matching.service';
import { NotificationGateway } from '../notification/notification.gateway';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let prisma: PrismaService;
  let matching: MatchingService;

  const mockPrismaService = {
    candidateProfile: { findUnique: jest.fn() },
    jobOffer: { findUnique: jest.fn() },
    application: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    recruiterProfile: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  };

  const mockMatchingService = {
    calculateComprehensiveScore: jest.fn().mockReturnValue(85),
  };

  const mockNotificationGateway = {
    sendToUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MatchingService, useValue: mockMatchingService },
        { provide: NotificationGateway, useValue: mockNotificationGateway },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
    prisma = module.get<PrismaService>(PrismaService);
    matching = module.get<MatchingService>(MatchingService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = 'user_abc';
    const dto = { jobOfferId: 'job_123', coverLetter: 'Hello' };
    const candidate = { id: 'cand_123', userId };
    const jobOffer = { id: 'job_123' };

    it('should create an application successfully', async () => {
      mockPrismaService.candidateProfile.findUnique.mockResolvedValue(
        candidate,
      );
      mockPrismaService.jobOffer.findUnique.mockResolvedValue(jobOffer);
      mockPrismaService.application.findUnique.mockResolvedValue(null);
      mockPrismaService.application.create.mockResolvedValue({
        id: 'app_1',
        score: 85,
        ...dto,
      });

      const result = await service.create(userId, dto);

      expect(matching.calculateComprehensiveScore).toHaveBeenCalled();
      expect(prisma.application.create).toHaveBeenCalled();
      expect(result.score).toBe(85);
    });

    it('should throw ConflictException if candidate already applied', async () => {
      mockPrismaService.candidateProfile.findUnique.mockResolvedValue(
        candidate,
      );
      mockPrismaService.jobOffer.findUnique.mockResolvedValue(jobOffer);
      mockPrismaService.application.findUnique.mockResolvedValue({
        id: 'existing',
      });

      await expect(service.create(userId, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ForbiddenException if candidate profile not found', async () => {
      mockPrismaService.candidateProfile.findUnique.mockResolvedValue(null);
      await expect(service.create(userId, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateStatus', () => {
    const appId = 'app_1';
    const recruiterUserId = 'rec_1';
    const application = {
      id: appId,
      jobOffer: { title: 'JS Dev', recruiter: { userId: recruiterUserId } },
      candidate: { userId: 'cand_1' },
    };
    const updateDto = {
      status: 'INTERVIEW' as any,
      interviewDate: '2026-05-01T10:00:00Z',
      interviewMessage: 'See you',
    };

    it('should update status and send notification', async () => {
      mockPrismaService.application.findUnique.mockResolvedValue(application);
      mockPrismaService.application.update.mockResolvedValue({
        id: appId,
        status: 'INTERVIEW',
      });

      const result = await service.updateStatus(
        appId,
        recruiterUserId,
        updateDto,
      );

      expect(prisma.application.update).toHaveBeenCalled();
      expect(mockNotificationGateway.sendToUser).toHaveBeenCalled();
      expect(result.status).toBe('INTERVIEW');
    });

    it('should throw ForbiddenException if recruiter is not correctly associated', async () => {
      mockPrismaService.application.findUnique.mockResolvedValue(application);
      await expect(
        service.updateStatus(appId, 'wrong_recruiter_id', updateDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if application not found', async () => {
      mockPrismaService.application.findUnique.mockResolvedValue(null);
      await expect(
        service.updateStatus(appId, recruiterUserId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
