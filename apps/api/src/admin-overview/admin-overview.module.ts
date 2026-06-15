import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../database/prisma.service';
import { AdminOverviewController } from './admin-overview.controller';
import { ADMIN_OVERVIEW_REPOSITORY, AdminOverviewService } from './admin-overview.service';
import { PrismaAdminOverviewRepository } from './prisma-admin-overview.repository';

@Module({
  imports: [AuthModule],
  controllers: [AdminOverviewController],
  providers: [
    PrismaService,
    AdminOverviewService,
    {
      provide: ADMIN_OVERVIEW_REPOSITORY,
      useClass: PrismaAdminOverviewRepository
    }
  ]
})
export class AdminOverviewModule {}
