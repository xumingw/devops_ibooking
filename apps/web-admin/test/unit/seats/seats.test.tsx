import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { AdminDashboard, requestSeats, saveAdminSeat } from '../../../src/App';
import { successfulSeatResponse, successfulSeatsResponse } from '../helpers/api-responses';

describe('seats', () => {
  it('座位列表请求会携带管理员 token', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulSeatsResponse());

    const seats = await requestSeats('access-token', fetcher, 'http://xmwhzl.love:13000');

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/seats',
      expect.objectContaining({
        credentials: 'include',
        headers: { Authorization: 'Bearer access-token' },
        method: 'GET'
      })
    );
    expect(seats[0]).toMatchObject({
      roomId: 'room-gm-301',
      roomName: '经管自习室 301',
      code: 'A001',
      quietZone: true
    });
  });

  it('新增座位会提交所属自习室、坐标和座位属性', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulSeatResponse());

    await saveAdminSeat(
      {
        roomId: 'room-gm-301',
        code: 'A010',
        x: 220,
        y: 120,
        hasPower: true,
        nearWindow: true,
        quietZone: false,
        status: 'ACTIVE'
      },
      { accessToken: 'access-token' },
      fetcher,
      'http://xmwhzl.love:13000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/seats',
      expect.objectContaining({
        body: JSON.stringify({
          roomId: 'room-gm-301',
          code: 'A010',
          x: 220,
          y: 120,
          hasPower: true,
          nearWindow: true,
          quietZone: false,
          status: 'ACTIVE'
        }),
        credentials: 'include',
        headers: {
          Authorization: 'Bearer access-token',
          'Content-Type': 'application/json'
        },
        method: 'POST'
      })
    );
  });

  it('编辑座位会 PATCH 对应座位记录', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulSeatResponse());

    await saveAdminSeat(
      {
        roomId: 'room-gm-301',
        code: 'A010',
        x: 260,
        y: 160,
        hasPower: false,
        nearWindow: true,
        quietZone: true,
        status: 'INACTIVE'
      },
      { accessToken: 'access-token', seatId: 'seat-gm-301-a010' },
      fetcher,
      'http://xmwhzl.love:13000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/seats/seat-gm-301-a010',
      expect.objectContaining({
        body: JSON.stringify({
          roomId: 'room-gm-301',
          code: 'A010',
          x: 260,
          y: 160,
          hasPower: false,
          nearWindow: true,
          quietZone: true,
          status: 'INACTIVE'
        }),
        method: 'PATCH'
      })
    );
  });

  it('渲染座位管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard adminName="系统管理员" initialActive="seats" />
    );

    expect(html).toContain('座位管理');
    expect(html).toContain('搜索座位编号、自习室');
    expect(html).toContain('座位编号');
    expect(html).toContain('座位总数');
    expect(html).toContain('禁用');
    expect(html).toContain('批量维护');
    expect(html).toContain('没有匹配的座位');
    expect(html).not.toContain('经管自习室 301');
    expect(html).not.toContain('管理模块');
  });

  it('渲染平面图编辑器页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard adminName="系统管理员" initialActive="editor" />
    );

    expect(html).toContain('座位平面图编辑器');
    expect(html).toContain('正在加载座位平面图编辑器数据');
    expect(html).toContain('管理端业务数据由后端接口提供');
    expect(html).not.toContain('经管自习室 301 · 光华楼 A座 3楼');
    expect(html).not.toContain('管理模块');
  });
});
