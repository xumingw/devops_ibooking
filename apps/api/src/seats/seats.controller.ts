import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  CreateSeatRequestSchema,
  SeatResponseDto,
  UpdateSeatRequestSchema,
  UpdateSeatStatusRequestSchema,
} from '@ibooking/shared-types';
import { parseBody } from '../common/parse-body';
import { SeatsService } from './seats.service';

@Controller('api/v1')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get('rooms/:roomId/seats')
  list(@Param('roomId') roomId: string): SeatResponseDto[] {
    return this.seatsService.list(roomId);
  }

  @Post('rooms/:roomId/seats')
  create(@Param('roomId') roomId: string, @Body() body: unknown): SeatResponseDto {
    return this.seatsService.create(roomId, parseBody(CreateSeatRequestSchema, body));
  }

  @Patch('seats/:id')
  update(@Param('id') id: string, @Body() body: unknown): SeatResponseDto {
    return this.seatsService.update(id, parseBody(UpdateSeatRequestSchema, body));
  }

  @Patch('seats/:id/status')
  updateStatus(@Param('id') id: string, @Body() body: unknown): SeatResponseDto {
    const dto = parseBody(UpdateSeatStatusRequestSchema, body);
    return this.seatsService.updateStatus(id, dto.status);
  }
}
