import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdminDashboard } from '../../../src/App';
import { adminOverviewFixture } from '../helpers/api-responses';

describe('checkin code', () => {
  it('渲染动态码管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard
        adminName="系统管理员"
        initialActive="qrcode"
        initialAdminOverview={adminOverviewFixture()}
      />
    );

    expect(html).toContain('动态码管理');
    expect(html).toContain('每间自习室每日更新');
    expect(html).toContain('生成动态码');
    expect(html).toContain('打印签到码');
    expect(html).toContain('自习室、签到码、楼栋');
    expect(html).toContain('今日有效码');
    expect(html).toContain('网页动态码');
    expect(html).toContain('小程序二维码');
    expect(html).toContain('739214');
    expect(html).toContain('截图复用拦截');
    expect(html).toContain('重新生成');
    expect(html).toContain('查看日志');
    expect(html).toContain('每日 00:00 自动更新');
    expect(html).not.toContain('FD-301-7K2');
    expect(html).not.toContain('管理模块');
  });
});
