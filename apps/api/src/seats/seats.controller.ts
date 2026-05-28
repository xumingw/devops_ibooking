import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Seat } from '@ibooking/shared-types';
import { AuthGuard } from '../auth/auth.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CreateSeatDto, ListSeatsQueryDto, UpdateSeatDto } from './seats.dto';
import { SeatsService } from './seats.service';

@ApiTags('seats')
@Controller('api/v1/seats')
@UseGuards(AuthGuard, PermissionsGuard)
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get()
  @RequirePermissions('seat.read')
  listSeats(@Query() query: ListSeatsQueryDto): Promise<Seat[]> {
    return this.seatsService.listSeats(query.roomId);
  }

  @Post()
  @RequirePermissions('seat.write')
  createSeat(@Body() body: CreateSeatDto): Promise<Seat> {
    return this.seatsService.createSeat(body);
  }

  @Patch(':id')
  @RequirePermissions('seat.write')
  updateSeat(@Param('id') id: string, @Body() body: UpdateSeatDto): Promise<Seat> {
    return this.seatsService.updateSeat(id, body);
  }
}
