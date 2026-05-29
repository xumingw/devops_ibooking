import { Inject, Injectable } from '@nestjs/common';
import {
  StudentNotificationGroup,
  StudentNotificationGroupLabel,
  StudentNotificationRecord,
  StudentNotificationSummary
} from '@ibooking/shared-types';

export const NOTIFICATION_REPOSITORY = 'NOTIFICATION_REPOSITORY';

const NOTIFICATION_GROUPS: StudentNotificationGroupLabel[] = ['今天', '昨天', '更早'];

export interface NotificationRepository {
  listByUserId(userId: string): Promise<StudentNotificationRecord[]>;
}

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly repository: NotificationRepository
  ) {}

  async getStudentSummary(userId: string): Promise<StudentNotificationSummary> {
    const records = await this.repository.listByUserId(userId);
    return {
      unreadCount: records.filter((record) => !record.read).length,
      groups: this.groupRecords(records)
    };
  }

  private groupRecords(records: StudentNotificationRecord[]): StudentNotificationGroup[] {
    return NOTIFICATION_GROUPS.map((date) => ({
      date,
      items: records.filter((record) => record.group === date)
    })).filter((group) => group.items.length > 0);
  }
}
