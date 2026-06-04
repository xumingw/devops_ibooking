// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { App } from '../../../src/App';
import { successfulLoginResponse } from '../helpers/api-responses';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe('auth session restore ui', () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
    }
    container?.remove();
    root = null;
    container = null;
    window.history.pushState(null, '', '/');
    vi.unstubAllGlobals();
  });

  it('未登录访问学生子页面时重定向到统一登录入口', async () => {
    const storage = createMemoryStorage({});
    vi.stubGlobal('localStorage', storage);
    window.history.pushState(null, '', '/student/rooms');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<App />);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(container.textContent).toContain('统一登录');
    expect(window.location.pathname).toBe('/');
  });

  it('挂载时会用记住登录状态刷新并恢复管理端会话', async () => {
    const storage = createMemoryStorage({ 'ibooking.auth.remember': '1' });
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulLoginResponse());
    vi.stubGlobal('fetch', fetcher);
    vi.stubGlobal('localStorage', storage);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<App />);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetcher).toHaveBeenCalledWith('http://localhost:3000/api/v1/auth/refresh', {
      credentials: 'include',
      method: 'POST'
    });
    expect(storage.getItem('ibooking.admin.accessToken')).toBe('access-token');
    expect(container.textContent).toContain('系统管理员');
    expect(window.location.pathname).toBe('/dashboard');
  });

  it('刷新令牌失效时停留在登录页并清理旧会话', async () => {
    const storage = createMemoryStorage({
      'ibooking.auth.remember': '1',
      'ibooking.admin.accessToken': 'old-admin-token',
      'ibooking.student.accessToken': 'old-student-token'
    });
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ code: 'REFRESH_TOKEN_INVALID', message: '会话已过期' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401
      })
    );
    vi.stubGlobal('fetch', fetcher);
    vi.stubGlobal('localStorage', storage);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<App />);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(storage.getItem('ibooking.auth.remember')).toBeNull();
    expect(storage.getItem('ibooking.admin.accessToken')).toBeNull();
    expect(storage.getItem('ibooking.student.accessToken')).toBeNull();
    expect(container.textContent).toContain('统一登录');
    expect(window.location.pathname).toBe('/');
  });
});

function createMemoryStorage(initial: Record<string, string>): Storage {
  const values = new Map(Object.entries(initial));
  return {
    get length() {
      return values.size;
    },
    clear: vi.fn(() => values.clear()),
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    key: vi.fn((index: number) => [...values.keys()][index] ?? null),
    removeItem: vi.fn((key: string) => {
      values.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    })
  };
}
