import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  NotFoundException,
  Post,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './dto/register.dto';
import { NotificationGateway } from '../notification/notification.gateway';
import { HashingService } from './hashing.service';
import { Prisma } from '@prisma/client';

interface CreateUserDto {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  company?: string;
  phone?: string;
}

interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  companyId?: string;
  phone?: string;
  status?: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(
    private prisma: PrismaService,
    private readonly notificationGateway: NotificationGateway,
    private readonly hashingService: HashingService,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const { email, password, firstName, lastName, role, company, phone } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const hashedPassword = await this.hashingService.hash(
      password || 'JobMatchn2026',
    );

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: role as any,
        },
      });

      if (role === UserRole.RECRUITER) {
        // Find or create company if company name is provided
        let companyId = null;
        if (company) {
          const comp = await tx.company.findFirst({ where: { name: company } });
          if (comp) {
            companyId = comp.id;
          } else {
            const newComp = await tx.company.create({
              data: { name: company },
            });
            companyId = newComp.id;
          }
        }

        await tx.recruiterProfile.create({
          data: {
            userId: user.id,
            companyId,
            phone,
            isApproved: true,
            approvedAt: new Date(),
          },
        });
      } else if (role === UserRole.CANDIDATE) {
        await tx.candidateProfile.create({
          data: {
            userId: user.id,
          },
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    });
  }

  @Get()
  async findAll(
    @Query('role') role?: string,
    @Query('isApproved') isApproved?: string,
  ) {
    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (isApproved !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.recruiterProfile = {
        isApproved: isApproved === 'true',
      };
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        recruiterProfile: {
          select: {
            isApproved: true,
            phone: true,
            company: {
              select: {
                name: true,
                industry: true,
                location: true,
                website: true,
                description: true,
              },
            },
          },
        },
        candidateProfile: true,
      },
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const { firstName, lastName, email, companyId, phone, status } = dto;

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update User basic info
      const user = await tx.user.update({
        where: { id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email && { email }),
        },
      });

      if (user.role === (UserRole.RECRUITER as any)) {
        // Update or create RecruiterProfile
        await tx.recruiterProfile.upsert({
          where: { userId: id },
          create: {
            userId: id,
            companyId: companyId || null,
            phone: phone || null,
            isApproved: status === 'ACTIVE',
          },
          update: {
            companyId: companyId || null,
            phone: phone || null,
            isApproved: status === 'ACTIVE',
          },
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    });
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { recruiterProfile: true },
    });

    if (
      !user ||
      user.role !== (UserRole.RECRUITER as any) ||
      !user.recruiterProfile
    ) {
      throw new NotFoundException('Recruteur non trouvé');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await (this.prisma as any).recruiterProfile.update({
      where: { userId: id },
      data: {
        isApproved: true,
        approvedAt: new Date(),
      },
    });

    this.notificationGateway.sendToUser(id, 'recruiter_approved', {
      message: 'Votre compte recruteur a été approuvé !',
    });

    return { success: true };
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string, @Body('reason') reason: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { recruiterProfile: true },
    });

    if (
      !user ||
      user.role !== (UserRole.RECRUITER as any) ||
      !user.recruiterProfile
    ) {
      throw new NotFoundException('Recruteur non trouvé');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await (this.prisma as any).recruiterProfile.update({
      where: { userId: id },
      data: {
        isApproved: false,
        rejectedReason: reason,
      },
    });

    this.notificationGateway.sendToUser(id, 'recruiter_rejected', {
      message: 'Votre compte recruteur a été refusé.',
      reason,
    });

    return { success: true };
  }
}
