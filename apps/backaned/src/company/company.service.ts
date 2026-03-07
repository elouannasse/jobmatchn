import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.company.findMany();
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        recruiters: true,
        jobs: true,
      },
    });

    if (!company) {
      throw new NotFoundException(`Entreprise avec l'ID ${id} non trouvée`);
    }

    return company;
  }
}
