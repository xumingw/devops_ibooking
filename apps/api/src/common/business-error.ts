import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@ibooking/shared-types';

export function businessError(status: HttpStatus, code: ErrorCode, message: string): HttpException {
  return new HttpException({ code, message }, status);
}
