import { Body, Controller, Get, Param, Patch, Query, UseGuards, NotFoundException, Post, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './dto/register.dto';
import { NotificationGateway } from '../notification/notification.gateway';
import { HashingService } from './hashing.service';

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
  async create(@Body() dto: any) {
    const { email, password, firstName, lastName, role, company, phone } = dto;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const hashedPassword = await this.hashingService.hash(password);

    return this.prisma.$transaction(async (tx) => {
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
            const newComp = await tx.company.create({ data: { name: company } });
            companyId = newComp.id;
          }
        }

        await tx.recruiterProfile.create({
          data: {
            userId: user.id,
            companyId,
            // @ts-ignore
            phone,
            // @ts-ignore
            isApproved: true,
            // @ts-ignore
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
  async findAll(@Query('role') role?: string, @Query('isApproved') isApproved?: string) {
    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (isApproved !== undefined) {
      where.recruiterProfile = {
        // @ts-ignore
        isApproved: isApproved === 'true',
      };
    }

    const users = await this.prisma.user.findMany({
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
            // @ts-ignore
            isApproved: true,
            phone: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
        candidateProfile: true,
      },
    });

    return users;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    const { firstName, lastName, email, role, companyId, phone, status } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Update User basic info
      const user = await tx.user.update({
        where: { id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email && { email }),
        },
      });

      if (user.role === UserRole.RECRUITER) {
        // Update or create RecruiterProfile
        await tx.recruiterProfile.upsert({
          where: { userId: id },
          create: {
            userId: id,
            companyId: companyId || null,
            // @ts-ignore
            phone: phone || null,
            // @ts-ignore
            isApproved: status === 'ACTIVE',
          },
          update: {
            companyId: companyId || null,
            // @ts-ignore
            phone: phone || null,
            // @ts-ignore
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

    if (!user || user.role !== UserRole.RECRUITER || !user.recruiterProfile) {
      throw new NotFoundException('Recruteur non trouvé');
    }

    await this.prisma.recruiterProfile.update({
      where: { userId: id },
      data: {
        // @ts-ignore
        isApproved: true,
        // @ts-ignore
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

    if (!user || user.role !== UserRole.RECRUITER || !user.recruiterProfile) {
      throw new NotFoundException('Recruteur non trouvé');
    }

    await this.prisma.recruiterProfile.update({
      where: { userId: id },
      data: {
        // @ts-ignore
        isApproved: false,
        // @ts-ignore
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
