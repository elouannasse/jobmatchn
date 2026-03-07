import { Injectable, ForbiddenException } from '@nestjs/common';
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

    return this.prisma.jobOffer.create({
      data: {
        ...dto,
        recruiterId: recruiter.id,
      },
    });
  }
}
