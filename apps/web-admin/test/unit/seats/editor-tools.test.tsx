// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdminDashboard } from '../../../src/App';
import {
  adminOverviewFixture,
  successfulAdminOverviewResponse,
  successfulRoomsResponse,
  successfulSeatsResponse
} from '../helpers/api-responses';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe('floor editor tools', () => {
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

  it('平面图编辑器工具会修改当前草稿布局', async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation((input) => {
      const url = String(input);
      if (url.endsWith('/api/v1/admin/overview')) return Promise.resolve(successfulAdminOverviewResponse());
      if (url.endsWith('/api/v1/rooms')) return Promise.resolve(successfulRoomsResponse());
      if (url.endsWith('/api/v1/seats')) return Promise.resolve(successfulSeatsResponse());
      return Promise.reject(new Error(`unexpected url: ${url}`));
    });
    vi.stubGlobal('fetch', fetcher);
    window.history.pushState(null, '', '/dashboard/editor');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <AdminDashboard
          accessToken="admin-token"
          adminName="系统管理员"
          initialActive="editor"
          initialAdminOverview={adminOverviewFixture()}
        />
      );
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(container.textContent).toContain('已配置座位1 个');

    await act(async () => {
      getButtonByLabel(container, '添加座位')?.click();
      await Promise.resolve();
    });

    expect(container.textContent).toContain('已新增');
    expect(container.textContent).toContain('已配置座位2 个');

    await act(async () => {
      getButtonByLabel(container, '标注属性')?.click();
      await Promise.resolve();
    });

    expect(container.textContent).toContain('已标注为带插座座位');
    expect(container.textContent).toContain('选中座位A1 · 带插座');

    await act(async () => {
      getButtonByLabel(container, '删除')?.click();
      await Promise.resolve();
    });

    expect(container.textContent).toContain('已从草稿中删除 A1');
    expect(container.textContent).toContain('已配置座位1 个');
  });
});

function getButtonByLabel(container: HTMLElement | null, label: string) {
  return container?.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
}
