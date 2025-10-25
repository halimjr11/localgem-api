import { createSuccessResponse, createErrorResponse } from './http-response.interface';

describe('HttpResponse', () => {
  describe('createSuccessResponse', () => {
    it('should create a success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Test message';
      const response = createSuccessResponse(data, message);

      expect(response).toEqual({
        status: 'success',
        message,
        data,
      });
    });

    it('should use default message if not provided', () => {
      const data = { id: 1, name: 'Test' };
      const response = createSuccessResponse(data);

      expect(response).toEqual({
        status: 'success',
        message: 'Operation successful',
        data,
      });
    });
  });

  describe('createErrorResponse', () => {
    it('should create an error response with required fields', () => {
      const error = {
        code: 'TEST_ERROR',
        message: 'Test error message',
      };

      const response = createErrorResponse(error);

      expect(response).toEqual({
        status: 'error',
        message: error.message,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    });

    it('should include details if provided', () => {
      const error = {
        code: 'TEST_ERROR',
        message: 'Test error message',
        details: { field: 'test', reason: 'invalid' },
      };

      const response = createErrorResponse(error);

      expect(response).toEqual({
        status: 'error',
        message: error.message,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      });
    });

    it('should handle empty error object', () => {
      const error = {
        code: '',
        message: '',
      };

      const response = createErrorResponse(error);

      expect(response).toEqual({
        status: 'error',
        message: '',
        error: {
          code: '',
          message: '',
        },
      });
    });
  });
});
