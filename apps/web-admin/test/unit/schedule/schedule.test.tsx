import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdminDashboard } from '../../../src/App';
import { adminOverviewFixture } from '../helpers/api-responses';

describe('schedule', () => {
  it('渲染开放时间管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard
        adminName="系统管理员"
        initialActive="schedule"
        initialAdminOverview={adminOverviewFixture()}
      />
    );

    expect(html).toContain('开放时间管理');
    expect(html).toContain('系统参数默认值');
    expect(html).toContain('08:00–22:00');
    expect(html).toContain('分钟级时段');
    expect(html).toContain('跨天开放');
    expect(html).toContain('特殊日期优先');
    expect(html).toContain('节假日特殊规则');
    expect(html).toContain('理工自习室 201 跨天开放');
    expect(html).toContain('常规开放');
    expect(html).toContain('未配置独立规则时使用系统参数中的全校默认规则');
    expect(html).toContain('保存开放时间');
    expect(html).not.toContain('管理模块');
  });
});
