import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdminDashboard, formatAdminDateLabel } from '../../../src/App';

describe('dashboard', () => {
  it('渲染登录成功后的管理仪表盘', () => {
    const html = renderToStaticMarkup(<AdminDashboard adminName="系统管理员" />);

    expect(html).toContain('管理仪表盘');
    expect(html).toContain('系统管理员');
    expect(html).toContain(`${formatAdminDateLabel()} · 实时数据`);
    expect(html).toContain('今日预约总数');
    expect(html).toContain('本周座位利用率热力图');
    expect(html).toContain('自习室实时状态');
    expect(html).toContain('最近预约记录');
    expect(html).toContain('导出报告');
    expect(html).toContain('自习室运行概览');
    expect(html).toContain('退出登录');
  });

  it('按当前管理员姓名和角色渲染侧栏身份信息', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard
        adminName="陈审计"
        adminRoles={[{ code: 'ROLE_AUDIT', name: '数据审计员' }]}
      />
    );

    expect(html).toContain('数据审计员');
    expect(html).not.toContain('超级管理员');
    expect(html.match(/class="dashboard-avatar">陈<\/div>/g)).toHaveLength(2);
    expect(html).not.toContain('class="dashboard-avatar">王</div>');
  });
});
