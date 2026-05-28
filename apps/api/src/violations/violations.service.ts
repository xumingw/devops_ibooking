import { Inject, Injectable } from '@nestjs/common';
import { StudentViolationRecord, StudentViolationSummary } from '@ibooking/shared-types';

export const VIOLATION_REPOSITORY = 'VIOLATION_REPOSITORY';

export interface ViolationRepository {
  listByUserId(userId: string): Promise<StudentViolationRecord[]>;
}

@Injectable()
export class ViolationsService {
  constructor(@Inject(VIOLATION_REPOSITORY) private readonly repository: ViolationRepository) {}

  async getStudentSummary(userId: string): Promise<StudentViolationSummary> {
    const records = await this.repository.listByUserId(userId);
    return {
      totalCount: records.reduce((sum, record) => sum + record.count, 0),
      restrictionThreshold: 3,
      severeThreshold: 5,
      records
    };
  }
}
