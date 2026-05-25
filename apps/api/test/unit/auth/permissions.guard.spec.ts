// @story US1.4.2
// @tc TC-US1.4.2-01
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '../../../src/auth/auth.guard';
import { PermissionsGuard } from '../../../src/auth/permissions.guard';
import { RequirePermissions } from '../../../src/auth/permissions.decorator';
import { AuthService } from '../../../src/auth/auth.service';

type RequestStub = {
  headers: Record<string, string | undefined>;
  auth?: unknown;
};

function createContext(request: RequestStub, handler = () => undefined) {
  return {
    getHandler: () => handler,
    getClass: () => class TestController {},
    switchToHttp: () => ({
      getRequest: () => request
    })
  };
}

describe('RBAC guards', () => {
  it('AuthGuard 缺少 Bearer token 时拒绝访问', async () => {
    const authService = { getMe: jest.fn() } as unknown as AuthService;
    const guard = new AuthGuard(authService);

    await expect(guard.canActivate(createContext({ headers: {} }) as never)).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });

  it('AuthGuard 验证 token 后把当前用户、角色和权限挂到 request', async () => {
    const authService = {
      getMe: jest.fn().mockResolvedValue({
        user: { id: 'u1', name: '王建华', studentNo: 'admin_full' },
        roles: [{ code: 'ROLE_FULL_ADMIN', name: '超级管理员' }],
        permissions: [{ code: 'room.write', name: '维护自习室' }]
      })
    } as unknown as AuthService;
    const request: RequestStub = { headers: { authorization: 'Bearer access-token' } };
    const guard = new AuthGuard(authService);

    await expect(guard.canActivate(createContext(request) as never)).resolves.toBe(true);

    expect(authService.getMe).toHaveBeenCalledWith('access-token');
    expect(request.auth).toMatchObject({
      user: { studentNo: 'admin_full' },
      permissions: ['room.write']
    });
  });

  it('PermissionsGuard 对缺少权限的当前用户返回 403', () => {
    class DemoController {
      @RequirePermissions('room.write')
      createRoom() {
        return undefined;
      }
    }
    const controller = new DemoController();
    const handler = controller.createRoom;
    const request: RequestStub = {
      headers: {},
      auth: {
        user: { id: 'u1' },
        permissions: ['room.read']
      }
    };
    const guard = new PermissionsGuard(new Reflector());

    expect(() => guard.canActivate(createContext(request, handler) as never)).toThrow(
      ForbiddenException
    );
  });

  it('PermissionsGuard 在权限满足时放行', () => {
    class DemoController {
      @RequirePermissions('room.write')
      createRoom() {
        return undefined;
      }
    }
    const controller = new DemoController();
    const handler = controller.createRoom;
    const request: RequestStub = {
      headers: {},
      auth: {
        user: { id: 'u1' },
        permissions: ['room.read', 'room.write']
      }
    };
    const guard = new PermissionsGuard(new Reflector());

    expect(guard.canActivate(createContext(request, handler) as never)).toBe(true);
  });
});
