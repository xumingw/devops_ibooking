import { describe, expect, it, vi } from 'vitest';

import {
	  buildStudentBookingRequest,
	  formatStudentBookingSubtitle,
	  getStudentBookingConfirmUiState,
	  mapStudentBookingSummaryToView,
	  requestStudentBookingCancel,
	  requestStudentBookingCreate,
	  requestStudentBookings
} from '../../../src/App';
import {
  successfulStudentBookingCancelResponse,
  successfulStudentBookingCreateResponse,
  successfulStudentBookingsResponse
} from '../helpers/api-responses';

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

  it('学生取消预约请求会调用当前用户取消接口', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulStudentBookingCancelResponse());

    const booking = await requestStudentBookingCancel(
      'student-token',
      'booking-upcoming',
      fetcher,
      'http://localhost:3000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/bookings/me/booking-upcoming/cancel',
      expect.objectContaining({
        credentials: 'include',
        headers: { Authorization: 'Bearer student-token' },
        method: 'PATCH'
      })
    );
    expect(booking.status).toBe('cancelled');
    expect(booking.canCancel).toBe(false);
  });

  it('学生确认预约请求会创建当前用户预约', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulStudentBookingCreateResponse());
    const request = buildStudentBookingRequest(undefined, new Date('2026-05-31T03:00:00.000Z'));

    const booking = await requestStudentBookingCreate(
      'student-token',
      request,
      fetcher,
      'http://localhost:3000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/bookings/me',
      expect.objectContaining({
        body: JSON.stringify(request),
        credentials: 'include',
        headers: {
          Authorization: 'Bearer student-token',
          'Content-Type': 'application/json'
        },
        method: 'POST'
      })
    );
    expect(request).toMatchObject({
      roomId: 'room-gm-301',
      seatId: 'seat-gm-301-c3',
      startAt: '2026-06-01T06:00:00.000Z',
      endAt: '2026-06-01T09:00:00.000Z'
    });
	  expect(booking.status).toBe('upcoming');
	});

  it('学生确认预约请求支持半小时开始和结束时间', () => {
    const request = buildStudentBookingRequest(
      undefined,
      new Date('2026-05-31T03:00:00.000Z'),
      {
        roomId: 'room-science-201',
        seatId: 'seat-room-science-201-c3',
        room: '理工自习室 201',
        location: '逸夫楼 · 2楼',
        seat: 'C3',
        dateLabel: '明天',
        time: '18:30 – 21:00（2.5小时）',
        tags: ['插座']
      }
    );

    expect(request).toEqual({
      roomId: 'room-science-201',
      seatId: 'seat-room-science-201-c3',
      startAt: '2026-06-01T10:30:00.000Z',
      endAt: '2026-06-01T13:00:00.000Z'
    });
  });

	it('学生确认预约成功后会锁定提交按钮并推进完成步骤', () => {
	  expect(
	    getStudentBookingConfirmUiState({
	      submitted: false,
	      submitting: false
	    })
	  ).toEqual({
	    checkedStepCount: 2,
	    doneStepCount: 3,
	    primaryDisabled: false,
	    primaryLabel: '确认提交预约'
	  });

	  expect(
	    getStudentBookingConfirmUiState({
	      submitted: true,
	      submitting: false
	    })
	  ).toEqual({
	    checkedStepCount: 4,
	    doneStepCount: 4,
	    primaryDisabled: true,
	    primaryLabel: '预约已提交'
	  });
	});

	it('助手推荐的相对日期会按当前日期转换为预约请求', () => {
    const request = buildStudentBookingRequest(
      {
        roomId: 'room-gm-301',
        seatId: 'seat-gm-301-c3',
        room: '经管自习室 301',
        location: '光华楼 A座 3楼',
        seat: 'C3',
        time: '明天晚上 18:00-22:00',
        tags: ['插座']
      },
      new Date('2026-05-31T03:00:00.000Z')
    );

    expect(request).toEqual({
      roomId: 'room-gm-301',
      seatId: 'seat-gm-301-c3',
      startAt: '2026-06-01T10:00:00.000Z',
      endAt: '2026-06-01T14:00:00.000Z'
    });
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
