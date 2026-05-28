import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ErrorCode, User, UserStatus } from '@ibooking/shared-types';

export const USER_REPOSITORY = 'USER_REPOSITORY';

const USER_STATUSES: UserStatus[] = ['ACTIVE', 'DISABLED'];

export type UserListFilters = {
  keyword?: string;
  status?: string;
  departmentId?: string;
  roleCode?: string;
};

export type NormalizedUserListFilters = {
  keyword?: string;
  status?: UserStatus;
  departmentId?: string;
  roleCode?: string;
};

export interface UserRepository {
  list(filters: NormalizedUserListFilters): Promise<User[]>;
}

@Injectable()
export class UsersService {
  constructor(@Inject(USER_REPOSITORY) private readonly repository: UserRepository) {}

  async listUsers(filters: UserListFilters = {}): Promise<User[]> {
    const normalized = this.normalizeFilters(filters);
    const users = await this.repository.list(normalized);
    return users.sort((left, right) =>
      left.studentNo.localeCompare(right.studentNo, 'en-US', { numeric: true })
    );
  }

  private normalizeFilters(filters: UserListFilters): NormalizedUserListFilters {
    const normalized: NormalizedUserListFilters = {};
    const keyword = filters.keyword?.trim();
    const status = filters.status?.trim();
    const departmentId = filters.departmentId?.trim();
    const roleCode = filters.roleCode?.trim();

    if (keyword) normalized.keyword = keyword;
    if (status) normalized.status = this.normalizeStatus(status);
    if (departmentId) normalized.departmentId = departmentId;
    if (roleCode) normalized.roleCode = roleCode;

    return normalized;
  }

  private normalizeStatus(status: string): UserStatus {
    if (!USER_STATUSES.includes(status as UserStatus)) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: '用户状态不合法'
      });
    }
    return status as UserStatus;
  }
}
