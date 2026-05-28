import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdminDashboard } from '../../../src/App';

describe('dashboard', () => {
  it('渲染登录成功后的管理仪表盘', () => {
    const html = renderToStaticMarkup(<AdminDashboard adminName="系统管理员" />);

    expect(html).toContain('管理仪表盘');
    expect(html).toContain('系统管理员');
    expect(html).toContain('2026年4月24日 · 实时数据');
    expect(html).toContain('今日预约总数');
    expect(html).toContain('本周座位利用率热力图');
    expect(html).toContain('自习室实时状态');
    expect(html).toContain('最近预约记录');
    expect(html).toContain('导出报告');
    expect(html).toContain('自习室运行概览');
    expect(html).toContain('退出登录');
  });
});
