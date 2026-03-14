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

  async findAll(query: any) {
    const { title, location, contractType, skills, salaryMin } = query;

    return this.prisma.jobOffer.findMany({
      where: {
        isPublished: true,
        ...(title && {
          title: { contains: title, mode: 'insensitive' },
        }),
        ...(location && {
          location: { contains: location, mode: 'insensitive' },
        }),
        ...(contractType && { contractType }),
        ...(salaryMin && {
          salaryMin: { gte: Number(salaryMin) },
        }),
        ...(skills && skills.length > 0 && {
          skills: { hasSome: Array.isArray(skills) ? skills : [skills] },
        }),
      },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
            location: true,
            industry: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
