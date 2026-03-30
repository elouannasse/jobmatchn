import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryProvider } from './cloudinary.provider';
import { UploadService } from './upload.service';

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryProvider, UploadService],
  exports: [CloudinaryProvider, UploadService],
})
export class UploadModule {}
