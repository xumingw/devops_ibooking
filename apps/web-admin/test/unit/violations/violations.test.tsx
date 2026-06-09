import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdminDashboard } from '../../../src/App';
import { adminOverviewFixture } from '../helpers/api-responses';

describe('violations', () => {
  it('渲染违约记录管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard
        adminName="系统管理员"
        initialActive="violations"
        initialAdminOverview={adminOverviewFixture()}
      />
    );

    expect(html).toContain('违约记录管理');
    expect(html).toContain('违约、限制与申诉处理');
    expect(html).toContain('处理申诉');
    expect(html).toContain('导出违约');
    expect(html).toContain('学生、学号、预约编号');
    expect(html).toContain('未签到');
    expect(html).toContain('seed-violation-admin-no-show');
    expect(html).toContain('陈浩然');
    expect(html).toContain('自动取消');
    expect(html).toContain('连续 3 次违约限制预约');
    expect(html).toContain('追加备注');
    expect(html).not.toContain('今日新增 18 条');
    expect(html).not.toContain('管理模块');
  });
});
