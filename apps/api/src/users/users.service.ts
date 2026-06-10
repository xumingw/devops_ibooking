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

export type CreateUserInput = {
  name: string;
  studentNo: string;
  departmentName?: string;
  roleName: string;
  status?: UserStatus;
};

export type AssignUserRoleInput = {
  roleName: string;
};

export interface UserRepository {
  list(filters: NormalizedUserListFilters): Promise<User[]>;
  create(input: CreateUserInput): Promise<User>;
  createMany(inputs: CreateUserInput[]): Promise<User[]>;
  assignRole(userId: string, input: AssignUserRoleInput): Promise<User>;
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

  async createUser(input: CreateUserInput): Promise<User> {
    return this.repository.create(this.normalizeCreateInput(input));
  }

  async importUsers(inputs: CreateUserInput[]): Promise<User[]> {
    if (inputs.length === 0) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: '导入名单不能为空'
      });
    }
    const users = await this.repository.createMany(
      inputs.map((input) => this.normalizeCreateInput(input))
    );
    return users.sort((left, right) =>
      left.studentNo.localeCompare(right.studentNo, 'en-US', { numeric: true })
    );
  }

  async assignUserRole(userId: string, input: AssignUserRoleInput): Promise<User> {
    const id = userId.trim();
    const roleName = input.roleName.trim();
    if (!id || !roleName) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: '用户和角色不能为空'
      });
    }
    return this.repository.assignRole(id, { roleName });
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

  private normalizeCreateInput(input: CreateUserInput): CreateUserInput {
    const name = input.name.trim();
    const studentNo = input.studentNo.trim();
    const departmentName = input.departmentName?.trim();
    const roleName = input.roleName.trim();
    const status = input.status ?? 'ACTIVE';

    if (!name || !studentNo || !roleName) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: '姓名、账号和角色不能为空'
      });
    }
    this.normalizeStatus(status);
    return {
      name,
      studentNo,
      departmentName: departmentName || undefined,
      roleName,
      status
    };
  }
}
