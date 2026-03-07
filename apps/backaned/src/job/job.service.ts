import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}

  async create(recruiterUserId: string, dto: CreateJobDto) {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId: recruiterUserId },
    });

    if (!recruiter) {
      throw new ForbiddenException('Profil recruteur non trouvé');
    }

    if (recruiter.companyId !== dto.companyId) {
      throw new ForbiddenException(
        'Vous ne pouvez créer des offres que pour votre entreprise',
      );
    }

    return this.prisma.job.create({
      data: {
        ...dto,
        recruiterId: recruiter.id,
      },
    });
  }

  async findAll() {
    return this.prisma.job.findMany({
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
          },
        },
      },
      where: {
        isPublished: true,
      },
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        recruiter: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Offre d'emploi avec l'ID ${id} non trouvée`);
    }

    return job;
  }
}
