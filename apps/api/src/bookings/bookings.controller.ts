import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StudentBookingRecord, StudentBookingSummary } from '@ibooking/shared-types';
import { AuthenticatedRequest, AuthGuard } from '../auth/auth.guard';
import { BookingsService } from './bookings.service';

@ApiTags('bookings')
@Controller('api/v1/bookings')
@UseGuards(AuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('me')
  getMyBookings(@Req() request: AuthenticatedRequest): Promise<StudentBookingSummary> {
    return this.bookingsService.getStudentSummary(request.auth!.user.id);
  }

  @Patch('me/:bookingId/cancel')
  cancelMyBooking(
    @Req() request: AuthenticatedRequest,
    @Param('bookingId') bookingId: string
  ): Promise<StudentBookingRecord> {
    return this.bookingsService.cancelStudentBooking(request.auth!.user.id, bookingId);
  }
}
