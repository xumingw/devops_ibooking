import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdminDashboard } from '../../../src/App';

describe('params', () => {
  it('渲染系统参数管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard adminName="系统管理员" initialActive="params" />
    );

    expect(html).toContain('系统参数管理');
    expect(html).toContain('预约规则与提醒策略');
    expect(html).toContain('保存参数');
    expect(html).toContain('恢复默认');
    expect(html).toContain('参数名称、取值、适用范围');
    expect(html).toContain('单次最长');
    expect(html).toContain('签到宽限');
    expect(html).toContain('待发布变更');
    expect(html).toContain('参数配置');
    expect(html).toContain('最大预约时长');
    expect(html).toContain('4 小时');
    expect(html).toContain('默认开放时间');
    expect(html).toContain('07:00-22:00');
    expect(html).toContain('开始前 15 分钟提醒');
    expect(html).toContain('开始后 10 分钟未签到提醒');
    expect(html).toContain('开始后 15 分钟自动取消');
    expect(html).toContain('生成违约记录');
    expect(html).toContain('院系自习室');
    expect(html).toContain('夜间开放');
    expect(html).toContain('参数变更需审批发布');
    expect(html).toContain('配置变更需审计留痕');
    expect(html).not.toContain('管理模块');
  });
});
