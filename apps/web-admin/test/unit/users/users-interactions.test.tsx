// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdminDashboard } from '../../../src/App';
import {
  adminOverviewFixture,
  successfulAdminOverviewResponse,
  successfulUsersResponse
} from '../helpers/api-responses';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe('users interactions', () => {
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

  it('用户管理顶部、工具栏和行内操作都会产生可见状态变化', async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation((input) => {
      const url = String(input);
      return Promise.resolve(url.includes('/users') ? successfulUsersResponse() : successfulAdminOverviewResponse());
    });
    vi.stubGlobal('fetch', fetcher);
    window.history.pushState(null, '', '/dashboard/users');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <AdminDashboard
          accessToken="admin-token"
          adminName="系统管理员"
          initialActive="users"
          initialAdminOverview={adminOverviewFixture()}
        />
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const toolbarCreateButton = container.querySelector<HTMLButtonElement>(
      '.user-management-toolbar .user-management-primary'
    );
    await act(async () => {
      toolbarCreateButton?.click();
      await Promise.resolve();
    });
    expect(container.textContent).toContain('用户管理：已打开新增用户流程。');

    const topbarImportButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.dashboard-actions button')
    ).find((button) => button.textContent?.includes('导入名单'));
    await act(async () => {
      topbarImportButton?.click();
      await Promise.resolve();
    });
    expect(container.textContent).toContain('用户管理：已准备导入名单流程。');

    const disableButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.user-management-actions button')
    ).find((button) => button.textContent?.includes('停用'));
    await act(async () => {
      disableButton?.click();
      await Promise.resolve();
    });

    expect(container.textContent).toContain('用户管理：已停用林晓明。');
    expect(container.textContent).toContain('1停用账号阻止登录与预约操作');
    expect(
      Array.from(container.querySelectorAll<HTMLButtonElement>('.user-management-actions button')).some(
        (button) => button.textContent?.includes('启用')
      )
    ).toBe(true);
  });
});
