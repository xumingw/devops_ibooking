import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdminDashboard } from '../../../src/App';
import { adminOverviewFixture } from '../helpers/api-responses';

describe('audit', () => {
  it('渲染审计日志管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard
        adminName="系统管理员"
        initialActive="audit"
        initialAdminOverview={adminOverviewFixture()}
      />
    );

    expect(html).toContain('审计日志管理');
    expect(html).toContain('操作留痕与风险复核');
    expect(html).toContain('筛选模块');
    expect(html).toContain('导出日志');
    expect(html).toContain('操作者、模块、预约编号');
    expect(html).toContain('审计日志');
    expect(html).toContain('风险事件');
    expect(html).toContain('审计流水');
    expect(html).toContain('系统管理员');
    expect(html).toContain('更新开放时间');
    expect(html).toContain('127.0.0.1');
    expect(html).toContain('失败操作');
    expect(html).toContain('关键操作全量留痕');
    expect(html).toContain('高风险变更需复核');
    expect(html).not.toContain('最近 24 小时 386 条');
    expect(html).not.toContain('管理模块');
  });
});
