import { Inject, Injectable } from '@nestjs/common';
import { StudentRoomFavoriteSummary } from '@ibooking/shared-types';

export const FAVORITES_REPOSITORY = 'FAVORITES_REPOSITORY';

export interface FavoritesRepository {
  listRoomFavorites(userId: string): Promise<StudentRoomFavoriteSummary>;
  addRoomFavorite(userId: string, roomId: string): Promise<void>;
  removeRoomFavorite(userId: string, roomId: string): Promise<void>;
}

@Injectable()
export class FavoritesService {
  constructor(
    @Inject(FAVORITES_REPOSITORY) private readonly repository: FavoritesRepository
  ) {}

  getStudentRoomFavorites(userId: string): Promise<StudentRoomFavoriteSummary> {
    return this.repository.listRoomFavorites(userId);
  }

  async addStudentRoomFavorite(
    userId: string,
    roomId: string
  ): Promise<StudentRoomFavoriteSummary> {
    await this.repository.addRoomFavorite(userId, roomId);
    return this.getStudentRoomFavorites(userId);
  }

  async removeStudentRoomFavorite(
    userId: string,
    roomId: string
  ): Promise<StudentRoomFavoriteSummary> {
    await this.repository.removeRoomFavorite(userId, roomId);
    return this.getStudentRoomFavorites(userId);
  }
}
