import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('global')
  @Roles(UserRole.ADMIN)
  getGlobalStats() {
    return this.statsService.getGlobalStats();
  }

  @Get('growth')
  @Roles(UserRole.ADMIN)
  getGrowth() {
    return this.statsService.getUserGrowth();
  }

  @Get('me')
  @Roles(UserRole.RECRUITER)
  getRecruiterStats(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return this.statsService.getRecruiterStats(userId);
  }

  @Get('me/candidate')
  @Roles(UserRole.CANDIDATE)
  getCandidateStats(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return this.statsService.getCandidateStats(userId);
  }
}
