import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';

interface Endpoint {
  method: string;
  path: string;
  description: string;
  request?: {
    body?: any;
    query?: any;
    params?: any;
    headers?: any;
  };
  response: any;
}

@ApiExcludeController()
@Controller()
export class DocsController {
  @Get(['/', '/docs'])
  getDocs(@Res() res: Response) {
    const endpoints: Endpoint[] = [
      {
        method: 'POST',
        path: '/auth/register',
        description: 'Register a new user',
        request: {
          body: {
            username: 'string',
            password: 'string',
            email: 'string',
          },
        },
        response: {
          status: 'success',
          message: 'User registered successfully',
          data: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
          },
        },
      },
      {
        method: 'POST',
        path: '/auth/login',
        description: 'Login user',
        request: {
          body: {
            email: 'string',
            password: 'string',
          },
        },
        response: {
          status: 'success',
          message: 'Login successful',
          data: {
            access_token: 'jwt.token.here',
            refresh_token: 'refresh.token.here',
            user: {
              id: 1,
              email: 'user@example.com',
              name: 'John Doe',
            },
          },
        },
      },
      {
        method: 'POST',
        path: '/auth/refresh',
        description: 'Refresh access token using refresh token',
        request: {
          body: {
            refresh_token: 'refresh.token.here',
          },
        },
        response: {
          status: 'success',
          message: 'Token refreshed successfully',
          data: {
            access_token: 'new.jwt.token.here',
            refresh_token: 'new.refresh.token.here',
          },
        },
      },
      {
        method: 'GET',
        path: '/places',
        description: 'Get all places',
        response: {
          status: 'success',
          message: 'Places retrieved successfully',
          data: [
            {
              id: 1,
              name: 'Place 1',
              location: 'Location 1',
            },
          ],
        },
      },
      {
        method: 'GET',
        path: '/places/:id',
        description: 'Get a single place by ID',
        request: {
          params: {
            id: 'number',
          },
        },
        response: {
          status: 'success',
          message: 'Place retrieved successfully',
          data: {
            id: 1,
            name: 'Beautiful Beach',
            location: 'Bali, Indonesia',
            description: 'A beautiful beach with white sand',
            imageUrl: '/uploads/1234567890-beach.jpg',
            latitude: -8.4095,
            longitude: 115.1889,
            tagsSlugs: ['beach', 'vacation'],
            userId: 1,
            avgRating: 4.5,
            reviewsCount: 2,
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          },
        },
      },
      {
        method: 'POST',
        path: '/places',
        description: 'Create a new place',
        request: {
          body: {
            name: 'string',
            location: 'string',
          },
        },
        response: {
          status: 'success',
          message: 'Place created successfully',
          data: {
            id: 1,
            name: 'Beautiful Beach',
            location: 'Bali, Indonesia',
            description: 'A beautiful beach with white sand',
            imageUrl: '/uploads/1234567890-beach.jpg',
            latitude: -8.4095,
            longitude: 115.1889,
            tagsSlugs: ['beach', 'vacation'],
            userId: 1,
            avgRating: 4.5,
            reviewsCount: 10,
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          },
        },
      },
      {
        method: 'PUT',
        path: '/places/:id',
        description: 'Update a place',
        request: {
          params: {
            id: 'number',
          },
          body: {
            name: 'string',
            location: 'string',
            description: 'string',
            image: 'File (image/*, max 5MB)',
            latitude: 'number',
            longitude: 'number',
            tagsSlugs: 'string[] (array of tag slugs)',
          },
        },
        response: {
          status: 'success',
          message: 'Place updated successfully',
          data: {
            id: 2,
            name: 'Updated Restaurant',
            description: 'An updated description',
            location: '456 Oak Ave',
            tags: ['restaurant', 'fine-dining'],
            rating: 0,
            userId: 1,
            updatedAt: '2023-06-02T00:00:00.000Z',
            createdAt: '2023-06-01T00:00:00.000Z'
          }
        }
      },
      {
        method: 'GET',
        path: '/places/:id/reviews',
        description: 'Get all reviews for a place',
        request: {
          params: {
            id: 'number',
          },
        },
        response: {
          status: 'success',
          message: 'Reviews retrieved successfully',
          data: [
            {
              id: 1,
              rating: 5,
              comment: 'Amazing place!',
              user: {
                id: 2,
                name: 'Jane Doe',
                email: 'jane@example.com'
              },
              placeId: 1,
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z'
            },
            {
              id: 2,
              rating: 4,
              comment: 'Great beach but crowded',
              user: {
                id: 3,
                name: 'John Smith',
                email: 'john@example.com'
              },
              placeId: 1,
              createdAt: '2023-01-02T00:00:00.000Z',
              updatedAt: '2023-01-02T00:00:00.000Z'
            }
          ]
        }
      },
      {
        method: 'POST',
        path: '/places/:id/reviews',
        description: 'Add a review to a place',
        request: {
          headers: {
            'Authorization': 'Bearer your.jwt.token.here'
          },
          params: {
            id: '1'
          },
          body: {
            rating: 5,
            comment: 'Amazing place!'
          }
        },
        response: {
          status: 'success',
          message: 'Review added successfully',
          data: {
            id: 2,
            rating: 5,
            comment: 'Amazing place!',
            userId: 1,
            placeId: 1,
            updatedAt: '2023-06-01T00:00:00.000Z',
            createdAt: '2023-06-01T00:00:00.000Z',
            user: {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com'
            }
          }
        }
      }
    ];
    
    res.render('index', { 
      title: 'LocalGem API Documentation',
      currentYear: new Date().getFullYear(),
      endpoints,
      stringify: (obj: any) => JSON.stringify(obj, null, 2)
    });
  }
}
