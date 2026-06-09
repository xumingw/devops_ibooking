import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StudentHomeSummary, StudentRoomAvailabilitySummary } from '@ibooking/shared-types';
import { AuthenticatedRequest, AuthGuard } from '../auth/auth.guard';
import { RoomsService } from '../rooms/rooms.service';
import { StudentHomeService } from './student-home.service';

@ApiTags('student-home')
@Controller('api/v1/students')
@UseGuards(AuthGuard)
export class StudentHomeController {
  constructor(
    private readonly studentHomeService: StudentHomeService,
    private readonly roomsService: RoomsService
  ) {}

  @Get('me/home')
  getMyHomeSummary(@Req() request: AuthenticatedRequest): Promise<StudentHomeSummary> {
    return this.studentHomeService.getStudentHomeSummary(request.auth!.user.id);
  }

  @Get('me/rooms/availability')
  getRoomAvailability(
    @Query('startAt') startAt: string,
    @Query('endAt') endAt: string
  ): Promise<StudentRoomAvailabilitySummary> {
    return this.roomsService.getRoomAvailability({ startAt, endAt });
  }
}
