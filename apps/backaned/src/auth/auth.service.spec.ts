import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { HashingService } from './hashing.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from './dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let hashing: HashingService;
  let jwt: JwtService;
  let mailer: MailerService;

  const mockPrismaService: any = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    passwordReset: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((arg: any): any => {
      if (Array.isArray(arg)) return Promise.resolve(arg);
      return arg(mockPrismaService);
    }),
    candidateProfile: { create: jest.fn() },
    recruiterProfile: { create: jest.fn() },
    company: { create: jest.fn() },
  };

  const mockHashingService = {
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockResolvedValue(true),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock_token'),
  };

  const mockMailerService = {
    sendMail: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: HashingService, useValue: mockHashingService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailerService, useValue: mockMailerService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    hashing = module.get<HashingService>(HashingService);
    jwt = module.get<JwtService>(JwtService);
    mailer = module.get<MailerService>(MailerService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CANDIDATE,
    };

    it('should create a new user with hashed password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user_id',
        ...registerDto,
      });

      const result = await service.register(registerDto);

      expect(hashing.hash).toHaveBeenCalledWith(registerDto.password);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException if email exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };
    const user = {
      id: 'uid',
      email: 'test@example.com',
      password: 'hashed',
      role: 'CANDIDATE',
    };

    it('should return token for valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockHashingService.compare.mockResolvedValue(true);

      const result = await service.login(loginDto);
      expect(result).toEqual({ accessToken: 'mock_token' });
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockHashingService.compare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should generate a token for valid email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'uid',
        firstName: 'John',
      });

      const result = await service.forgotPassword('test@example.com');

      expect(prisma.passwordReset.create).toHaveBeenCalled();
      expect(mailer.sendMail).toHaveBeenCalled();
      expect(result.message).toContain('lien de réinitialisation');
    });
  });

  describe('resetPassword', () => {
    it('should update password for valid token', async () => {
      const resetRecord = {
        id: 'rid',
        email: 'test@example.com',
        expiresAt: new Date(Date.now() + 10000),
      };
      mockPrismaService.passwordReset.findUnique.mockResolvedValue(resetRecord);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'uid',
        email: 'test@example.com',
      });

      const result = await service.resetPassword('valid_token', 'new_pass');

      expect(hashing.hash).toHaveBeenCalledWith('new_pass');
      expect(prisma.user.update).toHaveBeenCalled();
      expect(result.message).toContain('réinitialisé');
    });

    it('should throw error for expired token', async () => {
      const resetRecord = {
        id: 'rid',
        expiresAt: new Date(Date.now() - 10000),
      };
      mockPrismaService.passwordReset.findUnique.mockResolvedValue(resetRecord);

      await expect(service.resetPassword('expired', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
