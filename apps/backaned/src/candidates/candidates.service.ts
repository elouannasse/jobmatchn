import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.candidateProfile.findMany({
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
        },
        applications: true,
      },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidat avec l'id ${id} introuvable`);
    }

    return candidate;
  }

  async create(dto: CreateCandidateDto) {
    const { email, password, firstName, lastName, ...profileData } = dto;
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.candidateProfile.create({
      data: {
        ...profileData,
        user: {
          create: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: 'CANDIDATE',
          },
        },
      },
      include: {
        user: true,
      },
    });
  }

  async update(id: string, dto: UpdateCandidateDto) {
    await this.findOne(id);

    return this.prisma.candidateProfile.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.candidateProfile.delete({
      where: { id },
    });
  }
}
