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
      code: this.toErrorCode(status, exception),
      message: this.toMessage(exception),
      data: null,
      requestId: request.requestId ?? 'unknown',
      timestamp: new Date().toISOString()
    });
  }

  private toErrorCode(status: number, exception: unknown): ErrorCode {
    const explicit = this.extractResponseCode(exception);
    if (explicit) return explicit;
    if (status === HttpStatus.UNAUTHORIZED) return ErrorCode.AUTH_UNAUTHORIZED;
    if (status === HttpStatus.FORBIDDEN) return ErrorCode.RBAC_FORBIDDEN;
    if (status === HttpStatus.NOT_FOUND) return ErrorCode.RESOURCE_NOT_FOUND;
    if (status === HttpStatus.BAD_REQUEST) return ErrorCode.VALIDATION_FAILED;
    return ErrorCode.INTERNAL_ERROR;
  }

  private extractResponseCode(exception: unknown): ErrorCode | null {
    if (!(exception instanceof HttpException)) return null;
    const response = exception.getResponse();
    if (
      response &&
      typeof response === 'object' &&
      'code' in response &&
      typeof response.code === 'string' &&
      Object.values(ErrorCode).includes(response.code as ErrorCode)
    ) {
      return response.code as ErrorCode;
    }
    return null;
  }

  private toMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') return response;
      if (
        response &&
        typeof response === 'object' &&
        'message' in response &&
        (typeof response.message === 'string' || Array.isArray(response.message))
      ) {
        return Array.isArray(response.message) ? response.message.join('; ') : response.message;
      }
    }

    if (exception instanceof Error) return exception.message;
    return 'internal error';
  }
}
