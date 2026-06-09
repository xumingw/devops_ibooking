import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../database/prisma.service';
import { PrismaStudentHomeRepository } from './prisma-student-home.repository';
import { StudentHomeController } from './student-home.controller';
import { STUDENT_HOME_REPOSITORY, StudentHomeService } from './student-home.service';

@Module({
  imports: [AuthModule],
  controllers: [StudentHomeController],
  providers: [
    PrismaService,
    StudentHomeService,
    PrismaStudentHomeRepository,
    {
      provide: STUDENT_HOME_REPOSITORY,
      useExisting: PrismaStudentHomeRepository
    }
  ]
})
export class StudentHomeModule {}
