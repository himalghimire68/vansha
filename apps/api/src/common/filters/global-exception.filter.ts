import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';

interface ErrorResponse {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
      timestamp: new Date().toISOString(),
    };

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const httpResponse = exception.getResponse() as any;
      errorResponse.error = {
        code: httpResponse.error || 'HTTP_ERROR',
        message: httpResponse.message || exception.message,
        details: httpResponse.details,
      };
    }
    // Handle Zod validation errors
    else if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      const issues = exception.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      errorResponse.error = {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: { issues },
      };
    }
    // Handle generic errors
    else if (exception instanceof Error) {
      errorResponse.error = {
        code: 'ERROR',
        message: exception.message,
      };
    }

    // Log error
    console.error({
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      status,
      error: exception,
    });

    response.status(status).json(errorResponse);
  }
}
