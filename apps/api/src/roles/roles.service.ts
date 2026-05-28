import { Inject, Injectable } from '@nestjs/common';
import { Role } from '@ibooking/shared-types';

export const ROLE_REPOSITORY = 'ROLE_REPOSITORY';

export type RoleListFilters = {
  keyword?: string;
};

export type NormalizedRoleListFilters = {
  keyword?: string;
};

export interface RoleRepository {
  list(filters: NormalizedRoleListFilters): Promise<Role[]>;
}

@Injectable()
export class RolesService {
  constructor(@Inject(ROLE_REPOSITORY) private readonly repository: RoleRepository) {}

  async listRoles(filters: RoleListFilters = {}): Promise<Role[]> {
    const roles = await this.repository.list(this.normalizeFilters(filters));
    return roles.sort((left, right) => left.code.localeCompare(right.code, 'en-US'));
  }

  private normalizeFilters(filters: RoleListFilters): NormalizedRoleListFilters {
    const normalized: NormalizedRoleListFilters = {};
    const keyword = filters.keyword?.trim();
    if (keyword) normalized.keyword = keyword;
    return normalized;
  }
}
