import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthRepository } from './auth.service';
import { AuthUserRecord, RefreshTokenRecord } from './auth.types';
import { PrismaService } from '../database/prisma.service';

const authUserInclude = {
  department: true,
  userRoles: {
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  }
} satisfies Prisma.UserInclude;

type PrismaAuthUser = Prisma.UserGetPayload<{ include: typeof authUserInclude }>;

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByStudentNo(studentNo: string): Promise<AuthUserRecord | null> {
    return this.findUser({ studentNo });
  }

  findUserByUsername(username: string): Promise<AuthUserRecord | null> {
    return this.findUser({ studentNo: username });
  }

  findUserById(userId: string): Promise<AuthUserRecord | null> {
    return this.findUser({ id: userId });
  }

  async saveRefreshToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.prisma.refreshToken.create({ data: input });
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: authUserInclude
        }
      }
    });
    if (!token) return null;

    return {
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      revoked: token.revoked,
      user: this.toAuthUser(token.user)
    };
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken
      .update({
        where: { tokenHash },
        data: {
          revoked: true,
          revokedAt: new Date()
        }
      })
      .catch(() => undefined);
  }

  private async findUser(where: { id?: string; studentNo?: string }): Promise<AuthUserRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: where.id ? { id: where.id } : { studentNo: where.studentNo ?? '' },
      include: authUserInclude
    });
    return user ? this.toAuthUser(user) : null;
  }

  private toAuthUser(user: PrismaAuthUser): AuthUserRecord {
    const permissions = new Map<string, AuthUserRecord['permissions'][number]>();
    for (const userRole of user.userRoles) {
      for (const rolePermission of userRole.role.rolePermissions) {
        const permission = rolePermission.permission;
        permissions.set(permission.code, {
          id: permission.id,
          code: permission.code,
          name: permission.name,
          menuKey: permission.menuKey
        });
      }
    }

    return {
      id: user.id,
      studentNo: user.studentNo,
      name: user.name,
      departmentId: user.departmentId,
      departmentName: user.department?.name ?? null,
      status: user.status,
      passwordHash: user.passwordHash,
      roles: user.userRoles.map((userRole) => ({
        id: userRole.role.id,
        code: userRole.role.code,
        name: userRole.role.name
      })),
      permissions: [...permissions.values()]
    };
  }
}
