import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
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
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      code: this.toErrorCode(exception, status),
      message: this.toMessage(exception),
      data: null,
      requestId: request.requestId ?? 'unknown',
      timestamp: new Date().toISOString(),
    });
  }

  private toErrorCode(exception: unknown, status: number): ErrorCode {
    const explicitCode = this.getExceptionField(exception, 'code');
    if (this.isErrorCode(explicitCode)) return explicitCode;

    if (status === HttpStatus.NOT_FOUND) return ErrorCode.RESOURCE_NOT_FOUND;
    if (status === HttpStatus.BAD_REQUEST) return ErrorCode.VALIDATION_FAILED;
    return ErrorCode.INTERNAL_ERROR;
  }

  private toMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') return response;
      const message = this.getExceptionField(exception, 'message');
      if (typeof message === 'string') return message;
    }

    if (exception instanceof Error) return exception.message;
    return 'internal error';
  }

  private getExceptionField(exception: unknown, field: 'code' | 'message'): unknown {
    if (!(exception instanceof HttpException)) return undefined;

    const response = exception.getResponse();
    if (!response || typeof response !== 'object' || !(field in response)) return undefined;
    return response[field as keyof typeof response];
  }

  private isErrorCode(value: unknown): value is ErrorCode {
    return typeof value === 'string' && Object.values(ErrorCode).includes(value as ErrorCode);
  }
}
