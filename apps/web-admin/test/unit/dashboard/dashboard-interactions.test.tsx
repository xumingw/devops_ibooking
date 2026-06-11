// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdminDashboard } from '../../../src/App';
import { adminOverviewFixture, successfulAdminOverviewResponse } from '../helpers/api-responses';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe('dashboard interactions', () => {
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
    vi.restoreAllMocks();
  });

  it('最近预约记录的查看全部会进入预约记录管理', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(successfulAdminOverviewResponse()));
    window.history.pushState(null, '', '/dashboard');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <AdminDashboard
          accessToken="admin-token"
          adminName="系统管理员"
          initialAdminOverview={adminOverviewFixture()}
        />
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const viewAllButton = container.querySelector<HTMLButtonElement>(
      '.dashboard-booking-card button'
    );
    expect(viewAllButton?.textContent).toContain('查看全部');

    await act(async () => {
      viewAllButton?.click();
      await Promise.resolve();
    });

    expect(window.location.pathname).toBe('/dashboard/bookings');
    expect(container.textContent).toContain('预约记录管理');
    expect(container.querySelector('.booking-records-panel')).not.toBeNull();
  });

  it('顶部刷新会重新拉取概览数据且不显示占位提示', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulAdminOverviewResponse());
    vi.stubGlobal('fetch', fetcher);
    window.history.pushState(null, '', '/dashboard');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <AdminDashboard
          accessToken="admin-token"
          adminName="系统管理员"
          initialAdminOverview={adminOverviewFixture()}
        />
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    const refreshButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.dashboard-actions button')
    ).find((button) => button.textContent?.includes('刷新'));

    await act(async () => {
      refreshButton?.click();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(container.textContent).not.toContain('管理仪表盘：刷新已触发');
  });

  it('顶部导出报告会下载当前仪表盘数据且不显示占位提示', async () => {
    const createObjectUrl = vi.fn(() => 'blob:dashboard-report');
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectUrl });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectUrl });
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(successfulAdminOverviewResponse()));
    window.history.pushState(null, '', '/dashboard');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <AdminDashboard
          accessToken="admin-token"
          adminName="系统管理员"
          initialAdminOverview={adminOverviewFixture()}
        />
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const exportButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.dashboard-actions button')
    ).find((button) => button.textContent?.includes('导出报告'));

    await act(async () => {
      exportButton?.click();
      await Promise.resolve();
    });

    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect(anchorClick).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:dashboard-report');
    expect(container.textContent).not.toContain('管理仪表盘：已生成当前概览报告');
  });
});
