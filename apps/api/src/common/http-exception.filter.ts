import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode } from '@ibooking/shared-types';
import { RequestWithId } from './request-context.middleware';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      code: this.toErrorCode(status),
      message: this.toMessage(exception),
      data: null,
      requestId: request.requestId ?? 'unknown',
      timestamp: new Date().toISOString()
    });
  }

  private toErrorCode(status: number): ErrorCode {
    if (status === HttpStatus.NOT_FOUND) return ErrorCode.RESOURCE_NOT_FOUND;
    if (status === HttpStatus.BAD_REQUEST) return ErrorCode.VALIDATION_FAILED;
    return ErrorCode.INTERNAL_ERROR;
  }

  private toMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') return response;
      if (
        response &&
        typeof response === 'object' &&
        'message' in response &&
        typeof response.message === 'string'
      ) {
        return response.message;
      }
    }

    if (exception instanceof Error) return exception.message;
    return 'internal error';
  }
}
