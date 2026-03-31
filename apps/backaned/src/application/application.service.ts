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
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private matchingService: MatchingService,
    private notificationGateway: NotificationGateway,
  ) {}

  async create(
    userId: string,
    dto: CreateApplicationDto,
    requesterRole?: string,
  ) {
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

    const applications = await this.prisma.application.findMany({
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

    // Optionnel: recalculer les scores à 0 à la volée pour garantir la fraîcheur
    const updatedApps = await Promise.all(
      applications.map(async (app: any) => {
        if (app.score === 0) {
          // On récupère le profil complet pour le matching
          const fullCandidate = await this.prisma.candidateProfile.findUnique({
            where: { id: candidate.id },
            include: { user: true },
          });
          if (fullCandidate) {
            const score = this.matchingService.calculateComprehensiveScore(
              fullCandidate,
              app.jobOffer,
            );
            return this.prisma.application.update({
              where: { id: app.id },
              data: { score },
              include: {
                jobOffer: {
                  include: {
                    company: { select: { name: true, logoUrl: true } },
                  },
                },
              },
            });
          }
        }
        return app;
      }),
    );

    return updatedApps;
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

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: dto.status,
        interviewDate: dto.interviewDate
          ? new Date(dto.interviewDate)
          : undefined,
        interviewMessage: dto.interviewMessage,
      },
    });

    // Envoyer une notification en temps réel au candidat
    const candidate = application.candidate;
    if (candidate && 'userId' in candidate) {
      const candidateUserId = candidate.userId;
      let message = `Le statut de votre candidature pour "${application.jobOffer.title}" est passé à ${updatedApplication.status}.`;

      if (dto.status === 'INTERVIEW' && dto.interviewDate) {
        const date = new Date(dto.interviewDate);
        message = `Vous avez un entretien pour "${application.jobOffer.title}" le ${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`;
      }

      this.notificationGateway.sendToUser(
        candidateUserId,
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

  async recalculateAllCandidateApplicationScores(candidateId: string) {
    const applications = await this.prisma.application.findMany({
      where: { candidateId },
      include: {
        candidate: { include: { user: true } },
        jobOffer: true,
      },
    });

    for (const app of applications) {
      const newScore = this.matchingService.calculateComprehensiveScore(
        app.candidate,
        app.jobOffer,
      );

      await this.prisma.application.update({
        where: { id: app.id },
        data: { score: newScore },
      });
    }
  }

  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        candidate: { include: { user: true } },
        jobOffer: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Candidature non trouvée');
    }

    // Recalculer si le score est 0 (peut-être calculé avant que le profil soit complet)
    if (application.score === 0) {
      const freshScore = this.matchingService.calculateComprehensiveScore(
        application.candidate,
        application.jobOffer,
      );

      return this.prisma.application.update({
        where: { id },
        data: { score: freshScore },
        include: {
          candidate: { include: { user: true } },
          jobOffer: true,
        },
      });
    }

    return application;
  }
}
