import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { AdminDashboard, App, requestLogin, resolveApiBaseUrl } from '../../src/App';

const successfulLoginResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        accessToken: 'access-token',
        expiresAt: '2026-05-25T12:00:00.000Z',
        user: {
          name: '系统管理员',
          departmentName: null
        },
        roles: [{ name: '系统管理员', code: 'admin' }]
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

describe('管理端登录页', () => {
  it('渲染复旦品牌管理端登录界面', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('复旦大学');
    expect(html).toContain('自习室预约系统');
    expect(html).toContain('智慧空间管理');
    expect(html).toContain('管理入口');
    expect(html).toContain('统一身份认证');
    expect(html).toContain('管理员账号');
    expect(html).toContain('Admin123!');
    expect(html).toContain('type="button">学生入口');
    expect(html).not.toContain('localhost:5173');
    expect(html).not.toContain('I0 工程骨架');
    expect(html).not.toContain('I1 接入认证');
  });

  it('渲染登录成功后的管理仪表盘', () => {
    const html = renderToStaticMarkup(<AdminDashboard adminName="系统管理员" />);

    expect(html).toContain('管理仪表盘');
    expect(html).toContain('系统管理员');
    expect(html).toContain('自习室运行概览');
    expect(html).toContain('退出登录');
  });

  it('管理员登录会请求配置的 API 地址并提交账号密码', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulLoginResponse());

    const session = await requestLogin(
      { entry: 'admin', account: ' admin_full ', password: 'Admin123!' },
      fetcher,
      'http://xmwhzl.love:13000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/auth/admin-login',
      expect.objectContaining({
        body: JSON.stringify({ username: 'admin_full', password: 'Admin123!' }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
      })
    );
    expect(session.user.name).toBe('系统管理员');
    expect(session.accessToken).toBe('access-token');
  });

  it('学生登录会提交 studentId 字段', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulLoginResponse());

    await requestLogin(
      { entry: 'student', account: ' stu_cse_01 ', password: 'Pass123!' },
      fetcher,
      'http://xmwhzl.love:13000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/auth/student-login',
      expect.objectContaining({
        body: JSON.stringify({ studentId: 'stu_cse_01', password: 'Pass123!' })
      })
    );
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
        { entry: 'admin', account: 'admin_full', password: 'wrong-password' },
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
