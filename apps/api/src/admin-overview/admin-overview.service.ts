import { Inject, Injectable } from '@nestjs/common';
import { AdminOverviewSnapshot } from '@ibooking/shared-types';

export const ADMIN_OVERVIEW_REPOSITORY = 'ADMIN_OVERVIEW_REPOSITORY';

export interface AdminOverviewRepository {
  getSnapshot(now?: Date): Promise<AdminOverviewSnapshot>;
}

@Injectable()
export class AdminOverviewService {
  constructor(
    @Inject(ADMIN_OVERVIEW_REPOSITORY)
    private readonly repository: AdminOverviewRepository
  ) {}

  getSnapshot(): Promise<AdminOverviewSnapshot> {
    return this.repository.getSnapshot(new Date());
  }
}
