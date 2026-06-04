// @story US1.1.1
// @story US1.1.2
// @story US1.1.3
// @tc TC-US1.1.1-01
// @tc TC-US1.1.2-01
// @tc TC-US1.1.3-01
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ErrorCode } from '@ibooking/shared-types';
import { AuthRepository, AuthService } from '../../../src/auth/auth.service';
import { PasswordHasher } from '../../../src/auth/password-hasher';
import { TokenService } from '../../../src/auth/token.service';

type UserFixture = {
  id: string;
  studentNo: string;
  name: string;
  departmentId: string | null;
  departmentName: string | null;
  status: 'ACTIVE' | 'DISABLED';
  passwordHash: string;
  roles: Array<{ code: string; name: string }>;
  permissions: Array<{ code: string; name: string }>;
};

class MemoryAuthRepository implements AuthRepository {
  readonly refreshTokens = new Map<
    string,
    { userId: string; tokenHash: string; expiresAt: Date; revoked: boolean }
  >();

  constructor(private readonly users: UserFixture[]) {}

  findUserByStudentNo(studentNo: string) {
    return Promise.resolve(this.users.find((user) => user.studentNo === studentNo) ?? null);
  }

  findUserByUsername(username: string) {
    return this.findUserByStudentNo(username);
  }

  findUserById(userId: string) {
    return Promise.resolve(this.users.find((user) => user.id === userId) ?? null);
  }

  saveRefreshToken(input: { userId: string; tokenHash: string; expiresAt: Date }) {
    this.refreshTokens.set(input.tokenHash, { ...input, revoked: false });
    return Promise.resolve();
  }

  async findRefreshToken(tokenHash: string) {
    const token = this.refreshTokens.get(tokenHash);
    if (!token) return null;
    const user = await this.findUserById(token.userId);
    if (!user) return null;
    return { ...token, user };
  }

  revokeRefreshToken(tokenHash: string) {
    const token = this.refreshTokens.get(tokenHash);
    if (token) token.revoked = true;
    return Promise.resolve();
  }
}

describe('AuthService', () => {
  const hasher = new PasswordHasher();
  let repository: MemoryAuthRepository;
  let service: AuthService;

  beforeEach(() => {
    repository = new MemoryAuthRepository([
      {
        id: 'u-student',
        studentNo: 'stu_cse_01',
        name: '林晓明',
        departmentId: 'dept-cs',
        departmentName: '计算机学院',
        status: 'ACTIVE',
        passwordHash: hasher.hash('Pass123!'),
        roles: [{ code: 'ROLE_STUDENT', name: '学生' }],
        permissions: [{ code: 'booking.create', name: '创建预约' }]
      },
      {
        id: 'u-disabled',
        studentNo: 'stu_disabled',
        name: '停用学生',
        departmentId: 'dept-cs',
        departmentName: '计算机学院',
        status: 'DISABLED',
        passwordHash: hasher.hash('Pass123!'),
        roles: [{ code: 'ROLE_STUDENT', name: '学生' }],
        permissions: []
      },
      {
        id: 'u-admin',
        studentNo: 'admin_full',
        name: '王建华',
        departmentId: null,
        departmentName: null,
        status: 'ACTIVE',
        passwordHash: hasher.hash('Admin123!'),
        roles: [{ code: 'ROLE_FULL_ADMIN', name: '超级管理员' }],
        permissions: [{ code: 'room.read', name: '查看自习室' }]
      }
    ]);
    service = new AuthService(repository, hasher, new TokenService('test-secret', 900), {
      refreshTtlSeconds: 7 * 24 * 60 * 60
    });
  });

  it('学生使用正确学号密码登录后获得 access token 并持久化 refresh token', async () => {
    const session = await service.loginStudent({ studentId: 'stu_cse_01', password: 'Pass123!' });

    expect(session.response.accessToken).toEqual(expect.any(String));
    expect(session.response.user).toMatchObject({
      id: 'u-student',
      studentNo: 'stu_cse_01',
      name: '林晓明',
      departmentName: '计算机学院'
    });
    expect(session.response.roles.map((role) => role.code)).toEqual(['ROLE_STUDENT']);
    expect(repository.refreshTokens.size).toBe(1);
    expect(session.refreshToken).toEqual(expect.any(String));
  });

  it('统一登录接口使用学工号密码登录并按账号返回角色', async () => {
    const studentSession = await service.login({
      studentNo: 'stu_cse_01',
      password: 'Pass123!'
    });
    const adminSession = await service.login({
      studentNo: 'admin_full',
      password: 'Admin123!'
    });

    expect(studentSession.response.user.studentNo).toBe('stu_cse_01');
    expect(studentSession.response.roles.map((role) => role.code)).toEqual(['ROLE_STUDENT']);
    expect(adminSession.response.user.studentNo).toBe('admin_full');
    expect(adminSession.response.roles.map((role) => role.code)).toEqual(['ROLE_FULL_ADMIN']);
    expect(repository.refreshTokens.size).toBe(2);
  });

  it('错误密码返回 401 且不创建 refresh token', async () => {
    await expect(
      service.loginStudent({ studentId: 'stu_cse_01', password: 'wrong-password' })
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(repository.refreshTokens.size).toBe(0);
  });

  it('不存在账号登录时仍执行一次密码校验以降低账号枚举风险', async () => {
    const verifyPassword = jest.spyOn(hasher, 'verify');

    await expect(
      service.loginStudent({ studentId: 'stu_missing', password: 'Pass123!' })
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(verifyPassword).toHaveBeenCalledTimes(1);
    expect(repository.refreshTokens.size).toBe(0);
  });

  it('禁用学生返回 USER_DISABLED 且不创建 refresh token', async () => {
    await expect(
      service.loginStudent({ studentId: 'stu_disabled', password: 'Pass123!' })
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: ErrorCode.USER_DISABLED })
    });

    expect(repository.refreshTokens.size).toBe(0);
  });

  it('管理员登录要求管理角色，普通学生不能进入后台', async () => {
    const adminSession = await service.loginAdmin({ username: 'admin_full', password: 'Admin123!' });

    expect(adminSession.response.roles.map((role) => role.code)).toEqual(['ROLE_FULL_ADMIN']);

    await expect(
      service.loginAdmin({ username: 'stu_cse_01', password: 'Pass123!' })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refresh 会轮换 refresh token，logout 会吊销当前 refresh token', async () => {
    const first = await service.loginStudent({ studentId: 'stu_cse_01', password: 'Pass123!' });
    const oldHash = hasher.hashToken(first.refreshToken);

    const refreshed = await service.refresh(first.refreshToken);

    expect(refreshed.response.accessToken).toEqual(expect.any(String));
    expect(refreshed.refreshToken).not.toBe(first.refreshToken);
    expect(repository.refreshTokens.get(oldHash)?.revoked).toBe(true);

    const currentHash = hasher.hashToken(refreshed.refreshToken);
    await service.logout(refreshed.refreshToken);
    expect(repository.refreshTokens.get(currentHash)?.revoked).toBe(true);
  });
});
