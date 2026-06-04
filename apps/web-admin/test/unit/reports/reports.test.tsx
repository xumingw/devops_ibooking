import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdminDashboard, formatAdminMonthLabel } from '../../../src/App';

describe('reports', () => {
  it('渲染数据报表页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard adminName="系统管理员" initialActive="reports" />
    );

    expect(html).toContain('数据报表');
    expect(html).toContain(`${formatAdminMonthLabel()} · 月度分析`);
    expect(html).toContain('导出 CSV');
    expect(html).toContain('导出 Excel');
    expect(html).toContain('本月预约总量');
    expect(html).toContain('平均签到率');
    expect(html).toContain('平均座位利用率');
    expect(html).toContain('本周每日预约量');
    expect(html).toContain('热门自习室 Top 5');
    expect(html).toContain('热门座位');
    expect(html).toContain('低利用率时段');
    expect(html).toContain('空状态');
    expect(html).toContain('统计口径');
    expect(html).not.toContain('NaN');
    expect(html).not.toContain('管理模块');
  });
});
