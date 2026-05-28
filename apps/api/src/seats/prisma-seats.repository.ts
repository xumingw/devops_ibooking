import { Injectable } from '@nestjs/common';
import { Prisma, Room as PrismaRoom, Seat as PrismaSeat } from '@prisma/client';
import { Seat } from '@ibooking/shared-types';
import { PrismaService } from '../database/prisma.service';
import { NormalizedSeatInput, SeatRepository } from './seats.service';

type PrismaSeatWithRoom = PrismaSeat & {
  room?: Pick<PrismaRoom, 'name'> | null;
};

@Injectable()
export class PrismaSeatsRepository implements SeatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(roomId?: string): Promise<Seat[]> {
    const seats = await this.prisma.seat.findMany({
      where: roomId ? { roomId } : undefined,
      include: { room: { select: { name: true } } },
      orderBy: [{ roomId: 'asc' }, { code: 'asc' }]
    });
    return seats.map((seat) => this.toDomain(seat));
  }

  async findById(id: string): Promise<Seat | null> {
    const seat = await this.prisma.seat.findUnique({
      where: { id },
      include: { room: { select: { name: true } } }
    });
    return seat ? this.toDomain(seat) : null;
  }

  async findByRoomAndCode(roomId: string, code: string): Promise<Seat | null> {
    const seat = await this.prisma.seat.findUnique({
      where: { roomId_code: { roomId, code } },
      include: { room: { select: { name: true } } }
    });
    return seat ? this.toDomain(seat) : null;
  }

  async roomExists(roomId: string): Promise<boolean> {
    const count = await this.prisma.room.count({ where: { id: roomId } });
    return count > 0;
  }

  async create(input: NormalizedSeatInput): Promise<Seat> {
    const seat = await this.prisma.seat.create({
      data: this.toPrismaData(input),
      include: { room: { select: { name: true } } }
    });
    return this.toDomain(seat);
  }

  async update(id: string, input: NormalizedSeatInput): Promise<Seat> {
    const seat = await this.prisma.seat.update({
      where: { id },
      data: this.toPrismaData(input),
      include: { room: { select: { name: true } } }
    });
    return this.toDomain(seat);
  }

  private toPrismaData(input: NormalizedSeatInput): Prisma.SeatUncheckedCreateInput {
    return {
      roomId: input.roomId,
      code: input.code,
      x: input.x,
      y: input.y,
      hasPower: input.hasPower,
      nearWindow: input.nearWindow,
      attributes: { quietZone: input.quietZone },
      status: input.status
    };
  }

  private toDomain(seat: PrismaSeatWithRoom): Seat {
    return {
      id: seat.id,
      roomId: seat.roomId,
      roomName: seat.room?.name,
      code: seat.code,
      x: seat.x,
      y: seat.y,
      hasPower: seat.hasPower,
      nearWindow: seat.nearWindow,
      quietZone: this.readQuietZone(seat.attributes),
      status: seat.status,
      updatedAt: seat.updatedAt.toISOString()
    };
  }

  private readQuietZone(attributes: Prisma.JsonValue): boolean {
    if (!attributes || typeof attributes !== 'object' || Array.isArray(attributes)) return false;
    return (attributes as Record<string, unknown>).quietZone === true;
  }
}
