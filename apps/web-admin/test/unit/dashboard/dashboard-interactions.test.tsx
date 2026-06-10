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
});
