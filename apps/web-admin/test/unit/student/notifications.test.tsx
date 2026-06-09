// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  formatStudentNotificationSubtitle,
  mapStudentNotificationSummaryToView,
  requestStudentNotifications,
  requestStudentNotificationsMarkAllRead,
  StudentHomePreview
} from '../../../src/App';
import {
  successfulRoomCatalogResponse,
  successfulStudentBookingsResponse,
  successfulStudentHomeSummaryResponse,
  successfulStudentNotificationsResponse,
  successfulStudentRoomAvailabilityResponse
} from '../helpers/api-responses';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe('student notifications api', () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
    }
    container?.remove();
    root = null;
    container = null;
    vi.unstubAllGlobals();
  });

  it('学生通知中心请求会携带学生 token', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulStudentNotificationsResponse());

    const summary = await requestStudentNotifications(
      'student-token',
      fetcher,
      'http://xmwhzl.love:13000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/notifications/me',
      expect.objectContaining({
        credentials: 'include',
        headers: { Authorization: 'Bearer student-token' },
        method: 'GET'
      })
    );
    expect(summary.unreadCount).toBe(2);
    expect(summary.groups[0].items[0]).toMatchObject({
      id: 'notice-booking-start',
      title: '预约提醒'
    });
  });

  it('学生通知中心标记全部已读会持久化到服务端', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulStudentNotificationsReadResponse());

    const summary = await requestStudentNotificationsMarkAllRead(
      'student-token',
      fetcher,
      'http://xmwhzl.love:13000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/notifications/me/read-all',
      expect.objectContaining({
        credentials: 'include',
        headers: { Authorization: 'Bearer student-token' },
        method: 'PATCH'
      })
    );
    expect(summary.unreadCount).toBe(0);
    expect(summary.groups[0].items[0].read).toBe(true);
  });

  it('通知中心点击标记全部已读会调用持久化接口并刷新未读数', async () => {
    const fetcher = createStudentNotificationFetchMock({
      notification: successfulStudentNotificationsResponse,
      markRead: successfulStudentNotificationsReadResponse
    });
    vi.stubGlobal('fetch', fetcher);

    await renderStudentNotify();

    expect(container?.textContent).toContain('2 条未读');
    await clickButton('标记全部已读');

    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/notifications/me/read-all'),
      expect.objectContaining({ method: 'PATCH' })
    );
    expect(container?.textContent).toContain('0 条未读');
  });

  it('通知中心顶部全部已读按钮也会持久化已读状态', async () => {
    const fetcher = createStudentNotificationFetchMock({
      notification: successfulStudentNotificationsResponse,
      markRead: successfulStudentNotificationsReadResponse
    });
    vi.stubGlobal('fetch', fetcher);

    await renderStudentNotify();

    await clickButton('全部已读');

    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/notifications/me/read-all'),
      expect.objectContaining({ method: 'PATCH' })
    );
    expect(container?.textContent).toContain('0 条未读');
  });

  it('学生首页加载时会同步服务端通知未读数，避免重新登录后显示旧角标', async () => {
    const fetcher = createStudentNotificationFetchMock({
      notification: successfulStudentNotificationsReadResponse,
      markRead: successfulStudentNotificationsReadResponse
    });
    vi.stubGlobal('fetch', fetcher);

    await renderStudentPage();

    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/notifications/me'),
      expect.objectContaining({ method: 'GET' })
    );
    expect(getButtonText('通知中心')).toBe('通知中心');
    expect(container?.textContent).not.toContain('通知中心3');
  });

  it('学生通知摘要会映射成页面图标、颜色和未读标题', () => {
    const view = mapStudentNotificationSummaryToView({
      unreadCount: 2,
      groups: [
        {
          date: '今天',
          items: [
            {
              id: 'notice-booking-start',
              group: '今天',
              iconType: 'bell',
              tone: 'teal',
              title: '预约提醒',
              description: '您今日 14:00 在经管自习室 301 的预约将在 15 分钟后开始',
              timeLabel: '13:45',
              read: false,
              occurredAt: '2026-05-29T05:45:00.000Z'
            },
            {
              id: 'notice-checkin-late',
              group: '今天',
              iconType: 'clock',
              tone: 'gold',
              title: '未签到提醒',
              description: '预约已开始 10 分钟，请尽快完成签到',
              timeLabel: '14:10',
              read: false,
              occurredAt: '2026-05-29T06:10:00.000Z'
            }
          ]
        }
      ]
    });

    expect(formatStudentNotificationSubtitle(view)).toBe('2 条未读');
    expect(view.groups[0].items[0]).toMatchObject({
      icon: 'bell',
      read: false,
      tone: '#2D7A6E'
    });
    expect(view.groups[0].items[1]).toMatchObject({
      icon: 'clock',
      tone: '#c8820a'
    });
  });

  async function renderStudentNotify() {
    await renderStudentPage('notify');
  }

  async function renderStudentPage(initialActive?: Parameters<typeof StudentHomePreview>[0]['initialActive']) {
    container?.remove();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <StudentHomePreview
          accessToken="student-token"
          initialActive={initialActive}
          studentName="林晓明"
        />
      );
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  async function clickButton(label: string) {
    const button = [...(container?.querySelectorAll('button') ?? [])].find((candidate) =>
      (candidate.textContent ?? '').replace(/\s+/g, '').includes(label)
    );
    if (!button) throw new Error(`button not found: ${label}`);

    await act(async () => {
      button.click();
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  function getButtonText(label: string) {
    const button = [...(container?.querySelectorAll('button') ?? [])].find((candidate) =>
      (candidate.textContent ?? '').replace(/\s+/g, '').includes(label)
    );
    if (!button) throw new Error(`button not found: ${label}`);
    return (button.textContent ?? '').replace(/\s+/g, '');
  }
});

const createStudentNotificationFetchMock = ({
  notification,
  markRead
}: {
  notification: () => Response;
  markRead: () => Response;
}) =>
  vi.fn<typeof fetch>((input) => {
    const url = String(input);
    if (url.includes('/api/v1/notifications/me/read-all')) {
      return Promise.resolve(markRead());
    }
    if (url.includes('/api/v1/notifications/me')) {
      return Promise.resolve(notification());
    }
    if (url.includes('/api/v1/rooms/catalog')) {
      return Promise.resolve(successfulRoomCatalogResponse());
    }
    if (url.includes('/api/v1/students/me/home')) {
      return Promise.resolve(successfulStudentHomeSummaryResponse());
    }
    if (url.includes('/api/v1/students/me/bookings')) {
      return Promise.resolve(successfulStudentBookingsResponse());
    }
    if (url.includes('/api/v1/rooms/availability')) {
      return Promise.resolve(successfulStudentRoomAvailabilityResponse());
    }
    return Promise.resolve(
      new Response(JSON.stringify({ code: 'SUCCESS', message: 'success', data: {} }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    );
  });

const successfulStudentNotificationsReadResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        unreadCount: 0,
        groups: [
          {
            date: '今天',
            items: [
              {
                id: 'notice-booking-start',
                group: '今天',
                iconType: 'bell',
                tone: 'teal',
                title: '预约提醒',
                description: '您今日 14:00 在经管自习室 301 的预约将在 15 分钟后开始',
                timeLabel: '13:45',
                read: true,
                occurredAt: '2026-05-29T05:45:00.000Z'
              }
            ]
          }
        ]
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );
