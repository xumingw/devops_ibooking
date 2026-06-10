// @story US1.3.1
// @tc TC-US1.3.1-01
// @story US1.3.2
// @tc TC-US1.3.2-01
import { Role } from '@ibooking/shared-types';
import {
  NormalizedRoleListFilters,
  RoleRepository,
  RolesService
} from '../../../src/roles/roles.service';

class MemoryRoleRepository implements RoleRepository {
  lastFilters: NormalizedRoleListFilters = {};

  constructor(private readonly roles: Role[]) {}

  async list(filters: NormalizedRoleListFilters): Promise<Role[]> {
    this.lastFilters = filters;
    return this.roles
      .filter((role) => {
        if (!filters.keyword) return true;
        const keyword = filters.keyword.toLowerCase();
        return [
          role.code,
          role.name,
          ...(role.permissions ?? []).map((permission) => permission.name),
          ...(role.permissions ?? []).map((permission) => permission.code)
        ].some((field) => field.toLowerCase().includes(keyword));
      })
      .map((role) => ({
        ...role,
        permissions: role.permissions?.map((permission) => ({ ...permission }))
      }));
  }

  async create(input: Parameters<RoleRepository['create']>[0]): Promise<Role> {
    const role = roleFixture({
      id: `role-${input.code}`,
      code: input.code,
      name: input.name,
      userCount: 0,
      permissions: input.menuKeys.map((menuKey) => ({
        id: `perm-${menuKey}`,
        code: `${menuKey}.read`,
        name: `${menuKey}权限`,
        menuKey
      }))
    });
    this.roles.push(role);
    return { ...role, permissions: role.permissions?.map((permission) => ({ ...permission })) };
  }

  async updatePermissions(
    roleId: string,
    input: Parameters<RoleRepository['updatePermissions']>[1]
  ): Promise<Role> {
    const role = this.roles.find((candidate) => candidate.id === roleId);
    if (!role) throw new Error('not found');
    role.permissions = input.menuKeys.map((menuKey) => ({
      id: `perm-${menuKey}`,
      code: `${menuKey}.read`,
      name: `${menuKey}权限`,
      menuKey
    }));
    return { ...role, permissions: role.permissions.map((permission) => ({ ...permission })) };
  }
}

describe('RolesService', () => {
  let repository: MemoryRoleRepository;
  let service: RolesService;

  beforeEach(() => {
    repository = new MemoryRoleRepository([
      roleFixture({
        id: 'role-room-admin',
        code: 'ROLE_ROOM_ADMIN',
        name: '自习室管理员',
        userCount: 3,
        permissions: [
          { id: 'perm-room-read', code: 'room.read', name: '查看自习室', menuKey: 'rooms' },
          { id: 'perm-seat-write', code: 'seat.write', name: '维护座位', menuKey: 'seats' }
        ]
      }),
      roleFixture({
        id: 'role-full-admin',
        code: 'ROLE_FULL_ADMIN',
        name: '超级管理员',
        userCount: 1,
        permissions: [
          { id: 'perm-user-read', code: 'user.read', name: '查看用户', menuKey: 'users' },
          { id: 'perm-role-assign', code: 'role.assign', name: '分配角色', menuKey: 'roles' }
        ]
      }),
      roleFixture({
        id: 'role-audit',
        code: 'ROLE_AUDIT',
        name: '数据审计员',
        userCount: 2,
        permissions: [
          { id: 'perm-audit-read', code: 'audit.read', name: '查看审计日志', menuKey: 'audit' }
        ]
      })
    ]);
    service = new RolesService(repository);
  });

  it('返回角色列表并按角色编码排序，供后台角色权限页展示', async () => {
    const roles = await service.listRoles();

    expect(roles.map((role) => role.code)).toEqual([
      'ROLE_AUDIT',
      'ROLE_FULL_ADMIN',
      'ROLE_ROOM_ADMIN'
    ]);
    expect(roles[1]).toMatchObject({
      name: '超级管理员',
      userCount: 1
    });
    expect(roles[1].permissions).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'user.read', menuKey: 'users' })])
    );
  });

  it('归一化关键词筛选条件后查询角色和权限点', async () => {
    const roles = await service.listRoles({ keyword: '  座位  ' });

    expect(repository.lastFilters).toEqual({ keyword: '座位' });
    expect(roles.map((role) => role.code)).toEqual(['ROLE_ROOM_ADMIN']);
  });

  it('创建角色和更新菜单权限时会归一化输入', async () => {
    const created = await service.createRole({
      name: ' 夜间值班管理员 ',
      code: ' ROLE_NIGHT_ADMIN ',
      menuKeys: ['bookings', 'qrcode', 'bookings']
    });

    expect(created).toMatchObject({
      name: '夜间值班管理员',
      code: 'ROLE_NIGHT_ADMIN'
    });
    expect(created.permissions?.map((permission) => permission.menuKey)).toEqual([
      'bookings',
      'qrcode'
    ]);

    const updated = await service.updateRolePermissions(created.id, {
      menuKeys: [' violations ', 'bookings']
    });
    expect(updated.permissions?.map((permission) => permission.menuKey)).toEqual([
      'violations',
      'bookings'
    ]);
  });
});

function roleFixture(input: {
  id: string;
  code: string;
  name: string;
  userCount: number;
  permissions: NonNullable<Role['permissions']>;
}): Role {
  return {
    id: input.id,
    code: input.code,
    name: input.name,
    userCount: input.userCount,
    permissions: input.permissions,
    updatedAt: '2026-05-28T03:40:35.000Z'
  };
}
