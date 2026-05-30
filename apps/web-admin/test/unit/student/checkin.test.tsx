import { describe, expect, it, vi } from 'vitest';

import {
  STUDENT_CHECKIN_TIMER_CIRCUMFERENCE,
  calculateStudentCheckInTimerDashOffset,
  canSubmitStudentCheckIn,
  requestStudentCheckInCode,
  requestStudentCheckInSession,
  tickStudentCheckInRemaining,
} from '../../../src/App';
import {
  successfulStudentCheckInSessionResponse,
  successfulStudentCheckInSubmitResponse,
} from '../helpers/api-responses';

describe('student checkin api', () => {
  it('学生签到页请求当前签到场次时携带学生 token', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(successfulStudentCheckInSessionResponse());

    const session = await requestStudentCheckInSession(
      'student-token',
      fetcher,
      'http://localhost:3000',
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/checkins/me/current',
      expect.objectContaining({
        credentials: 'include',
        headers: { Authorization: 'Bearer student-token' },
        method: 'GET',
      }),
    );
    expect(session).toMatchObject({
      bookingId: 'booking-current',
      room: '经管自习室 301',
      remainingSeconds: 562,
    });
  });

  it('学生签到提交 6 位动态码', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(successfulStudentCheckInSubmitResponse());

    const result = await requestStudentCheckInCode(
      'student-token',
      '274159',
      fetcher,
      'http://localhost:3000',
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/checkins/me',
      expect.objectContaining({
        body: JSON.stringify({ code: '274159' }),
        credentials: 'include',
        headers: {
          Authorization: 'Bearer student-token',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }),
    );
    expect(result).toMatchObject({
      bookingId: 'booking-current',
      status: 'CHECKED_IN',
    });
  });

  it('学生签到倒计时每秒递减且不低于 0', () => {
    expect(tickStudentCheckInRemaining(562)).toBe(561);
    expect(tickStudentCheckInRemaining(1)).toBe(0);
    expect(tickStudentCheckInRemaining(0)).toBe(0);
  });

  it('签到倒计时圆环会随剩余时间推进', () => {
    expect(calculateStudentCheckInTimerDashOffset(562, 562)).toBe(0);
    expect(calculateStudentCheckInTimerDashOffset(281, 562)).toBeCloseTo(
      STUDENT_CHECKIN_TIMER_CIRCUMFERENCE / 2,
    );
    expect(calculateStudentCheckInTimerDashOffset(0, 562)).toBe(
      STUDENT_CHECKIN_TIMER_CIRCUMFERENCE,
    );
  });

  it('签到时间结束后不允许继续提交动态码', () => {
    const baseInput = {
      accessToken: 'student-token',
      hasSession: true,
      enteredCode: '274159',
      codeLength: 6,
      loading: false,
      submitting: false,
      submitted: false,
    };

    expect(canSubmitStudentCheckIn({ ...baseInput, remainingSeconds: 1 })).toBe(true);
    expect(canSubmitStudentCheckIn({ ...baseInput, remainingSeconds: 0 })).toBe(false);
    expect(
      canSubmitStudentCheckIn({ ...baseInput, enteredCode: '27415', remainingSeconds: 1 }),
    ).toBe(false);
  });
});
