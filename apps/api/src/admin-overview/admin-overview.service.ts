import { Inject, Injectable } from '@nestjs/common';
import {
  AdminBookingRecordPage,
  AdminOverviewSnapshot,
  AdminViolationRecordPage
} from '@ibooking/shared-types';

export const ADMIN_OVERVIEW_REPOSITORY = 'ADMIN_OVERVIEW_REPOSITORY';
const DEFAULT_ADMIN_BOOKING_PAGE_SIZE = 10;
const MAX_ADMIN_BOOKING_PAGE_SIZE = 50;

export type AdminBookingPageRequest = {
  page?: number;
  size?: number;
};

export interface AdminOverviewRepository {
  getSnapshot(now?: Date): Promise<AdminOverviewSnapshot>;
  listBookings(query: { page: number; size: number }): Promise<AdminBookingRecordPage>;
  listViolations(query: { page: number; size: number }): Promise<AdminViolationRecordPage>;
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

  listBookings(query: AdminBookingPageRequest = {}): Promise<AdminBookingRecordPage> {
    return this.repository.listBookings({
      page: normalizePageNumber(query.page),
      size: normalizePageSize(query.size)
    });
  }

  listViolations(query: AdminBookingPageRequest = {}): Promise<AdminViolationRecordPage> {
    return this.repository.listViolations({
      page: normalizePageNumber(query.page),
      size: normalizePageSize(query.size)
    });
  }
}

function normalizePageNumber(page: number | undefined): number {
  if (!Number.isFinite(page) || !page || page < 1) return 1;
  return Math.floor(page);
}

function normalizePageSize(size: number | undefined): number {
  if (!Number.isFinite(size) || !size || size < 1) return DEFAULT_ADMIN_BOOKING_PAGE_SIZE;
  return Math.min(MAX_ADMIN_BOOKING_PAGE_SIZE, Math.floor(size));
}
