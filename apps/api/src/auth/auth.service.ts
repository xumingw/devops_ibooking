import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { ErrorCode, LoginResponse, MeResponse } from '@ibooking/shared-types';
import { PasswordHasher } from './password-hasher';
import { TokenService } from './token.service';
import { AuthUserRecord, RefreshTokenRecord } from './auth.types';

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';
export const AUTH_OPTIONS = 'AUTH_OPTIONS';

const ADMIN_ROLE_CODES = new Set([
  'ROLE_FULL_ADMIN',
  'ROLE_ROOM_ADMIN',
  'ROLE_AUDIT',
  'ROLE_DEPARTMENT_ADMIN'
]);
const DUMMY_PASSWORD_HASH =
  'scrypt$ibooking-dummy-s1$TDG7mBcJOEtPaiHK8MssUx4X5Xh6C-uIgp7X-j1bAw7Qg7HBB2i90mP3CSUlnV1FlmSpL08OR5Hnnl2vsgapSw';

export interface AuthRepository {
  findUserByStudentNo(studentNo: string): Promise<AuthUserRecord | null>;
  findUserByUsername(username: string): Promise<AuthUserRecord | null>;
  findUserById(userId: string): Promise<AuthUserRecord | null>;
  saveRefreshToken(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findRefreshToken(tokenHash: string): Promise<RefreshTokenRecord | null>;
  revokeRefreshToken(tokenHash: string): Promise<void>;
}

export type AuthOptions = {
  refreshTtlSeconds: number;
};

export type AuthSession = {
  response: LoginResponse;
  refreshToken: string;
  refreshExpiresAt: Date;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly repository: AuthRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokenService: TokenService,
    @Inject(AUTH_OPTIONS) private readonly options: AuthOptions
  ) {}

  async login(input: { studentNo: string; password: string }): Promise<AuthSession> {
    const user = await this.repository.findUserByStudentNo(input.studentNo);
    this.assertCanLogin(user, input.password);
    return this.createSession(user);
  }

  async loginStudent(input: { studentId: string; password: string }): Promise<AuthSession> {
    return this.login({ studentNo: input.studentId, password: input.password });
  }

  async loginAdmin(input: { username: string; password: string }): Promise<AuthSession> {
    const user = await this.repository.findUserByUsername(input.username);
    this.assertCanLogin(user, input.password);
    if (!user.roles.some((role) => ADMIN_ROLE_CODES.has(role.code))) {
      throw new ForbiddenException({
        code: ErrorCode.RBAC_FORBIDDEN,
        message: '当前账号没有管理后台权限'
      });
    }

    return this.createSession(user);
  }

  async refresh(refreshToken: string): Promise<AuthSession> {
    const tokenHash = this.hasher.hashToken(refreshToken);
    const stored = await this.repository.findRefreshToken(tokenHash);
    if (!stored || stored.revoked || stored.expiresAt <= new Date()) {
      throw this.invalidRefreshToken();
    }
    if (stored.user.status === 'DISABLED') {
      await this.repository.revokeRefreshToken(tokenHash);
      throw this.userDisabled();
    }

    await this.repository.revokeRefreshToken(tokenHash);
    return this.createSession(stored.user);
  }

  async logout(refreshToken: string): Promise<{ success: true }> {
    await this.repository.revokeRefreshToken(this.hasher.hashToken(refreshToken));
    return { success: true };
  }

  async getMe(accessToken: string): Promise<MeResponse> {
    let payload;
    try {
      payload = this.tokenService.verifyAccessToken(accessToken);
    } catch {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_UNAUTHORIZED,
        message: '登录状态已过期，请重新登录'
      });
    }

    const user = await this.repository.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_UNAUTHORIZED,
        message: '登录状态无效，请重新登录'
      });
    }
    if (user.status === 'DISABLED') throw this.userDisabled();

    return {
      user: this.toUserDto(user),
      roles: user.roles.map((role) => ({
        id: role.id ?? role.code,
        code: role.code,
        name: role.name
      })),
      permissions: user.permissions.map((permission) => ({
        id: permission.id ?? permission.code,
        code: permission.code,
        name: permission.name,
        menuKey: permission.menuKey ?? null
      }))
    };
  }

  private assertCanLogin(user: AuthUserRecord | null, password: string): asserts user is AuthUserRecord {
    const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const passwordMatches = this.hasher.verify(password, passwordHash);
    if (!user || !passwordMatches) {
      throw new UnauthorizedException({
        code: ErrorCode.INVALID_CREDENTIALS,
        message: '账号或密码错误'
      });
    }
    if (user.status === 'DISABLED') throw this.userDisabled();
  }

  private async createSession(user: AuthUserRecord): Promise<AuthSession> {
    const roles = user.roles.map((role) => role.code);
    const permissions = user.permissions.map((permission) => permission.code);
    const access = this.tokenService.signAccessToken({
      userId: user.id,
      studentNo: user.studentNo,
      roles,
      permissions
    });
    const refreshToken = randomBytes(48).toString('base64url');
    const refreshExpiresAt = new Date(Date.now() + this.options.refreshTtlSeconds * 1000);

    await this.repository.saveRefreshToken({
      userId: user.id,
      tokenHash: this.hasher.hashToken(refreshToken),
      expiresAt: refreshExpiresAt
    });

    return {
      response: {
        accessToken: access.token,
        expiresAt: access.expiresAt.toISOString(),
        user: this.toUserDto(user),
        roles: user.roles.map((role) => ({
          id: role.id ?? role.code,
          code: role.code,
          name: role.name
        })),
        permissions: user.permissions.map((permission) => ({
          id: permission.id ?? permission.code,
          code: permission.code,
          name: permission.name,
          menuKey: permission.menuKey ?? null
        }))
      },
      refreshToken,
      refreshExpiresAt
    };
  }

  private toUserDto(user: AuthUserRecord) {
    return {
      id: user.id,
      studentNo: user.studentNo,
      name: user.name,
      departmentId: user.departmentId,
      departmentName: user.departmentName,
      status: user.status
    };
  }

  private userDisabled(): UnauthorizedException {
    return new UnauthorizedException({
      code: ErrorCode.USER_DISABLED,
      message: '账号已禁用，不可登录'
    });
  }

  private invalidRefreshToken(): UnauthorizedException {
    return new UnauthorizedException({
      code: ErrorCode.REFRESH_TOKEN_INVALID,
      message: '会话已过期，请重新登录'
    });
  }
}
