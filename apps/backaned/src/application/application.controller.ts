import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @Roles(UserRole.CANDIDATE)
  create(@Request() req: any, @Body() dto: CreateApplicationDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return this.applicationService.create(userId, dto);
  }

  @Get('my')
  @Roles(UserRole.CANDIDATE)
  findMyApplications(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return this.applicationService.findMyApplications(userId);
  }

  @Get('recruiter')
  @Roles(UserRole.RECRUITER)
  findForRecruiter(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return this.applicationService.findAllForRecruiter(userId);
  }

  @Get('job/:jobId')
  @Roles(UserRole.RECRUITER)
  findByJob(@Param('jobId') jobId: string, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return this.applicationService.findByJob(jobId, userId);
  }

  @Patch(':id/status')
  @Roles(UserRole.RECRUITER)
  updateStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return this.applicationService.updateStatus(id, userId, dto);
  }
}
