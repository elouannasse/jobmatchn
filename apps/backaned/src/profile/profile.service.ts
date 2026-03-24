import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        recruiterProfile: {
          include: {
            company: true,
          },
        },
        candidateProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Omit password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        recruiterProfile: true,
        candidateProfile: true 
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const { 
      firstName, 
      lastName, 
      email, 
      companyName, 
      companyDescription, 
      companyIndustry, 
      companyLocation,
      companyLogoUrl,
      title,
      summary,
      location,
      linkedinUrl,
      cvUrl,
      skills,
    } = dto;

    // Update User
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
      },
    });

    // Update Company if recruiter
    if (user.role === 'RECRUITER' && user.recruiterProfile?.companyId) {
      await this.prisma.company.update({
        where: { id: user.recruiterProfile.companyId },
        data: {
          ...(companyName && { name: companyName }),
          ...(companyDescription && { description: companyDescription }),
          ...(companyIndustry && { industry: companyIndustry }),
          ...(companyLocation && { location: companyLocation }),
          ...(companyLogoUrl && { logoUrl: companyLogoUrl }),
        },
      });
    }

    // Update Candidate Profile if candidate
    if (user.role === 'CANDIDATE' && user.candidateProfile?.id) {
      await this.prisma.candidateProfile.update({
        where: { id: user.candidateProfile.id },
        data: {
          ...(title && { title }),
          ...(summary && { summary }),
          ...(location && { location }),
          ...(linkedinUrl && { linkedinUrl }),
          ...(cvUrl && { cvUrl }),
          ...(skills && { skills }),
        },
      });
    }

    return this.getProfile(userId);
  }
}
