import { Module } from '@nestjs/common';
import { CandidateProfileController } from './candidate-profile.controller';
import { CandidateProfileService } from './candidate-profile.service';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UploadModule } from '../upload/upload.module';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [UploadModule, ApplicationModule],
  controllers: [CandidateProfileController, ProfileController],
  providers: [CandidateProfileService, ProfileService],
  exports: [CandidateProfileService, ProfileService],
})
export class ProfileModule {}
