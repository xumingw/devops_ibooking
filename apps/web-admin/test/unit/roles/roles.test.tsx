import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { AdminDashboard, mapAdminRoleToRow, requestRoles } from '../../../src/App';
import { successfulRolesResponse } from '../helpers/api-responses';

describe('roles', () => {
  it('角色列表请求会携带管理员 token 和关键词筛选', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulRolesResponse());

    const roles = await requestRoles(
      'access-token',
      { keyword: '  用户  ' },
      fetcher,
      'http://xmwhzl.love:13000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/roles?keyword=%E7%94%A8%E6%88%B7',
      expect.objectContaining({
        credentials: 'include',
        headers: { Authorization: 'Bearer access-token' },
        method: 'GET'
      })
    );
    expect(roles[0]).toMatchObject({
      code: 'ROLE_FULL_ADMIN',
      name: '超级管理员',
      userCount: 1
    });
    expect(roles[0].permissions).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'user.read', menuKey: 'users' })])
    );
  });

  it('渲染角色权限管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard adminName="系统管理员" initialActive="roles" />
    );

    expect(html).toContain('角色权限管理');
    expect(html).toContain('角色权限 · 菜单级过滤');
    expect(html).toContain('新建角色');
    expect(html).toContain('分配权限');
    expect(html).toContain('角色名称、权限点、菜单');
    expect(html).toContain('角色数');
    expect(html).toContain('权限点');
    expect(html).toContain('待审变更');
    expect(html).toContain('菜单级权限');
    expect(html).toContain('角色列表');
    expect(html).toContain('没有匹配的角色');
    expect(html).not.toContain('只读观察员');
    expect(html).toContain('审批后生效');
    expect(html).toContain('菜单级过滤');
    expect(html).toContain('后端暂无权限点数据');
    expect(html).toContain('菜单权限矩阵');
    expect(html).not.toContain('空间管理 / 座位管理 / 平面图编辑器');
    expect(html).not.toContain('权限变更需审计留痕');
    expect(html).not.toContain('管理模块');
  });

  it('非超级管理员后台菜单按权限 menuKey 过滤', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard
        adminName="李思源"
        adminPermissions={[
          { id: 'perm-room-read', code: 'room.read', name: '查看自习室', menuKey: 'rooms' },
          { id: 'perm-seat-write', code: 'seat.write', name: '维护座位', menuKey: 'seats' },
          {
            id: 'perm-checkin-code-manage',
            code: 'checkin_code.manage',
            name: '管理动态码',
            menuKey: 'qrcode'
          }
        ]}
        adminRoles={[{ code: 'ROLE_ROOM_ADMIN', name: '自习室管理员' }]}
        initialActive="users"
      />
    );

    expect(html).toContain('管理仪表盘');
    expect(html).toContain('自习室管理');
    expect(html).toContain('座位管理');
    expect(html).toContain('动态码管理');
    expect(html).not.toContain('用户管理');
    expect(html).not.toContain('角色权限');
    expect(html).not.toContain('数据报表');
    expect(html).not.toContain('预约记录管理');
  });

  it('审计员只能看到只读运营与审计报表菜单', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard
        adminName="周明"
        adminPermissions={[
          { id: 'perm-room-read', code: 'room.read', name: '查看自习室', menuKey: 'rooms' },
          { id: 'perm-booking-read', code: 'booking.read', name: '查看预约', menuKey: 'bookings' },
          { id: 'perm-violation-read', code: 'violation.read', name: '查看违约', menuKey: 'violations' },
          { id: 'perm-audit-read', code: 'audit.read', name: '查看审计日志', menuKey: 'audit' },
          { id: 'perm-report-read', code: 'report.read', name: '查看报表', menuKey: 'reports' }
        ]}
        adminRoles={[{ code: 'ROLE_AUDIT', name: '数据审计员' }]}
        initialActive="roles"
      />
    );

    expect(html).toContain('管理仪表盘');
    expect(html).toContain('自习室管理');
    expect(html).toContain('预约记录');
    expect(html).toContain('违约记录');
    expect(html).toContain('审计日志');
    expect(html).toContain('数据报表');
    expect(html).not.toContain('座位管理');
    expect(html).not.toContain('动态码管理');
    expect(html).not.toContain('角色权限');
  });

  it('超级管理员按角色编码展示全部权限范围', () => {
    const row = mapAdminRoleToRow({
      id: 'role-full-admin',
      code: 'ROLE_FULL_ADMIN',
      name: '超级管理员',
      userCount: 1,
      permissions: [
        { id: 'perm-user-read', code: 'user.read', name: '查看用户', menuKey: 'users' },
        { id: 'perm-role-assign', code: 'role.assign', name: '分配角色', menuKey: 'roles' }
      ],
      updatedAt: '2026-05-28T03:40:35.000Z'
    });

    expect(row).toMatchObject({
      scope: '全部院系',
      spaceAccess: '全部',
      operationAccess: '全部',
      menuAccess: '13/13',
      status: 'active'
    });
  });

  it('角色行映射兼容后端单数资源权限编码', () => {
    const row = mapAdminRoleToRow({
      id: 'role-room-admin',
      code: 'ROLE_ROOM_ADMIN',
      name: '自习室管理员',
      userCount: 3,
      permissions: [
        { id: 'perm-room-read', code: 'room.read', name: '查看自习室', menuKey: 'rooms' },
        { id: 'perm-seat-write', code: 'seat.write', name: '维护座位', menuKey: 'seats' }
      ],
      updatedAt: '2026-05-28T03:40:35.000Z'
    });

    expect(row).toMatchObject({
      scope: '全校空间',
      spaceAccess: '可编辑',
      operationAccess: '无',
      menuAccess: '2/13'
    });
  });
});
