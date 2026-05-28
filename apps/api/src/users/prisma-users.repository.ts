import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { User } from '@ibooking/shared-types';
import { PrismaService } from '../database/prisma.service';
import { NormalizedUserListFilters, UserRepository } from './users.service';

const userListInclude = {
  department: true,
  userRoles: {
    include: {
      role: true
    }
  }
} satisfies Prisma.UserInclude;

type PrismaUserListItem = Prisma.UserGetPayload<{ include: typeof userListInclude }>;

@Injectable()
export class PrismaUsersRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: NormalizedUserListFilters): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: this.toWhere(filters),
      include: userListInclude,
      orderBy: { studentNo: 'asc' }
    });
    return users.map((user) => this.toDomain(user));
  }

  private toWhere(filters: NormalizedUserListFilters): Prisma.UserWhereInput {
    const and: Prisma.UserWhereInput[] = [];

    if (filters.status) and.push({ status: filters.status });
    if (filters.departmentId) and.push({ departmentId: filters.departmentId });
    if (filters.roleCode) {
      and.push({
        userRoles: {
          some: {
            role: {
              code: filters.roleCode
            }
          }
        }
      });
    }
    if (filters.keyword) {
      and.push({
        OR: [
          { studentNo: { contains: filters.keyword } },
          { name: { contains: filters.keyword } },
          { email: { contains: filters.keyword } },
          { department: { name: { contains: filters.keyword } } }
        ]
      });
    }

    return and.length > 0 ? { AND: and } : {};
  }

  private toDomain(user: PrismaUserListItem): User {
    return {
      id: user.id,
      studentNo: user.studentNo,
      name: user.name,
      email: user.email,
      departmentId: user.departmentId,
      departmentName: user.department?.name ?? null,
      status: user.status,
      roles: user.userRoles.map((userRole) => ({
        id: userRole.role.id,
        code: userRole.role.code,
        name: userRole.role.name
      })),
      updatedAt: user.updatedAt.toISOString()
    };
  }
}
