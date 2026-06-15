import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Role } from '@ibooking/shared-types';
import { PrismaService } from '../database/prisma.service';
import {
  CreateRoleInput,
  NormalizedRoleListFilters,
  RoleRepository,
  UpdateRolePermissionsInput
} from './roles.service';

const roleListInclude = {
  rolePermissions: {
    include: {
      permission: true
    }
  },
  _count: {
    select: {
      userRoles: true
    }
  }
} satisfies Prisma.RoleInclude;

type PrismaRoleListItem = Prisma.RoleGetPayload<{ include: typeof roleListInclude }>;

@Injectable()
export class PrismaRolesRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: NormalizedRoleListFilters): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      where: this.toWhere(filters),
      include: roleListInclude,
      orderBy: { code: 'asc' }
    });
    return roles.map((role) => this.toDomain(role));
  }

  async create(input: CreateRoleInput): Promise<Role> {
    const permissions = await this.findPermissionsByMenuKeys(input.menuKeys);
    const role = await this.prisma.role.create({
      data: {
        code: input.code,
        name: input.name,
        rolePermissions: {
          create: permissions.map((permission) => ({
            permissionId: permission.id
          }))
        }
      },
      include: roleListInclude
    });
    return this.toDomain(role);
  }

  async updatePermissions(roleId: string, input: UpdateRolePermissionsInput): Promise<Role> {
    const permissions = await this.findPermissionsByMenuKeys(input.menuKeys);
    await this.prisma.rolePermission.deleteMany({ where: { roleId } });
    if (permissions.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: permissions.map((permission) => ({
          roleId,
          permissionId: permission.id
        })),
        skipDuplicates: true
      });
    }
    const role = await this.prisma.role.findUniqueOrThrow({
      where: { id: roleId },
      include: roleListInclude
    });
    return this.toDomain(role);
  }

  private toWhere(filters: NormalizedRoleListFilters): Prisma.RoleWhereInput {
    if (!filters.keyword) return {};

    return {
      OR: [
        { code: { contains: filters.keyword } },
        { name: { contains: filters.keyword } },
        {
          rolePermissions: {
            some: {
              permission: {
                OR: [
                  { code: { contains: filters.keyword } },
                  { name: { contains: filters.keyword } },
                  { menuKey: { contains: filters.keyword } }
                ]
              }
            }
          }
        }
      ]
    };
  }

  private toDomain(role: PrismaRoleListItem): Role {
    return {
      id: role.id,
      code: role.code,
      name: role.name,
      userCount: role._count.userRoles,
      permissions: role.rolePermissions
        .map((rolePermission) => ({
          id: rolePermission.permission.id,
          code: rolePermission.permission.code,
          name: rolePermission.permission.name,
          menuKey: rolePermission.permission.menuKey
        }))
        .sort((left, right) => left.code.localeCompare(right.code, 'en-US')),
      updatedAt: role.updatedAt.toISOString()
    };
  }

  private async findPermissionsByMenuKeys(menuKeys: string[]) {
    if (menuKeys.length === 0) return [];
    return this.prisma.permission.findMany({
      where: {
        menuKey: {
          in: menuKeys
        }
      },
      orderBy: { code: 'asc' }
    });
  }
}
