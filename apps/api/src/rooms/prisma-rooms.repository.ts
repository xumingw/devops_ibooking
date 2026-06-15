import { Injectable } from '@nestjs/common';
import { Prisma, Room as PrismaRoom } from '@prisma/client';
import {
  BookingStatus,
  Room,
  RoomAvailabilitySummary,
  RoomCatalogItem
} from '@ibooking/shared-types';
import { PrismaService } from '../database/prisma.service';
import { NormalizedRoomInput, RoomRepository } from './rooms.service';

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ['PENDING_CHECKIN', 'CHECKED_IN'];

type RoomCatalogRow = Prisma.RoomGetPayload<{
  include: {
    department: true;
    seats: true;
  };
}>;

@Injectable()
export class PrismaRoomsRepository implements RoomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<Room[]> {
    const rooms = await this.prisma.room.findMany({ orderBy: { name: 'asc' } });
    return rooms.map((room) => this.toDomain(room));
  }

  async listCatalog(): Promise<RoomCatalogItem[]> {
    const rooms = await this.prisma.room.findMany({
      where: { status: 'ACTIVE' },
      include: {
        department: true,
        seats: true
      },
      orderBy: [{ building: 'asc' }, { floor: 'asc' }, { name: 'asc' }]
    });
    return rooms.map((room) => this.toCatalogItem(room));
  }

  async getAvailability(startAt: Date, endAt: Date): Promise<RoomAvailabilitySummary> {
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
          endAt: { gt: startAt },
          room: { status: 'ACTIVE' },
          seat: { status: 'ACTIVE' }
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

  async findById(id: string): Promise<Room | null> {
    const room = await this.prisma.room.findUnique({ where: { id } });
    return room ? this.toDomain(room) : null;
  }

  async findByName(name: string): Promise<Room | null> {
    const room = await this.prisma.room.findUnique({ where: { name } });
    return room ? this.toDomain(room) : null;
  }

  async create(input: NormalizedRoomInput): Promise<Room> {
    const room = await this.prisma.room.create({ data: input });
    return this.toDomain(room);
  }

  async update(id: string, input: NormalizedRoomInput): Promise<Room> {
    const room = await this.prisma.room.update({
      where: { id },
      data: input
    });
    return this.toDomain(room);
  }

  private toDomain(room: PrismaRoom): Room {
    return {
      id: room.id,
      name: room.name,
      building: room.building,
      floor: room.floor,
      capacity: room.capacity,
      scopeType: room.scopeType,
      departmentId: room.departmentId,
      openHour: room.openHour,
      closeHour: room.closeHour,
      overnight: room.overnight,
      status: room.status
    };
  }

  private toCatalogItem(room: RoomCatalogRow): RoomCatalogItem {
    const activeSeats = room.seats.filter((seat) => seat.status === 'ACTIVE');
    return {
      id: room.id,
      name: room.name,
      building: room.building,
      floor: `${room.floor}楼`,
      capacity: activeSeats.length,
      hours: formatRoomHours(room),
      scope:
        room.scopeType === 'SCHOOL'
          ? '全校开放'
          : `仅${room.department?.name ?? '院系'}`,
      tags: summarizeRoomTags(room, activeSeats),
      resourceStatus: room.status
    };
  }
}

function formatRoomHours(room: Pick<PrismaRoom, 'openHour' | 'closeHour' | 'overnight'>): string {
  const open = `${String(room.openHour).padStart(2, '0')}:00`;
  const close = room.closeHour === 24 ? '24:00' : `${String(room.closeHour).padStart(2, '0')}:00`;
  return room.overnight ? `${open}–${close}（跨天）` : `${open}–${close}`;
}

function summarizeRoomTags(room: RoomCatalogRow, activeSeats: RoomCatalogRow['seats']): string[] {
  const tags = new Set<string>();
  if ((room.openHour === 0 && room.closeHour === 24) || room.overnight) {
    tags.add('24小时');
  }
  if (activeSeats.some((seat) => seat.hasPower)) tags.add('插座');
  if (activeSeats.some((seat) => seat.nearWindow)) tags.add('靠窗');
  if (activeSeats.some((seat) => asRecord(seat.attributes).quietZone === true)) {
    tags.add('安静区');
  }
  if (tags.size === 0) tags.add('普通座');
  return Array.from(tags);
}

function asRecord(value: Prisma.JsonValue): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
