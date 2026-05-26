import { Response } from 'express';
import { AuthController } from '../../../src/auth/auth.controller';
import { AuthService, AuthSession } from '../../../src/auth/auth.service';

describe('AuthController', () => {
  it('统一登录接口使用学工号密码调用 AuthService.login 并写入 refresh cookie', async () => {
    const refreshExpiresAt = new Date('2026-05-26T12:00:00.000Z');
    const session: AuthSession = {
      refreshToken: 'refresh-token',
      refreshExpiresAt,
      response: {
        accessToken: 'access-token',
        expiresAt: '2026-05-26T12:15:00.000Z',
        user: {
          id: 'u-admin',
          studentNo: 'admin_full',
          name: '王建华',
          departmentId: null,
          departmentName: null,
          status: 'ACTIVE'
        },
        roles: [{ id: 'role-full-admin', code: 'ROLE_FULL_ADMIN', name: '超级管理员' }],
        permissions: []
      }
    };
    const authService = {
      login: jest.fn().mockResolvedValue(session)
    } as unknown as AuthService;
    const response = {
      cookie: jest.fn()
    } as unknown as Response;
    const controller = new AuthController(authService);

    const result = await controller.login(
      { studentNo: 'admin_full', password: 'Admin123!' },
      response
    );

    expect(authService.login).toHaveBeenCalledWith({
      studentNo: 'admin_full',
      password: 'Admin123!'
    });
    expect(response.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh-token',
      expect.objectContaining({
        httpOnly: true,
        path: '/api/v1/auth',
        expires: refreshExpiresAt
      })
    );
    expect(result.user.studentNo).toBe('admin_full');
    expect(result.roles.map((role) => role.code)).toEqual(['ROLE_FULL_ADMIN']);
  });
});
