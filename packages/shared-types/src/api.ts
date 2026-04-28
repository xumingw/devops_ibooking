import { z } from 'zod';
import { ErrorCode } from './error-codes';

export const ApiResponseSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    code: z.nativeEnum(ErrorCode),
    message: z.string(),
    data,
    requestId: z.string(),
    timestamp: z.string()
  });

export interface ApiResponse<T> {
  code: ErrorCode;
  message: string;
  data: T;
  requestId: string;
  timestamp: string;
}

export interface PageQuery {
  page: number;
  size: number;
  sort?: string;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface HealthResponse {
  status: 'UP';
  db: 'UP' | 'DOWN';
  redis: 'UP' | 'DOWN';
  timestamp: string;
}
