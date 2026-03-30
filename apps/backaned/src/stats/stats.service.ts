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
      totalRecruiters,
      totalPendingRecruiters,
      totalPendingJobs,
      statusDistribution,
      averageScore,
    ] = await Promise.all([
      this.prisma.jobOffer.count(),
      this.prisma.application.count(),
      this.prisma.candidateProfile.count(),
      this.prisma.company.count(),
      this.prisma.user.count({ where: { role: 'RECRUITER' } }),
      this.prisma.recruiterProfile.count({ where: { isApproved: false } }),
      this.prisma.jobOffer.count({ where: { approvalStatus: 'PENDING' } }),
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
      totalRecruiters,
      totalPendingRecruiters,
      totalPendingJobs,
      statusDistribution: statusDistribution.map(
        (item: { status: ApplicationStatus; _count: { id: number } }) => ({
          status: item.status,
          count: item._count.id,
        }),
      ),
      averageScore: Math.round(averageScore._avg.score || 0),
    };
  }

  async getUserGrowth() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const users = await this.prisma.user.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by month
    const growth = users.reduce(
      (acc: Record<string, number>, user) => {
        const month = user.createdAt.toLocaleString('default', {
          month: 'short',
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(growth).map(([month, count]) => ({
      month,
      users: count,
    }));
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

    const [myJobs, totalApps, statusStats] = await Promise.all([
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
      this.prisma.application.groupBy({
        by: ['status'],
        where: {
          jobOffer: {
            recruiterId: recruiter.id,
          },
        },
        _count: {
          id: true,
        },
      }),
    ]);

    // Monthly applications for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyApps = await this.prisma.application.findMany({
      where: {
        jobOffer: {
          recruiterId: recruiter.id,
        },
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        createdAt: true,
      },
    });

    const growth = monthlyApps.reduce(
      (acc: Record<string, number>, app) => {
        const month = app.createdAt.toLocaleString('default', {
          month: 'short',
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const monthlyData = Object.entries(growth).map(([month, count]) => ({
      month,
      applications: count,
    }));

    return {
      myJobs,
      totalApplicationsReceived: totalApps,
      statusDistribution: statusStats.map(
        (item: { status: ApplicationStatus; _count: { id: number } }) => ({
          status: item.status,
          count: item._count.id,
        }),
      ),
      monthlyApplications: monthlyData,
    };
  }

  async getCandidateStats(userId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidate) {
      return {
        totalApplications: 0,
        statusDistribution: [],
        recentApplications: [],
      };
    }

    const [totalApps, statusStats, recentApps] = await Promise.all([
      this.prisma.application.count({
        where: { candidateId: candidate.id },
      }),
      this.prisma.application.groupBy({
        by: ['status'],
        where: { candidateId: candidate.id },
        _count: {
          id: true,
        },
      }),
      this.prisma.application.findMany({
        where: { candidateId: candidate.id },
        take: 5,
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
      }),
    ]);

    return {
      totalApplications: totalApps,
      statusDistribution: statusStats.map(
        (item: { status: ApplicationStatus; _count: { id: number } }) => ({
          status: item.status,
          count: item._count.id,
        }),
      ),
      recentApplications: recentApps,
    };
  }
}
