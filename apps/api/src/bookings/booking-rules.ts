import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@ibooking/shared-types';
import { businessError } from '../common/business-error';

export function assertWholeHour(date: Date): void {
  if (date.getUTCMinutes() !== 0 || date.getUTCSeconds() !== 0 || date.getUTCMilliseconds() !== 0) {
    throw businessError(
      HttpStatus.UNPROCESSABLE_ENTITY,
      ErrorCode.BOOKING_NOT_WHOLE_HOUR,
      '预约开始和结束时间必须为整点',
    );
  }
}

export function enumerateHourlySlots(startAt: Date, endAt: Date): string[] {
  assertWholeHour(startAt);
  assertWholeHour(endAt);

  if (endAt.getTime() <= startAt.getTime()) {
    throw businessError(
      HttpStatus.UNPROCESSABLE_ENTITY,
      ErrorCode.BOOKING_END_BEFORE_START,
      '结束时间必须晚于开始时间',
    );
  }

  const slots: string[] = [];
  for (let current = startAt.getTime(); current < endAt.getTime(); current += 60 * 60 * 1000) {
    slots.push(new Date(current).toISOString());
  }
  return slots;
}
