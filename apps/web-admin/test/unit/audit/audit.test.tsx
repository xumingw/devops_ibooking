import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdminDashboard } from '../../../src/App';

describe('audit', () => {
  it('渲染审计日志管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard adminName="系统管理员" initialActive="audit" />
    );

    expect(html).toContain('审计日志管理');
    expect(html).toContain('最近 24 小时 386 条');
    expect(html).toContain('筛选模块');
    expect(html).toContain('导出日志');
    expect(html).toContain('操作者、模块、预约编号');
    expect(html).toContain('资源变更');
    expect(html).toContain('权限变更');
    expect(html).toContain('失败登录');
    expect(html).toContain('风险事件');
    expect(html).toContain('审计流水');
    expect(html).toContain('王老师');
    expect(html).toContain('张老师');
    expect(html).toContain('李老师');
    expect(html).toContain('系统任务');
    expect(html).toContain('更新开放时间');
    expect(html).toContain('停用座位 C-018');
    expect(html).toContain('新增权限点');
    expect(html).toContain('自动取消预约');
    expect(html).toContain('登录失败 4 次');
    expect(html).toContain('IP 10.28.4.16');
    expect(html).toContain('权限调整需二次复核');
    expect(html).toContain('操作留痕不可删除');
    expect(html).toContain('审计数据保留 180 天');
    expect(html).not.toContain('管理模块');
  });
});
