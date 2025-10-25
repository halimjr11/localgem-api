import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { HttpResponseInterceptor } from '../http-response.interceptor';

describe('HttpResponseInterceptor', () => {
  let interceptor: HttpResponseInterceptor<any>;
  let executionContext: any;
  let callHandler: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpResponseInterceptor],
    }).compile();

    interceptor = module.get<HttpResponseInterceptor<any>>(HttpResponseInterceptor);
    
    executionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn(),
    };

    callHandler = {
      handle: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should return success response with data', (done) => {
    const testData = { id: 1, name: 'Test' };
    callHandler.handle.mockReturnValue(of(testData));

    interceptor.intercept(executionContext, callHandler).subscribe({
      next: (result) => {
        expect(result).toEqual({
          status: 'success',
          message: 'Operation successful',
          data: testData,
        });
        done();
      },
    });
  });

  it('should return already formatted success response as is', (done) => {
    const formattedResponse = {
      status: 'success',
      message: 'Custom success',
      data: { id: 1 },
    };
    callHandler.handle.mockReturnValue(of(formattedResponse));

    interceptor.intercept(executionContext, callHandler).subscribe({
      next: (result) => {
        expect(result).toBe(formattedResponse);
        done();
      },
    });
  });

  it('should return already formatted error response as is', (done) => {
    const errorResponse = {
      status: 'error',
      message: 'Custom error',
      error: 'Error details',
    };
    callHandler.handle.mockReturnValue(of(errorResponse));

    interceptor.intercept(executionContext, callHandler).subscribe({
      next: (result) => {
        expect(result).toBe(errorResponse);
        done();
      },
    });
  });

  it('should handle response with message and data', (done) => {
    const response = {
      message: 'Custom message',
      data: { id: 1 },
    };
    callHandler.handle.mockReturnValue(of(response));

    interceptor.intercept(executionContext, callHandler).subscribe({
      next: (result) => {
        expect(result).toEqual({
          status: 'success',
          message: 'Custom message',
          data: { id: 1 },
        });
        done();
      },
    });
  });

  it('should handle HttpException with object response', (done) => {
    const error = new HttpException(
      { message: 'Not found', code: 'NOT_FOUND' },
      HttpStatus.NOT_FOUND,
    );
    callHandler.handle.mockReturnValue(throwError(() => error));

    interceptor.intercept(executionContext, callHandler).subscribe({
      error: (err) => {
        expect(err).toEqual({
          status: 'error',
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not found',
          code: 'NOT_FOUND',
        });
        done();
      },
    });
  });

  it('should handle HttpException with string response', (done) => {
    const error = new HttpException('Simple error', HttpStatus.BAD_REQUEST);
    callHandler.handle.mockReturnValue(throwError(() => error));

    interceptor.intercept(executionContext, callHandler).subscribe({
      error: (err) => {
        expect(err).toEqual({
          status: 'error',
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Simple error',
        });
        done();
      },
    });
  });

  it('should handle non-HttpException error', (done) => {
    const error = new Error('Unexpected error');
    callHandler.handle.mockReturnValue(throwError(() => error));

    interceptor.intercept(executionContext, callHandler).subscribe({
      next: () => {
        fail('Expected error, got success');
        done();
      },
      error: (err) => {
        expect(err).toEqual({
          status: 'error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error'
        });
        done();
      },
    });
  }, 10000); // Increased timeout for this test

  it('should not include error details in production', (done) => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const error = new Error('Unexpected error');
    callHandler.handle.mockReturnValue(throwError(() => error));

    interceptor.intercept(executionContext, callHandler).subscribe({
      error: (err) => {
        expect(err).toEqual({
          status: 'error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        });
        process.env.NODE_ENV = originalEnv;
        done();
      },
    });
  });
});
