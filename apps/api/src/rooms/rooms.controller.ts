import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Room, RoomAvailabilitySummary, RoomCatalogItem } from '@ibooking/shared-types';
import { AuthGuard } from '../auth/auth.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CreateRoomDto, UpdateRoomDto } from './rooms.dto';
import { RoomsService } from './rooms.service';

@ApiTags('rooms')
@Controller('api/v1/rooms')
@UseGuards(AuthGuard, PermissionsGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  listRooms(): Promise<Room[]> {
    return this.roomsService.listRooms();
  }

  @Get('catalog')
  listCatalog(): Promise<RoomCatalogItem[]> {
    return this.roomsService.listRoomCatalog();
  }

  @Get('availability')
  getAvailability(
    @Query('startAt') startAt: string,
    @Query('endAt') endAt: string
  ): Promise<RoomAvailabilitySummary> {
    return this.roomsService.getRoomAvailability({ startAt, endAt });
  }

  @Post()
  @RequirePermissions('room.write')
  createRoom(@Body() body: CreateRoomDto): Promise<Room> {
    return this.roomsService.createRoom(body);
  }

  @Patch(':id')
  @RequirePermissions('room.write')
  updateRoom(@Param('id') id: string, @Body() body: UpdateRoomDto): Promise<Room> {
    return this.roomsService.updateRoom(id, body);
  }
}
