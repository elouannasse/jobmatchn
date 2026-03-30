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
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { UploadService, UploadResult } from '../upload/upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  getProfile(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    return this.profileService.getProfile(userId);
  }

  @Put()
  updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    const userId = req.user.userId;
    return this.profileService.updateProfile(userId, dto);
  }

  @Post('logo')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB for logos
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              "Format d'image non supporté (JPG, JPEG, PNG uniquement)",
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadLogo(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const uploadResult: UploadResult = await this.uploadService.uploadFile(
      file,
      'logos',
    );

    const userId = req.user.userId;

    return this.profileService.updateProfile(userId, {
      companyLogoUrl: uploadResult.secure_url,
    });
  }

  @Post('cv')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for CV
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype === 'application/pdf' ||
          file.mimetype === 'application/msword' ||
          file.mimetype ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Format de fichier non supporté (PDF, DOC, DOCX uniquement)',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadCv(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    try {
      const uploadResult: UploadResult = await this.uploadService.uploadFile(
        file,
        'cvs',
      );

      const userId = req.user.userId;

      return this.profileService.updateProfile(userId, {
        cvUrl: uploadResult.secure_url,
      });
    } catch (error) {
      console.error('CV Upload Error:', error);
      throw error;
    }
  }
}
