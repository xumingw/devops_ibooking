import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../database/prisma.service';
import { CheckInsController } from './checkins.controller';
import { CHECK_IN_REPOSITORY, CheckInsService } from './checkins.service';
import { PrismaCheckInsRepository } from './prisma-checkins.repository';

@Module({
  imports: [AuthModule],
  controllers: [CheckInsController],
  providers: [
    PrismaService,
    CheckInsService,
    {
      provide: CHECK_IN_REPOSITORY,
      useClass: PrismaCheckInsRepository,
    },
  ],
  exports: [CheckInsService],
})
export class CheckInsModule {}
