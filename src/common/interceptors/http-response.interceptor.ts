import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpResponse, createErrorResponse, createSuccessResponse } from '../interfaces/http-response.interface';

@Injectable()
export class HttpResponseInterceptor<T> implements NestInterceptor<T, HttpResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<HttpResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the response is already formatted, return it as is
        if (data?.status && (data.status === 'success' || data.status === 'error')) {
          return data;
        }
        // If the response has a message and data, use them
        if (data?.message !== undefined && data?.data !== undefined) {
          return createSuccessResponse(data.data, data.message);
        }
        // For all other cases, treat the entire response as data
        return createSuccessResponse(data);
      }),
      catchError((error) => {
        if (error instanceof HttpException) {
          const status = error.getStatus();
          const response = error.getResponse();
          
          if (typeof response === 'object' && response !== null) {
            return throwError(() => ({
              status: 'error',
              statusCode: status,
              ...(response as object),
            }));
          }

          return throwError(() => ({
            status: 'error',
            statusCode: status,
            message: response || 'An error occurred',
          }));
        }

        return throwError(() => ({
          status: 'error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        }));
      }),
    );
  }
}
