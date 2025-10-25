import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

interface MockTokens {
  access_token: string;
  refresh_token: string;
}

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<AuthService> = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      validateUser: jest.fn(),
      getProfile: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: serviceMock },
      ],
    }).compile();

    controller = module.get(AuthController);
    service = module.get(AuthService) as any;
  });

  it('register forwards to service.register and returns success response', async () => {
    const mockUser: Partial<User> = { id: 1, email: 'a@a.com', name: 'A' };
    service.register.mockResolvedValueOnce(mockUser as User);
    const body = { email: 'a@a.com', password: 'x', name: 'A' };
    const res = await controller.register(body);
    expect(service.register).toHaveBeenCalledWith(body);
    expect(res).toEqual({
      status: 'success',
      message: 'User registered successfully',
      data: mockUser
    });
  });

  it('login forwards req.user to service.login and returns success response', async () => {
    const mockTokens: MockTokens = { access_token: 't', refresh_token: 'rt' };
    (service.login as jest.Mock).mockResolvedValueOnce(mockTokens);
    // @ts-expect-error minimal req
    const res = await controller.login({ user: { id: 2, email: 'b@b.com' } });
    expect(service.login).toHaveBeenCalledWith({ id: 2, email: 'b@b.com' });
    expect(res).toEqual({
      status: 'success',
      message: 'Login successful',
      data: mockTokens
    });
  });

  it('refresh forwards to service.refresh and returns success response', async () => {
    const mockTokens: MockTokens = { access_token: 'new', refresh_token: 'new_rt' };
    (service.refresh as jest.Mock).mockResolvedValueOnce(mockTokens);
    const res = await controller.refresh({ refresh_token: 'r' });
    expect(service.refresh).toHaveBeenCalledWith('r');
    expect(res).toEqual({
      status: 'success',
      message: 'Token refreshed successfully',
      data: mockTokens
    });
  });

  // Error scenario tests
  it('register returns error response when service throws', async () => {
    const error = new HttpException(
      { message: 'Email already exists' },
      HttpStatus.BAD_REQUEST
    );
    service.register.mockRejectedValueOnce(error);
    
    try {
      await controller.register({ email: 'a@a.com', password: 'x', name: 'A' });
      fail('Expected an exception to be thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      const response = e.getResponse();
      expect(response).toEqual(expect.objectContaining({
        message: 'Email already exists'
      }));
      expect(e.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    }
  });

  it('login returns unauthorized when service throws', async () => {
    const error = new Error('Invalid credentials');
    (service.login as jest.Mock).mockRejectedValueOnce(error);
    
    try {
      await controller.login({ user: { id: 1, email: 'a@a.com' } } as any);
      fail('Expected an exception to be thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      const response = e.getResponse();
      expect(response).toEqual({
        status: 'error',
        message: 'Login failed',
        error: 'Invalid credentials'
      });
      expect(e.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    }
  });

  it('refresh returns unauthorized when service throws', async () => {
    const error = new Error('Invalid refresh token');
    (service.refresh as jest.Mock).mockRejectedValueOnce(error);
    
    try {
      await controller.refresh({ refresh_token: 'invalid' });
      fail('Expected an exception to be thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      const response = e.getResponse();
      expect(response).toEqual({
        status: 'error',
        message: 'Token refresh failed',
        error: 'Invalid or expired refresh token'
      });
      expect(e.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    }
  });
});
