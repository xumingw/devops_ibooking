import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { ErrorCode, StudentBookingRecord, StudentBookingStatus } from '@ibooking/shared-types';
import { PrismaService } from '../database/prisma.service';
import { BookingRepository } from './bookings.service';

type BookingWithRoomSeat = Prisma.BookingGetPayload<{
  include: {
    room: true;
    seat: true;
  };
}>;

@Injectable()
export class PrismaBookingsRepository implements BookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByUserId(userId: string): Promise<StudentBookingRecord[]> {
    const rows = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        room: true,
        seat: true
      },
      orderBy: { startAt: 'desc' },
      take: 50
    });

    return rows.map((row) => this.toRecord(row));
  }

  async cancelByUserId(userId: string, bookingId: string): Promise<StudentBookingRecord> {
    const now = new Date();
    const row = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.updateMany({
        where: {
          id: bookingId,
          userId,
          status: 'PENDING_CHECKIN',
          startAt: { gt: now }
        },
        data: { status: 'CANCELLED_BY_USER' }
      });
      if (updated.count === 0) return null;

      await tx.bookingSlot.deleteMany({ where: { bookingId } });
      return tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          room: true,
          seat: true
        }
      });
    });

    if (row) return this.toRecord(row);

    const current = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
      select: { id: true }
    });
    if (!current) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: '预约不存在'
      });
    }
    throw new BadRequestException({
      code: ErrorCode.VALIDATION_FAILED,
      message: '当前预约不可取消'
    });
  }

  private toRecord(row: BookingWithRoomSeat): StudentBookingRecord {
    const status = this.mapStatus(row.status);
    return {
      id: row.id,
      room: row.room.name,
      location: `${row.room.building} ${row.room.floor}楼`,
      seat: row.seat.code,
      time: this.formatTimeRange(row.startAt, row.endAt),
      status,
      tags: this.formatTags(row),
      canCheckIn: this.canCheckIn(row, status),
      canCancel: status === 'upcoming' && row.startAt.getTime() > Date.now(),
      startAt: row.startAt.toISOString(),
      endAt: row.endAt.toISOString()
    };
  }

  private mapStatus(status: BookingStatus): StudentBookingStatus {
    if (status === 'CHECKED_IN') return 'using';
    if (status === 'COMPLETED') return 'completed';
    if (status === 'CANCELLED_AUTO_NO_CHECKIN') return 'violation';
    if (status === 'CANCELLED_BY_USER' || status === 'CANCELLED_BY_ADMIN') return 'cancelled';
    return 'upcoming';
  }

  private canCheckIn(row: BookingWithRoomSeat, status: StudentBookingStatus): boolean {
    if (status !== 'upcoming') return false;
    const now = Date.now();
    const checkInWindowStart = row.startAt.getTime() - 15 * 60 * 1000;
    const checkInWindowEnd = row.startAt.getTime() + 15 * 60 * 1000;
    return now >= checkInWindowStart && now <= checkInWindowEnd && now <= row.endAt.getTime();
  }

  private formatTags(row: BookingWithRoomSeat): string[] {
    const tags: string[] = [];
    if (row.seat.hasPower) tags.push('插座');
    if (row.seat.nearWindow) tags.push('靠窗');
    if (row.room.overnight) tags.push('24小时');
    return tags;
  }

  private formatTimeRange(startAt: Date, endAt: Date): string {
    return `${this.formatDateLabel(startAt)} ${this.formatClock(startAt)}-${this.formatClock(endAt)}`;
  }

  private formatDateLabel(date: Date): string {
    const today = new Date();
    if (this.isSameDate(date, today)) return '今日';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (this.isSameDate(date, yesterday)) return '昨日';
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
