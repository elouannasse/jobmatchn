import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { MatchingService } from '../matching/matching.service';
import { NotificationGateway } from '../notification/notification.gateway';

interface JobQuery {
  title?: string;
  location?: string;
  contractType?: string;
  skills?: string | string[];
  salaryMin?: string | number;
}

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private matchingService: MatchingService,
    private notificationGateway: NotificationGateway,
  ) {}

  async create(userId: string, dto: CreateJobDto, userRole?: string) {
    let recruiterId: string;

    if (userRole === 'ADMIN') {
      // Find a recruiter for the specified company
      const recruiter = await this.prisma.recruiterProfile.findFirst({
        where: { companyId: dto.companyId },
      });

      if (!recruiter) {
        throw new ForbiddenException(
          "Aucun recruteur trouvé pour cette entreprise. L'admin ne peut pas créer d'offre sans recruteur associé.",
        );
      }
      recruiterId = recruiter.id;
    } else {
      const recruiter = await this.prisma.recruiterProfile.findUnique({
        where: { userId },
      });

      if (!recruiter) {
        throw new ForbiddenException('Profil recruteur non trouvé');
      }
      recruiterId = recruiter.id;
    }

    return this.prisma.jobOffer.create({
      data: {
        ...dto,
        recruiterId,
        approvalStatus: dto.isPublished ? 'PENDING' : 'APPROVED',
      },
    });
  }

  async findAll(query: JobQuery, userId?: string) {
    const { title, location, contractType, skills, salaryMin } = query;

    const jobs = await this.prisma.jobOffer.findMany({
      where: {
        isPublished: true,
        approvalStatus: 'APPROVED',
        ...(title && {
          OR: [
            { title: { contains: title, mode: 'insensitive' } },
            { company: { name: { contains: title, mode: 'insensitive' } } },
            { skills: { hasSome: [title] } },
          ],
        }),
        ...(location && {
          location: { contains: location, mode: 'insensitive' },
        }),
        ...(contractType && { contractType: contractType as any }),
        ...(salaryMin && {
          salaryMin: { gte: Number(salaryMin) },
        }),
        ...(skills &&
          Array.isArray(skills) &&
          skills.length > 0 && {
            skills: { hasSome: skills },
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

    // If userId is provided, calculate match score if the user is a candidate
    if (userId) {
      const candidate = await this.prisma.candidateProfile.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (candidate) {
        return (jobs as any[]).map((job) => ({
          ...job,
          matchScore: this.matchingService.calculateComprehensiveScore(
            candidate,
            job,
          ),
        }));
      }
    }

    return jobs;
  }

  async findOne(id: string) {
    const job = await this.prisma.jobOffer.findUnique({
      where: { id },
      include: {
        company: true,
        recruiter: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Offre d'emploi avec l'id ${id} introuvable`);
    }

    return job;
  }

  async update(
    id: string,
    recruiterUserId: string,
    dto: Partial<CreateJobDto>,
    isAdmin = false,
  ) {
    const job = await this.findOne(id);

    if (!isAdmin) {
      const recruiter = await this.prisma.recruiterProfile.findUnique({
        where: { userId: recruiterUserId },
      });

      if (!recruiter || job.recruiterId !== recruiter.id) {
        throw new ForbiddenException(
          "Vous n'avez pas la permission de modifier cette offre",
        );
      }
    }

    return this.prisma.jobOffer.update({
      where: { id },
      data: {
        ...dto,
        // If isPublished is set to true in the update, set to PENDING for review
        ...(dto.isPublished === true && {
          approvalStatus: 'PENDING',
        }),
      },
    });
  }

  async remove(id: string, recruiterUserId: string, isAdmin = false) {
    const job = await this.findOne(id);

    if (!isAdmin) {
      const recruiter = await this.prisma.recruiterProfile.findUnique({
        where: { userId: recruiterUserId },
      });

      if (!recruiter || job.recruiterId !== recruiter.id) {
        throw new ForbiddenException(
          "Vous n'avez pas la permission de supprimer cette offre",
        );
      }
    }

    return this.prisma.jobOffer.delete({
      where: { id },
    });
  }

  async findAllAdmin() {
    return this.prisma.jobOffer.findMany({
      include: {
        company: true,
        _count: {
          select: { applications: true },
        },
        recruiter: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllForRecruiter(userId: string) {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    if (!recruiter) {
      throw new ForbiddenException('Profil recruteur non trouvé');
    }

    return this.prisma.jobOffer.findMany({
      where: { recruiterId: recruiter.id },
      include: {
        company: {
          select: { name: true, logoUrl: true },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPendingAdmin() {
    return this.prisma.jobOffer.findMany({
      where: {
        approvalStatus: 'PENDING',
      },
      include: {
        company: true,
        recruiter: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: string, adminId: string) {
    const job = await this.prisma.jobOffer.findUnique({
      where: { id },
      include: { recruiter: true },
    });

    if (!job) {
      throw new NotFoundException(`Offre d'emploi avec l'id ${id} introuvable`);
    }

    const updatedJob = await this.prisma.jobOffer.update({
      where: { id },
      data: {
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: adminId,
      },
    });

    // Send notification
    this.notificationGateway.sendToUser(job.recruiter.userId, 'notification', {
      type: 'JOB_APPROVED',
      title: 'Offre approuvée ✅',
      message: `Votre offre '${job.title}' a été approuvée ✅`,
      jobId: job.id,
    });

    return updatedJob;
  }

  async reject(id: string, reason: string) {
    const job = await this.prisma.jobOffer.findUnique({
      where: { id },
      include: { recruiter: true },
    });

    if (!job) {
      throw new NotFoundException(`Offre d'emploi avec l'id ${id} introuvable`);
    }

    const updatedJob = await this.prisma.jobOffer.update({
      where: { id },
      data: {
        approvalStatus: 'REJECTED',
        rejectedReason: reason,
        isPublished: false, // Automatically unpublish if rejected
      },
    });

    // Send notification
    this.notificationGateway.sendToUser(job.recruiter.userId, 'notification', {
      type: 'JOB_REJECTED',
      title: 'Offre rejetée ❌',
      message: `Votre offre '${job.title}' a été rejetée ❌\nRaison: ${reason}`,
      jobId: job.id,
      reason,
    });

    return updatedJob;
  }
}
