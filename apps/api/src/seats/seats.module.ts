import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../database/prisma.service';
import { PrismaSeatsRepository } from './prisma-seats.repository';
import { SeatsController } from './seats.controller';
import { SEAT_REPOSITORY, SeatsService } from './seats.service';

@Module({
  imports: [AuthModule],
  controllers: [SeatsController],
  providers: [
    PrismaService,
    SeatsService,
    PrismaSeatsRepository,
    {
      provide: SEAT_REPOSITORY,
      useExisting: PrismaSeatsRepository
    }
  ]
})
export class SeatsModule {}
