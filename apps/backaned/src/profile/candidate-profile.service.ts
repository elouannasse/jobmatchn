import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto';

@Injectable()
export class CandidateProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profil candidat non trouvé');
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateCandidateProfileDto) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profil candidat non trouvé');
    }

    return this.prisma.candidateProfile.update({
      where: { userId },
      data: dto,
    });
  }
}
