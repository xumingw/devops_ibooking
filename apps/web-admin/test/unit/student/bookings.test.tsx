import { describe, expect, it, vi } from 'vitest';

import {
  formatStudentBookingSubtitle,
  mapStudentBookingSummaryToView,
  requestStudentBookings
} from '../../../src/App';
import { successfulStudentBookingsResponse } from '../helpers/api-responses';

describe('student bookings api', () => {
  it('学生我的预约请求会携带学生 token', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulStudentBookingsResponse());

    const summary = await requestStudentBookings(
      'student-token',
      fetcher,
      'http://localhost:3000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/bookings/me',
      expect.objectContaining({
        credentials: 'include',
        headers: { Authorization: 'Bearer student-token' },
        method: 'GET'
      })
    );
    expect(summary.totalCount).toBe(3);
    expect(summary.activeCount).toBe(2);
    expect(summary.completedCount).toBe(1);
  });

  it('学生预约摘要会映射成页面状态和副标题', () => {
    const view = mapStudentBookingSummaryToView({
      totalCount: 3,
      activeCount: 2,
      completedCount: 1,
      records: [
        {
          id: 'booking-upcoming',
          room: '经管自习室 301',
          location: '光华楼 A座 3楼',
          seat: 'C3',
          time: '今日 14:00-17:00',
          status: 'upcoming',
          tags: ['插座'],
          canCheckIn: true,
          canCancel: true,
          startAt: '2026-05-29T06:00:00.000Z',
          endAt: '2026-05-29T09:00:00.000Z'
        },
        {
          id: 'booking-using',
          room: '理工自习室 201',
          location: '理科楼 2楼',
          seat: 'F12',
          time: '今日 09:00-12:00',
          status: 'using',
          tags: ['24小时'],
          canCheckIn: false,
          canCancel: false,
          startAt: '2026-05-29T01:00:00.000Z',
          endAt: '2026-05-29T04:00:00.000Z'
        }
      ]
    });

    expect(formatStudentBookingSubtitle(view)).toBe('本学期共 3 次预约 · 1 次完成');
    expect(view.records[0]).toMatchObject({
      id: 'booking-upcoming',
      status: 'upcoming',
      statusLabel: '待签到',
      statusVariant: 'blue',
      statusIcon: 'clock'
    });
    expect(view.records[1]).toMatchObject({
      status: 'using',
      statusLabel: '使用中',
      statusVariant: 'green',
      statusIcon: 'check-circle'
    });
  });
});
