import { Inject, Injectable } from '@nestjs/common';
import { StudentBookingRecord, StudentBookingSummary } from '@ibooking/shared-types';

export const BOOKING_REPOSITORY = 'BOOKING_REPOSITORY';

export interface BookingRepository {
  listByUserId(userId: string): Promise<StudentBookingRecord[]>;
}

@Injectable()
export class BookingsService {
  constructor(@Inject(BOOKING_REPOSITORY) private readonly repository: BookingRepository) {}

  async getStudentSummary(userId: string): Promise<StudentBookingSummary> {
    const records = await this.repository.listByUserId(userId);
    return {
      totalCount: records.length,
      activeCount: records.filter(
        (record) => record.status === 'upcoming' || record.status === 'using'
      ).length,
      completedCount: records.filter((record) => record.status === 'completed').length,
      records
    };
  }
}
