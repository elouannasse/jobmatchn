import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingCronService } from './matching-cron.service';

@Module({
  providers: [MatchingService, MatchingCronService],
  exports: [MatchingService],
})
export class MatchingModule {}
