import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { AdminDashboard, requestAdminBookingRecords } from '../../../src/App';
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

  it('管理端预约记录请求支持分页参数', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 'SUCCESS',
          message: 'success',
          data: {
            items: [
              {
                id: 'booking-page-011',
                uid: 'stu_seed_05',
                user: '周子昂',
                room: '理工自习室 201',
                seat: 'A4',
                date: '6/11',
                time: '20:00–21:00',
                checkin: '—',
                status: 'pending'
              }
            ],
            total: 23,
            page: 2,
            size: 10
          }
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    );

    const page = await requestAdminBookingRecords(
      'admin-token',
      { page: 2, size: 10 },
      fetcher,
      'http://localhost:3000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/admin/bookings?page=2&size=10',
      expect.objectContaining({
        credentials: 'include',
        headers: { Authorization: 'Bearer admin-token' },
        method: 'GET'
      })
    );
    expect(page.total).toBe(23);
    expect(page.items[0]?.id).toBe('booking-page-011');
  });
});
