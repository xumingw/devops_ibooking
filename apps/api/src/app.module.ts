import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { RequestContextMiddleware } from './common/request-context.middleware';
import { ResponseInterceptor } from './common/response.interceptor';
import { PrismaService } from './database/prisma.service';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { AuthModule } from './auth/auth.module';
import { RoomsModule } from './rooms/rooms.module';
import { SeatsModule } from './seats/seats.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ViolationsModule } from './violations/violations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BookingsModule } from './bookings/bookings.module';
import { CheckInsModule } from './checkins/checkins.module';
import { AssistantModule } from './assistant/assistant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env.local',
        '.env',
        'apps/api/.env.local',
        'apps/api/.env',
        '../../.env.local',
        '../../.env'
      ]
    }),
    AuthModule,
    RoomsModule,
    SeatsModule,
    UsersModule,
    RolesModule,
    ViolationsModule,
    NotificationsModule,
    BookingsModule,
    CheckInsModule,
    AssistantModule
  ],
  controllers: [HealthController],
  providers: [
    PrismaService,
    HealthService,
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
