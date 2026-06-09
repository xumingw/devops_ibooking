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
          startAt: { lte: now },
          OR: [{ startAt: { lte: cutoffAt } }, { createdAt: { lte: cutoffAt } }],
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
        if (!this.isCheckInExpired(row, now)) continue;

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
    const earliestDeadlineBaseAt = new Date(now.getTime() - this.lateWindowMs);
    const latestStartAt = new Date(now.getTime() + this.earlyWindowMs);

    const rows = await this.prisma.booking.findMany({
      where: {
        userId,
        status: 'PENDING_CHECKIN',
        startAt: { lte: latestStartAt },
        endAt: { gt: now },
        OR: [
          { startAt: { gt: earliestDeadlineBaseAt } },
          { createdAt: { gt: earliestDeadlineBaseAt } },
        ],
      },
      include: {
        room: true,
        seat: true,
      },
      orderBy: { startAt: 'asc' },
    });
    const row = rows.find((candidate) => this.canCheckIn(candidate, now)) ?? null;

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
    const earliestDeadlineBaseAt = new Date(checkedInAt.getTime() - this.lateWindowMs);
    const latestStartAt = new Date(checkedInAt.getTime() + this.earlyWindowMs);
    const row = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.updateMany({
        where: {
          id: input.bookingId,
          userId: input.userId,
          status: 'PENDING_CHECKIN',
          startAt: { lte: latestStartAt },
          endAt: { gt: checkedInAt },
          OR: [
            { startAt: { gt: earliestDeadlineBaseAt } },
            { createdAt: { gt: earliestDeadlineBaseAt } },
          ],
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
      remainingSeconds: this.remainingCheckInSeconds(row, now),
      codeLength: 6,
    };
  }

  private remainingCheckInSeconds(row: Pick<BookingWithRoomSeat, 'startAt' | 'createdAt'>, now: Date): number {
    const cutoffAt = this.checkInDeadlineAt(row).getTime();
    return Math.max(0, Math.floor((cutoffAt - now.getTime()) / 1000));
  }

  private canCheckIn(row: Pick<BookingWithRoomSeat, 'startAt' | 'endAt' | 'createdAt'>, now: Date): boolean {
    return (
      now.getTime() >= row.startAt.getTime() - this.earlyWindowMs &&
      now.getTime() < this.checkInDeadlineAt(row).getTime() &&
      now.getTime() <= row.endAt.getTime()
    );
  }

  private isCheckInExpired(row: Pick<BookingWithRoomSeat, 'startAt' | 'createdAt'>, now: Date): boolean {
    return this.checkInDeadlineAt(row).getTime() <= now.getTime();
  }

  private checkInDeadlineAt(row: Pick<BookingWithRoomSeat, 'startAt' | 'createdAt'>): Date {
    const baseAt = row.createdAt.getTime() > row.startAt.getTime() ? row.createdAt : row.startAt;
    return new Date(baseAt.getTime() + this.lateWindowMs);
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
