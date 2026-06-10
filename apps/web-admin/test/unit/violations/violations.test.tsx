import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { AdminDashboard, requestAdminViolationRecords } from '../../../src/App';
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

  it('长违约编号会压缩展示并保留完整 title', () => {
    const overview = adminOverviewFixture();
    overview.violations.records = [
      {
        ...overview.violations.records[0],
        id: 'cmq6ssw3d000ijar3kfclbhvf',
        bookingId: 'seed-admin-booking-today-pending'
      }
    ];

    const html = renderToStaticMarkup(
      <AdminDashboard
        adminName="系统管理员"
        initialActive="violations"
        initialAdminOverview={overview}
      />
    );

    expect(html).toContain('cmq6ssw3…clbhvf');
    expect(html).toContain('title="cmq6ssw3d000ijar3kfclbhvf"');
    expect(html).toContain('title="seed-admin-booking-today-pending"');
  });

  it('管理端违约记录请求支持分页参数', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 'SUCCESS',
          message: 'success',
          data: {
            items: [
              {
                id: 'violation-page-006',
                bookingId: 'booking-page-006',
                student: '陈浩然',
                uid: 'stu_econ_01',
                room: '理工自习室 201',
                seat: 'A1',
                reason: '未签到',
                action: '自动取消并释放座位',
                occurred: '6/8 23:32',
                status: 'confirmed'
              }
            ],
            total: 19,
            page: 2,
            size: 5
          }
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    );

    const page = await requestAdminViolationRecords(
      'admin-token',
      { page: 2, size: 5 },
      fetcher,
      'http://localhost:3000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/admin/violations?page=2&size=5',
      expect.objectContaining({
        credentials: 'include',
        headers: { Authorization: 'Bearer admin-token' },
        method: 'GET'
      })
    );
    expect(page.total).toBe(19);
    expect(page.items[0]?.id).toBe('violation-page-006');
  });
});
