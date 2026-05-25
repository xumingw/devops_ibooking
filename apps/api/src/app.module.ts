import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { BookingsController } from './bookings/bookings.controller';
import { BookingsService } from './bookings/bookings.service';
import { BOOKINGS_STORE, bookingsStore } from './bookings/bookings.store';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { RequestContextMiddleware } from './common/request-context.middleware';
import { ResponseInterceptor } from './common/response.interceptor';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { SeatsController } from './seats/seats.controller';
import { SeatsService } from './seats/seats.service';
import { SEATS_STORE, seatsStore } from './seats/seats.store';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [HealthController, SeatsController, BookingsController],
  providers: [
    HealthService,
    { provide: SEATS_STORE, useValue: seatsStore },
    { provide: BOOKINGS_STORE, useValue: bookingsStore },
    SeatsService,
    BookingsService,
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
