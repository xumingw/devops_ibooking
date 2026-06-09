import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  StudentHomeSummary,
  StudentRoomAvailabilitySummary,
  StudentWeekdayLabel
} from '@ibooking/shared-types';
import { PrismaService } from '../database/prisma.service';
import { StudentHomeRepository } from './student-home.service';

const DAY_MS = 24 * 60 * 60 * 1000;
const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;
const BOOKING_SLOT_MS = 30 * 60 * 1000;
const DAILY_BOOKING_LIMIT = 3;
const WEEKDAY_LABELS: StudentWeekdayLabel[] = ['一', '二', '三', '四', '五', '六', '日'];
const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ['PENDING_CHECKIN', 'CHECKED_IN'];
const STUDY_BOOKING_STATUSES: BookingStatus[] = ['CHECKED_IN', 'COMPLETED'];
const TODAY_BOOKING_STATUSES: BookingStatus[] = ['PENDING_CHECKIN', 'CHECKED_IN', 'COMPLETED'];

type StudyBookingRow = {
  startAt: Date;
  endAt: Date;
  status: BookingStatus;
};

@Injectable()
export class PrismaStudentHomeRepository implements StudentHomeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string, now = new Date()): Promise<StudentHomeSummary> {
    const todayStart = getShanghaiDayStart(now);
    const tomorrowStart = new Date(todayStart.getTime() + DAY_MS);
    const weekStart = getShanghaiWeekStart(now);
    const weekEnd = new Date(weekStart.getTime() + 7 * DAY_MS);
    const lastWeekStart = new Date(weekStart.getTime() - 7 * DAY_MS);
    const currentSlotStart = floorToBookingSlot(now);
    const yesterdaySlotStart = new Date(currentSlotStart.getTime() - DAY_MS);

