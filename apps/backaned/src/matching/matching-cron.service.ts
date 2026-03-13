import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MatchingService } from './matching.service';

@Injectable()
export class MatchingCronService {
  private readonly logger = new Logger(MatchingCronService.name);

  constructor(
    private prisma: PrismaService,
    private matchingService: MatchingService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleScoreRecalculation() {
    this.logger.log('Début du recalcul automatique des scores...');

    // On récupère toutes les candidatures avec les skills du candidat et de l'offre
    const applications = await this.prisma.application.findMany({
      include: {
        candidate: {
          select: { skills: true },
        },
        jobOffer: {
          select: { skills: true },
        },
      },
    });

    let updatedCount = 0;

    for (const app of applications) {
      const newScore = this.matchingService.calculateScore(
        app.candidate.skills,
        app.jobOffer.skills,
      );

      // On ne met à jour que si le score a changé
      if (newScore !== app.score) {
        await this.prisma.application.update({
          where: { id: app.id },
          data: { score: newScore },
        });
        updatedCount++;
      }
    }

    this.logger.log(
      `Recalcul terminé. ${updatedCount} scores ont été mis à jour sur ${applications.length} candidatures.`,
    );
  }
}
