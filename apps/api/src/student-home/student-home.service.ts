import { Inject, Injectable } from '@nestjs/common';
import { StudentHomeSummary, StudentRoomAvailabilitySummary } from '@ibooking/shared-types';

export const STUDENT_HOME_REPOSITORY = 'STUDENT_HOME_REPOSITORY';

export interface StudentHomeRepository {
  getSummary(userId: string, now?: Date): Promise<StudentHomeSummary>;
  getRoomAvailability(startAt: Date, endAt: Date): Promise<StudentRoomAvailabilitySummary>;
}

@Injectable()
export class StudentHomeService {
  constructor(
    @Inject(STUDENT_HOME_REPOSITORY) private readonly repository: StudentHomeRepository
  ) {}

  getStudentHomeSummary(userId: string): Promise<StudentHomeSummary> {
    return this.repository.getSummary(userId);
  }

  getRoomAvailability(input: { startAt: string; endAt: string }): Promise<StudentRoomAvailabilitySummary> {
    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);
    return this.repository.getRoomAvailability(startAt, endAt);
  }
}
