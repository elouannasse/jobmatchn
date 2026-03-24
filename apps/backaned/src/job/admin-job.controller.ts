import { Controller, Get, Param, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { JobService } from './job.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';

@Controller('admin/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminJobController {
  constructor(private readonly jobService: JobService) {}

  @Get('pending')
  getPendingJobs() {
    return this.jobService.findPendingAdmin();
  }

  @Patch(':id/approve')
  approveJob(@Param('id') id: string, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const adminId = req.user.userId as string;
    return this.jobService.approve(id, adminId);
  }

  @Patch(':id/reject')
  rejectJob(@Param('id') id: string, @Body('reason') reason: string) {
    return this.jobService.reject(id, reason);
  }
}
