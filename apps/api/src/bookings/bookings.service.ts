import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ErrorCode, StudentBookingRecord, StudentBookingSummary } from '@ibooking/shared-types';

export const BOOKING_REPOSITORY = 'BOOKING_REPOSITORY';
const MAX_BOOKING_HOURS = 4;
const BOOKING_SLOT_MINUTES = 30;

export type CreateStudentBookingInput = {
  roomId: string;
  seatId: string;
  startAt: string;
  endAt: string;
};

export interface BookingRepository {
  listByUserId(userId: string): Promise<StudentBookingRecord[]>;
  cancelByUserId(userId: string, bookingId: string): Promise<StudentBookingRecord>;
  createByUserId(
    userId: string,
    input: CreateStudentBookingInput
  ): Promise<StudentBookingRecord>;
}

@Injectable()
export class BookingsService {
  constructor(@Inject(BOOKING_REPOSITORY) private readonly repository: BookingRepository) {}

  async getStudentSummary(userId: string): Promise<StudentBookingSummary> {
    const records = await this.repository.listByUserId(userId);
    return {
      totalCount: records.length,
      activeCount: records.filter(
        (record) => record.status === 'upcoming' || record.status === 'using'
      ).length,
      completedCount: records.filter((record) => record.status === 'completed').length,
      records
    };
  }

  cancelStudentBooking(userId: string, bookingId: string): Promise<StudentBookingRecord> {
    return this.repository.cancelByUserId(userId, bookingId);
  }

  async createStudentBooking(
    userId: string,
    input: CreateStudentBookingInput
  ): Promise<StudentBookingRecord> {
    const startAt = this.parseBookingDate(input.startAt);
    const endAt = this.parseBookingDate(input.endAt);
    const durationMs = endAt.getTime() - startAt.getTime();
    const hourMs = 60 * 60 * 1000;
    const slotMs = BOOKING_SLOT_MINUTES * 60 * 1000;
    const currentSlotStartAt = Math.floor(Date.now() / slotMs) * slotMs;

    if (durationMs <= 0) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: '预约结束时间必须晚于开始时间'
      });
    }
    if (!this.isHalfHourSlot(startAt) || !this.isHalfHourSlot(endAt)) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: '预约时间必须按 30 分钟粒度选择'
      });
    }
    if (startAt.getTime() < currentSlotStartAt) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: '不能预约已过去的时段'
      });
    }
    if (durationMs > MAX_BOOKING_HOURS * hourMs) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: '单次预约最长 4 小时'
      });
    }

    return this.repository.createByUserId(userId, input);
  }

  private isHalfHourSlot(date: Date): boolean {
    return (
      date.getUTCMinutes() % BOOKING_SLOT_MINUTES === 0 &&
      date.getUTCSeconds() === 0 &&
      date.getUTCMilliseconds() === 0
    );
  }

  private parseBookingDate(value: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: '预约时间格式不正确'
      });
    }
    return date;
  }
}
