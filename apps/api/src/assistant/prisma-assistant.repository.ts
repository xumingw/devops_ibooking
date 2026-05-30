import { Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import {
  StudentAssistantAction,
  StudentAssistantBookingCandidate,
  StudentAssistantSeatCandidate,
  StudentBookingStatus
} from '@ibooking/shared-types';
import { PrismaService } from '../database/prisma.service';
import {
  AssistantRepository,
  FindAvailableSeatsInput,
  ListAssistantBookingsInput
} from './assistant.service';

const OCCUPYING_BOOKING_STATUSES: BookingStatus[] = ['PENDING_CHECKIN', 'CHECKED_IN'];

type AssistantSeatRow = Prisma.SeatGetPayload<{
  include: {
    room: {
      include: {
        schedules: true;
      };
    };
  };
}>;

type AssistantBookingRow = Prisma.BookingGetPayload<{
  include: {
    room: {
      select: {
        id: true;
        name: true;
        building: true;
        floor: true;
      };
    };
    seat: {
      select: {
        id: true;
        code: true;
        hasPower: true;
        nearWindow: true;
        attributes: true;
      };
    };
  };
}>;

@Injectable()
export class PrismaAssistantRepository implements AssistantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAvailableSeats(input: FindAvailableSeatsInput): Promise<StudentAssistantSeatCandidate[]> {
    const where: Prisma.SeatWhereInput = {
      status: 'ACTIVE',
      ...(input.filters.hasPower ? { hasPower: true } : {}),
      ...(input.filters.nearWindow ? { nearWindow: true } : {}),
      room: {
        status: 'ACTIVE',
        OR: this.accessibleRoomScope(input.departmentId)
      },
      bookings: {
        none: {
          status: { in: OCCUPYING_BOOKING_STATUSES },
          startAt: { lt: input.timeRange.endAt },
          endAt: { gt: input.timeRange.startAt }
        }
      },
      ...(input.filters.quietZone
        ? {
            attributes: {
              path: '$.quietZone',
              equals: true
            }
          }
        : {})
    };

    const rows: AssistantSeatRow[] = await this.prisma.seat.findMany({
      where,
      include: {
        room: {
          include: {
            schedules: {
              where: {
                date: this.toScheduleDate(input.timeRange.startAt)
              },
              take: 1
            }
          }
        }
      },
      orderBy: [{ roomId: 'asc' }, { code: 'asc' }],
      take: 20
    });

    return rows
      .filter((row) => this.isRoomOpenForRange(row.room, input.timeRange))
      .slice(0, 5)
      .map((row) => this.toSeatCandidate(row, input.timeLabel));
  }

  async listBookingsByUserId(
    input: ListAssistantBookingsInput
  ): Promise<StudentAssistantBookingCandidate[]> {
    const startAt = new Date(input.targetDate);
    startAt.setHours(0, 0, 0, 0);
    const endAt = new Date(startAt);
    endAt.setDate(startAt.getDate() + 1);

    const rows = await this.prisma.booking.findMany({
      where: {
        userId: input.userId,
        startAt: {
          gte: startAt,
          lt: endAt
        }
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            building: true,
            floor: true
          }
        },
        seat: {
          select: {
            id: true,
            code: true,
            hasPower: true,
            nearWindow: true,
            attributes: true
          }
        }
      },
      orderBy: { startAt: 'asc' },
      take: 10
    });

    return rows.map((row) => this.toBookingCandidate(row, input.dateLabel));
  }

  private accessibleRoomScope(departmentId: string | null): Prisma.RoomWhereInput[] {
    const scope: Prisma.RoomWhereInput[] = [{ scopeType: 'SCHOOL' }];
    if (departmentId) scope.push({ scopeType: 'DEPARTMENT', departmentId });
    return scope;
  }

  private isRoomOpenForRange(
    room: AssistantSeatRow['room'],
    timeRange: FindAvailableSeatsInput['timeRange']
  ): boolean {
    const schedule = room.schedules[0];
    if (schedule?.closed) return false;

    const openHour = schedule?.openHour ?? room.openHour;
    const closeHour = schedule?.closeHour ?? room.closeHour;
    const overnight = room.overnight || closeHour <= openHour;
    let startHour = this.toHourOffset(timeRange.startAt, timeRange.startAt);
    let endHour = this.toHourOffset(timeRange.endAt, timeRange.startAt);
    let normalizedCloseHour = closeHour;

    if (overnight) {
      normalizedCloseHour = closeHour <= openHour ? closeHour + 24 : closeHour;
      if (startHour < openHour) startHour += 24;
      if (endHour <= openHour) endHour += 24;
    }

    return startHour >= openHour && endHour <= normalizedCloseHour && startHour < endHour;
  }

  private toHourOffset(value: Date, baseDate: Date): number {
    const dayOffset = this.daysBetween(value, baseDate) * 24;
    return dayOffset + value.getHours() + value.getMinutes() / 60;
  }

  private daysBetween(value: Date, baseDate: Date): number {
    const left = new Date(value);
    const right = new Date(baseDate);
    left.setHours(0, 0, 0, 0);
    right.setHours(0, 0, 0, 0);
    return Math.round((left.getTime() - right.getTime()) / (24 * 60 * 60 * 1000));
  }

  private toScheduleDate(value: Date): Date {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private toSeatCandidate(row: AssistantSeatRow, timeLabel: string): StudentAssistantSeatCandidate {
    return {
      roomId: row.roomId,
      seatId: row.id,
      room: row.room.name,
      location: `${row.room.building} ${row.room.floor}楼`,
      seat: row.code,
      time: this.formatSeatTime(timeLabel),
      tags: this.formatSeatTags({
        hasPower: row.hasPower,
        nearWindow: row.nearWindow,
        attributes: row.attributes
      })
    };
  }

  private toBookingCandidate(
    row: AssistantBookingRow,
    dateLabel: string
  ): StudentAssistantBookingCandidate {
    const status = this.mapBookingStatus(row.status);
    return {
      bookingId: row.id,
      room: row.room.name,
      location: `${row.room.building} ${row.room.floor}楼`,
      seat: row.seat.code,
      time: `${dateLabel} ${this.formatClock(row.startAt)}-${this.formatClock(row.endAt)}`,
      status,
      actions: this.actionsForBooking(row, status)
    };
  }

  private mapBookingStatus(status: BookingStatus): StudentBookingStatus {
    if (status === 'CHECKED_IN') return 'using';
    if (status === 'COMPLETED') return 'completed';
    if (status === 'CANCELLED_AUTO_NO_CHECKIN') return 'violation';
    if (status === 'CANCELLED_BY_USER' || status === 'CANCELLED_BY_ADMIN') return 'cancelled';
    return 'upcoming';
  }

  private actionsForBooking(
    row: Pick<AssistantBookingRow, 'startAt' | 'endAt'>,
    status: StudentBookingStatus
  ): StudentAssistantAction[] {
    if (status === 'upcoming') {
      const actions: StudentAssistantAction[] = [];
      if (this.canCheckIn(row)) actions.push('CHECK_IN');
      if (row.startAt.getTime() > Date.now()) actions.push('CANCEL');
      actions.push('DETAIL');
      return actions;
    }
    return ['DETAIL'];
  }

  private canCheckIn(row: Pick<AssistantBookingRow, 'startAt' | 'endAt'>): boolean {
    const now = Date.now();
    const checkInWindowStart = row.startAt.getTime() - 15 * 60 * 1000;
    const checkInWindowEnd = row.startAt.getTime() + 15 * 60 * 1000;
    return now >= checkInWindowStart && now <= checkInWindowEnd && now <= row.endAt.getTime();
  }

  private formatSeatTags(input: {
    hasPower: boolean;
    nearWindow: boolean;
    attributes: Prisma.JsonValue;
  }): string[] {
    const tags: string[] = [];
    if (input.hasPower) tags.push('插座');
    if (input.nearWindow) tags.push('靠窗');
    if (this.readQuietZone(input.attributes)) tags.push('安静区');
    return tags;
  }

  private readQuietZone(attributes: Prisma.JsonValue): boolean {
    if (!attributes || typeof attributes !== 'object' || Array.isArray(attributes)) return false;
    return (attributes as Record<string, unknown>).quietZone === true;
  }

  private formatClock(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  private formatSeatTime(timeLabel: string): string {
    return /\d{2}:\d{2}-\d{2}:\d{2}$/.test(timeLabel)
      ? timeLabel
      : `${timeLabel} ${this.formatClockFromLabel(timeLabel)}`;
  }

  private formatClockFromLabel(timeLabel: string): string {
    if (timeLabel.endsWith('晚上')) return '18:00-22:00';
    if (timeLabel.endsWith('下午')) return '12:00-18:00';
    if (timeLabel.endsWith('上午')) return '08:00-12:00';
    if (timeLabel.endsWith('全天')) return '08:00-22:00';
    const explicit = timeLabel.match(/(\d{2}:\d{2}-\d{2}:\d{2})$/);
    return explicit?.[1] ?? '08:00-22:00';
  }
}