    const [
      totalSeats,
      occupiedSeats,
      yesterdayOccupiedSeats,
      todayBookingCount,
      favoriteRows,
      studyBookings
    ] = await Promise.all([
      this.prisma.seat.count({
        where: {
          status: 'ACTIVE',
          room: { status: 'ACTIVE' }
        }
      }),
      this.countOccupiedSeatsAt(currentSlotStart),
      this.countOccupiedSeatsAt(yesterdaySlotStart),
      this.prisma.booking.count({
        where: {
          userId,
          startAt: { gte: todayStart, lt: tomorrowStart },
          status: { in: TODAY_BOOKING_STATUSES }
        }
      }),
      this.prisma.favorite.findMany({
        where: { userId },
        include: {
          room: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),
      this.prisma.booking.findMany({
        where: {
          userId,
          status: { in: STUDY_BOOKING_STATUSES },
          startAt: { lt: weekEnd },
          endAt: { gt: lastWeekStart }
        },
        select: {
          startAt: true,
          endAt: true,
          status: true
        }
      })
    ]);

    const availableSeats = Math.max(0, totalSeats - occupiedSeats);
    const yesterdayAvailableSeats = Math.max(0, totalSeats - yesterdayOccupiedSeats);
    const studySummary = summarizeStudyHours(studyBookings, now, weekStart, weekEnd, lastWeekStart);

    return {
      totalSeats,
      availableSeats,
      availableSeatsDeltaPercent: percentageDelta(availableSeats, yesterdayAvailableSeats),
      todayBookingCount,
      dailyBookingLimit: DAILY_BOOKING_LIMIT,
      favoriteRooms: favoriteRows.map((row) => ({
        roomId: row.roomId,
        room: row.room.name
      })),
      weekStudyHours: studySummary.weekStudyHours,
      lastWeekStudyHours: studySummary.lastWeekStudyHours,
      weekRecords: WEEKDAY_LABELS.map((day, index) => ({
        day,
        hours: studySummary.weekRecords[index] ?? 0
      }))
    };
  }

  async getRoomAvailability(startAt: Date, endAt: Date): Promise<StudentRoomAvailabilitySummary> {
    const [seats, occupiedBookings] = await Promise.all([
      this.prisma.seat.findMany({
        where: {
          status: 'ACTIVE',
          room: { status: 'ACTIVE' }
        },
        select: {
          id: true,
          roomId: true
        },
        orderBy: [{ roomId: 'asc' }, { code: 'asc' }]
      }),
      this.prisma.booking.findMany({
        where: {
          status: { in: ACTIVE_BOOKING_STATUSES },
          startAt: { lt: endAt },
          endAt: { gt: startAt }
        },
        select: {
          roomId: true,
          seatId: true
        }
      })
    ]);

    const totalsByRoomId = new Map<string, number>();
    seats.forEach((seat) => {
      totalsByRoomId.set(seat.roomId, (totalsByRoomId.get(seat.roomId) ?? 0) + 1);
    });

    const occupiedSeatIdsByRoomId = new Map<string, Set<string>>();
    occupiedBookings.forEach((booking) => {
      const occupiedSeatIds = occupiedSeatIdsByRoomId.get(booking.roomId) ?? new Set<string>();
      occupiedSeatIds.add(booking.seatId);
      occupiedSeatIdsByRoomId.set(booking.roomId, occupiedSeatIds);
    });

    const rooms = Array.from(totalsByRoomId.entries()).map(([roomId, totalSeats]) => {
      const occupiedSeats = occupiedSeatIdsByRoomId.get(roomId)?.size ?? 0;
      return {
        roomId,
        totalSeats,
        availableSeats: Math.max(0, totalSeats - occupiedSeats)
      };
    });

    return {
      totalSeats: rooms.reduce((sum, room) => sum + room.totalSeats, 0),
      availableSeats: rooms.reduce((sum, room) => sum + room.availableSeats, 0),
      rooms
    };
  }

  private countOccupiedSeatsAt(slotStart: Date): Promise<number> {
    return this.prisma.bookingSlot.count({
      where: {
        slotStart,
        booking: {
          status: { in: ACTIVE_BOOKING_STATUSES }
        }
      }
    });
  }
}

function floorToBookingSlot(date: Date): Date {
  return new Date(Math.floor(date.getTime() / BOOKING_SLOT_MS) * BOOKING_SLOT_MS);
}

function getShanghaiDayStart(date: Date): Date {
  const shiftedTime = date.getTime() + SHANGHAI_OFFSET_MS;
  return new Date(Math.floor(shiftedTime / DAY_MS) * DAY_MS - SHANGHAI_OFFSET_MS);
}

function getShanghaiWeekStart(date: Date): Date {
  const dayStart = getShanghaiDayStart(date);
  const shanghaiDate = new Date(date.getTime() + SHANGHAI_OFFSET_MS);
  const dayOfWeek = shanghaiDate.getUTCDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  return new Date(dayStart.getTime() - daysSinceMonday * DAY_MS);
}

function percentageDelta(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function summarizeStudyHours(
  bookings: StudyBookingRow[],
  now: Date,
  weekStart: Date,
  weekEnd: Date,
  lastWeekStart: Date
) {
  const weekRecords = Array.from({ length: 7 }, () => 0);
  let lastWeekStudyHours = 0;

  bookings.forEach((booking) => {
    const effectiveEnd =
      booking.status === 'CHECKED_IN' && booking.endAt.getTime() > now.getTime()
        ? now
        : booking.endAt;
    if (effectiveEnd <= booking.startAt) return;

    lastWeekStudyHours += sumOverlapHours(booking.startAt, effectiveEnd, lastWeekStart, weekStart);
    splitCurrentWeekHours(booking.startAt, effectiveEnd, weekStart, weekEnd, weekRecords);
  });

  return {
    weekStudyHours: roundHours(weekRecords.reduce((sum, hours) => sum + hours, 0)),
    lastWeekStudyHours: roundHours(lastWeekStudyHours),
    weekRecords: weekRecords.map(roundHours)
  };
}

function splitCurrentWeekHours(
  startAt: Date,
  endAt: Date,
  weekStart: Date,
  weekEnd: Date,
  weekRecords: number[]
) {
  let cursor = new Date(Math.max(startAt.getTime(), weekStart.getTime()));
  const effectiveEnd = new Date(Math.min(endAt.getTime(), weekEnd.getTime()));
  while (cursor < effectiveEnd) {
    const dayStart = getShanghaiDayStart(cursor);
    const nextDayStart = new Date(dayStart.getTime() + DAY_MS);
    const segmentEnd = new Date(Math.min(effectiveEnd.getTime(), nextDayStart.getTime()));
    const dayIndex = Math.floor((dayStart.getTime() - weekStart.getTime()) / DAY_MS);
    if (dayIndex >= 0 && dayIndex < weekRecords.length) {
      weekRecords[dayIndex] += (segmentEnd.getTime() - cursor.getTime()) / 3_600_000;
    }
    cursor = segmentEnd;
  }
}

function sumOverlapHours(startAt: Date, endAt: Date, rangeStart: Date, rangeEnd: Date): number {
  const overlapStart = Math.max(startAt.getTime(), rangeStart.getTime());
  const overlapEnd = Math.min(endAt.getTime(), rangeEnd.getTime());
  if (overlapEnd <= overlapStart) return 0;
  return (overlapEnd - overlapStart) / 3_600_000;
}

function roundHours(hours: number): number {
  return Math.round(hours * 10) / 10;
}
