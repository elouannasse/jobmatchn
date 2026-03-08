import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateApplicationDto) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidate) {
      throw new ForbiddenException('Profil candidat non trouvé');
    }

    // Vérifier si l'offre existe
    const jobOffer = await this.prisma.jobOffer.findUnique({
      where: { id: dto.jobOfferId },
    });

    if (!jobOffer) {
      throw new NotFoundException("Offre d'emploi non trouvée");
    }

    // Vérifier si le candidat a déjà postulé
    const existingApplication = await this.prisma.application.findUnique({
      where: {
        candidateId_jobOfferId: {
          candidateId: candidate.id,
          jobOfferId: dto.jobOfferId,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('Vous avez déjà postulé à cette offre');
    }

    return this.prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobOfferId: dto.jobOfferId,
        coverLetter: dto.coverLetter,
      },
    });
  }

  async findMyApplications(userId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidate) {
      throw new ForbiddenException('Profil candidat non trouvé');
    }

    return this.prisma.application.findMany({
      where: { candidateId: candidate.id },
      include: {
        jobOffer: {
          include: {
            company: {
              select: { name: true, logoUrl: true },
            },
          },
        },
      },
    });
  }

  async findByJob(jobId: string, recruiterUserId: string) {
    const jobOffer = await this.prisma.jobOffer.findUnique({
      where: { id: jobId },
      include: { recruiter: true },
    });

    if (!jobOffer) {
      throw new NotFoundException("Offre d'emploi non trouvée");
    }

    if (jobOffer.recruiter.userId !== recruiterUserId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à voir les candidatures de cette offre",
      );
    }

    return this.prisma.application.findMany({
      where: { jobOfferId: jobId },
      include: {
        candidate: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });
  }

  async updateStatus(
    applicationId: string,
    recruiterUserId: string,
    dto: UpdateApplicationStatusDto,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { jobOffer: { include: { recruiter: true } } },
    });

    if (!application) {
      throw new NotFoundException('Candidature non trouvée');
    }

    if (application.jobOffer.recruiter.userId !== recruiterUserId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier cette candidature",
      );
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: dto.status },
    });
  }
}
