// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminDashboard } from '../../../src/App';
import {
  adminOverviewFixture,
  successfulAdminOverviewResponse,
  successfulRolesResponse
} from '../helpers/api-responses';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe('admin action buttons', () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation((input) => {
        const url = String(input);
        if (url.includes('/api/v1/admin/bookings')) return Promise.resolve(adminBookingPageResponse());
        if (url.includes('/api/v1/admin/violations')) return Promise.resolve(adminViolationPageResponse());
        if (url.includes('/api/v1/roles')) return Promise.resolve(successfulRolesResponse());
        return Promise.resolve(successfulAdminOverviewResponse());
      })
    );
  });

  afterEach(() => {
    cleanup();
    window.history.pushState(null, '', '/');
    vi.unstubAllGlobals();
  });

  it('只读管理页工具栏按钮会显示动作反馈', async () => {
    await mountDashboard('schedule');
    await clickButton('保存开放时间');
    expect(container?.textContent).toContain('开放时间管理：已保存为待审批开放时间变更。');

    await mountDashboard('bookings');
    await clickButton('代预约');
    expect(container?.textContent).toContain('预约记录管理：已打开管理员代预约流程。');
    await clickButton('详情');
    expect(container?.textContent).toContain('预约记录管理：已打开预约 booking-action-001 详情。');

    await mountDashboard('violations');
    await clickButton('处理申诉');
    expect(container?.textContent).toContain('违约记录管理：已打开申诉处理队列。');

    await mountDashboard('qrcode');
    await clickButton('生成动态码');
    expect(container?.textContent).toContain('动态码管理：已重新生成今日动态码任务。');

    await mountDashboard('params');
    await clickButton('保存参数');
    expect(container?.textContent).toContain('系统参数管理：已保存参数变更为待审批草稿。');

    await mountDashboard('audit');
    await clickButton('导出日志');
    expect(container?.textContent).toContain('审计日志管理：已生成审计日志导出任务。');
  });

  it('角色行内禁用按钮会更新当前表格状态', async () => {
    await mountDashboard('roles');

    await clickButton('禁用');

    expect(container?.textContent).toContain('角色权限管理：已禁用超级管理员。');
    expect(
      Array.from(container?.querySelectorAll<HTMLButtonElement>('.role-management-actions button') ?? []).some(
        (button) => button.textContent?.includes('启用')
      )
    ).toBe(true);
  });

  async function mountDashboard(active: Parameters<typeof AdminDashboard>[0]['initialActive']) {
    cleanup();
    window.history.pushState(null, '', `/dashboard/${active}`);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root?.render(
        <AdminDashboard
          accessToken="admin-token"
          adminName="系统管理员"
          initialActive={active}
          initialAdminOverview={adminOverviewFixture()}
        />
      );
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  async function clickButton(label: string) {
    const button = Array.from(container?.querySelectorAll<HTMLButtonElement>('button') ?? []).find(
      (candidate) => candidate.textContent?.includes(label)
    );
    expect(button, `missing button: ${label}`).toBeTruthy();
    await act(async () => {
      button?.click();
      await Promise.resolve();
    });
  }

  function cleanup() {
    if (root) {
      act(() => root?.unmount());
    }
    container?.remove();
    root = null;
    container = null;
  }
});

function adminBookingPageResponse() {
  return new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        items: [
          {
            id: 'booking-action-001',
            uid: 'stu_cse_01',
            user: '林晓明',
            room: '经管自习室 301',
            seat: 'C3',
            date: '6/10',
            time: '20:00–22:00',
            checkin: '—',
            status: 'pending'
          }
        ],
        page: 1,
        size: 10,
        total: 1
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );
}

function adminViolationPageResponse() {
  return new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        items: [
          {
            id: 'violation-action-001',
            bookingId: 'booking-action-001',
            student: '林晓明',
            uid: 'stu_cse_01',
            room: '经管自习室 301',
            seat: 'C3',
            reason: '未签到',
            action: '自动取消并释放座位',
            occurred: '6/10 20:15',
            status: 'confirmed'
          }
        ],
        page: 1,
        size: 10,
        total: 1
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );
}
