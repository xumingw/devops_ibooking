import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Role } from '@ibooking/shared-types';
import { PrismaService } from '../database/prisma.service';
import { NormalizedRoleListFilters, RoleRepository } from './roles.service';

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
}
