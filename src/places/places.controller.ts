import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
  HttpStatus,
  HttpException,
  NotFoundException,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PlacesService } from './places.service';
import { Place } from './entities/place.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';
import type { AuthUser } from '../auth/types';
import { createSuccessResponse } from '../common/interfaces/http-response.interface';
import { FileStorageService } from '../common/services/file-storage.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';

@Controller('places')
@UseGuards(JwtAuthGuard)
export class PlacesController {
  constructor(
    private readonly placesService: PlacesService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  @Get()
  async findAll(
    @Req() req: ExpressRequest & { user: AuthUser },
    @Query('tags') tags?: string,
  ) {
    try {
      const userId = req.user.id;
      const places = await this.placesService.findAll(Number(userId), tags);
      return createSuccessResponse(places, 'Places retrieved successfully');
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to retrieve places',
          error: error.message || 'Internal server error',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: ExpressRequest & { user: AuthUser },
  ) {
    try {
      const userId = req.user.id;
      const place = await this.placesService.findOne(Number(id), Number(userId));
      if (!place) {
        throw new NotFoundException('Place not found');
      }
      return createSuccessResponse(place, 'Place retrieved successfully');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(
          {
            status: 'error',
            message: error.message,
            error: 'Not Found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to retrieve place',
          error: error.message || 'Internal server error',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
    @Body() body: CreatePlaceDto,
    @Req() req: ExpressRequest & { user: AuthUser },
  ) {
    try {
      const userId = req.user.id;
      if (!body.name || !body.location) {
        throw new BadRequestException('Name and location are required');
      }

      const placeData: Partial<Place> = { ...body };

      if (file) {
        const uploadedFile = await this.fileStorageService.saveFile(file);
        placeData.imageUrl = uploadedFile.path;
      }

      const place = await this.placesService.create(placeData, Number(userId));
      return createSuccessResponse(place, 'Place created successfully');
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException(
          {
            status: 'error',
            message: error.message,
            error: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to create place',
          error: error.message || 'Internal server error',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
    @Body() data: UpdatePlaceDto,
    @Req() req: ExpressRequest & { user: AuthUser },
  ) {
    try {
      const userId = req.user.id;
      const placeData: Partial<Place> = { ...data };

      if (file) {
        const uploadedFile = await this.fileStorageService.saveFile(file);
        placeData.imageUrl = uploadedFile.path;
      }

      const place = await this.placesService.update(
        Number(id),
        placeData,
        Number(userId),
      );
      if (!place) {
        throw new NotFoundException('Place not found or you do not have permission');
      }
      return createSuccessResponse(place, 'Place updated successfully');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(
          {
            status: 'error',
            message: error.message,
            error: 'Not Found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to update place',
          error: error.message || 'Internal server error',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
