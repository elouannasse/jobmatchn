import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { MatchingModule } from '../matching/matching.module';
import { AdminJobController } from './admin-job.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [MatchingModule, NotificationModule],
  controllers: [JobController, AdminJobController],
  providers: [JobService],
})
export class JobModule {}
