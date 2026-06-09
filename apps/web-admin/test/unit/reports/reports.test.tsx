import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdminDashboard } from '../../../src/App';
import { adminOverviewFixture } from '../helpers/api-responses';

describe('reports', () => {
  it('渲染数据报表页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard
        adminName="系统管理员"
        initialActive="reports"
        initialAdminOverview={adminOverviewFixture()}
      />
    );

    expect(html).toContain('数据报表');
    expect(html).toContain('运营指标与资源分析');
    expect(html).toContain('导出 CSV');
    expect(html).toContain('导出 Excel');
    expect(html).toContain('平均签到率');
    expect(html).toContain('预约总量');
    expect(html).toContain('本周每日预约量');
    expect(html).toContain('热门自习室 Top 5');
    expect(html).toContain('热门座位');
    expect(html).toContain('低利用率时段');
    expect(html).toContain('报表只读后端聚合');
    expect(html).toContain('低利用率辅助调度');
    expect(html).not.toContain('NaN');
    expect(html).not.toContain('管理模块');
  });
});
