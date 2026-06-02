import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { AdminDashboard, requestRooms, saveAdminRoom } from '../../../src/App';
import {
  successfulLoginResponse,
  successfulRoomResponse,
  successfulRoomsResponse
} from '../helpers/api-responses';

describe('rooms', () => {
  it('自习室列表请求会携带管理员 token', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulRoomsResponse());

    const rooms = await requestRooms('access-token', fetcher, 'http://xmwhzl.love:13000');

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/rooms',
      expect.objectContaining({
        credentials: 'include',
        headers: { Authorization: 'Bearer access-token' },
        method: 'GET'
      })
    );
    expect(rooms[0].name).toBe('经管自习室 301');
  });

  it('自习室列表遇到访问令牌过期会刷新会话并用新 token 重试', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'AUTH_UNAUTHORIZED', message: '会话已过期' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 401
        })
      )
      .mockResolvedValueOnce(successfulLoginResponse())
      .mockResolvedValueOnce(successfulRoomsResponse());
    const onSessionRefresh = vi.fn();
    const storage = {
      setItem: vi.fn(),
      removeItem: vi.fn()
    };

    const rooms = await requestRooms('expired-token', fetcher, 'http://xmwhzl.love:13000', {
      onSessionRefresh,
      storage
    });

    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      'http://xmwhzl.love:13000/api/v1/rooms',
      expect.objectContaining({
        headers: { Authorization: 'Bearer expired-token' },
        method: 'GET'
      })
    );
    expect(fetcher).toHaveBeenNthCalledWith(2, 'http://xmwhzl.love:13000/api/v1/auth/refresh', {
      credentials: 'include',
      method: 'POST'
    });
    expect(fetcher).toHaveBeenNthCalledWith(
      3,
      'http://xmwhzl.love:13000/api/v1/rooms',
      expect.objectContaining({
        headers: { Authorization: 'Bearer access-token' },
        method: 'GET'
      })
    );
    expect(storage.setItem).toHaveBeenCalledWith('ibooking.admin.accessToken', 'access-token');
    expect(storage.removeItem).toHaveBeenCalledWith('ibooking.student.accessToken');
    expect(onSessionRefresh).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'access-token',
        kind: 'admin',
        name: '系统管理员'
      })
    );
    expect(rooms[0].name).toBe('经管自习室 301');
  });

  it('新增自习室会提交开放范围和开放时间', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulRoomResponse());

    await saveAdminRoom(
      {
        name: '计算机学院自习室 B',
        building: '计算机楼',
        floor: 4,
        capacity: 24,
        scopeType: 'DEPARTMENT',
        departmentId: 'dept-cs',
        openHour: 22,
        closeHour: 7,
        overnight: true
      },
      { accessToken: 'access-token' },
      fetcher,
      'http://xmwhzl.love:13000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/rooms',
      expect.objectContaining({
        body: JSON.stringify({
          name: '计算机学院自习室 B',
          building: '计算机楼',
          floor: 4,
          capacity: 24,
          scopeType: 'DEPARTMENT',
          departmentId: 'dept-cs',
          openHour: 22,
          closeHour: 7,
          overnight: true
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

  it('渲染自习室管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard adminName="系统管理员" initialActive="rooms" />
    );

    expect(html).toContain('自习室管理');
    expect(html).toContain('共 48 个自习室');
    expect(html).toContain('新增自习室');
    expect(html).toContain('资源状态同步');
    expect(html).toContain('搜索自习室名称、楼栋');
    expect(html).toContain('自习室名称');
    expect(html).toContain('R001');
    expect(html).toContain('08:00–22:00');
    expect(html).toContain('编辑');
    expect(html).toContain('平面图');
    expect(html).not.toContain('管理模块');
    expect(html).not.toContain('本周座位利用率热力图');
  });
});
