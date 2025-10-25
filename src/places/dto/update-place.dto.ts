import { PartialType } from '@nestjs/swagger';
import { CreatePlaceDto } from './create-place.dto';
import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';

export class UpdatePlaceDto extends PartialType(CreatePlaceDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagsSlugs?: string[];
}
