import { describe, expect, it, vi } from 'vitest';

import {
  formatStudentNotificationSubtitle,
  mapStudentNotificationSummaryToView,
  requestStudentNotifications
} from '../../../src/App';
import { successfulStudentNotificationsResponse } from '../helpers/api-responses';

describe('student notifications api', () => {
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
});
