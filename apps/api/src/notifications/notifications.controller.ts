import { Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StudentNotificationSummary } from '@ibooking/shared-types';
import { AuthenticatedRequest, AuthGuard } from '../auth/auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('api/v1/notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  getMyNotifications(@Req() request: AuthenticatedRequest): Promise<StudentNotificationSummary> {
    return this.notificationsService.getStudentSummary(request.auth!.user.id);
  }

  @Patch('me/read-all')
  markMyNotificationsRead(@Req() request: AuthenticatedRequest): Promise<StudentNotificationSummary> {
    return this.notificationsService.markAllRead(request.auth!.user.id);
  }
}
