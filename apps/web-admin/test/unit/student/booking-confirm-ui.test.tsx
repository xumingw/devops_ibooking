// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { StudentBookingConfirmPanel } from '../../../src/App';
import { successfulStudentBookingCreateResponse } from '../helpers/api-responses';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe('student booking confirm ui', () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
    }
    container?.remove();
    root = null;
    container = null;
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('提交成功后按钮锁定为已提交并不显示步骤条', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulStudentBookingCreateResponse());
    vi.stubGlobal('fetch', fetcher);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<StudentBookingConfirmPanel accessToken="student-token" />);
    });

    await act(async () => {
      getSubmitButton().click();
      await Promise.resolve();
      await Promise.resolve();
    });

    const submittedButton = getSubmitButton();
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(submittedButton.disabled).toBe(true);
    expect(submittedButton.textContent).toContain('预约已提交');
    expect(container.querySelector('.student-booking-stepper')).toBeNull();

    await act(async () => {
      submittedButton.click();
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('预约弹窗内修改时间会同步到提交请求', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-31T03:00:00.000Z'));
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulStudentBookingCreateResponse());
    const submitResult = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <StudentBookingConfirmPanel
          accessToken="student-token"
          onSubmitResult={submitResult}
          seatBookingDraft={{
            roomId: 'room-science-201',
            seatId: 'seat-room-science-201-c3',
            room: '理工自习室 201',
            location: '逸夫楼 · 2楼',
            seat: 'C3',
            dateLabel: '明天',
            time: '14:00 – 17:00（3小时）',
            tags: ['插座']
          }}
        />
      );
    });

    expect(container.querySelector('.student-booking-time-card')).toBeNull();
    expect(container.querySelector('.student-booking-detail-grid select[aria-label="预约日期"]')).not.toBeNull();
    expect(
      container.querySelector(
        '.student-booking-detail-grid .student-room-time-field[aria-label="预约开始时间"]'
      )
    ).not.toBeNull();
    expect(
      [...container.querySelectorAll('.student-booking-confirm-card h2')].some(
        (heading) => heading.textContent === '预约时间'
      )
    ).toBe(false);

    await selectTimePart('预约开始时间', '小时', '20');
    await selectTimePart('预约开始时间', '分钟', '00');
    await selectTimePart('预约结束时间', '小时', '00');
    expect([...getTimeSelect('预约结束时间', '分钟').options].map((option) => option.value)).toEqual([
      '00'
    ]);
    await act(async () => {
      getSubmitButton().click();
      await Promise.resolve();
      await Promise.resolve();
    });

    const [, request] = fetcher.mock.calls.find(
      ([input, init]) => String(input).endsWith('/api/v1/bookings/me') && init?.method === 'POST'
    )!;
    expect(JSON.parse(request.body as string)).toEqual({
      roomId: 'room-science-201',
      seatId: 'seat-room-science-201-c3',
      startAt: '2026-06-01T12:00:00.000Z',
      endAt: '2026-06-01T16:00:00.000Z'
    });
    expect(submitResult).toHaveBeenCalledWith({
      type: 'success',
      message: '预约成功：理工自习室 201 · C3 · 明天 20:00 – 00:00',
      booking: expect.objectContaining({
        room: '理工自习室 201',
        seat: 'C3',
        time: '明天 20:00 – 00:00',
        startAt: '2026-06-01T12:00:00.000Z',
        endAt: '2026-06-01T16:00:00.000Z'
      })
    });
    expect(container.textContent).toContain('20:00 – 00:00（4小时）');
  });

  const getSubmitButton = () => {
    const button = [...(container?.querySelectorAll('button') ?? [])].find((candidate) =>
      /确认提交预约|预约已提交|提交中/.test(candidate.textContent ?? '')
    );
    if (!button) throw new Error('submit button not found');
    return button as HTMLButtonElement;
  };

  const selectTimePart = async (label: string, part: '小时' | '分钟', value: string) => {
    const select = getTimeSelect(label, part);
    await act(async () => {
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      await Promise.resolve();
      await Promise.resolve();
    });
  };

  const getTimeSelect = (label: string, part: '小时' | '分钟') => {
    const field = container?.querySelector(`.student-room-time-field[aria-label="${label}"]`);
    if (!field) throw new Error(`time field not found: ${label}`);
    const select = field.querySelector(`select[aria-label="${label}${part}"]`) as HTMLSelectElement | null;
    if (!select) throw new Error(`time select not found: ${label} ${part}`);
    return select;
  };
});
