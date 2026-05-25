import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../database/prisma.service';
import { PrismaRoomsRepository } from './prisma-rooms.repository';
import { ROOM_REPOSITORY, RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';

@Module({
  imports: [AuthModule],
  controllers: [RoomsController],
  providers: [
    PrismaService,
    RoomsService,
    PrismaRoomsRepository,
    {
      provide: ROOM_REPOSITORY,
      useExisting: PrismaRoomsRepository
    }
  ]
})
export class RoomsModule {}
