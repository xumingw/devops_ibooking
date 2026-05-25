import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  BookingResponseDto,
  CancelBookingRequestSchema,
  CheckInBookingRequestSchema,
  CreateBookingRequestSchema,
} from '@ibooking/shared-types';
import { parseBody } from '../common/parse-body';
import { BookingsService } from './bookings.service';

@Controller('api/v1/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() body: unknown): BookingResponseDto {
    return this.bookingsService.create(parseBody(CreateBookingRequestSchema, body));
  }

  @Get('me')
  listMine(@Query('userId') userId: string): BookingResponseDto[] {
    return this.bookingsService.listMine(userId);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Body() body: unknown): BookingResponseDto {
    return this.bookingsService.cancel(id, parseBody(CancelBookingRequestSchema, body));
  }

  @Post(':id/check-in')
  checkIn(@Param('id') id: string, @Body() body: unknown): BookingResponseDto {
    return this.bookingsService.checkIn(id, parseBody(CheckInBookingRequestSchema, body));
  }
}
