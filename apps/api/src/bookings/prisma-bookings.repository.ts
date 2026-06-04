import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { ErrorCode, StudentBookingRecord, StudentBookingStatus } from '@ibooking/shared-types';
import { PrismaService } from '../database/prisma.service';
import { BookingRepository, CreateStudentBookingInput } from './bookings.service';

type BookingWithRoomSeat = Prisma.BookingGetPayload<{
  include: {
    room: true;
    seat: true;
  };
}>;

type BookingRoomWithSchedules = Prisma.RoomGetPayload<{
  include: {
    schedules: true;
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

  async createByUserId(
    userId: string,
    input: CreateStudentBookingInput
  ): Promise<StudentBookingRecord> {
    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);

    try {
      const row = await this.prisma.$transaction(async (tx) => {
        const [user, room, seat] = await Promise.all([
          tx.user.findUnique({
            where: { id: userId },
            select: { id: true, departmentId: true }
          }),
          tx.room.findUnique({
            where: { id: input.roomId },
            include: {
              schedules: {
                where: { date: { in: this.toScheduleDates(startAt, endAt) } }
              }
            }
          }),
          tx.seat.findFirst({ where: { id: input.seatId, roomId: input.roomId } })
        ]);

        if (!user) {
          throw new NotFoundException({
            code: ErrorCode.RESOURCE_NOT_FOUND,
            message: '用户不存在'
          });
        }
        if (!room || !seat) {
          throw new NotFoundException({
            code: ErrorCode.RESOURCE_NOT_FOUND,
            message: '自习室或座位不存在'
          });
        }
        if (room.status !== 'ACTIVE' || seat.status !== 'ACTIVE') {
          throw new BadRequestException({
            code: ErrorCode.VALIDATION_FAILED,
            message: '自习室或座位当前不可预约'
          });
        }
        if (
          room.scopeType === 'DEPARTMENT' &&
          (!room.departmentId || room.departmentId !== user.departmentId)
        ) {
          throw new BadRequestException({
            code: ErrorCode.VALIDATION_FAILED,
            message: '该自习室仅限所属院系预约'
          });
        }
        if (!this.isRoomOpenForRange(room, startAt, endAt)) {
          throw new BadRequestException({
            code: ErrorCode.VALIDATION_FAILED,
            message: '预约时间不在自习室开放时间内'
          });
        }

        const overlapping = await tx.booking.findFirst({
          where: {
            userId,
            status: { in: ['PENDING_CHECKIN', 'CHECKED_IN'] },
            startAt: { lt: endAt },
            endAt: { gt: startAt }
          },
          select: { id: true }
        });
        if (overlapping) {
          throw new BadRequestException({
            code: ErrorCode.VALIDATION_FAILED,
            message: '该时段已有预约'
          });
        }

        const created = await tx.booking.create({
          data: {
            userId,
            roomId: input.roomId,
            seatId: input.seatId,
            startAt,
            endAt,
            status: 'PENDING_CHECKIN'
          },
          include: {
            room: true,
            seat: true
          }
        });

        await tx.bookingSlot.createMany({
          data: this.toHalfHourSlots(startAt, endAt).map((slotStart) => ({
            bookingId: created.id,
            userId,
            seatId: input.seatId,
            slotStart
          }))
        });

        return created;
      });

      return this.toRecord(row);
    } catch (error) {
      if (this.isUniqueConflict(error)) {
        throw new BadRequestException({
          code: ErrorCode.VALIDATION_FAILED,
          message: '该座位时段已被预约'
        });
      }
      throw error;
    }
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

  private toHalfHourSlots(startAt: Date, endAt: Date): Date[] {
    const slots: Date[] = [];
    for (
      let cursor = startAt.getTime();
      cursor < endAt.getTime();
      cursor += 30 * 60 * 1000
    ) {
      slots.push(new Date(cursor));
    }
    return slots;
  }

  private isRoomOpenForRange(
    room: Pick<BookingRoomWithSchedules, 'openHour' | 'closeHour' | 'overnight' | 'schedules'>,
    startAt: Date,
    endAt: Date
  ): boolean {
    const schedulesByDate = new Map(
      room.schedules.map((schedule) => [this.scheduleDateKey(schedule.date), schedule])
    );

    return this.toHalfHourSlots(startAt, endAt).every((slotStart) => {
      const schedule = schedulesByDate.get(this.scheduleDateKey(this.toScheduleDate(slotStart)));
      if (schedule?.closed) return false;

      const openHour = schedule?.openHour ?? room.openHour;
      const closeHour = schedule?.closeHour ?? room.closeHour;
      const overnight = schedule ? closeHour <= openHour : room.overnight || closeHour <= openHour;
      const hour = this.getShanghaiHour(slotStart);
      if (overnight) {
        return hour >= openHour || hour < closeHour;
      }
      return hour >= openHour && hour < closeHour;
    });
  }

  private toScheduleDates(startAt: Date, endAt: Date): Date[] {
    const datesByKey = new Map<string, Date>();
    for (const slotStart of this.toHalfHourSlots(startAt, endAt)) {
      const scheduleDate = this.toScheduleDate(slotStart);
      datesByKey.set(this.scheduleDateKey(scheduleDate), scheduleDate);
    }
    return [...datesByKey.values()];
  }

  private toScheduleDate(value: Date): Date {
    const shanghaiDate = new Date(value.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return new Date(`${shanghaiDate}T00:00:00.000Z`);
  }

  private scheduleDateKey(value: Date): string {
    return value.toISOString().slice(0, 10);
  }

  private getShanghaiHour(date: Date): number {
    return (
      Number(
        new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          hour12: false,
          timeZone: 'Asia/Shanghai'
        }).format(date)
      ) % 24
    );
  }

  private isUniqueConflict(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
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
