import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import {
  App,
  requestLogin,
  resolveApiBaseUrl,
  resolveSessionKind
} from '../../../src/App';
import { successfulLoginResponse } from '../helpers/api-responses';

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
