import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsUUID()
  jobOfferId: string;

  @IsOptional()
  @IsString()
  coverLetter?: string;
}
