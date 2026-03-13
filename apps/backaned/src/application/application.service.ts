import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async updateStatus(
    applicationId: string,
    recruiterUserId: string,
    dto: UpdateApplicationStatusDto,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobOffer: {
          include: {
            recruiter: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Candidature non trouvée');
    }

    // Vérifier que c'est bien le recruteur proprétaire de l'offre qui modifie le statut
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
