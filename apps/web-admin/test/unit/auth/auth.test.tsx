import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import {
  App,
  logoutSession,
  requestLogin,
  requestRooms,
  requestSeats,
  restoreRememberedSession,
  resolveApiBaseUrl,
  resolvePostLoginPath,
  resolveSessionKind
} from '../../../src/App';
import {
  successfulLoginResponse,
  successfulRoomsResponse,
  successfulSeatsResponse
} from '../helpers/api-responses';

describe('auth', () => {
  it('渲染复旦品牌统一登录界面', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('复旦大学');
    expect(html).toContain('自习室预约系统');
    expect(html).toContain('智慧空间管理');
    expect(html).toContain('统一登录');
    expect(html).toContain('统一身份认证');
    expect(html).toContain('学工号');
    expect(html).toContain('请输入学工号');
    expect(html).toContain('Admin123!');
    expect(html).not.toContain('管理入口');
    expect(html).not.toContain('学生入口');
    expect(html).not.toContain('管理端登录');
    expect(html).not.toContain('localhost:5173');
    expect(html).not.toContain('I0 工程骨架');
    expect(html).not.toContain('I1 接入认证');
  });

  it('统一登录会请求配置的 API 地址并提交学工号密码', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulLoginResponse());

    const session = await requestLogin(
      { account: ' admin_full ', password: 'Admin123!' },
      fetcher,
      'http://xmwhzl.love:13000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/auth/login',
      expect.objectContaining({
        body: JSON.stringify({ studentNo: 'admin_full', password: 'Admin123!' }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
      })
    );
    expect(session.user.name).toBe('系统管理员');
    expect(session.accessToken).toBe('access-token');
  });

  it('学生登录会提交 studentNo 字段', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulLoginResponse());

    await requestLogin(
      { account: ' stu_cse_01 ', password: 'Pass123!' },
      fetcher,
      'http://xmwhzl.love:13000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/auth/login',
      expect.objectContaining({
        body: JSON.stringify({ studentNo: 'stu_cse_01', password: 'Pass123!' })
      })
    );
  });

  it('退出登录会调用后端注销接口并清理本地访问令牌', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ code: 'SUCCESS', data: { success: true } }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    );
    const storage = {
      removeItem: vi.fn()
    } as unknown as Pick<Storage, 'removeItem'>;

    await logoutSession(fetcher, 'http://xmwhzl.love:13000', storage);

    expect(fetcher).toHaveBeenCalledWith('http://xmwhzl.love:13000/api/v1/auth/logout', {
      credentials: 'include',
      method: 'POST'
    });
    expect(storage.removeItem).toHaveBeenCalledWith('ibooking.admin.accessToken');
    expect(storage.removeItem).toHaveBeenCalledWith('ibooking.student.accessToken');
  });

  it('记住登录状态会通过刷新令牌恢复会话并更新访问令牌', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulLoginResponse());
    const storage = {
      getItem: vi.fn().mockReturnValue('1'),
      setItem: vi.fn(),
      removeItem: vi.fn()
    } as unknown as Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

    const session = await restoreRememberedSession(
      fetcher,
      'http://xmwhzl.love:13000',
      storage
    );

    expect(fetcher).toHaveBeenCalledWith('http://xmwhzl.love:13000/api/v1/auth/refresh', {
      credentials: 'include',
      method: 'POST'
    });
    expect(session).toEqual({
      kind: 'admin',
      name: '系统管理员',
      roles: [{ name: '超级管理员', code: 'ROLE_FULL_ADMIN' }],
      accessToken: 'access-token'
    });
    expect(storage.setItem).toHaveBeenCalledWith('ibooking.admin.accessToken', 'access-token');
  });

  it('记住登录状态恢复学生会话时写入学生访问令牌并清理管理端令牌', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulStudentLoginResponse());
    const storage = {
      getItem: vi.fn().mockReturnValue('1'),
      setItem: vi.fn(),
      removeItem: vi.fn()
    } as unknown as Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

    const session = await restoreRememberedSession(
      fetcher,
      'http://xmwhzl.love:13000',
      storage
    );

    expect(session).toEqual({
      kind: 'student',
      name: '林晓明',
      roles: [{ name: '学生', code: 'ROLE_STUDENT' }],
      accessToken: 'student-access-token'
    });
    expect(storage.setItem).toHaveBeenCalledWith(
      'ibooking.student.accessToken',
      'student-access-token'
    );
    expect(storage.removeItem).toHaveBeenCalledWith('ibooking.admin.accessToken');
  });

  it('刷新令牌失效时清理记住登录状态和旧访问令牌', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ code: 'REFRESH_TOKEN_INVALID', message: '会话已过期' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401
      })
    );
    const storage = {
      getItem: vi.fn().mockReturnValue('1'),
      setItem: vi.fn(),
      removeItem: vi.fn()
    } as unknown as Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

    const session = await restoreRememberedSession(
      fetcher,
      'http://xmwhzl.love:13000',
      storage
    );

    expect(session).toBeNull();
    expect(storage.removeItem).toHaveBeenCalledWith('ibooking.auth.remember');
    expect(storage.removeItem).toHaveBeenCalledWith('ibooking.admin.accessToken');
    expect(storage.removeItem).toHaveBeenCalledWith('ibooking.student.accessToken');
  });

  it('并发业务请求遇到访问令牌过期时只刷新一次会话', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'AUTH_UNAUTHORIZED', message: '会话已过期' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 401
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'AUTH_UNAUTHORIZED', message: '会话已过期' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 401
        })
      )
      .mockResolvedValueOnce(successfulLoginResponse())
      .mockResolvedValueOnce(successfulRoomsResponse())
      .mockResolvedValueOnce(successfulSeatsResponse());
    const roomRefresh = vi.fn();
    const seatRefresh = vi.fn();
    const roomStorage = {
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    const seatStorage = {
      setItem: vi.fn(),
      removeItem: vi.fn()
    };

    const [rooms, seats] = await Promise.all([
      requestRooms('expired-token', fetcher, 'http://xmwhzl.love:13000', {
        onSessionRefresh: roomRefresh,
        storage: roomStorage
      }),
      requestSeats('expired-token', fetcher, 'http://xmwhzl.love:13000', {
        onSessionRefresh: seatRefresh,
        storage: seatStorage
      })
    ]);

    const refreshCalls = fetcher.mock.calls.filter(
      ([url]) => url === 'http://xmwhzl.love:13000/api/v1/auth/refresh'
    );
    expect(refreshCalls).toHaveLength(1);
    expect(fetcher).toHaveBeenNthCalledWith(
      4,
      'http://xmwhzl.love:13000/api/v1/rooms',
      expect.objectContaining({
        headers: { Authorization: 'Bearer access-token' }
      })
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      5,
      'http://xmwhzl.love:13000/api/v1/seats',
      expect.objectContaining({
        headers: { Authorization: 'Bearer access-token' }
      })
    );
    expect(roomStorage.setItem).toHaveBeenCalledWith('ibooking.admin.accessToken', 'access-token');
    expect(seatStorage.setItem).toHaveBeenCalledWith('ibooking.admin.accessToken', 'access-token');
    expect(roomRefresh).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'access-token', kind: 'admin' })
    );
    expect(seatRefresh).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'access-token', kind: 'admin' })
    );
    expect(rooms[0].name).toBe('经管自习室 301');
    expect(seats[0].code).toBe('A001');
  });

  it('刷新会话失败时清理本地会话且不产生未处理的拒绝', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'AUTH_UNAUTHORIZED', message: '会话已过期' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 401
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'REFRESH_TOKEN_INVALID', message: '会话已过期' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 401
        })
      );
    const storage = {
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    const onSessionExpired = vi.fn();
    const unhandledReasons: unknown[] = [];
    const onUnhandledRejection = (reason: unknown) => {
      unhandledReasons.push(reason);
    };

    process.on('unhandledRejection', onUnhandledRejection);
    try {
      await expect(
        requestRooms('expired-token', fetcher, 'http://xmwhzl.love:13000', {
          onSessionExpired,
          storage
        })
      ).rejects.toThrow('会话已过期');
      await new Promise((resolve) => setTimeout(resolve, 0));
    } finally {
      process.off('unhandledRejection', onUnhandledRejection);
    }

    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(storage.removeItem).toHaveBeenCalledWith('ibooking.auth.remember');
    expect(storage.removeItem).toHaveBeenCalledWith('ibooking.admin.accessToken');
    expect(storage.removeItem).toHaveBeenCalledWith('ibooking.student.accessToken');
    expect(unhandledReasons).toEqual([]);
  });

  it('登录成功后按角色分流到学生或管理视图', () => {
    expect(resolveSessionKind([{ name: '超级管理员', code: 'ROLE_FULL_ADMIN' }])).toBe('admin');
    expect(resolveSessionKind([{ name: '学生', code: 'ROLE_STUDENT' }])).toBe('student');
    expect(
      resolveSessionKind([
        { name: '学生', code: 'ROLE_STUDENT' },
        { name: '数据审计员', code: 'ROLE_AUDIT' }
      ])
    ).toBe('admin');
  });

  it('登录后保留已访问的合法学生或管理端目标页', () => {
    expect(resolvePostLoginPath('student', '/student/checkin')).toBe('/student/checkin');
    expect(resolvePostLoginPath('student', '/student/bookings')).toBe('/student/bookings');
    expect(resolvePostLoginPath('student', '/dashboard/users')).toBe('/student');
    expect(resolvePostLoginPath('admin', '/dashboard/rooms')).toBe('/dashboard/rooms');
    expect(resolvePostLoginPath('admin', '/student/checkin')).toBe('/dashboard');
  });

  it('登录失败时透传后端错误信息', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ code: 'UNAUTHORIZED', message: '账号或密码错误' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401
      })
    );

    await expect(
      requestLogin(
        { account: 'admin_full', password: 'wrong-password' },
        fetcher,
        'http://xmwhzl.love:13000'
      )
    ).rejects.toThrow('账号或密码错误');
  });

  it('生产构建缺少 VITE_API_BASE_URL 时不能回退到 localhost', () => {
    expect(() => resolveApiBaseUrl({ PROD: true })).toThrow(
      '生产构建缺少 VITE_API_BASE_URL'
    );
    expect(resolveApiBaseUrl({ PROD: false })).toBe('http://localhost:3000');
    expect(
      resolveApiBaseUrl({
        PROD: true,
        VITE_API_BASE_URL: 'http://xmwhzl.love:13000/'
      })
    ).toBe('http://xmwhzl.love:13000');
  });
});

const successfulStudentLoginResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        accessToken: 'student-access-token',
        expiresAt: '2026-05-25T12:00:00.000Z',
        user: {
          name: '林晓明',
          departmentName: '计算机学院'
        },
        roles: [{ name: '学生', code: 'ROLE_STUDENT' }]
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );
