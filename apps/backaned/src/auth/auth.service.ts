import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, UserRole } from './dto/register.dto';
import { HashingService } from './hashing.service';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { MailerService } from '@nestjs-modules/mailer';
import * as crypto from 'crypto';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private hashingService: HashingService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { recruiterProfile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await this.hashingService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      isApproved:
        user.role === (UserRole.RECRUITER as any)
          ? user.recruiterProfile?.isApproved
          : true,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async register(dto: RegisterDto) {
    const { email, password, firstName, lastName, role } = dto;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Hacher le mot de passe
    const hashedPassword = await this.hashingService.hash(password);

    // Créer l'utilisateur et son profil dans une transaction
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: role as any,
        },
      });

      if (role === UserRole.CANDIDATE) {
        await tx.candidateProfile.create({
          data: {
            userId: user.id,
          },
        });
      } else if (role === UserRole.RECRUITER) {
        let companyId = null;

        if (dto.company) {
          const company = await tx.company.create({
            data: {
              name: dto.company.name,
              industry: dto.company.industry,
              location: dto.company.location,
              website: dto.company.website,
              description: dto.company.description,
            },
          });
          companyId = company.id;
        }

        await tx.recruiterProfile.create({
          data: {
            userId: user.id,
            companyId,
            isApproved: false,
          },
        });
      }

      // Ne pas renvoyer le mot de passe
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userResult } = user;
      return userResult;
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    const isPasswordValid = await this.hashingService.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    const hashedPassword = await this.hashingService.hash(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Mot de passe mis à jour avec succès' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Pour des raisons de sécurité, on ne dit pas si l'email existe ou non
      return {
        message:
          'Si cet email correspond à un compte, un lien de réinitialisation sera envoyé.',
      };
    }

    // Supprimer les anciens tokens pour cet email
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await (this.prisma as any).passwordReset.deleteMany({
      where: { email },
    });

    // Générer un token sécurisé
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 heure

    // Sauvegarder le token
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await (this.prisma as any).passwordReset.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // Lien de réinitialisation
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    // Ici on envoie un email réel
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Réinitialisation de votre mot de passe JobMatchn',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2563eb; text-align: center;">Réinitialisation de mot de passe</h2>
            <p>Bonjour <strong>${user.firstName}</strong>,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe sur JobMatchn. Cliquez sur le bouton ci-dessous pour procéder :</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Réinitialiser mon mot de passe</a>
            </div>
            <p style="color: #666; font-size: 14px;">Ce lien est disponible pendant <strong>1 heure</strong>. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">L'équipe JobMatchn</p>
          </div>
        `,
      });
      console.log(`[AUTH] REAL Email sent to ${email}`);
    } catch (error) {
      console.error(`[AUTH] Failed to send email to ${email}:`, error);
    }

    // Backup console log
    console.log(`[AUTH] Reset Link for ${email}: ${resetLink}`);

    return {
      message:
        'Si cet email correspond à un compte, un lien de réinitialisation sera envoyé.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    // Vérifier le token
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const passwordReset = await (this.prisma as any).passwordReset.findUnique({
      where: { token },
    });

    if (!passwordReset) {
      throw new UnauthorizedException('Lien de réinitialisation invalide');
    }

    // Vérifier l'expiration
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (new Date() > (passwordReset.expiresAt as Date)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await (this.prisma as any).passwordReset.delete({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        where: { id: passwordReset.id as string },
      });
      throw new UnauthorizedException('Lien de réinitialisation expiré');
    }

    // Trouver l'utilisateur
    const user = await this.prisma.user.findUnique({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where: { email: passwordReset.email as string },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await this.hashingService.hash(newPassword);

    // Mettre à jour et supprimer le token dans une transaction
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      (this.prisma as any).passwordReset.delete({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        where: { id: passwordReset.id as string },
      }),
    ]);

    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}
