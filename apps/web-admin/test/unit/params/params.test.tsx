import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdminDashboard } from '../../../src/App';
import { adminOverviewFixture } from '../helpers/api-responses';

describe('params', () => {
  it('渲染系统参数管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard
        adminName="系统管理员"
        initialActive="params"
        initialAdminOverview={adminOverviewFixture()}
      />
    );

    expect(html).toContain('系统参数管理');
    expect(html).toContain('预约规则与提醒策略');
    expect(html).toContain('保存参数');
    expect(html).toContain('恢复默认');
    expect(html).toContain('参数名称、取值、适用范围');
    expect(html).toContain('单次最长');
    expect(html).toContain('待发布变更');
    expect(html).toContain('参数配置');
    expect(html).toContain('最大预约时长');
    expect(html).toContain('4 小时');
    expect(html).toContain('开始前提醒');
    expect(html).toContain('超过 15 分钟自动释放座位');
    expect(html).toContain('生成违约记录');
    expect(html).toContain('院系自习室');
    expect(html).toContain('参数变更需审批发布');
    expect(html).toContain('配置变更需审计留痕');
    expect(html).not.toContain('管理模块');
  });
});
