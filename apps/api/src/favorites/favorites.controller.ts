import { Controller, Delete, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StudentRoomFavoriteSummary } from '@ibooking/shared-types';
import { AuthenticatedRequest, AuthGuard } from '../auth/auth.guard';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@Controller('api/v1/favorites')
@UseGuards(AuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get('me/rooms')
  getMyRoomFavorites(@Req() request: AuthenticatedRequest): Promise<StudentRoomFavoriteSummary> {
    return this.favoritesService.getStudentRoomFavorites(request.auth!.user.id);
  }

  @Put('me/rooms/:roomId')
  addMyRoomFavorite(
    @Req() request: AuthenticatedRequest,
    @Param('roomId') roomId: string
  ): Promise<StudentRoomFavoriteSummary> {
    return this.favoritesService.addStudentRoomFavorite(request.auth!.user.id, roomId);
  }

  @Delete('me/rooms/:roomId')
  removeMyRoomFavorite(
    @Req() request: AuthenticatedRequest,
    @Param('roomId') roomId: string
  ): Promise<StudentRoomFavoriteSummary> {
    return this.favoritesService.removeStudentRoomFavorite(request.auth!.user.id, roomId);
  }
}
