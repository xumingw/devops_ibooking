import { Injectable } from '@nestjs/common';
import { Room as PrismaRoom } from '@prisma/client';
import { Room } from '@ibooking/shared-types';
import { PrismaService } from '../database/prisma.service';
import { NormalizedRoomInput, RoomRepository } from './rooms.service';

@Injectable()
export class PrismaRoomsRepository implements RoomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<Room[]> {
    const rooms = await this.prisma.room.findMany({ orderBy: { name: 'asc' } });
    return rooms.map((room) => this.toDomain(room));
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
}
