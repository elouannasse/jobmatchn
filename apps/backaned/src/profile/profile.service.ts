import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApplicationService } from '../application/application.service';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private applicationService: ApplicationService,
  ) {}

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
    console.log('--- updateProfile Start ---');
    console.log('UserId:', userId);
    console.log('DTO:', dto);

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          recruiterProfile: true,
          candidateProfile: true,
        },
      });

      if (!user) {
        console.error('User not found in updateProfile');
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
        companyId,
      } = dto;

      console.log('Updating Main User fields...');
      // Update User
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(email !== undefined && { email }),
        },
      });

      // Update Company if recruiter
      if (user.role === 'RECRUITER' && user.recruiterProfile?.companyId) {
        console.log('Updating Company info...');
        await this.prisma.company.update({
          where: { id: user.recruiterProfile.companyId },
          data: {
            ...(companyName !== undefined && { name: companyName }),
            ...(companyDescription !== undefined && {
              description: companyDescription,
            }),
            ...(companyIndustry !== undefined && {
              industry: companyIndustry,
            }),
            ...(companyLocation !== undefined && {
              location: companyLocation,
            }),
            ...(companyLogoUrl !== undefined && { logoUrl: companyLogoUrl }),
          },
        });
      }

      // Link Company to Recruiter if companyId is provided
      if (user.role === 'RECRUITER' && companyId) {
        console.log('Linking Company to Recruiter...');
        await this.prisma.recruiterProfile.update({
          where: { userId: userId },
          data: {
            companyId: companyId,
          },
        });
      }

      // Update Candidate Profile if candidate
      if (user.role === 'CANDIDATE' && user.candidateProfile?.id) {
        console.log('Updating Candidate Profile...');
        await this.prisma.candidateProfile.update({
          where: { id: user.candidateProfile.id },
          data: {
            ...(title !== undefined && { title }),
            ...(summary !== undefined && { summary }),
            ...(location !== undefined && { location }),
            ...(linkedinUrl !== undefined && { linkedinUrl }),
            ...(cvUrl !== undefined && { cvUrl }),
            ...(skills !== undefined && { skills }),
          },
        });

        // Recalculation immédiate des scores de matching
        console.log('Triggering score recalculation for candidate...');
        await this.applicationService.recalculateAllCandidateApplicationScores(
          user.candidateProfile.id,
        );
      }

      console.log('Profile updated successfully, returning results...');
      return this.getProfile(userId);
    } catch (error) {
      console.error('Error in ProfileService.updateProfile:', error);
      throw error;
    }
  }
}
