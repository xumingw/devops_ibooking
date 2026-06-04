import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../database/prisma.service';
import { BookingsController } from './bookings.controller';
import { BOOKING_REPOSITORY, BookingsService } from './bookings.service';
import { PrismaBookingsRepository } from './prisma-bookings.repository';

@Module({
  imports: [AuthModule],
  controllers: [BookingsController],
  providers: [
    PrismaService,
    BookingsService,
    {
      provide: BOOKING_REPOSITORY,
      useClass: PrismaBookingsRepository
    }
  ],
  exports: [BookingsService]
})
export class BookingsModule {}
