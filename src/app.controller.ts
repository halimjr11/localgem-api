import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  getHello() {
    const endpoints = [
      {
        method: 'GET',
        path: '/api/places',
        description: 'Get all places',
        response: {
          success: true,
          data: [
            {
              id: 1,
              name: 'Sample Place',
              description: 'A wonderful place',
              rating: 4.5
            }
          ]
        }
      },
      {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Register a new user',
        request: {
          body: {
            username: 'string',
            email: 'string',
            password: 'string'
          }
        },
        response: {
          success: true,
          message: 'User registered successfully'
        }
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'User login',
        request: {
          body: {
            email: 'string',
            password: 'string'
          }
        },
        response: {
          success: true,
          token: 'jwt.token.here',
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com'
          }
        }
      }
    ];

    return {
      title: 'LocalGem API Documentation',
      currentYear: new Date().getFullYear(),
      endpoints
    };
  }
}
