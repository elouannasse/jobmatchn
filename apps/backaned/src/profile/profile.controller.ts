import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { UploadService } from '../upload/upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  getProfile(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return this.profileService.getProfile(userId);
  }

  @Put()
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return this.profileService.updateProfile(userId, dto);
  }

  @Post('logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    const uploadResult: any = await this.uploadService.uploadFile(file, 'logos');
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    
    return this.profileService.updateProfile(userId, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      companyLogoUrl: uploadResult.secure_url as string,
    });
  }

  @Post('cv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCv(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    const uploadResult: any = await this.uploadService.uploadFile(file, 'cvs');
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    
    return this.profileService.updateProfile(userId, {
      cvUrl: uploadResult.secure_url as string,
    });
  }
}
