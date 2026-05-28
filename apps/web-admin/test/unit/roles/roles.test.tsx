import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdminDashboard } from '../../../src/App';

describe('roles', () => {
  it('渲染角色权限管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard adminName="系统管理员" initialActive="roles" />
    );

    expect(html).toContain('角色权限管理');
    expect(html).toContain('5 个角色 · 菜单级权限');
    expect(html).toContain('新建角色');
    expect(html).toContain('分配权限');
    expect(html).toContain('角色名称、权限点、菜单');
    expect(html).toContain('角色数');
    expect(html).toContain('权限点');
    expect(html).toContain('待审变更');
    expect(html).toContain('菜单级权限');
    expect(html).toContain('角色列表');
    expect(html).toContain('超级管理员');
    expect(html).toContain('自习室管理员');
    expect(html).toContain('院系管理员');
    expect(html).toContain('只读观察员');
    expect(html).toContain('编辑权限');
    expect(html).toContain('复制角色');
    expect(html).toContain('禁用');
    expect(html).toContain('审批后生效');
    expect(html).toContain('RBAC 角色权限模型');
    expect(html).toContain('菜单级过滤');
    expect(html).toContain('最小权限原则');
    expect(html).toContain('菜单权限矩阵');
    expect(html).toContain('空间管理 / 座位管理 / 平面图编辑器');
    expect(html).toContain('运营管理 / 签到动态码 / 违约记录');
    expect(html).toContain('系统与权限 / 用户管理 / 角色权限');
    expect(html).toContain('全选');
    expect(html).toContain('可编辑');
    expect(html).toContain('可处理');
    expect(html).toContain('权限变更需审计留痕');
    expect(html).toContain('高风险角色变更需要二次复核');
    expect(html).not.toContain('管理模块');
  });
});
