import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../database/prisma.service';
import { PrismaViolationsRepository } from './prisma-violations.repository';
import { VIOLATION_REPOSITORY, ViolationsService } from './violations.service';
import { ViolationsController } from './violations.controller';

@Module({
  imports: [AuthModule],
  controllers: [ViolationsController],
  providers: [
    PrismaService,
    ViolationsService,
    PrismaViolationsRepository,
    {
      provide: VIOLATION_REPOSITORY,
      useExisting: PrismaViolationsRepository
    }
  ]
})
export class ViolationsModule {}
