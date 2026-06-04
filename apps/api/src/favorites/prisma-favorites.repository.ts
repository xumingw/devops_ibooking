import { Injectable } from '@nestjs/common';
import { StudentRoomFavoriteSummary } from '@ibooking/shared-types';
import { PrismaService } from '../database/prisma.service';
import { FavoritesRepository } from './favorites.service';

@Injectable()
export class PrismaFavoritesRepository implements FavoritesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listRoomFavorites(userId: string): Promise<StudentRoomFavoriteSummary> {
    const rows = await this.prisma.favorite.findMany({
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
    });

    return {
      favoriteRoomIds: rows.map((row) => row.roomId),
      favorites: rows.map((row) => ({
        roomId: row.roomId,
        room: row.room.name
      }))
    };
  }

  async addRoomFavorite(userId: string, roomId: string): Promise<void> {
    await this.prisma.favorite.upsert({
      where: {
        userId_roomId: {
          userId,
          roomId
        }
      },
      update: {},
      create: {
        userId,
        roomId
      }
    });
  }

  async removeRoomFavorite(userId: string, roomId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({
      where: {
        userId,
        roomId
      }
    });
  }
}
