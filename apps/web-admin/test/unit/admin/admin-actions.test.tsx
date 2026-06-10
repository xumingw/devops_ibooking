// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminDashboard } from '../../../src/App';
import { adminOverviewFixture, successfulAdminOverviewResponse } from '../helpers/api-responses';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe('admin action buttons', () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation((input, init) => {
        const url = String(input);
        if (url.includes('/api/v1/admin/bookings')) return Promise.resolve(adminBookingPageResponse());
        if (url.includes('/api/v1/admin/violations')) return Promise.resolve(adminViolationPageResponse());
        if (url.includes('/api/v1/roles/role-night-admin/permissions')) {
          return Promise.resolve(updatedNightRoleResponse());
        }
        if (url.includes('/api/v1/roles') && init?.method === 'POST') {
          return Promise.resolve(createdNightRoleResponse());
        }
        if (url.includes('/api/v1/roles')) return Promise.resolve(adminRolesResponse());
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

  it('角色权限筛选是真实下拉并会过滤列表', async () => {
    await mountDashboard('roles');

    await selectByLabel('角色筛选', '自习室管理员');
    expect(container?.querySelectorAll('.role-management-table-row')).toHaveLength(1);
    expect(container?.textContent).toContain('自习室管理员');
    expect(container?.textContent).not.toContain('超级管理员role-full-admin');

    await selectByLabel('权限范围筛选', '全部院系');
    expect(container?.querySelectorAll('.role-management-table-row')).toHaveLength(0);
    expect(container?.textContent).toContain('没有匹配的角色');

    await selectByLabel('角色筛选', '全部角色');
    expect(container?.querySelectorAll('.role-management-table-row')).toHaveLength(1);
    expect(container?.textContent).toContain('超级管理员');

    await selectByLabel('审批状态筛选', '待审批');
    expect(container?.querySelectorAll('.role-management-table-row')).toHaveLength(0);

    await selectByLabel('权限范围筛选', '全部范围');
    expect(container?.querySelectorAll('.role-management-table-row')).toHaveLength(1);
    expect(container?.textContent).toContain('临时观察员');
  });

  it('新建角色和分配权限会真实更新角色列表', async () => {
    await mountDashboard('roles');

    await clickButton('新建角色');
    await fillByLabel('角色名称', '夜间值班管理员');
    await fillByLabel('角色编码', 'ROLE_NIGHT_ADMIN');
    await togglePermission('预约记录管理');
    await togglePermission('动态码管理');
    await clickButton('保存角色');

    expect(container?.textContent).toContain('夜间值班管理员');
    expect(container?.textContent).toContain('2/13');

    await clickButton('分配权限');
    await selectByLabel('待分配角色', '夜间值班管理员');
    await togglePermission('违约记录管理');
    await clickButton('保存权限');

    const roleRow = Array.from(container?.querySelectorAll<HTMLElement>('.role-management-table-row') ?? []).find(
      (row) => row.textContent?.includes('夜间值班管理员')
    );
    expect(roleRow?.textContent).toContain('3/13');
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

  async function selectByLabel(label: string, value: string) {
    const select = Array.from(container?.querySelectorAll<HTMLSelectElement>('select') ?? []).find(
      (candidate) => candidate.getAttribute('aria-label') === label
    );
    expect(select, `missing select: ${label}`).toBeTruthy();
    await act(async () => {
      select!.value = value;
      select!.dispatchEvent(new Event('change', { bubbles: true }));
      await Promise.resolve();
    });
  }

  async function fillByLabel(label: string, value: string) {
    const input = Array.from(container?.querySelectorAll<HTMLInputElement>('input') ?? []).find(
      (candidate) => candidate.getAttribute('aria-label') === label
    );
    expect(input, `missing input: ${label}`).toBeTruthy();
    await act(async () => {
      input!.value = value;
      input!.dispatchEvent(new Event('input', { bubbles: true }));
      await Promise.resolve();
    });
  }

  async function togglePermission(label: string) {
    const checkbox = Array.from(container?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? []).find(
      (candidate) => candidate.getAttribute('aria-label') === label
    );
    expect(checkbox, `missing permission: ${label}`).toBeTruthy();
    await act(async () => {
      checkbox!.click();
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

function adminRolesResponse() {
  return new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: [
        {
          id: 'role-full-admin',
          code: 'ROLE_FULL_ADMIN',
          name: '超级管理员',
          userCount: 1,
          permissions: [
            { id: 'perm-user-read', code: 'user.read', name: '查看用户', menuKey: 'users' },
            { id: 'perm-role-assign', code: 'role.assign', name: '分配角色', menuKey: 'roles' }
          ],
          updatedAt: '2026-05-28T03:40:35.000Z'
        },
        {
          id: 'role-room-admin',
          code: 'ROLE_ROOM_ADMIN',
          name: '自习室管理员',
          userCount: 2,
          permissions: [
            { id: 'perm-room-read', code: 'room.read', name: '查看自习室', menuKey: 'rooms' },
            { id: 'perm-seat-write', code: 'seat.write', name: '维护座位', menuKey: 'seats' }
          ],
          updatedAt: '2026-05-28T03:40:35.000Z'
        },
        {
          id: 'role-temp-audit',
          code: 'ROLE_TEMP_AUDIT',
          name: '临时观察员',
          userCount: 0,
          permissions: [],
          updatedAt: '2026-05-28T03:40:35.000Z'
        }
      ]
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );
}

function createdNightRoleResponse() {
  return roleResponse({
    id: 'role-night-admin',
    code: 'ROLE_NIGHT_ADMIN',
    name: '夜间值班管理员',
    userCount: 0,
    permissions: [
      { id: 'perm-booking-read', code: 'booking.read', name: '查看预约', menuKey: 'bookings' },
      { id: 'perm-checkin-code-manage', code: 'checkin_code.manage', name: '管理动态码', menuKey: 'qrcode' }
    ]
  });
}

function updatedNightRoleResponse() {
  return roleResponse({
    id: 'role-night-admin',
    code: 'ROLE_NIGHT_ADMIN',
    name: '夜间值班管理员',
    userCount: 0,
    permissions: [
      { id: 'perm-booking-read', code: 'booking.read', name: '查看预约', menuKey: 'bookings' },
      { id: 'perm-checkin-code-manage', code: 'checkin_code.manage', name: '管理动态码', menuKey: 'qrcode' },
      { id: 'perm-violation-read', code: 'violation.read', name: '查看违约', menuKey: 'violations' }
    ]
  });
}

function roleResponse(input: {
  id: string;
  code: string;
  name: string;
  userCount: number;
  permissions: Array<{ id: string; code: string; name: string; menuKey: string }>;
}) {
  return new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        ...input,
        updatedAt: '2026-06-10T03:40:35.000Z'
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
