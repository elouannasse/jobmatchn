import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getGlobalStats() {
    const [
      totalJobs,
      totalApplications,
      totalCandidates,
      totalCompanies,
      statusDistribution,
      averageScore,
    ] = await Promise.all([
      this.prisma.jobOffer.count(),
      this.prisma.application.count(),
      this.prisma.candidateProfile.count(),
      this.prisma.company.count(),
      this.prisma.application.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      }),
      this.prisma.application.aggregate({
        _avg: {
          score: true,
        },
      }),
    ]);

    return {
      totalJobs,
      totalApplications,
      totalCandidates,
      totalCompanies,
      statusDistribution: statusDistribution.map(
        (item: { status: ApplicationStatus; _count: { id: number } }) => ({
          status: item.status,
          count: item._count.id,
        }),
      ),
      averageScore: Math.round(averageScore._avg.score || 0),
    };
  }

  async getRecruiterStats(userId: string) {
    const recruiter = await this.prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    if (!recruiter) {
      return {
        myJobs: 0,
        totalApplicationsReceived: 0,
        statusDistribution: [],
      };
    }

    const [myJobs, totalApps] = await Promise.all([
      this.prisma.jobOffer.count({
        where: { recruiterId: recruiter.id },
      }),
      this.prisma.application.count({
        where: {
          jobOffer: {
            recruiterId: recruiter.id,
          },
        },
      }),
    ]);

    const statusStats = await this.prisma.application.groupBy({
      by: ['status'],
      where: {
        jobOffer: {
          recruiterId: recruiter.id,
        },
      },
      _count: {
        id: true,
      },
    });

    return {
      myJobs,
      totalApplicationsReceived: totalApps,
      statusDistribution: statusStats.map(
        (item: { status: ApplicationStatus; _count: { id: number } }) => ({
          status: item.status,
          count: item._count.id,
        }),
      ),
    };
  }
}
