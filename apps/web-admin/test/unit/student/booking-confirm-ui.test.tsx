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
    vi.unstubAllGlobals();
  });

  it('提交成功后按钮锁定为已提交并完成步骤条', async () => {
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
    expect(container.querySelectorAll('.student-booking-stepper li.is-done')).toHaveLength(4);

    await act(async () => {
      submittedButton.click();
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  const getSubmitButton = () => {
    const button = [...(container?.querySelectorAll('button') ?? [])].find((candidate) =>
      /确认提交预约|预约已提交|提交中/.test(candidate.textContent ?? '')
    );
    if (!button) throw new Error('submit button not found');
    return button as HTMLButtonElement;
  };
});
