// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdminDashboard } from '../../../src/App';
import { adminOverviewFixture, successfulAdminOverviewResponse } from '../helpers/api-responses';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe('booking records pagination', () => {
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

  it('预约记录管理加载全量记录分页并支持翻页', async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation((input) => {
      const url = String(input);
      if (url.endsWith('/api/v1/admin/overview')) {
        return Promise.resolve(successfulAdminOverviewResponse());
      }
      if (url.includes('/api/v1/admin/bookings?page=2&size=10')) {
        return Promise.resolve(successfulAdminBookingRecordsPage(2));
      }
      if (url.includes('/api/v1/admin/bookings?page=1&size=10')) {
        return Promise.resolve(successfulAdminBookingRecordsPage(1));
      }
      return Promise.reject(new Error(`unexpected url: ${url}`));
    });
    vi.stubGlobal('fetch', fetcher);
    window.history.pushState(null, '', '/dashboard/bookings');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <AdminDashboard
          accessToken="admin-token"
          adminName="系统管理员"
          initialActive="bookings"
          initialAdminOverview={adminOverviewFixture()}
        />
      );
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(container.textContent).toContain('第 1 / 3 页');
    expect(container.textContent).toContain('共 23 条');
    expect(container.textContent).toContain('booking-page-001');
    expect(container.textContent).not.toContain('booking-page-011');

    const nextButton = findButtonByText(container, '下一页');
    expect(nextButton?.disabled).toBe(false);

    await act(async () => {
      nextButton?.click();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/admin/bookings?page=2&size=10',
      expect.any(Object)
    );
    expect(container.textContent).toContain('第 2 / 3 页');
    expect(container.textContent).toContain('booking-page-011');
    expect(container.textContent).not.toContain('booking-page-001');
  });
});

function successfulAdminBookingRecordsPage(page: number) {
  const start = (page - 1) * 10 + 1;
  return new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        items: Array.from({ length: page === 3 ? 3 : 10 }, (_, index) => {
          const serial = start + index;
          return {
            id: `booking-page-${String(serial).padStart(3, '0')}`,
            uid: `stu_seed_${String(serial).padStart(2, '0')}`,
            user: `演示学生${serial}`,
            room: serial % 2 === 0 ? '经管自习室 301' : '理工自习室 201',
            seat: `A${(serial % 8) + 1}`,
            date: '6/11',
            time: '20:00–21:00',
            checkin: '—',
            status: 'pending'
          };
        }),
        total: 23,
        page,
        size: 10
      }
    }),
    { headers: { 'Content-Type': 'application/json' }, status: 200 }
  );
}

function findButtonByText(container: HTMLElement | null, text: string) {
  return Array.from(container?.querySelectorAll('button') ?? []).find((button) =>
    button.textContent?.includes(text)
  ) as HTMLButtonElement | undefined;
}
