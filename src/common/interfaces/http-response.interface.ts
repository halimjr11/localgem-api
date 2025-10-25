export interface HttpResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export function createSuccessResponse<T>(data: T, message: string = 'Operation successful'): HttpResponse<T> {
  return {
    status: 'success',
    message,
    data,
  };
}

export function createErrorResponse(error: {
  code: string;
  message: string;
  details?: any;
}): HttpResponse<null> {
  return {
    status: 'error',
    message: error.message,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
  };
}
