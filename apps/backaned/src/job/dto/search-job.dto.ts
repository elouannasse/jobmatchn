import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ContractType } from '@prisma/client';
import { Type } from 'class-transformer';

export class SearchJobDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @IsOptional()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  salaryMin?: number;
}
