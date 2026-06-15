// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { StudentHomePreview } from '../../../src/App';
import {
  successfulStudentBookingCancelResponse,
  successfulStudentNotificationsResponse,
  successfulStudentRoomFavoritesResponse,
  successfulStudentBookingCreateResponse,
  successfulStudentHomeSummaryResponse,
  successfulStudentRoomAvailabilityResponse,
  successfulStudentBookingsResponse,
  successfulRoomCatalogResponse
} from '../helpers/api-responses';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe('student interactive controls', () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
    }
    container?.remove();
    root = null;
    container = null;
    window.history.pushState(null, '', '/');
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('学生首页按钮会导航到对应页面或给出操作反馈', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-02T03:42:00.000Z'));
    await renderStudentHome();

    await clickButton('搜索自习室');
    expect(container?.textContent).toContain('自习室列表');
    expect(window.location.pathname).toBe('/student/rooms');

    await clickButton('首页概览');
    await clickButton('通知');
    expect(container?.textContent).toContain('通知中心');
    expect(window.location.pathname).toBe('/student/notify');

    await clickButton('首页概览');
    await clickButton('取消预约');
    expect(container?.textContent).toContain('我的预约');
    expect(container?.textContent).toContain('请在我的预约列表中选择对应记录取消');

    await clickButton('首页概览');
    await clickButton('立即找座');
    expect(container?.textContent).toContain('自习室列表');
    expect(window.location.pathname).toBe('/student/rooms');

    await clickButton('首页概览');
    await clickButton('我的收藏');
    expect(container?.textContent).toContain('已切换到常用自习室列表');
    expect(container?.textContent).toContain('自习室列表');
    expect(getButton('我的收藏').className).toContain('is-active');
    expect(getRoomGridText()).toContain('经管自习室 301');
    expect(getRoomGridText()).toContain('理工自习室 201');
    expect(getRoomGridText()).toContain('文史馆阅览室 A');
    expect(getRoomGridText()).not.toContain('新闻学院研讨室');

    await clickButton('首页概览');
    await clickButton('智能推荐');
    expect(container?.textContent).toContain('智能助手');
  });

  it('自习室列表筛选、预约和候补按钮会更新页面状态', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-02T03:42:00.000Z'));
    await renderStudentHome('rooms');

    await clickButton('有空位');
    expect(getButton('有空位').className).toContain('is-active');
    expect(container?.querySelector('.student-rooms-grid')?.textContent).not.toContain('新闻学院研讨室');

    await clickButton('全部楼栋');
    await clickButton('加入候补');
    expect(container?.textContent).toContain('已为你加入新闻学院研讨室候补提醒');

    await clickButtonInArticle('经管自习室 301', '预约');
    expect(window.location.pathname).toBe('/student/rooms');
    expect(container?.textContent).toContain('请确认经管自习室 301的预约信息');
    expect(container?.querySelector('.student-booking-confirm-dialog')).not.toBeNull();
  });

  it('自习室列表支持我的收藏筛选和星标切换', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-02T03:42:00.000Z'));
    await renderStudentHome('rooms');

    await clickButton('我的收藏');
    expect(getButton('我的收藏').className).toContain('is-active');
    expect(getRoomGridText()).toContain('经管自习室 301');
    expect(getRoomGridText()).toContain('理工自习室 201');
    expect(getRoomGridText()).toContain('文史馆阅览室 A');
    expect(getRoomGridText()).not.toContain('新闻学院研讨室');

    expect(getFavoriteButton('经管自习室 301').className).toContain('is-active');
    await clickFavoriteButton('经管自习室 301');
    expect(getRoomGridText()).not.toContain('经管自习室 301');
    expect(container?.textContent).toContain('已取消收藏经管自习室 301');

    await clickButton('首页概览');
    expect(getArticleText('常用自习室')).toContain('2');
    await clickButton('自习室列表');

    await clickButton('全部楼栋');
    expect(getFavoriteButton('新闻学院研讨室').className).not.toContain('is-active');
    await clickFavoriteButton('新闻学院研讨室');
    expect(container?.textContent).toContain('已收藏新闻学院研讨室');

    await clickButton('我的收藏');
    expect(getRoomGridText()).toContain('新闻学院研讨室');
  });

  it('自习室列表会从服务端读取并保存收藏', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-02T03:42:00.000Z'));
    const fetcher = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.includes('/api/v1/notifications/me')) {
        return Promise.resolve(successfulStudentNotificationsResponse());
      }
      if (url.includes('/api/v1/favorites/me/rooms/room-gm-301')) {
        expect(init?.method).toBe('DELETE');
        return Promise.resolve(
          successfulStudentRoomFavoritesResponse(['room-science-201', 'room-humanities-a'])
        );
      }
      if (url.includes('/api/v1/favorites/me/rooms/room-news-seminar')) {
        expect(init?.method).toBe('PUT');
        return Promise.resolve(
          successfulStudentRoomFavoritesResponse([
            'room-science-201',
            'room-humanities-a',
            'room-news-seminar'
          ])
        );
      }
      if (url.includes('/api/v1/favorites/me/rooms')) {
        return Promise.resolve(
          successfulStudentRoomFavoritesResponse([
            'room-gm-301',
            'room-science-201',
            'room-humanities-a'
          ])
        );
      }
      throw new Error(`unexpected fetch: ${url}`);
    });
    vi.stubGlobal('fetch', fetcher);

    await renderStudentHome('rooms', { accessToken: 'student-token' });

    await clickButton('我的收藏');
    expect(getRoomGridText()).toContain('经管自习室 301');
    expect(getRoomGridText()).not.toContain('新闻学院研讨室');

    await clickFavoriteButton('经管自习室 301');
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/favorites/me/rooms/room-gm-301'),
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(getRoomGridText()).not.toContain('经管自习室 301');

    await clickButton('全部楼栋');
    await clickFavoriteButton('新闻学院研讨室');
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/favorites/me/rooms/room-news-seminar'),
      expect.objectContaining({ method: 'PUT' })
    );

    await clickButton('我的收藏');
    expect(getRoomGridText()).toContain('新闻学院研讨室');
  });

  it('自习室列表兼容缺省 favorites 明细的收藏响应', async () => {
    const fetcher = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.includes('/api/v1/notifications/me')) {
        return Promise.resolve(successfulStudentNotificationsResponse());
      }
      if (url.includes('/api/v1/favorites/me/rooms') && init?.method === 'GET') {
        return Promise.resolve(successfulStudentRoomFavoritesIdsOnlyResponse(['room-gm-301']));
      }
      throw new Error(`unexpected fetch: ${url}`);
    });
    vi.stubGlobal('fetch', fetcher);

    await renderStudentHome('rooms', { accessToken: 'student-token' });
    await flushEffects();

    expect(container?.textContent).not.toContain('Cannot read properties');
    await clickButton('我的收藏');
    expect(getRoomGridText()).toContain('经管自习室 301');
    expect(getRoomGridText()).not.toContain('理工自习室 201');
  });

  it('自习室列表按预约时间、楼栋、楼层和教室搜索', async () => {
    await renderStudentHome('rooms');

    await selectOption('日期', '明天');
    await selectTimePart('开始时间', '小时', '18');
    await selectTimePart('开始时间', '分钟', '30');
    await selectTimePart('结束时间', '小时', '21');
    await selectTimePart('结束时间', '分钟', '00');
    await selectOption('楼栋', '逸夫楼');
    await selectOption('楼层', '2楼');
    await selectOption('教室', '理工自习室 201');
    await clickButton('有插座');
    await clickButton('搜索可预约自习室');

    expect(getSelect('日期').value).toBe('明天');
    expect(getTimeSelect('开始时间', '小时').value).toBe('18');
    expect(getTimeSelect('开始时间', '分钟').value).toBe('30');
    expect(getTimeSelect('结束时间', '小时').value).toBe('21');
    expect(getTimeSelect('结束时间', '分钟').value).toBe('00');
    expect(getSelect('楼栋').value).toBe('逸夫楼');
    expect(getSelect('楼层').value).toBe('2楼');
    expect(getSelect('教室').value).toBe('理工自习室 201');
    expect(container?.textContent).toContain(
      '已按 明天 18:30 – 21:00（2小时30分钟）、逸夫楼、2楼、理工自习室 201 搜索可预约自习室'
    );
    const roomGridText = container?.querySelector('.student-rooms-grid')?.textContent;
    expect(roomGridText).toContain('理工自习室 201');
    expect(roomGridText).not.toContain('经管自习室 301');
  });

  it('今天预约最早从当前半小时 slot 起点开始', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-02T11:30:00.000Z'));
    await renderStudentHome('rooms');

    expect(getSelect('日期').value).toBe('今天');
    expect(getTimeSelect('开始时间', '小时').value).toBe('19');
    expect(getTimeSelect('开始时间', '分钟').value).toBe('30');
    expect(getTimeSelectOption('开始时间', '小时', '18').disabled).toBe(true);
    expect([...getTimeSelect('开始时间', '分钟').options].map((option) => option.value)).toEqual([
      '30'
    ]);
    expect(getTimeSelectOption('开始时间', '分钟', '30').disabled).toBe(false);
    expect(getTimeSelectOption('开始时间', '小时', '20').disabled).toBe(false);
    expect(getTimeSelectOption('开始时间', '小时', '21').disabled).toBe(false);

    await selectOption('日期', '明天');
    expect(getTimeSelectOption('开始时间', '小时', '18').disabled).toBe(false);
    await selectTimePart('开始时间', '小时', '18');
    await selectTimePart('开始时间', '分钟', '00');
    expect(getTimeSelect('开始时间', '小时').value).toBe('18');
    expect(getTimeSelect('开始时间', '分钟').value).toBe('00');
  });

  it('自习室列表时间控件按半小时选择并支持 00-23 跨午夜结束', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-02T03:42:00.000Z'));
    await renderStudentHome('rooms');

    expect(getTimeField('开始时间').querySelectorAll('select')).toHaveLength(2);
    expect(getTimeField('结束时间').querySelectorAll('select')).toHaveLength(2);
    expect([...getTimeSelect('开始时间', '小时').options].map((option) => option.value)).toEqual(
      Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'))
    );
    expect([...getTimeSelect('开始时间', '分钟').options].map((option) => option.value)).toEqual([
      '00',
      '30'
    ]);
    expect([...getTimeSelect('结束时间', '小时').options].map((option) => option.value)).not.toContain(
      '24'
    );

    await selectTimePart('开始时间', '小时', '15');
    await selectTimePart('开始时间', '分钟', '30');
    expect(getTimeSelect('开始时间', '小时').value).toBe('15');
    expect(getTimeSelect('开始时间', '分钟').value).toBe('30');
    expect(getTimeSelectOption('结束时间', '小时', '20').disabled).toBe(true);

    await selectTimePart('结束时间', '小时', '18');
    await selectTimePart('结束时间', '分钟', '30');
    expect(getTimeSelect('结束时间', '小时').value).toBe('18');
    expect(getTimeSelect('结束时间', '分钟').value).toBe('30');
    expect(container?.textContent).toContain('今天 15:30 – 18:30（3小时）');

    await selectTimePart('开始时间', '小时', '20');
    await selectTimePart('开始时间', '分钟', '00');
    await selectTimePart('结束时间', '小时', '00');
    expect(getTimeSelect('结束时间', '小时').value).toBe('00');
    expect([...getTimeSelect('结束时间', '分钟').options].map((option) => option.value)).toEqual([
      '00'
    ]);
    expect(getTimeSelect('结束时间', '分钟').value).toBe('00');
    expect(container?.textContent).toContain('今天 20:00 – 00:00（4小时）');
  });

  it('跨天搜索只展示覆盖完整时间段的自习室', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-02T03:42:00.000Z'));
    await renderStudentHome('rooms');

    await selectTimePart('开始时间', '小时', '20');
    await selectTimePart('开始时间', '分钟', '00');
    await selectTimePart('结束时间', '小时', '00');
    await clickButton('搜索可预约自习室');

    const roomGridText = getRoomGridText();
    expect(container?.textContent).toContain('已按 今天 20:00 – 00:00（4小时）');
    expect(roomGridText).toContain('理工自习室 201');
    expect(roomGridText).not.toContain('经管自习室 301');
    expect(roomGridText).not.toContain('图书馆自习区');
  });

  it('跨午夜搜索会匹配 24 小时自习室', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-02T03:42:00.000Z'));
    await renderStudentHome('rooms');

    await selectTimePart('开始时间', '小时', '23');
    await selectTimePart('开始时间', '分钟', '30');
    await selectTimePart('结束时间', '小时', '01');
    await selectTimePart('结束时间', '分钟', '30');
    await clickButton('搜索可预约自习室');

    const roomGridText = getRoomGridText();
    expect(container?.textContent).toContain('已按 今天 23:30 – 01:30（2小时）');
    expect(roomGridText).toContain('理工自习室 201');
    expect(roomGridText).not.toContain('经管自习室 301');
    expect(roomGridText).not.toContain('理工自习室 403');
    expect(container?.textContent).toContain('匹配 1 间');
  });

  it('从自习室列表点预约后直接打开预约弹窗', async () => {
    await renderStudentHome('rooms');

    await clickButtonInArticle('理工自习室 201', '预约');

    expect(window.location.pathname).toBe('/student/rooms');
    const dialog = container?.querySelector('.student-booking-confirm-dialog');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain('理工自习室 201');
    expect(dialog?.textContent).toContain('逸夫楼 · 2楼');
    expect(dialog?.textContent).toContain('C3');
    expect(container?.textContent).not.toContain('已选择理工自习室 201');
    expect(container?.querySelector('.student-seat-selector-panel')).toBeNull();
  });

  it('预约弹窗会核对筛选后的自习室和预约时间', async () => {
    await renderStudentHome('rooms');

    await selectOption('日期', '明天');
    await selectTimePart('开始时间', '小时', '18');
    await selectTimePart('开始时间', '分钟', '30');
    await selectTimePart('结束时间', '小时', '20');
    await selectTimePart('结束时间', '分钟', '30');
    await selectOption('楼栋', '逸夫楼');
    await selectOption('楼层', '2楼');
    await selectOption('教室', '理工自习室 201');
    await clickButtonInArticle('理工自习室 201', '预约');

    expect(window.location.pathname).toBe('/student/rooms');
    const dialog = container?.querySelector('.student-booking-confirm-dialog');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain('理工自习室 201');
    expect(dialog?.textContent).toContain('逸夫楼 · 2楼');
    expect(dialog?.textContent).toContain('明天');
    expect(dialog?.textContent).toContain('18:30 – 20:30（2小时）');
  });

  it('预约弹窗内可以选择座位位置', async () => {
    await renderStudentHome('rooms');

    await clickButtonInArticle('经管自习室 301', '预约');
    const dialog = container?.querySelector('.student-booking-confirm-dialog');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain('位置选择');
    expect(dialog?.querySelector('.student-booking-seat-map')).not.toBeNull();
    expect(dialog?.querySelector('.student-booking-position-card select')).toBeNull();
    expect(getSeatButton('C3').getAttribute('data-status')).toBe('selected');

    await clickSeatButton('B1');

    expect(getSeatButton('B1').getAttribute('data-status')).toBe('selected');
    const seatDetail = [...(dialog?.querySelectorAll('.student-booking-detail-grid div') ?? [])].find(
      (candidate) => normalize(candidate.textContent).includes('座位编号')
    );
    expect(seatDetail?.textContent).toContain('B1（靠窗）');
    expect(seatDetail?.textContent).not.toContain('C3（插座');
  });

  it('旧的选座预约地址会收敛到自习室列表页', async () => {
    window.history.pushState(null, '', '/student/select');
    await renderStudentHome();

    const selectionPage = container?.querySelector('.student-room-selection-layout');
    expect(window.location.pathname).toBe('/student/rooms');
    expect(selectionPage).not.toBeNull();
    expect(selectionPage?.textContent).toContain('附加条件');
    expect(selectionPage?.textContent).toContain('开始时间');
    expect(selectionPage?.textContent).toContain('结束时间');
    expect(selectionPage?.textContent).toContain('教室');
    expect(selectionPage?.textContent).toContain('光华楼 A座');
    expect(selectionPage?.textContent).toContain('3楼');

    await clickButtonInSelector('.student-rooms-panel', '有插座');
    await selectOption('楼栋', '逸夫楼');
    await clickButtonInArticle('理工自习室 201', '预约');

    expect(window.location.pathname).toBe('/student/rooms');
    expect(container?.querySelector('.student-booking-confirm-dialog')?.textContent).toContain(
      '理工自习室 201'
    );
    expect(container?.querySelector('.student-seat-selector-panel')).toBeNull();
  });

  it('预约弹窗关闭后停留在自习室列表页', async () => {
    await renderStudentHome('rooms');

    await clickButtonInArticle('经管自习室 301', '预约');
    expect(container?.querySelector('.student-booking-confirm-dialog')).not.toBeNull();

    await clickButtonInSelector('.student-booking-confirm-dialog', '关闭');
    expect(container?.querySelector('.student-booking-confirm-dialog')).toBeNull();
    expect(window.location.pathname).toBe('/student/rooms');
    expect(container?.querySelector('.student-rooms-grid')).not.toBeNull();
  });

  it('我的预约筛选和记录操作按钮会给出反馈', async () => {
    const fetcher = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/api/v1/bookings/me') && init?.method === 'GET') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              code: 'SUCCESS',
              message: 'success',
              data: {
                totalCount: 2,
                activeCount: 0,
                completedCount: 1,
                records: [
                  {
                    id: 'booking-completed',
                    room: '文史馆阅览室 A',
                    location: '文史馆 1楼',
                    seat: 'A5',
                    time: '4月20日 14:00-16:00',
                    status: 'completed',
                    tags: ['靠窗'],
                    canCheckIn: false,
                    canCancel: false,
                    startAt: '2026-04-20T06:00:00.000Z',
                    endAt: '2026-04-20T08:00:00.000Z'
                  },
                  {
                    id: 'booking-violation',
                    room: '经管自习室 301',
                    location: '光华楼 A座 3楼',
                    seat: 'D8',
                    time: '4月18日 10:00-12:00',
                    status: 'violation',
                    tags: [],
                    canCheckIn: false,
                    canCancel: false,
                    startAt: '2026-04-18T02:00:00.000Z',
                    endAt: '2026-04-18T04:00:00.000Z'
                  }
                ]
              }
            }),
            { headers: { 'Content-Type': 'application/json' }, status: 200 }
          )
        );
      }
      if (url.includes('/api/v1/notifications/me')) {
        return Promise.resolve(successfulStudentNotificationsResponse());
      }
      throw new Error(`unexpected fetch: ${url}`);
    });
    vi.stubGlobal('fetch', fetcher);

    await renderStudentHome('bookings', { accessToken: 'student-token' });
    await flushEffects();

    await clickButton('已完成');
    expect(getButton('已完成').className).toContain('is-active');
    expect(container?.textContent).not.toContain('今日 14:00–17:00');

    await clickButton('再次预约');
    expect(container?.textContent).toContain('自习室列表');

    await renderStudentHome('bookings', { accessToken: 'student-token' });
    await flushEffects();
    await clickButton('查看原因');
    expect(container?.textContent).toContain('违约原因');

    await clickButton('导出记录');
    expect(container?.textContent).toContain('已生成预约记录导出任务');
  });

  it('登录态进入我的预约时加载期间不显示 mock 预约记录', async () => {
    const fetcher = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/api/v1/bookings/me') && init?.method === 'GET') {
        return new Promise<Response>(() => undefined);
      }
      if (url.includes('/api/v1/notifications/me')) {
        return Promise.resolve(successfulStudentNotificationsResponse());
      }
      throw new Error(`unexpected fetch: ${url}`);
    });
    vi.stubGlobal('fetch', fetcher);

    await renderStudentHome('bookings', { accessToken: 'student-token' });

    expect(container?.textContent).toContain('正在加载我的预约');
    expect(container?.querySelector('.student-booking-card')).toBeNull();
    expect(container?.textContent).not.toContain('今日 14:00–17:00');
    expect(container?.textContent).not.toContain('4月22日 09:00–12:00');
  });

  it('服务端已有待签到预约会同步占用首页和自习室列表余位', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-02T03:42:00.000Z'));
    const fetcher = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/api/v1/bookings/me') && init?.method === 'GET') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              code: 'SUCCESS',
              message: 'success',
              data: {
                totalCount: 1,
                activeCount: 1,
                completedCount: 0,
                records: [
                  {
                    id: 'booking-upcoming',
                    room: '经管自习室 301',
                    location: '光华楼 A座 3楼',
                    seat: 'C3',
                    time: '今日 14:00-17:00',
                    status: 'upcoming',
                    tags: ['插座'],
                    canCheckIn: true,
                    canCancel: true,
                    startAt: '2026-06-02T06:00:00.000Z',
                    endAt: '2026-06-02T09:00:00.000Z'
                  }
                ]
              }
            }),
            { headers: { 'Content-Type': 'application/json' }, status: 200 }
          )
        );
      }
      if (url.includes('/api/v1/rooms/catalog')) {
        return Promise.resolve(
          successfulRoomCatalogResponse([
            {
              id: 'room-gm-301',
              name: '经管自习室 301',
              building: '光华楼 A座',
              floor: '3楼',
              capacity: 48,
              hours: '08:00–22:00',
              scope: '全校开放',
              tags: ['插座', '靠窗', '安静区'],
              resourceStatus: 'ACTIVE'
            }
          ])
        );
      }
      if (url.includes('/api/v1/rooms/availability')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              code: 'SUCCESS',
              message: 'success',
              data: {
                totalSeats: 48,
                availableSeats: 11,
                rooms: [{ roomId: 'room-gm-301', totalSeats: 48, availableSeats: 11 }]
              }
            }),
            { headers: { 'Content-Type': 'application/json' }, status: 200 }
          )
        );
      }
      if (url.includes('/api/v1/favorites/me/rooms')) {
        return Promise.resolve(successfulStudentRoomFavoritesResponse());
      }
      if (url.includes('/api/v1/notifications/me')) {
        return Promise.resolve(successfulStudentNotificationsResponse());
      }
      throw new Error(`unexpected fetch: ${url}`);
    });
    vi.stubGlobal('fetch', fetcher);

    await renderStudentHome(undefined, { accessToken: 'student-token' });
    await flushEffects();

    expect(container?.textContent).toContain('下一场预约');
    expect(getArticleText('经管自习室 301')).toContain('11 / 48');

    await clickButton('自习室列表');
    expect(getArticleText('经管自习室 301')).toContain('11 空余 / 48');
  });

  it('服务端预约签到后首页不再展示签到和取消入口', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-03T07:28:00.000Z'));
    const fetcher = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/api/v1/bookings/me') && init?.method === 'GET') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              code: 'SUCCESS',
              message: 'success',
              data: {
                totalCount: 1,
                activeCount: 1,
                completedCount: 0,
                records: [
                  {
                    id: 'booking-using',
                    room: '经管自习室 301',
                    location: '光华楼 A座 3楼',
                    seat: 'A2',
                    time: '今日 15:27-16:27',
                    status: 'using',
                    tags: ['插座'],
                    canCheckIn: false,
                    canCancel: false,
                    startAt: '2026-06-03T07:27:00.000Z',
                    endAt: '2026-06-03T08:27:00.000Z',
                    createdAt: '2026-06-03T07:28:00.000Z',
                    checkInDeadlineAt: '2026-06-03T07:43:00.000Z'
                  }
                ]
              }
            }),
            { headers: { 'Content-Type': 'application/json' }, status: 200 }
          )
        );
      }
      if (url.includes('/api/v1/favorites/me/rooms')) {
        return Promise.resolve(successfulStudentRoomFavoritesResponse());
      }
      if (url.includes('/api/v1/notifications/me')) {
        return Promise.resolve(successfulStudentNotificationsResponse());
      }
      throw new Error(`unexpected fetch: ${url}`);
    });
    vi.stubGlobal('fetch', fetcher);

    await renderStudentHome(undefined, { accessToken: 'student-token' });
    await flushEffects();

    expect(container?.textContent).toContain('进行中预约');
    expect(container?.textContent).toContain('今日 15:27 – 16:27');
    expect(container?.textContent).toContain('距结束还有');
    expect(container?.textContent).not.toContain('立即签到');
    expect(container?.textContent).not.toContain('取消预约');
    expect(container?.textContent).toContain('查看记录');
    expect(container?.textContent).toContain('预约下一场');
  });

  it('当前 slot 未签到预约在首页展示待签到入口', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-03T07:28:00.000Z'));
    const fetcher = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/api/v1/bookings/me') && init?.method === 'GET') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              code: 'SUCCESS',
              message: 'success',
              data: {
                totalCount: 1,
                activeCount: 1,
                completedCount: 0,
                records: [
                  {
                    id: 'booking-current-pending',
                    room: '理工自习室 201',
                    location: '理科楼 2楼',
                    seat: 'C3',
                    time: '今日 15:27-16:27',
                    status: 'upcoming',
                    tags: ['插座'],
                    canCheckIn: true,
                    canCancel: false,
                    startAt: '2026-06-03T07:27:00.000Z',
                    endAt: '2026-06-03T08:27:00.000Z',
                    createdAt: '2026-06-03T07:28:00.000Z',
                    checkInDeadlineAt: '2026-06-03T07:43:00.000Z'
                  }
                ]
              }
            }),
            { headers: { 'Content-Type': 'application/json' }, status: 200 }
          )
        );
      }
      if (url.includes('/api/v1/favorites/me/rooms')) {
        return Promise.resolve(successfulStudentRoomFavoritesResponse());
      }
      if (url.includes('/api/v1/notifications/me')) {
        return Promise.resolve(successfulStudentNotificationsResponse());
      }
      throw new Error(`unexpected fetch: ${url}`);
    });
    vi.stubGlobal('fetch', fetcher);

    await renderStudentHome(undefined, { accessToken: 'student-token' });
    await flushEffects();

    expect(container?.textContent).toContain('待签到预约');
    expect(container?.textContent).toContain('距签到截止还有');
    expect(container?.textContent).toContain('15分');
    expect(container?.textContent).toContain('立即签到');
    expect(container?.textContent).toContain('取消预约');
    expect(container?.textContent).not.toContain('进行中预约');
    expect(container?.textContent).not.toContain('预约下一场');
  });

  it('取消唯一待签到预约后首页不再显示下一场预约并释放余位', async () => {
    let cancelledOnServer = false;
    const fetcher = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.endsWith('/api/v1/bookings/me/booking-upcoming/cancel') && init?.method === 'PATCH') {
        cancelledOnServer = true;
        return Promise.resolve(successfulStudentBookingCancelResponse());
      }
      if (url.endsWith('/api/v1/bookings/me') && init?.method === 'GET') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              code: 'SUCCESS',
              message: 'success',
              data: {
                totalCount: 1,
                activeCount: cancelledOnServer ? 0 : 1,
                completedCount: 0,
                records: [
                  {
                    id: 'booking-upcoming',
                    room: '经管自习室 301',
                    location: '光华楼 A座 3楼',
                    seat: 'C3',
                    time: '今日 14:00-17:00',
                    status: cancelledOnServer ? 'cancelled' : 'upcoming',
                    tags: ['插座'],
                    canCheckIn: !cancelledOnServer,
                    canCancel: !cancelledOnServer,
                    startAt: '2026-06-02T06:00:00.000Z',
                    endAt: '2026-06-02T09:00:00.000Z'
                  }
                ]
              }
            }),
            { headers: { 'Content-Type': 'application/json' }, status: 200 }
          )
        );
      }
      if (url.includes('/api/v1/favorites/me/rooms')) {
        return Promise.resolve(successfulStudentRoomFavoritesResponse());
      }
      if (url.includes('/api/v1/notifications/me')) {
        return Promise.resolve(successfulStudentNotificationsResponse());
      }
      throw new Error(`unexpected fetch: ${url}`);
    });
    vi.stubGlobal('fetch', fetcher);

    await renderStudentHome('bookings', { accessToken: 'student-token' });

    expect(container?.textContent).toContain('经管自习室 301');
    await clickButtonInArticle('经管自习室 301', '取消');
    await flushEffects();

    expect(container?.textContent).toContain('已取消预约');

    await clickButton('首页概览');
    expect(container?.textContent).toContain('暂无预约');
    expect(container?.textContent).not.toContain('下一场预约');
    expect(container?.textContent).not.toContain('立即签到');
    expect(getArticleText('经管自习室 301')).toContain('12 / 48');

    await clickButton('自习室列表');
    expect(getArticleText('经管自习室 301')).toContain('12 空余 / 48');
  });

  it('智能助手取消预约后同步释放自习室余位', async () => {
    const fetcher = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.includes('/api/v1/assistant/me/messages') && init?.method === 'POST') {
        return Promise.resolve(successfulAssistantBookingResponse());
      }
      if (url.endsWith('/api/v1/bookings/me/booking-upcoming/cancel') && init?.method === 'PATCH') {
        return Promise.resolve(successfulStudentBookingCancelResponse());
      }
      if (url.includes('/api/v1/notifications/me')) {
        return Promise.resolve(successfulStudentNotificationsResponse());
      }
      throw new Error(`unexpected fetch: ${url}`);
    });
    vi.stubGlobal('fetch', fetcher);

    await renderStudentHome('assistant', { accessToken: 'student-token' });

    await askAssistant('我今天定了哪里');
    expect(container?.textContent).toContain('找到 1 条待处理预约');
    expect(container?.textContent).toContain('经管自习室 301 · C3');
    await clickButtonInSelector('.student-assistant-panel', '取消预约');
    await flushEffects();

    expect(container?.textContent).toContain('已取消 经管自习室 301');

    await clickButton('自习室列表');
    expect(getArticleText('经管自习室 301')).toContain('13 空余 / 48');
  });

  it('智能助手可预约座位结果会直接打开预约弹窗', async () => {
    const fetcher = vi.fn<typeof fetch>((input, init) => {
      const url = String(input);
      if (url.includes('/api/v1/assistant/me/messages') && init?.method === 'POST') {
        return Promise.resolve(successfulAssistantSeatResponse());
      }
      if (url.includes('/api/v1/notifications/me')) {
        return Promise.resolve(successfulStudentNotificationsResponse());
      }
      throw new Error(`unexpected fetch: ${url}`);
    });
    vi.stubGlobal('fetch', fetcher);

    await renderStudentHome('assistant', { accessToken: 'student-token' });

    await askAssistant('明天下午有空座吗');
    expect(container?.textContent).toContain('找到 1 个可预约座位');
    await clickButtonInResultCard('明天 18:17–20:43', '立即预约');

    const dialog = container?.querySelector('.student-booking-confirm-dialog');
    expect(window.location.pathname).toBe('/student/rooms');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain('经管自习室 301');
    expect(dialog?.textContent).toContain('位置选择');
    expect(dialog?.querySelector('.student-booking-seat-map')).not.toBeNull();
    expect(getSeatButton('C3').getAttribute('data-status')).toBe('selected');
    expect((getSeatButton('A5') as HTMLButtonElement).disabled).toBe(true);
    expect(getSeatButton('A5').getAttribute('data-status')).toBe('taken');
    expect((getSeatButton('G1') as HTMLButtonElement).disabled).toBe(true);
    expect(getSeatButton('G1').getAttribute('data-status')).toBe('disabled');
    expect(container?.querySelector('.student-seat-selector-panel')).toBeNull();
  });

  it('提交预约成功后关闭弹窗并在自习室列表提示结果', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-29T03:00:00.000Z'));
    const fetcher = vi.fn<typeof fetch>((input, init) => {
      if (String(input).endsWith('/api/v1/bookings/me') && init?.method === 'POST') {
        return Promise.resolve(successfulStudentBookingCreateResponse());
      }
      if (String(input).endsWith('/api/v1/bookings/me') && init?.method === 'GET') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              code: 'SUCCESS',
              message: 'success',
              data: {
                totalCount: 1,
                activeCount: 1,
                completedCount: 0,
                records: [
                  {
                    id: 'booking-created',
                    room: '经管自习室 301',
                    location: '光华楼 A座 3楼',
                    seat: 'C3',
                    time: '6月1日 14:00-17:00',
                    status: 'upcoming',
                    tags: ['插座', '安静区'],
                    canCheckIn: false,
                    canCancel: true,
                    startAt: '2026-06-01T06:00:00.000Z',
                    endAt: '2026-06-01T09:00:00.000Z'
                  }
                ]
              }
            }),
            { headers: { 'Content-Type': 'application/json' }, status: 200 }
          )
        );
      }
      if (String(input).includes('/api/v1/favorites/me/rooms')) {
        return Promise.resolve(successfulStudentRoomFavoritesResponse());
      }
      if (String(input).includes('/api/v1/notifications/me')) {
        return Promise.resolve(successfulStudentNotificationsResponse());
      }
      return Promise.resolve(successfulStudentBookingCreateResponse());
    });
    vi.stubGlobal('fetch', fetcher);
    await renderStudentHome('rooms', { accessToken: 'student-token' });

    expect(getArticleText('经管自习室 301')).toContain('12 空余 / 48');

    await clickButtonInArticle('经管自习室 301', '预约');
    await clickSeatButton('A1');
    await clickButton('确认提交预约');
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(
      fetcher.mock.calls.filter(
        ([input, init]) => String(input).endsWith('/api/v1/bookings/me') && init?.method === 'POST'
      )
    ).toHaveLength(1);
    const [, submitRequest] = fetcher.mock.calls.find(
      ([input, init]) => String(input).endsWith('/api/v1/bookings/me') && init?.method === 'POST'
    )!;
    expect(JSON.parse(submitRequest.body as string)).toEqual(
      expect.objectContaining({
        roomId: 'room-gm-301',
        seatId: 'seat-gm-301-a1'
      })
    );
    expect(container?.querySelector('.student-booking-confirm-dialog')).toBeNull();
    expect(container?.textContent).toContain('自习室列表');
    expect(container?.textContent).toContain('预约成功');
    expect(getArticleText('经管自习室 301')).toContain('11 空余 / 48');
    expect(window.location.pathname).toBe('/student/rooms');

    await clickButton('首页概览');
    await flushEffects();

    expect(container?.textContent).toContain('下一场预约');
    expect(container?.textContent).toContain('6月1日 14:00 – 17:00');
    expect(getArticleStrongText('今日我的预约')).toBe('0');
    expect(getArticleText('今日我的预约')).toContain('今日暂无预约');
  });

  it('提交预约失败后关闭弹窗并提示失败原因', async () => {
    const fetcher = vi.fn<typeof fetch>((input, init) => {
      if (String(input).endsWith('/api/v1/bookings/me') && init?.method === 'POST') {
        return Promise.resolve(
          new Response(JSON.stringify({ code: 'BOOKING_CONFLICT', message: '座位已被预约' }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          })
        );
      }
      if (String(input).includes('/api/v1/favorites/me/rooms')) {
        return Promise.resolve(successfulStudentRoomFavoritesResponse());
      }
      if (String(input).includes('/api/v1/notifications/me')) {
        return Promise.resolve(successfulStudentNotificationsResponse());
      }
      return Promise.resolve(successfulStudentBookingsResponse());
    });
    vi.stubGlobal('fetch', fetcher);
    await renderStudentHome('rooms', { accessToken: 'student-token' });

    await clickButtonInArticle('经管自习室 301', '预约');
    await clickSeatButton('A1');
    await clickButton('确认提交预约');
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(container?.querySelector('.student-booking-confirm-dialog')).toBeNull();
    expect(container?.textContent).toContain('预约失败：座位已被预约');
    expect(window.location.pathname).toBe('/student/rooms');
  });

  it('从首页去预约后直接打开预约弹窗', async () => {
    await renderStudentHome();

    await clickButton('去预约');

    const notice = container?.querySelector('.student-action-notice');
    expect(notice?.textContent).toContain('请确认经管自习室 301的预约信息');
    expect(container?.querySelector('.student-booking-confirm-dialog')).not.toBeNull();
    expect(container?.querySelector('.student-seat-selector-panel')).toBeNull();
  });

  it('学生首页关键指标来自服务端真实汇总数据', async () => {
    const fetcher = vi.fn<typeof fetch>((input) => {
      const url = String(input);
      if (url.includes('/api/v1/students/me/home')) {
        return Promise.resolve(successfulStudentHomeSummaryResponse());
      }
      if (url.includes('/api/v1/rooms/catalog')) {
        return Promise.resolve(successfulRoomCatalogResponse());
      }
      if (url.includes('/api/v1/rooms/availability')) {
        return Promise.resolve(successfulStudentRoomAvailabilityResponse());
      }
      if (url.includes('/api/v1/bookings/me')) {
        return Promise.resolve(successfulStudentBookingsResponse());
      }
      if (url.includes('/api/v1/favorites/me/rooms')) {
        return Promise.resolve(successfulStudentRoomFavoritesResponse(['room-gm-301', 'room-science-201']));
      }
      if (url.includes('/api/v1/notifications/me')) {
        return Promise.resolve(successfulStudentNotificationsResponse());
      }
      return Promise.resolve(successfulStudentBookingsResponse());
    });
    vi.stubGlobal('fetch', fetcher);

    await renderStudentHome('home', { accessToken: 'student-token' });

    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/students/me/home'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer student-token' })
      })
    );
    expect(container?.textContent).toContain('今日全校空座198共 207 个座位较昨日 +6%');
    expect(container?.textContent).toContain('今日我的预约2还有 1 次可用今日 2 场');
    expect(container?.textContent).toContain('常用自习室2经管自习室 301 · 理工自习室 201已收藏');
    expect(container?.textContent).toContain('本周学习时长7.5h较上周 +2.5h持续提升');
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/rooms/availability'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer student-token' })
      })
    );
    const recommendedRoomsText = container?.querySelector('.student-home-room-list')?.textContent ?? '';
    expect(recommendedRoomsText).toContain('经管自习室 301');
    expect(recommendedRoomsText).toContain('34 / 37');
    expect(recommendedRoomsText).toContain('理工自习室 201');
    expect(recommendedRoomsText).toContain('38 / 38');
    expect(recommendedRoomsText).toContain('文史馆阅览室');
    expect(recommendedRoomsText).toContain('38 / 38');
    expect(container?.textContent).not.toContain('12 / 48');
    expect(container?.textContent).not.toContain('31 / 64');
    expect(container?.textContent).not.toContain('5 / 80');
  });

  it('学生自习室列表座位数使用服务端真实座位统计', async () => {
    const fetcher = vi.fn<typeof fetch>((input) => {
      const url = String(input);
      if (url.includes('/api/v1/rooms/catalog')) {
        return Promise.resolve(successfulRoomCatalogResponse());
      }
      if (url.includes('/api/v1/rooms/availability')) {
        return Promise.resolve(successfulStudentRoomAvailabilityResponse());
      }
      if (url.includes('/api/v1/favorites/me/rooms')) {
        return Promise.resolve(successfulStudentRoomFavoritesResponse(['room-gm-301']));
      }
      if (url.includes('/api/v1/notifications/me')) {
        return Promise.resolve(successfulStudentNotificationsResponse());
      }
      return Promise.resolve(successfulStudentBookingsResponse());
    });
    vi.stubGlobal('fetch', fetcher);

    await renderStudentHome('rooms', { accessToken: 'student-token' });

    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/rooms/availability'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer student-token' })
      })
    );
    expect(container?.textContent).toContain('34 空余 / 37');
    expect(container?.textContent).toContain('38 空余 / 38');
    expect(container?.textContent).not.toContain('12 空余 / 48');
    expect(container?.textContent).not.toContain('31 空余 / 64');
  });

  it('自习室列表状态根据服务端真实余位推导', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-02T03:42:00.000Z'));
    const fetcher = vi.fn<typeof fetch>((input) => {
      const url = String(input);
      if (url.includes('/api/v1/rooms/catalog')) {
        return Promise.resolve(successfulRoomCatalogResponse());
      }
      if (url.includes('/api/v1/rooms/availability')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              code: 'SUCCESS',
              message: 'success',
              data: {
                totalSeats: 293,
                availableSeats: 202,
                rooms: [
                  { roomId: 'room-gm-301', totalSeats: 37, availableSeats: 34 },
                  { roomId: 'room-science-201', totalSeats: 38, availableSeats: 38 },
                  { roomId: 'room-humanities-a', totalSeats: 80, availableSeats: 5 },
                  { roomId: 'room-news-seminar', totalSeats: 37, availableSeats: 37 },
                  { roomId: 'room-science-403', totalSeats: 56, availableSeats: 0 },
                  { roomId: 'room-library-zone', totalSeats: 120, availableSeats: 88 }
                ]
              }
            }),
            { headers: { 'Content-Type': 'application/json' }, status: 200 }
          )
        );
      }
      if (url.includes('/api/v1/favorites/me/rooms')) {
        return Promise.resolve(successfulStudentRoomFavoritesResponse(['room-gm-301']));
      }
      if (url.includes('/api/v1/notifications/me')) {
        return Promise.resolve(successfulStudentNotificationsResponse());
      }
      return Promise.resolve(successfulStudentBookingsResponse());
    });
    vi.stubGlobal('fetch', fetcher);

    await renderStudentHome('rooms', { accessToken: 'student-token' });

    expect(getArticleText('新闻学院研讨室')).toContain('37 空余 / 37');
    expect(getArticleText('新闻学院研讨室')).toContain('开放中');
    expect(getArticleText('新闻学院研讨室')).toContain('预约');
    expect(getArticleText('新闻学院研讨室')).not.toContain('已满座');
    expect(getArticleText('新闻学院研讨室')).not.toContain('加入候补');

    expect(getArticleText('文史馆阅览室 A')).toContain('5 空余 / 80');
    expect(getArticleText('文史馆阅览室 A')).toContain('较繁忙');

    expect(getArticleText('理工自习室 403')).toContain('0 空余 / 56');
    expect(getArticleText('理工自习室 403')).toContain('已满座');
    expect(getArticleText('理工自习室 403')).toContain('加入候补');
  });

  async function renderStudentHome(
    initialActive?: Parameters<typeof StudentHomePreview>[0]['initialActive'],
    props: Partial<Parameters<typeof StudentHomePreview>[0]> = {}
  ) {
    container?.remove();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<StudentHomePreview initialActive={initialActive} studentName="林晓明" {...props} />);
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  async function clickButton(label: string) {
    await act(async () => {
      getButton(label).click();
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  async function clickButtonInArticle(articleText: string, buttonLabel: string) {
    const article = [...(container?.querySelectorAll('article') ?? [])].find((candidate) =>
      normalize(candidate.textContent).includes(normalize(articleText))
    );
    if (!article) throw new Error(`article not found: ${articleText}`);
    const button = [...article.querySelectorAll('button')].find((candidate) =>
      normalize(candidate.textContent).includes(normalize(buttonLabel))
    );
    if (!button) throw new Error(`button not found in article: ${buttonLabel}`);

    await act(async () => {
      button.click();
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  async function clickButtonInResultCard(cardText: string, buttonLabel: string) {
    const card = [...(container?.querySelectorAll('.student-assistant-result-card') ?? [])].find(
      (candidate) => normalize(candidate.textContent).includes(normalize(cardText))
    );
    if (!card) throw new Error(`result card not found: ${cardText}`);
    const button = [...card.querySelectorAll('button')].find((candidate) =>
      normalize(candidate.textContent).includes(normalize(buttonLabel))
    );
    if (!button) throw new Error(`button not found in result card: ${buttonLabel}`);

    await act(async () => {
      button.click();
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  async function clickFavoriteButton(roomName: string) {
    await act(async () => {
      getFavoriteButton(roomName).click();
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  async function clickSeatButton(seatNo: string) {
    await act(async () => {
      getSeatButton(seatNo).click();
      await Promise.resolve();
    });
  }

  async function flushEffects() {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  async function askAssistant(question: string) {
    const input = container?.querySelector('input[aria-label="输入助手问题"]') as HTMLInputElement | null;
    if (!input) throw new Error('assistant input not found');
    const sendButton = container?.querySelector('button[aria-label="发送问题"]') as HTMLButtonElement | null;
    if (!sendButton) throw new Error('assistant send button not found');

    await act(async () => {
      const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      valueSetter?.call(input, question);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await Promise.resolve();
    });
    await act(async () => {
      sendButton.click();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  async function clickButtonInSelector(selector: string, label: string) {
    const rootElement = container?.querySelector(selector);
    if (!rootElement) throw new Error(`selector not found: ${selector}`);
    const button = [...rootElement.querySelectorAll('button')].find((candidate) =>
      normalize(candidate.textContent).includes(normalize(label))
    );
    if (!button) throw new Error(`button not found in selector ${selector}: ${label}`);

    await act(async () => {
      button.click();
      await Promise.resolve();
    });
  }

  async function selectOption(label: string, value: string) {
    const select = getSelect(label);
    await act(async () => {
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      await Promise.resolve();
    });
  }

  async function selectTimePart(label: string, part: '小时' | '分钟', value: string) {
    const select = getTimeSelect(label, part);
    await act(async () => {
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  function getTimeField(label: string) {
    const field = container?.querySelector(`.student-room-time-field[aria-label="${label}"]`);
    if (!field) throw new Error(`time field not found: ${label}`);
    return field as HTMLElement;
  }

  function getTimeSelect(label: string, part: '小时' | '分钟') {
    const select = getTimeField(label).querySelector(`select[aria-label="${label}${part}"]`);
    if (!select) throw new Error(`time select not found: ${label} ${part}`);
    return select as HTMLSelectElement;
  }

  function getTimeSelectOption(label: string, part: '小时' | '分钟', value: string) {
    const option = [...getTimeSelect(label, part).options].find(
      (candidate) => candidate.value === value
    );
    if (!option) throw new Error(`time option not found: ${label} ${part} ${value}`);
    return option;
  }

  function getSelect(label: string) {
    const selectLabel = [...(container?.querySelectorAll('label') ?? [])].find((candidate) =>
      normalize(candidate.textContent).includes(normalize(label))
    );
    const select = selectLabel?.querySelector('select');
    if (!select) throw new Error(`select not found: ${label}`);
    return select as HTMLSelectElement;
  }

  function getButton(label: string) {
    const button = [...(container?.querySelectorAll('button') ?? [])].find((candidate) =>
      normalize(candidate.textContent).includes(normalize(label))
    );
    if (!button) throw new Error(`button not found: ${label}`);
    return button as HTMLButtonElement;
  }

  function getFavoriteButton(roomName: string) {
    const button = [...(container?.querySelectorAll('button[aria-label]') ?? [])].find((candidate) => {
      const label = candidate.getAttribute('aria-label');
      return normalize(label).includes('收藏') && normalize(label).includes(normalize(roomName));
    });
    if (!button) throw new Error(`favorite button not found: ${roomName}`);
    return button as HTMLButtonElement;
  }

  function getSeatButton(seatNo: string) {
    const button = container?.querySelector(
      `.student-booking-seat-map button[aria-label^="${seatNo} "]`
    );
    if (!button) throw new Error(`seat button not found: ${seatNo}`);
    return button as HTMLButtonElement;
  }

  function getRoomGridText() {
    return container?.querySelector('.student-rooms-grid')?.textContent ?? '';
  }

  function getArticleText(articleText: string) {
    const article = [...(container?.querySelectorAll('article') ?? [])].find((candidate) =>
      normalize(candidate.textContent).includes(normalize(articleText))
    );
    if (!article) throw new Error(`article not found: ${articleText}`);
    return article.textContent ?? '';
  }

  function getArticleStrongText(articleText: string) {
    const article = [...(container?.querySelectorAll('article') ?? [])].find((candidate) =>
      normalize(candidate.textContent).includes(normalize(articleText))
    );
    if (!article) throw new Error(`article not found: ${articleText}`);
    return article.querySelector('strong')?.textContent ?? '';
  }

  function normalize(text?: string | null) {
    return (text ?? '').replace(/\s+/g, '');
  }

  function successfulAssistantBookingResponse() {
    return new Response(
      JSON.stringify({
        code: 'SUCCESS',
        message: 'success',
        data: {
          intent: 'booking_query',
          text: '找到 1 条待处理预约。',
          seats: [],
          bookings: [
            {
              bookingId: 'booking-upcoming',
              room: '经管自习室 301',
              location: '光华楼 A座 3楼',
              seat: 'C3',
              time: '今日 14:00-17:00',
              status: 'upcoming',
              actions: ['CANCEL', 'DETAIL']
            }
          ],
          suggestions: ['查看我的预约', '重新找座']
        }
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  }

  function successfulAssistantSeatResponse() {
    return new Response(
      JSON.stringify({
        code: 'SUCCESS',
        message: 'success',
        data: {
          intent: 'availability',
          text: '找到 1 个可预约座位。',
          seats: [
            {
              roomId: 'room-gm-301',
              seatId: 'seat-gm-301-c3',
              room: '经管自习室 301',
              location: '光华楼 A座 3楼',
              seat: 'C3',
              time: '明天 18:17–20:43',
              tags: ['插座', '安静区']
            }
          ],
          bookings: [],
          suggestions: ['查看我的预约']
        }
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  }

  function successfulStudentRoomFavoritesIdsOnlyResponse(favoriteRoomIds: string[]) {
    return new Response(
      JSON.stringify({
        code: 'SUCCESS',
        message: 'success',
        data: { favoriteRoomIds }
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
