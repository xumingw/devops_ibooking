// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdminDashboard } from '../../../src/App';
import {
  adminOverviewFixture,
  successfulAdminOverviewResponse,
  successfulUsersResponse
} from '../helpers/api-responses';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe('users interactions', () => {
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

  it('用户管理顶部、工具栏和行内操作都会产生可见状态变化', async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation((input) => {
      const url = String(input);
      return Promise.resolve(url.includes('/users') ? successfulUsersResponse() : successfulAdminOverviewResponse());
    });
    vi.stubGlobal('fetch', fetcher);
    window.history.pushState(null, '', '/dashboard/users');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <AdminDashboard
          accessToken="admin-token"
          adminName="系统管理员"
          initialActive="users"
          initialAdminOverview={adminOverviewFixture()}
        />
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const toolbarCreateButton = container.querySelector<HTMLButtonElement>(
      '.user-management-toolbar .user-management-primary'
    );
    await act(async () => {
      toolbarCreateButton?.click();
      await Promise.resolve();
    });
    expect(container.textContent).toContain('用户管理：已打开新增用户流程。');

    const topbarImportButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.dashboard-actions button')
    ).find((button) => button.textContent?.includes('导入名单'));
    await act(async () => {
      topbarImportButton?.click();
      await Promise.resolve();
    });
    expect(container.textContent).toContain('用户管理：已准备导入名单流程。');

    const disableButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.user-management-actions button')
    ).find((button) => button.textContent?.includes('停用'));
    await act(async () => {
      disableButton?.click();
      await Promise.resolve();
    });

    expect(container.textContent).toContain('用户管理：已停用林晓明。');
    expect(container.textContent).toContain('1停用账号阻止登录与预约操作');
    expect(
      Array.from(container.querySelectorAll<HTMLButtonElement>('.user-management-actions button')).some(
        (button) => button.textContent?.includes('启用')
      )
    ).toBe(true);
  });

  it('用户管理筛选控件是真实下拉并会过滤列表', async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation((input) => {
      const url = String(input);
      return Promise.resolve(url.includes('/users') ? successfulMixedUsersResponse() : successfulAdminOverviewResponse());
    });
    vi.stubGlobal('fetch', fetcher);
    window.history.pushState(null, '', '/dashboard/users');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <AdminDashboard
          accessToken="admin-token"
          adminName="系统管理员"
          initialActive="users"
          initialAdminOverview={adminOverviewFixture()}
        />
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(container.querySelectorAll('.user-management-table-row')).toHaveLength(3);

    await selectFilter('院系筛选', '经济学院');
    expect(container.querySelectorAll('.user-management-table-row')).toHaveLength(1);
    expect(container.textContent).toContain('陈浩然');
    expect(container.textContent).not.toContain('林晓明stu_cse_01');
    expect(container.textContent).toContain('1当前展示按搜索条件实时过滤');

    await selectFilter('角色筛选', '数据审计员');
    expect(container.querySelectorAll('.user-management-table-row')).toHaveLength(0);
    expect(container.textContent).toContain('没有匹配的用户');

    await selectFilter('院系筛选', '全部院系');
    expect(container.querySelectorAll('.user-management-table-row')).toHaveLength(1);
    expect(container.textContent).toContain('周明');

    await selectFilter('账号状态筛选', '停用');
    expect(container.querySelectorAll('.user-management-table-row')).toHaveLength(1);
    expect(container.textContent).toContain('周明');

    await selectFilter('角色筛选', '全部角色');
    expect(container.querySelectorAll('.user-management-table-row')).toHaveLength(1);
    expect(container.textContent).toContain('周明');
  });

  it('新增用户、导入名单和分配角色会真实更新用户列表', async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation((input) => {
      const url = String(input);
      return Promise.resolve(url.includes('/users') ? successfulMixedUsersResponse() : successfulAdminOverviewResponse());
    });
    vi.stubGlobal('fetch', fetcher);
    window.history.pushState(null, '', '/dashboard/users');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <AdminDashboard
          accessToken="admin-token"
          adminName="系统管理员"
          initialActive="users"
          initialAdminOverview={adminOverviewFixture()}
        />
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    await clickByText('新增用户');
    expect(container.textContent).toContain('新增用户');
    await fillByLabel('用户姓名', '赵新雨');
    await fillByLabel('登录账号', 'stu_new_01');
    await selectFilter('用户院系', '新闻学院');
    await selectFilter('用户角色', '学生');
    await clickByText('保存用户');
    expect(container.textContent).toContain('赵新雨');
    expect(container.textContent).toContain('stu_new_01');
    expect(container.textContent).toContain('4当前展示按搜索条件实时过滤');

    await clickByText('导入名单');
    await fillByLabel('名单内容', '钱导入,stu_import_01,经济学院,学生\n孙审计,audit_import,未分配,数据审计员');
    await clickByText('导入用户');
    expect(container.textContent).toContain('钱导入');
    expect(container.textContent).toContain('孙审计');
    expect(container.textContent).toContain('6当前展示按搜索条件实时过滤');

    await clickRowButton('林晓明', '分配角色');
    await selectFilter('分配角色', '数据审计员');
    await clickByText('保存角色');
    expect(findRowText('林晓明')).toContain('数据审计员');
  });

  async function selectFilter(label: string, value: string) {
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
    const input = Array.from(
      container?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea') ?? []
    ).find((candidate) => candidate.getAttribute('aria-label') === label);
    expect(input, `missing input: ${label}`).toBeTruthy();
    await act(async () => {
      input!.value = value;
      input!.dispatchEvent(new Event('input', { bubbles: true }));
      await Promise.resolve();
    });
  }

  async function clickByText(label: string) {
    const button = Array.from(container?.querySelectorAll<HTMLButtonElement>('button') ?? []).find(
      (candidate) => candidate.textContent?.includes(label)
    );
    expect(button, `missing button: ${label}`).toBeTruthy();
    await act(async () => {
      button?.click();
      await Promise.resolve();
    });
  }

  async function clickRowButton(rowText: string, buttonText: string) {
    const row = Array.from(container?.querySelectorAll<HTMLElement>('.user-management-table-row') ?? []).find(
      (candidate) => candidate.textContent?.includes(rowText)
    );
    expect(row, `missing row: ${rowText}`).toBeTruthy();
    const button = Array.from(row!.querySelectorAll<HTMLButtonElement>('button')).find((candidate) =>
      candidate.textContent?.includes(buttonText)
    );
    expect(button, `missing row button: ${buttonText}`).toBeTruthy();
    await act(async () => {
      button?.click();
      await Promise.resolve();
    });
  }

  function findRowText(rowText: string) {
    return Array.from(container?.querySelectorAll<HTMLElement>('.user-management-table-row') ?? []).find(
      (candidate) => candidate.textContent?.includes(rowText)
    )?.textContent;
  }
});

