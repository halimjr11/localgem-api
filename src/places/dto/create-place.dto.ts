import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreatePlaceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ description: 'Description of the place' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ 
    type: 'string', 
    format: 'binary',
    description: 'Image file of the place' 
  })
  image: any;

  @ApiProperty({ 
    type: [String],
    description: 'Array of tag slugs associated with the place' 
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  tagsSlugs: string[];
}
