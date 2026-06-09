import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdminDashboard } from '../../../src/App';
import { adminOverviewFixture } from '../helpers/api-responses';

describe('bookings', () => {
  it('渲染预约记录管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard
        adminName="系统管理员"
        initialActive="bookings"
        initialAdminOverview={adminOverviewFixture()}
      />
    );

    expect(html).toContain('预约记录管理');
    expect(html).toContain('预约、签到与取消记录');
    expect(html).toContain('代预约');
    expect(html).toContain('导出 Excel');
    expect(html).toContain('学号、姓名、座位编号');
    expect(html).toContain('批量取消');
    expect(html).toContain('预约ID');
    expect(html).toContain('签到时间');
    expect(html).toContain('seed-admin-booking-now');
    expect(html).toContain('林晓明');
    expect(html).toContain('使用中');
    expect(html).toContain('完整校验');
    expect(html).toContain('详情');
    expect(html).not.toContain('BK-1893');
    expect(html).not.toContain('管理模块');
  });
});
