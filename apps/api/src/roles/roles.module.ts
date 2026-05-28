import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../database/prisma.service';
import { PrismaRolesRepository } from './prisma-roles.repository';
import { RolesController } from './roles.controller';
import { ROLE_REPOSITORY, RolesService } from './roles.service';

@Module({
  imports: [AuthModule],
  controllers: [RolesController],
  providers: [
    PrismaService,
    RolesService,
    PrismaRolesRepository,
    {
      provide: ROLE_REPOSITORY,
      useExisting: PrismaRolesRepository
    }
  ]
})
export class RolesModule {}
