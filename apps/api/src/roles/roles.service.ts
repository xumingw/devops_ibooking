import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ErrorCode, Role } from '@ibooking/shared-types';

export const ROLE_REPOSITORY = 'ROLE_REPOSITORY';

export type RoleListFilters = {
  keyword?: string;
};

export type NormalizedRoleListFilters = {
  keyword?: string;
};

export type CreateRoleInput = {
  name: string;
  code: string;
  menuKeys: string[];
};

export type UpdateRolePermissionsInput = {
  menuKeys: string[];
};

export interface RoleRepository {
  list(filters: NormalizedRoleListFilters): Promise<Role[]>;
  create(input: CreateRoleInput): Promise<Role>;
  updatePermissions(roleId: string, input: UpdateRolePermissionsInput): Promise<Role>;
}

@Injectable()
export class RolesService {
  constructor(@Inject(ROLE_REPOSITORY) private readonly repository: RoleRepository) {}

  async listRoles(filters: RoleListFilters = {}): Promise<Role[]> {
    const roles = await this.repository.list(this.normalizeFilters(filters));
    return roles.sort((left, right) => left.code.localeCompare(right.code, 'en-US'));
  }

  async createRole(input: CreateRoleInput): Promise<Role> {
    return this.repository.create(this.normalizeRoleInput(input));
  }

  async updateRolePermissions(
    roleId: string,
    input: UpdateRolePermissionsInput
  ): Promise<Role> {
    const id = roleId.trim();
    if (!id) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: '角色不能为空'
      });
    }
    return this.repository.updatePermissions(id, {
      menuKeys: this.normalizeMenuKeys(input.menuKeys)
    });
  }

  private normalizeFilters(filters: RoleListFilters): NormalizedRoleListFilters {
    const normalized: NormalizedRoleListFilters = {};
    const keyword = filters.keyword?.trim();
    if (keyword) normalized.keyword = keyword;
    return normalized;
  }

  private normalizeRoleInput(input: CreateRoleInput): CreateRoleInput {
    const name = input.name.trim();
    const code = input.code.trim();
    if (!name || !code) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: '角色名称和编码不能为空'
      });
    }
    return {
      name,
      code,
      menuKeys: this.normalizeMenuKeys(input.menuKeys)
    };
  }

  private normalizeMenuKeys(menuKeys: string[] = []): string[] {
    return Array.from(
      new Set(menuKeys.map((menuKey) => menuKey.trim()).filter(Boolean))
    );
  }
}
