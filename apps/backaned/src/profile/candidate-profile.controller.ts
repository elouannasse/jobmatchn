import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CandidateProfileService } from './candidate-profile.service';
import { UploadService } from '../upload/upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';
import { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto';

@Controller('profile/candidate')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CANDIDATE)
export class CandidateProfileController {
  constructor(
    private readonly candidateProfileService: CandidateProfileService,
    private readonly uploadService: UploadService,
  ) {}

  @Get('me')
  getProfile(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return this.candidateProfileService.getProfile(userId);
  }

  @Patch('me')
  updateProfile(@Request() req: any, @Body() dto: UpdateCandidateProfileDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return this.candidateProfileService.updateProfile(userId, dto);
  }

  @Post('upload-cv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCv(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;

    const uploadResult: any = await this.uploadService.uploadFile(file, 'cvs');

    return this.candidateProfileService.updateProfile(userId, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      cvUrl: uploadResult.secure_url as string,
    });
  }
}
