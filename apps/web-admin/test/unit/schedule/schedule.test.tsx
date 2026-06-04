import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdminDashboard } from '../../../src/App';

describe('schedule', () => {
  it('渲染开放时间管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard adminName="系统管理员" initialActive="schedule" />
    );

    expect(html).toContain('开放时间管理');
    expect(html).toContain('全校默认时段');
    expect(html).toContain('07:00–22:00');
    expect(html).toContain('半小时时段');
    expect(html).toContain('跨天开放');
    expect(html).toContain('特殊日期优先');
    expect(html).toContain('节假日特殊规则');
    expect(html).toContain('考试周延长');
    expect(html).toContain('闭馆维护');
    expect(html).toContain('未配置时回退默认');
    expect(html).toContain('保存开放时间');
    expect(html).not.toContain('管理模块');
  });
});
