import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { MatchingService } from '../matching/matching.service';
import { NotificationGateway } from '../notification/notification.gateway';

@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private matchingService: MatchingService,
    private notificationGateway: NotificationGateway,
  ) {}

  async create(userId: string, dto: CreateApplicationDto, requesterRole?: string) {
    let candidate;

    if (requesterRole === 'ADMIN' && dto.candidateId) {
      candidate = await this.prisma.candidateProfile.findUnique({
        where: { id: dto.candidateId },
        include: { user: true },
      });
    } else {
      candidate = await this.prisma.candidateProfile.findUnique({
        where: { userId },
        include: { user: true },
      });
    }

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

    // Calcul du score de compatibilité
    const score = this.matchingService.calculateComprehensiveScore(
      candidate,
      jobOffer,
    );

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

    try {
      return await this.prisma.application.create({
        data: {
          candidateId: candidate.id,
          jobOfferId: dto.jobOfferId,
          coverLetter: dto.coverLetter,
          score,
        },
      });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Vous avez déjà postulé à cette offre');
      }
      throw error;
    }
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
      orderBy: { createdAt: 'desc' },
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

  async findAllForRecruiter(userId: string) {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    if (!recruiter) {
      throw new ForbiddenException('Profil recruteur non trouvé');
    }

    return this.prisma.application.findMany({
      where: {
        jobOffer: {
          recruiterId: recruiter.id,
        },
      },
      include: {
        jobOffer: {
          select: {
            id: true,
            title: true,
          },
        },
        candidate: {
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
      orderBy: { createdAt: 'desc' },
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
    isAdmin = false,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobOffer: { include: { recruiter: true } },
        candidate: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Candidature non trouvée');
    }

    if (!isAdmin && application.jobOffer.recruiter.userId !== recruiterUserId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier cette candidature",
      );
    }

    const updateData: any = { 
      status: dto.status,
      interviewDate: dto.interviewDate ? new Date(dto.interviewDate) : undefined,
      interviewMessage: dto.interviewMessage,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: updateData,
    }) as any;

    // Envoyer une notification en temps réel au candidat
    const candidate = application.candidate as { userId: string } | null;
    if (candidate) {
      let message = `Le statut de votre candidature pour "${application.jobOffer.title}" est passé à ${updatedApplication.status}.`;
      
      if (dto.status === 'INTERVIEW' && dto.interviewDate) {
        const date = new Date(dto.interviewDate);
        message = `Vous avez un entretien pour "${application.jobOffer.title}" le ${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`;
      }

      this.notificationGateway.sendToUser(
        candidate.userId,
        'application_status_updated',
        {
          applicationId: updatedApplication.id,
          status: updatedApplication.status,
          jobTitle: application.jobOffer.title,
          message,
          interviewDate: updatedApplication.interviewDate,
          interviewMessage: updatedApplication.interviewMessage,
        },
      );
    }

    return updatedApplication;
  }

  async findAll() {
    return this.prisma.application.findMany({
      include: {
        jobOffer: {
          include: {
            company: { select: { name: true, logoUrl: true } },
          },
        },
        candidate: {
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

  async remove(id: string, recruiterUserId: string, isAdmin = false) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        jobOffer: { include: { recruiter: true } },
      },
    });

    if (!application) {
      throw new NotFoundException('Candidature non trouvée');
    }

    if (!isAdmin && application.jobOffer.recruiter.userId !== recruiterUserId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à supprimer cette candidature",
      );
    }

    return this.prisma.application.delete({
      where: { id },
    });
  }
}
