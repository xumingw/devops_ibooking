import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../database/prisma.service';
import { NotificationsController } from './notifications.controller';
import { NOTIFICATION_REPOSITORY, NotificationsService } from './notifications.service';
import { PrismaNotificationsRepository } from './prisma-notifications.repository';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [
    PrismaService,
    NotificationsService,
    PrismaNotificationsRepository,
    {
      provide: NOTIFICATION_REPOSITORY,
      useExisting: PrismaNotificationsRepository
    }
  ]
})
export class NotificationsModule {}
