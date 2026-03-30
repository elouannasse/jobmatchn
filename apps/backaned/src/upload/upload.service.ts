import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadResult {
  secure_url: string;
  [key: string]: any;
}

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadResult> {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');

    // Fallback to local storage if Cloudinary is NOT configured
    if (!cloudName) {
      console.log('--- Using Local Storage Fallback ---');
      try {
        if (!file.buffer) {
          console.error('File Buffer is empty! Multer might be misconfigured.');
          throw new BadRequestException('Le contenu du fichier est vide');
        }

        const uploadDir = path.join(process.cwd(), 'uploads', folder);
        console.log('Target Directory:', uploadDir);

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
          console.log('Directory created successfully');
        }

        const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const filePath = path.join(uploadDir, fileName);
        console.log('Target File Path:', filePath);

        fs.writeFileSync(filePath, file.buffer);
        console.log('File written to disk successfully');

        const port = process.env.PORT || 4000;
        const localUrl = `http://localhost:${port}/uploads/${folder}/${fileName}`;

        return { secure_url: localUrl };
      } catch (localError: unknown) {
        console.error('Local Upload Failed:', localError);
        const errorMessage =
          localError instanceof Error ? localError.message : String(localError);
        throw new Error(`Échec de l'upload local: ${errorMessage}`);
      }
    }

    // Cloudinary Logic
    console.log('--- Using Cloudinary ---');
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, uploadResult) => {
          if (error) {
            console.error('Cloudinary Stream Error:', error);
            return reject(new Error(error.message));
          }
          if (!uploadResult) {
            return reject(new BadRequestException('Upload failed'));
          }
          resolve(uploadResult);
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }
}
