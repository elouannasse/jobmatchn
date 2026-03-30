import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { SearchJobDto } from './dto/search-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  create(@Request() req: any, @Body() dto: CreateJobDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userRole = req.user.role as string;
    return this.jobService.create(userId, dto, userRole);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Query() query: SearchJobDto, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user?.userId as string | undefined;
    return this.jobService.findAll(query, userId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllAdmin() {
    return this.jobService.findAllAdmin();
  }

  @Get('recruiter')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  findAllForRecruiter(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return this.jobService.findAllForRecruiter(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: Partial<CreateJobDto>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.jobService.update(id, userId, dto, isAdmin);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.jobService.remove(id, userId, isAdmin);
  }
}
