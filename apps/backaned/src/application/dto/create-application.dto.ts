import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsUUID()
  jobOfferId: string;

  @IsOptional()
  @IsUUID()
  candidateId?: string;

  @IsOptional()
  @IsString()
  coverLetter?: string;
}
