import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorCode, StudentCheckInResult, StudentCheckInSession } from '@ibooking/shared-types';
import { PrismaService } from '../database/prisma.service';
import { CheckInRepository } from './checkins.service';

type BookingWithRoomSeat = Prisma.BookingGetPayload<{
  include: {
    room: true;
    seat: true;
  };
}>;

@Injectable()
export class PrismaCheckInsRepository implements CheckInRepository {
  private readonly earlyWindowMs = 15 * 60 * 1000;
  private readonly lateWindowMs = 15 * 60 * 1000;
  private readonly expiryBatchSize = 100;

  constructor(private readonly prisma: PrismaService) {}

  async expireNoShowBookings(now: Date): Promise<number> {
    const cutoffAt = new Date(now.getTime() - this.lateWindowMs);

    return this.prisma.$transaction(async (tx) => {
      const rows = await tx.booking.findMany({
        where: {
          status: 'PENDING_CHECKIN',
          startAt: { lte: cutoffAt },
        },
        include: {
          room: true,
          seat: true,
        },
        orderBy: { startAt: 'asc' },
        take: this.expiryBatchSize,
      });

      let expiredCount = 0;
      for (const row of rows) {
        const updated = await tx.booking.updateMany({
          where: {
            id: row.id,
            status: 'PENDING_CHECKIN',
          },
          data: { status: 'CANCELLED_AUTO_NO_CHECKIN' },
        });
        if (updated.count !== 1) continue;

        await tx.bookingSlot.deleteMany({ where: { bookingId: row.id } });
        await tx.violation.create({
          data: {
            userId: row.userId,
            bookingId: row.id,
            roomId: row.roomId,
            seatId: row.seatId,
            reason: 'NO_CHECK_IN',
            occurredAt: now,
          },
        });
        await tx.reminderLog.create({
          data: {
            bookingId: row.id,
            type: 'AUTO_CANCEL_NO_CHECKIN',
            channel: 'SYSTEM',
            sentAt: now,
          },
        });
        expiredCount += 1;
      }

      return expiredCount;
    });
  }

  async findCurrentByUserId(userId: string): Promise<StudentCheckInSession | null> {
    const now = new Date();
    const earliestStartAt = new Date(now.getTime() - this.lateWindowMs);
    const latestStartAt = new Date(now.getTime() + this.earlyWindowMs);

    const row = await this.prisma.booking.findFirst({
      where: {
        userId,
        status: 'PENDING_CHECKIN',
        startAt: {
          gt: earliestStartAt,
          lte: latestStartAt,
        },
        endAt: { gt: now },
      },
      include: {
        room: true,
        seat: true,
      },
      orderBy: { startAt: 'asc' },
    });

    return row ? this.toSession(row, now) : null;
  }

  async verifyCode(input: { roomId: string; code: string }): Promise<boolean> {
    const now = new Date();
    const row = await this.prisma.checkInCode.findFirst({
      where: {
        roomId: input.roomId,
        code: input.code,
        validAt: { lte: now },
        expiresAt: { gte: now },
      },
      select: { id: true },
    });

    return Boolean(row);
  }

  async markCheckedIn(input: {
    bookingId: string;
    userId: string;
  }): Promise<StudentCheckInResult> {
    const checkedInAt = new Date();
    const earliestStartAt = new Date(checkedInAt.getTime() - this.lateWindowMs);
    const latestStartAt = new Date(checkedInAt.getTime() + this.earlyWindowMs);
    const row = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.updateMany({
        where: {
          id: input.bookingId,
          userId: input.userId,
          status: 'PENDING_CHECKIN',
          startAt: {
            gt: earliestStartAt,
            lte: latestStartAt,
          },
          endAt: { gt: checkedInAt },
        },
        data: { status: 'CHECKED_IN' },
      });

      if (updated.count !== 1) return null;

      return tx.booking.findUnique({
        where: { id: input.bookingId },
        include: {
          room: true,
          seat: true,
        },
      });
    });

    if (!row) {
      throw new BadRequestException({
        code: ErrorCode.CHECK_IN_OUT_OF_WINDOW,
        message: '当前没有可签到预约',
      });
    }

    return {
      bookingId: row.id,
      room: row.room.name,
      seat: row.seat.code,
      time: this.formatTimeRange(row.startAt, row.endAt),
      checkedInAt: checkedInAt.toISOString(),
      status: 'CHECKED_IN',
    };
  }

  private toSession(row: BookingWithRoomSeat, now: Date): StudentCheckInSession {
    return {
      bookingId: row.id,
      roomId: row.roomId,
      room: row.room.name,
      seat: row.seat.code,
      time: this.formatTimeRange(row.startAt, row.endAt),
      remainingSeconds: this.remainingCheckInSeconds(row.startAt, now),
      codeLength: 6,
    };
  }

  private remainingCheckInSeconds(startAt: Date, now: Date): number {
    const cutoffAt = startAt.getTime() + this.lateWindowMs;
    return Math.max(0, Math.floor((cutoffAt - now.getTime()) / 1000));
  }

  private formatTimeRange(startAt: Date, endAt: Date): string {
    return `${this.formatDateLabel(startAt)} ${this.formatClock(startAt)}-${this.formatClock(endAt)}`;
  }

  private formatDateLabel(date: Date): string {
    const today = new Date();
    if (this.isSameDate(date, today)) return '今日';
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (this.isSameDate(date, tomorrow)) return '明日';
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  private formatClock(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  private isSameDate(left: Date, right: Date): boolean {
    return (
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate()
    );
  }
}
