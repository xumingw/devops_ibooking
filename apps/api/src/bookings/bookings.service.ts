import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  BookingResponseDto,
  CancelBookingRequestDto,
  CheckInBookingRequestDto,
  CreateBookingRequestDto,
  ErrorCode,
} from '@ibooking/shared-types';
import { businessError } from '../common/business-error';
import { SeatsService } from '../seats/seats.service';
import { BookingsStore, bookingsStore } from './bookings.store';
import { enumerateHourlySlots } from './booking-rules';

const FIXED_CHECK_IN_CODE = '123456';

@Injectable()
export class BookingsService {
  constructor(
    private readonly seatsService: SeatsService,
    @Inject('BOOKINGS_STORE') private readonly store: BookingsStore = bookingsStore,
  ) {}

  listMine(userId: string): BookingResponseDto[] {
    return this.store.listByUser(userId);
  }

  create(dto: CreateBookingRequestDto): BookingResponseDto {
    const seat = this.seatsService.getActiveSeat(dto.seatId);
    const slots = enumerateHourlySlots(new Date(dto.startAt), new Date(dto.endAt));

    for (const slotStart of slots) {
      if (this.store.hasSlot(dto.seatId, slotStart)) {
        throw businessError(
          HttpStatus.CONFLICT,
          ErrorCode.BOOKING_SLOT_TAKEN,
          '该座位时段已被预约',
        );
      }
    }

    return this.store.create({
      userId: dto.userId,
      roomId: seat.roomId,
      seatId: dto.seatId,
      startAt: new Date(dto.startAt).toISOString(),
      endAt: new Date(dto.endAt).toISOString(),
      slots,
    });
  }

  cancel(id: string, dto: CancelBookingRequestDto): BookingResponseDto {
    const booking = this.getOwnedBooking(id, dto.userId);
    if (booking.status !== 'PENDING_CHECKIN') {
      throw businessError(
        HttpStatus.CONFLICT,
        ErrorCode.BOOKING_INVALID_TRANSITION,
        '当前预约状态不可取消',
      );
    }

    this.store.releaseSlots(id);
    return this.store.updateStatus(id, 'CANCELLED_BY_USER') as BookingResponseDto;
  }

  checkIn(id: string, dto: CheckInBookingRequestDto): BookingResponseDto {
    const booking = this.getOwnedBooking(id, dto.userId);
    if (booking.status !== 'PENDING_CHECKIN') {
      throw businessError(
        HttpStatus.CONFLICT,
        ErrorCode.BOOKING_INVALID_TRANSITION,
        '当前预约状态不可签到',
      );
    }
    if (dto.code !== FIXED_CHECK_IN_CODE) {
      throw businessError(HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.INVALID_CODE, '签到码错误');
    }

    return this.store.updateStatus(id, 'CHECKED_IN') as BookingResponseDto;
  }

  private getOwnedBooking(id: string, userId: string): BookingResponseDto {
    const booking = this.store.getById(id);
    if (!booking) {
      throw businessError(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND, '预约不存在');
    }
    if (booking.userId !== userId) {
      throw businessError(HttpStatus.FORBIDDEN, ErrorCode.NOT_OWNER, '只能操作自己的预约');
    }
    return booking;
  }
}
