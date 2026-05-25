// @story US3.4.2
// @tc TC-US3.4.2-01
import { ErrorCode } from '@ibooking/shared-types';
import { SeatsService } from '../seats/seats.service';
import { SeatsStore } from '../seats/seats.store';
import { BookingsStore } from './bookings.store';
import { BookingsService } from './bookings.service';

describe('US3.4.2 预约与签到最小功能', () => {
  let seatsService: SeatsService;
  let bookingsService: BookingsService;

  beforeEach(() => {
    seatsService = new SeatsService(new SeatsStore());
    bookingsService = new BookingsService(seatsService, new BookingsStore());
    seatsService.create('room_101', { code: 'A001', x: 1, y: 1 });
  });

  it('TC-US3.4.2-01: 整点预约、重复时段拒绝、取消释放和固定码签到', () => {
    const seat = seatsService.list('room_101')[0];

    const booking = bookingsService.create({
      userId: 'stu_01',
      seatId: seat.id,
      startAt: '2026-05-01T19:00:00.000+08:00',
      endAt: '2026-05-01T21:00:00.000+08:00',
    });
    expect(booking).toMatchObject({ status: 'PENDING_CHECKIN', roomId: 'room_101' });

    expect(() =>
      bookingsService.create({
        userId: 'stu_02',
        seatId: seat.id,
        startAt: '2026-05-01T19:30:00.000+08:00',
        endAt: '2026-05-01T20:30:00.000+08:00',
      }),
    ).toThrow(
      expect.objectContaining({
        response: expect.objectContaining({ code: ErrorCode.BOOKING_NOT_WHOLE_HOUR }),
      }),
    );

    expect(() =>
      bookingsService.create({
        userId: 'stu_02',
        seatId: seat.id,
        startAt: '2026-05-01T21:00:00.000+08:00',
        endAt: '2026-05-01T19:00:00.000+08:00',
      }),
    ).toThrow(
      expect.objectContaining({
        response: expect.objectContaining({ code: ErrorCode.BOOKING_END_BEFORE_START }),
      }),
    );

    expect(() =>
      bookingsService.create({
        userId: 'stu_02',
        seatId: seat.id,
        startAt: '2026-05-01T20:00:00.000+08:00',
        endAt: '2026-05-01T22:00:00.000+08:00',
      }),
    ).toThrow(
      expect.objectContaining({
        response: expect.objectContaining({ code: ErrorCode.BOOKING_SLOT_TAKEN }),
      }),
    );

    expect(bookingsService.cancel(booking.id, { userId: 'stu_01' })).toMatchObject({
      status: 'CANCELLED_BY_USER',
    });

    const nextBooking = bookingsService.create({
      userId: 'stu_02',
      seatId: seat.id,
      startAt: '2026-05-01T19:00:00.000+08:00',
      endAt: '2026-05-01T21:00:00.000+08:00',
    });

    expect(() =>
      bookingsService.checkIn(nextBooking.id, { userId: 'stu_02', code: '000000' }),
    ).toThrow(
      expect.objectContaining({
        response: expect.objectContaining({ code: ErrorCode.INVALID_CODE }),
      }),
    );
    expect(
      bookingsService.checkIn(nextBooking.id, { userId: 'stu_02', code: '123456' }),
    ).toMatchObject({
      status: 'CHECKED_IN',
    });
  });
});
