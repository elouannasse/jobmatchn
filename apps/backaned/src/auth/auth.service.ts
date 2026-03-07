import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, UserRole } from './dto/register.dto';
import { HashingService } from './hashing.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private hashingService: HashingService,
  ) {}

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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
        await tx.recruiterProfile.create({
          data: {
            userId: user.id,
            companyName: 'Ma Compagnie', // Valeur par défaut, à mettre à jour plus tard
          },
        });
      }

      // Ne pas renvoyer le mot de passe
      const userResult: Record<string, any> = { ...user };
      delete userResult.password;

      return userResult;
    });
  }
}
