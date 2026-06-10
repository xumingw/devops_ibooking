// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminDashboard } from '../../../src/App';
import { adminOverviewFixture, successfulAdminOverviewResponse } from '../helpers/api-responses';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe('reports interactions', () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;
  let createObjectUrl: ReturnType<typeof vi.fn>;
  let revokeObjectUrl: ReturnType<typeof vi.fn>;
  let anchorClick: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createObjectUrl = vi.fn(() => 'blob:admin-report');
    revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectUrl });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectUrl });
    anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  });

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

  it('报表筛选和顶部/页内导出按钮会产生实际状态变化', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulAdminOverviewResponse());
    vi.stubGlobal('fetch', fetcher);
    window.history.pushState(null, '', '/dashboard/reports');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <AdminDashboard
          accessToken="admin-token"
          adminName="系统管理员"
          initialActive="reports"
          initialAdminOverview={adminOverviewFixture()}
        />
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const scopeButton = container.querySelector<HTMLButtonElement>(
      '.data-reports-toolbar button[aria-label="统计范围"]'
    );
    expect(scopeButton?.textContent).toContain('全校范围');

    await act(async () => {
      scopeButton?.click();
      await Promise.resolve();
    });
    expect(container.textContent).toContain('已切换统计范围：普通自习室。');

    const pageCsvButton = container.querySelector<HTMLButtonElement>(
      '.data-reports-toolbar .data-reports-primary'
    );
    await act(async () => {
      pageCsvButton?.click();
      await Promise.resolve();
    });
    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect(anchorClick).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('已导出 CSV：');

    const topbarExcelButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.dashboard-actions button')
    ).find((button) => button.textContent?.includes('导出 Excel'));

    await act(async () => {
      topbarExcelButton?.click();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(createObjectUrl).toHaveBeenCalledTimes(2);
    expect(anchorClick).toHaveBeenCalledTimes(2);
    expect(container.textContent).toContain('已导出 Excel：');
  });
});
