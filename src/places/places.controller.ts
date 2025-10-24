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
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { Place } from './entities/place.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';
import type { AuthUser } from '../auth/types';

@Controller('places')
@UseGuards(JwtAuthGuard)
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  findAll(
    @Req() req: ExpressRequest & { user: AuthUser },
    @Query('tags') tags?: string,
  ): Promise<Place[]> {
    const userId = req.user.id;
    return this.placesService.findAll(Number(userId), tags);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: ExpressRequest & { user: AuthUser },
  ): Promise<Place> {
    const userId = req.user.id;
    return this.placesService.findOne(Number(id), Number(userId));
  }

  @Post()
  create(
    @Body() body: Partial<Place>,
    @Req() req: ExpressRequest & { user: AuthUser },
  ): Promise<Place> {
    const userId = req.user.id;
    return this.placesService.create(body, Number(userId));
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<Place>,
    @Req() req: ExpressRequest & { user: AuthUser },
  ): Promise<Place> {
    const userId = req.user.id;
    return this.placesService.update(Number(id), body, Number(userId));
  }
}