function successfulMixedUsersResponse() {
  return new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: [
        {
          id: 'user-stu-cse-01',
          studentNo: 'stu_cse_01',
          name: '林晓明',
          email: 'stu_cse_01@fudan.edu.cn',
          departmentId: 'dept-cs',
          departmentName: '计算机学院',
          status: 'ACTIVE',
          roles: [{ id: 'role-student', code: 'ROLE_STUDENT', name: '学生' }],
          updatedAt: '2026-05-28T03:40:35.000Z'
        },
        {
          id: 'user-stu-econ-01',
          studentNo: 'stu_econ_01',
          name: '陈浩然',
          email: 'stu_econ_01@fudan.edu.cn',
          departmentId: 'dept-econ',
          departmentName: '经济学院',
          status: 'ACTIVE',
          roles: [{ id: 'role-student', code: 'ROLE_STUDENT', name: '学生' }],
          updatedAt: '2026-05-28T03:40:35.000Z'
        },
        {
          id: 'user-audit-01',
          studentNo: 'audit01',
          name: '周明',
          email: 'audit01@fudan.edu.cn',
          departmentId: null,
          departmentName: null,
          status: 'INACTIVE',
          roles: [{ id: 'role-audit', code: 'ROLE_AUDIT', name: '数据审计员' }],
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
