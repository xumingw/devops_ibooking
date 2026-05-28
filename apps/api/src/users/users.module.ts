import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../database/prisma.service';
import { PrismaUsersRepository } from './prisma-users.repository';
import { UsersController } from './users.controller';
import { USER_REPOSITORY, UsersService } from './users.service';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [
    PrismaService,
    UsersService,
    PrismaUsersRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: PrismaUsersRepository
    }
  ]
})
export class UsersModule {}
