import { Controller, Post, Body, UseGuards, Request, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import type { Request as ExpressRequest } from 'express';
import type { AuthUser } from './types';
import { createSuccessResponse } from '../common/interfaces/http-response.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() userData: { email: string; password: string; name: string },
  ) {
    try {
      const user = await this.authService.register(userData);
      return createSuccessResponse(user, 'User registered successfully');
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message || 'Registration failed',
          error: error.response?.message || 'Registration error',
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: ExpressRequest & { user: AuthUser }) {
    try {
      const tokens = await this.authService.login(req.user);
      return createSuccessResponse(tokens, 'Login successful');
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Login failed',
          error: error.message || 'Authentication error',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    try {
      const tokens = await this.authService.refresh(body.refresh_token);
      return createSuccessResponse(tokens, 'Token refreshed successfully');
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Token refresh failed',
          error: 'Invalid or expired refresh token',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
