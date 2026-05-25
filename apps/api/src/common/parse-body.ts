import { BadRequestException } from '@nestjs/common';
import { ErrorCode } from '@ibooking/shared-types';

interface SafeParseSchema<T> {
  safeParse(
    value: unknown,
  ): { success: true; data: T } | { success: false; error: { issues: Array<{ message: string }> } };
}

export function parseBody<T>(schema: SafeParseSchema<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (parsed.success) return parsed.data;

  throw new BadRequestException({
    code: ErrorCode.VALIDATION_FAILED,
    message: parsed.error.issues[0]?.message ?? 'invalid request body',
  });
}
