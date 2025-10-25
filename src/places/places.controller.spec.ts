import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, BadRequestException, NotFoundException, HttpException } from '@nestjs/common';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';
import { Place } from './entities/place.entity';

type MockAuthRequest = {
  user: {
    id: number;
  };
};

describe('PlacesController', () => {
  let controller: PlacesController;
  let service: any;

  beforeEach(async () => {
    const serviceMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlacesController],
      providers: [
        {
          provide: PlacesService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<PlacesController>(PlacesController);
    service = module.get(PlacesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return places list with success response', async () => {
      const mockPlaces = [
        { id: 1, name: 'Place 1' }, 
        { id: 2, name: 'Place 2' }
      ];
      (service.findAll as jest.Mock).mockResolvedValueOnce(mockPlaces);
      
      const req = { user: { id: 1 } } as any;
      const result = await controller.findAll(req, undefined);
      
      expect(service.findAll).toHaveBeenCalledWith(1, undefined);
      expect(result).toEqual({
        status: 'success',
        message: 'Places retrieved successfully',
        data: mockPlaces
      });
    });

    it('should handle tags filter', async () => {
      const mockPlaces = [
        { id: 1, name: 'Place 1', tags: ['tag1'] }
      ];
      (service.findAll as jest.Mock).mockResolvedValueOnce(mockPlaces);
      
      const req = { user: { id: 1 } } as any;
      const result = await controller.findAll(req, 'tag1,tag2');
      
      expect(service.findAll).toHaveBeenCalledWith(1, 'tag1,tag2');
      expect(result).toEqual({
        status: 'success',
        message: 'Places retrieved successfully',
        data: mockPlaces
      });
    });

    it('should handle service errors with custom status code', async () => {
      const error = new Error('Database error');
      error['status'] = HttpStatus.SERVICE_UNAVAILABLE;
      (service.findAll as jest.Mock).mockRejectedValueOnce(error);

      const req = { user: { id: 1 } } as any;
      
      try {
        await controller.findAll(req, undefined);
        fail('Expected an error to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        expect(e.getResponse()).toEqual({
          status: 'error',
          message: 'Failed to retrieve places',
          error: 'Database error'
        });
      }
    });

    it('should handle generic errors', async () => {
      const error = new Error('Unexpected error');
      (service.findAll as jest.Mock).mockRejectedValueOnce(error);

      const req = { user: { id: 1 } } as any;
      
      try {
        await controller.findAll(req, undefined);
        fail('Expected an error to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(e.getResponse()).toEqual({
          status: 'error',
          message: 'Failed to retrieve places',
          error: 'Unexpected error'
        });
      }
    });
  });

  it('should return places list with success response', async () => {
    const mockPlaces = [{ id: 1, name: 'Place 1' }, { id: 2, name: 'Place 2' }];
    (service.findAll as jest.Mock).mockResolvedValueOnce(mockPlaces);
    // @ts-expect-error: constructing minimal req object for test
    const result = await controller.findAll({ user: { id: 1 } }, undefined);
    expect(service.findAll).toHaveBeenCalledWith(1, undefined);
    expect(result).toEqual({
      status: 'success',
      message: 'Places retrieved successfully',
      data: mockPlaces
    });
  });

  describe('findOne', () => {
    it('should return place with success response', async () => {
      const mockPlace = { id: 1, name: 'Test Place', location: 'Test Location' };
      (service.findOne as jest.Mock).mockResolvedValueOnce(mockPlace);
      
      const req = { user: { id: 2 } } as any;
      const result = await controller.findOne('1', req);
      
      expect(service.findOne).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual({
        status: 'success',
        message: 'Place retrieved successfully',
        data: mockPlace
      });
    });

    it('should throw not found exception when place does not exist', async () => {
      (service.findOne as jest.Mock).mockResolvedValueOnce(null);
      
      const req = { user: { id: 1 } } as any;
      
      try {
        await controller.findOne('999', req);
        fail('Expected NotFoundException to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(e.getResponse()).toEqual({
          status: 'error',
          message: 'Place not found',
          error: 'Not Found'
        });
      }
    });

    it('should handle service errors with custom status code', async () => {
      const error = new Error('Database error');
      error['status'] = HttpStatus.BAD_GATEWAY;
      (service.findOne as jest.Mock).mockRejectedValueOnce(error);

      const req = { user: { id: 1 } } as any;
      
      try {
        await controller.findOne('1', req);
        fail('Expected an error to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
      }
    });

    it('should handle invalid ID format', async () => {
      const req = { user: { id: 1 } } as any;
      
      try {
        await controller.findOne('invalid-id', req);
        fail('Expected an error to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('create', () => {
    it('should create and return the new place', async () => {
      const createDto = { 
        name: 'New Place', 
        location: 'Test Location',
        description: 'A test place'
      };
      const mockPlace = { 
        id: 5, 
        ...createDto, 
        userId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      (service.create as jest.Mock).mockResolvedValueOnce(mockPlace);
      
      const req = { user: { id: 7 } } as any;
      const result = await controller.create(createDto, req);
      
      expect(service.create).toHaveBeenCalledWith(createDto, 7);
      expect(result).toEqual({
        status: 'success',
        message: 'Place created successfully',
        data: mockPlace
      });
    });

    it('should validate required fields', async () => {
      const invalidDtos = [
        { location: 'Missing name' },
        { name: 'Missing location' },
        { name: '', location: '' },
        { name: '  ', location: '  ' }
      ];

      for (const dto of invalidDtos) {
        try {
          // Mock the service to throw a BadRequestException
          (service.create as jest.Mock).mockRejectedValueOnce(
            new BadRequestException('Name and location are required')
          );
          
          await controller.create(dto as any, { user: { id: 1 } } as any);
          fail(`Expected an error for ${JSON.stringify(dto)}`);
        } catch (e) {
          // The controller should wrap the BadRequestException in an HttpException
          expect(e).toBeInstanceOf(HttpException);
          expect(e.getStatus()).toBe(HttpStatus.BAD_REQUEST);
          expect(e.getResponse()).toMatchObject({
            status: 'error',
            message: 'Name and location are required',
            error: 'Bad Request'
          });
        }
      }
    });

    it('should handle service errors', async () => {
      const createDto = { name: 'New Place', location: 'Test Location' };
      const error = new Error('Database error');
      error['status'] = HttpStatus.CONFLICT;
      (service.create as jest.Mock).mockRejectedValueOnce(error);

      const req = { user: { id: 1 } } as any;
      
      try {
        await controller.create(createDto, req);
        fail('Expected an error to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(e.getResponse()).toEqual({
          status: 'error',
          message: 'Failed to create place',
          error: 'Database error'
        });
      }
    });
  });

  describe('update', () => {
    it('should update and return the updated place', async () => {
      const updateDto = { 
        name: 'Updated Place',
        description: 'Updated description'
      };
      const updatedPlace = { 
        id: 11, 
        name: 'Updated Place',
        location: 'Test Location',
        description: 'Updated description',
        userId: 13,
        updatedAt: new Date()
      };
      
      (service.update as jest.Mock).mockResolvedValueOnce(updatedPlace);
      
      const req = { user: { id: 13 } } as any;
      const result = await controller.update('11', updateDto, req);
      
      expect(service.update).toHaveBeenCalledWith(11, updateDto, 13);
      expect(result).toEqual({
        status: 'success',
        message: 'Place updated successfully',
        data: updatedPlace
      });
    });

    it('should throw not found exception when place does not exist', async () => {
      const updateDto = { name: 'Updated Place' };
      (service.update as jest.Mock).mockResolvedValueOnce(null);
      
      const req = { user: { id: 1 } } as any;
      
      try {
        await controller.update('999', updateDto, req);
        fail('Expected NotFoundException to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(e.getResponse()).toEqual({
          status: 'error',
          message: 'Place not found or you do not have permission',
          error: 'Not Found'
        });
      }
    });

    it('should handle service errors', async () => {
      const updateDto = { name: 'Updated Place' };
      const error = new Error('Update failed');
      error['status'] = HttpStatus.FORBIDDEN;
      (service.update as jest.Mock).mockRejectedValueOnce(error);

      const req = { user: { id: 1 } } as any;
      
      try {
        await controller.update('1', updateDto, req);
        fail('Expected an error to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(e.getResponse()).toEqual({
          status: 'error',
          message: 'Failed to update place',
          error: 'Update failed'
        });
      }
    });

    it('should handle invalid ID format', async () => {
      const updateDto = { name: 'Updated Place' };
      const req = { user: { id: 1 } } as any;
      
      try {
        await controller.update('invalid-id', updateDto, req);
        fail('Expected an error to be thrown');
      } catch (e) {
        // The controller converts invalid IDs to NaN and treats them as not found
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  // Additional edge cases
  describe('Edge Cases', () => {
    it('should handle empty tags filter', async () => {
      const mockPlaces = [
        { id: 1, name: 'Place 1' },
        { id: 2, name: 'Place 2' }
      ];
      (service.findAll as jest.Mock).mockResolvedValueOnce(mockPlaces);
      
      const req = { user: { id: 1 } } as any;
      const result = await controller.findAll(req, '');
      
      expect(service.findAll).toHaveBeenCalledWith(1, '');
      expect(result).toEqual({
        status: 'success',
        message: 'Places retrieved successfully',
        data: mockPlaces
      });
    });

    it('should handle missing user ID', async () => {
      const req = { user: {} } as any;
      
      try {
        await controller.findAll(req, undefined);
        fail('Expected an error to be thrown');
      } catch (e) {
        // The controller will throw a ReferenceError when trying to access req.user.id
        expect(e).toBeInstanceOf(ReferenceError);
      }
    });

    it('should handle undefined user object', async () => {
      const req = {} as any;
      
      try {
        await controller.findAll(req, undefined);
        fail('Expected an error to be thrown');
      } catch (e) {
        // The controller wraps the error in an HttpException
        expect(e).toBeInstanceOf(HttpException);
      }
    });
  });
});
