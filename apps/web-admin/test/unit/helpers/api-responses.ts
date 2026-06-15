import type { AdminOverviewSnapshot, RoomCatalogItem } from '@ibooking/shared-types';

export const adminOverviewFixture = (): AdminOverviewSnapshot => ({
  dashboard: {
    kpis: [
      {
        label: '今日预约总数',
        value: '3',
        note: '来自预约订单',
        icon: 'calendar',
        tone: '#0F3D32',
        trend: '今日有预约'
      },
      {
        label: '当前在座人数',
        value: '1',
        note: '共 112 个可用座位',
        icon: 'users',
        tone: '#3A6FA8',
        trend: '实时'
      }
    ],
    heatmapDays: ['周一', '周二'],
    heatmapHours: ['8时', '9时'],
    heatmapData: [
      [0.2, 0.5],
      [0.1, 0.3]
    ],
    roomStatuses: [
      {
        name: '经管自习室 301',
        pct: 50,
        totalSeats: 2,
        occupiedSeats: 1,
        availableSeats: 1,
        status: 'mid'
      },
      {
        name: '理工自习室 201',
        pct: 0,
        totalSeats: 2,
        occupiedSeats: 0,
        availableSeats: 2,
        status: 'low'
      }
    ],
    recentBookings: [
      {
        id: 'seed-admin-booking-now',
        user: '林晓明',
        room: '经管301',
        seat: 'C3',
        time: '20:00–22:00',
        status: 'active'
      }
    ]
  },
  schedule: {
    summary: [
      {
        label: '开放自习室',
        value: '2',
        note: '当前启用资源',
        icon: 'building',
        tone: '#2F9B5F'
      }
    ],
    rules: [
      {
        room: '经管自习室 301',
        scope: '工作日',
        time: '08:00–22:00',
        type: '常规开放',
        status: '已生效',
        note: '光华楼 A座 3楼 · 48 座'
      }
    ],
    specialRules: [
      {
        title: '理工自习室 201 跨天开放',
        date: '当前',
        target: '理科楼 2楼',
        time: '00:00–24:00',
        desc: '结束时间早于开始时间时按次日计算'
      }
    ],
    roomOptions: ['经管自习室 301', '理工自习室 201'],
    options: [
      { label: '分钟级时段', desc: '预约搜索按开始、结束时间过滤可用座位', enabled: true },
      { label: '跨天开放', desc: '夜间自习室结束时间早于开始时间时按次日计算', enabled: true }
    ],
    priorities: [
      { order: '1', title: '自习室独立规则', desc: '单个房间的开放状态和开放时段优先生效' },
      { order: '2', title: '系统参数默认值', desc: '未配置独立规则时使用系统参数中的全校默认规则' }
    ]
  },
  bookings: {
    records: [
      {
        id: 'seed-admin-booking-now',
        uid: 'stu_cse_01',
        user: '林晓明',
        room: '经管自习室 301',
        seat: 'C3',
        date: '6/9',
        time: '20:00–22:00',
        checkin: '20:05',
        status: 'active'
      }
    ],
    operationRules: [
      ['完整校验', '代预约仍遵守开放时间、冲突、时长、权限规则'],
      ['审计留痕', '记录操作者、目标学生、座位与提交结果']
    ]
  },
  violations: {
    summary: [
      {
        label: '本月违约',
        value: '1',
        note: '近 30 天记录',
        icon: 'alert',
        tone: '#C84040'
      }
    ],
    records: [
      {
        id: 'seed-violation-admin-no-show',
        bookingId: 'seed-admin-booking-no-show',
        student: '陈浩然',
        uid: 'stu_econ_01',
        room: '理工自习室 201',
        seat: 'A1',
        reason: '未签到',
        action: '自动取消并释放座位',
        occurred: '6/8 22:15',
        status: 'confirmed'
      }
    ],
    rules: [
      ['开始后 15 分钟自动取消', '释放座位，生成违约记录并进入复核队列'],
      ['连续 3 次违约限制预约', '限制期内仅管理员可人工解除限制']
    ]
  },
  dynamicCodes: {
    summary: [
      {
        label: '今日有效码',
        value: '3',
        note: '按自习室生成',
        icon: 'qr',
        tone: '#2F9B5F'
      }
    ],
    records: [
      {
        room: '经管自习室 301',
        building: '光华楼 A座',
        webCode: '739214',
        qrStatus: '可打印',
        refresh: '每日更新',
        updatedAt: '6/9 08:00',
        status: 'active'
      }
    ],
    preview: {
      room: '经管自习室 301',
      building: '光华楼 A座',
      webCode: '739214',
      qrStatus: '可打印',
      refresh: '每日更新',
      updatedAt: '6/9 08:00',
      status: 'active'
    },
    rules: [
      ['每日 00:00 自动更新', '每间自习室生成当日签到凭证'],
      ['截图复用拦截', '同一图片重复提交会进入异常上报']
    ]
  },
  params: {
    summary: [
      {
        label: '单次最长',
        value: '4 小时',
        note: '预约时长限制',
        icon: 'settings',
        tone: '#2F9B5F'
      }
    ],
    records: [
      {
        name: '最大预约时长',
        value: '4 小时',
        defaultValue: '4 小时',
        scope: '全校',
        type: '数字',
        status: 'active',
        note: '单次预约最长时长'
      }
    ],
    timeline: [
      ['预约前', '开始前提醒', '提前 15 分钟推送通知'],
      ['未签到', '自动取消', '超过 15 分钟自动释放座位']
    ],
    scopes: [
      ['全校默认', '所有普通自习室共用的基础规则'],
      ['院系范围', '院系自习室仍需校验学生归属']
    ],
    rules: [
      ['参数变更需审批发布', '待发布变更不会立即影响预约规则'],
      ['配置变更需审计留痕', '保存、恢复默认和发布都会进入审计日志'],
      ['违约策略联动签到记录', '自动取消后同步释放座位并生成违约记录']
    ]
  },
  audit: {
    summary: [
      {
        label: '审计日志',
        value: '4',
        note: '最近操作记录',
        icon: 'eye',
        tone: '#3A6FA8'
      }
    ],
    records: [
      {
        time: '6/9 20:30',
        operator: '系统管理员',
        module: '自习室管理',
        action: '更新开放时间',
        target: 'room-gm-301',
        ip: '127.0.0.1',
        result: 'success',
        detail: '经管自习室 301 开放时间同步'
      }
    ],
    risks: [
      ['失败操作', '0 条', '需确认是否存在越权或重复操作'],
      ['待复核变更', '1 条', '高风险权限或参数变更需要审批']
    ],
    rules: [
      ['关键操作全量留痕', '登录、资源变更、权限调整、代操作均进入审计日志'],
      ['高风险变更需复核', '角色权限和系统参数变更需要审批后生效']
    ]
  },
  reports: {
    summary: [
      {
        label: '平均签到率',
        value: '75%',
        note: '近 30 天',
        icon: 'check-circle',
        tone: '#2F9B5F'
      },
      {
        label: '预约总量',
        value: '4',
        note: '近 30 天有效预约',
        icon: 'calendar',
        tone: '#3A6FA8'
      }
    ],
    weeklyBookings: [
      ['一', 2],
      ['二', 1],
      ['三', 0]
    ],
    topRooms: [{ name: '经管自习室 301', count: 3, pct: 100 }],
    topSeats: [['C3', '经管自习室 301', '3', '插座、安静区']],
    lowPeriods: [['8时', '3%', '低峰']],
    rules: [
      ['报表只读后端聚合', '图表、排行和摘要均基于预约、签到和座位表计算'],
      ['低利用率辅助调度', '管理员可据此调整开放范围或维护计划']
    ]
  }
});

export const successfulAdminOverviewResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: adminOverviewFixture()
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

export const successfulLoginResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        accessToken: 'access-token',
        expiresAt: '2026-05-25T12:00:00.000Z',
        user: {
          name: '系统管理员',
          departmentName: null
        },
        roles: [{ name: '超级管理员', code: 'ROLE_FULL_ADMIN' }]
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

export const successfulRoomsResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: [
        {
          id: 'room-gm-301',
          name: '经管自习室 301',
          building: '光华楼 A座',
          floor: 3,
          capacity: 48,
          scopeType: 'SCHOOL',
          departmentId: null,
          openHour: 8,
          closeHour: 22,
          overnight: false,
          status: 'ACTIVE'
        }
      ]
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

export const successfulRoomResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        id: 'room-cs-lab-b',
        name: '计算机学院自习室 B',
        building: '计算机楼',
        floor: 4,
        capacity: 24,
        scopeType: 'DEPARTMENT',
        departmentId: 'dept-cs',
        openHour: 22,
        closeHour: 7,
        overnight: true,
        status: 'ACTIVE'
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

export const successfulSeatsResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: [
        {
          id: 'seat-gm-301-a001',
          roomId: 'room-gm-301',
          roomName: '经管自习室 301',
          code: 'A001',
          x: 80,
          y: 120,
          hasPower: true,
          nearWindow: false,
          quietZone: true,
          status: 'ACTIVE',
          updatedAt: '2026-05-28T03:32:35.000Z'
        }
      ]
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

export const successfulSeatResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        id: 'seat-gm-301-a010',
        roomId: 'room-gm-301',
        roomName: '经管自习室 301',
        code: 'A010',
        x: 220,
        y: 120,
        hasPower: true,
        nearWindow: true,
        quietZone: false,
        status: 'ACTIVE',
        updatedAt: '2026-05-28T03:35:35.000Z'
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

export const successfulUsersResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: [
        {
          id: 'user-stu-cse-01',
          studentNo: 'stu_cse_01',
          name: '林晓明',
          email: 'stu_cse_01@fudan.edu.cn',
          departmentId: 'dept-cs',
          departmentName: '计算机学院',
          status: 'ACTIVE',
          roles: [{ id: 'role-student', code: 'ROLE_STUDENT', name: '学生' }],
          updatedAt: '2026-05-28T03:40:35.000Z'
        }
      ]
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

export const successfulRolesResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: [
        {
          id: 'role-full-admin',
          code: 'ROLE_FULL_ADMIN',
          name: '超级管理员',
          userCount: 1,
          permissions: [
            { id: 'perm-user-read', code: 'user.read', name: '查看用户', menuKey: 'users' },
            { id: 'perm-role-assign', code: 'role.assign', name: '分配角色', menuKey: 'roles' }
          ],
          updatedAt: '2026-05-28T03:40:35.000Z'
        }
      ]
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

export const successfulStudentViolationsResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        totalCount: 1.5,
        restrictionThreshold: 3,
        severeThreshold: 5,
        records: [
          {
            id: 'violation-no-checkin',
            room: '经管自习室 301 · D8',
            seat: 'D8',
            date: '5月28日',
            reason: '未签到（签到超时自动取消）',
            count: 1,
            status: 'confirmed',
            occurredAt: '2026-05-28T04:00:00.000Z'
          },
          {
            id: 'violation-appealed',
            room: '文史馆阅览室 · B14',
            seat: 'B14',
            date: '5月20日',
            reason: '提前离座超 30 分钟',
            count: 0.5,
            status: 'appealed',
            occurredAt: '2026-05-20T09:00:00.000Z'
          }
        ]
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

export const successfulStudentNotificationsResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        unreadCount: 2,
        groups: [
          {
            date: '今天',
            items: [
              {
                id: 'notice-booking-start',
                group: '今天',
                iconType: 'bell',
                tone: 'teal',
                title: '预约提醒',
                description: '您今日 14:00 在经管自习室 301 的预约将在 15 分钟后开始',
                timeLabel: '13:45',
                read: false,
                occurredAt: '2026-05-29T05:45:00.000Z'
              },
              {
                id: 'notice-checkin-late',
                group: '今天',
                iconType: 'clock',
                tone: 'gold',
                title: '未签到提醒',
                description: '预约已开始 10 分钟，请尽快完成签到',
                timeLabel: '14:10',
                read: false,
                occurredAt: '2026-05-29T06:10:00.000Z'
              }
            ]
          },
          {
            date: '昨天',
            items: [
              {
                id: 'notice-checkin-done',
                group: '昨天',
                iconType: 'check',
                tone: 'green',
                title: '签到成功',
                description: '您已完成经管自习室 301 · C3 签到',
                timeLabel: '昨天 13:52',
                read: true,
                occurredAt: '2026-05-28T05:52:00.000Z'
              }
            ]
          }
        ]
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

export const successfulStudentRoomFavoritesResponse = (
  favoriteRoomIds: string[] = ['room-gm-301', 'room-science-201', 'room-humanities-a']
) => {
  const roomNameById: Record<string, string> = {
    'room-gm-301': '经管自习室 301',
    'room-science-201': '理工自习室 201',
    'room-humanities-a': '文史馆阅览室 A',
    'room-news-seminar': '新闻学院研讨室',
    'room-science-403': '理工自习室 403',
    'room-library-zone': '图书馆自习区'
  };
  return new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        favoriteRoomIds,
        favorites: favoriteRoomIds.map((roomId) => ({
          roomId,
          room: roomNameById[roomId] ?? roomId
        }))
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );
};

export const successfulStudentHomeSummaryResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        totalSeats: 207,
        availableSeats: 198,
        availableSeatsDeltaPercent: 6,
        todayBookingCount: 2,
        dailyBookingLimit: 3,
        favoriteRooms: [
          { roomId: 'room-gm-301', room: '经管自习室 301' },
          { roomId: 'room-science-201', room: '理工自习室 201' }
        ],
        weekStudyHours: 7.5,
        lastWeekStudyHours: 5,
        weekRecords: [
          { day: '一', hours: 1.5 },
          { day: '二', hours: 2 },
          { day: '三', hours: 0 },
          { day: '四', hours: 4 },
          { day: '五', hours: 0 },
          { day: '六', hours: 0 },
          { day: '日', hours: 0 }
        ]
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

export const successfulStudentRoomAvailabilityResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        totalSeats: 224,
        availableSeats: 221,
        rooms: [
          { roomId: 'room-gm-301', totalSeats: 37, availableSeats: 34 },
          { roomId: 'room-science-201', totalSeats: 38, availableSeats: 38 },
          { roomId: 'room-humanities-a', totalSeats: 38, availableSeats: 38 },
          { roomId: 'room-news-seminar', totalSeats: 37, availableSeats: 37 },
          { roomId: 'room-science-403', totalSeats: 37, availableSeats: 37 },
          { roomId: 'room-library-zone', totalSeats: 37, availableSeats: 37 }
        ]
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

export const successfulRoomCatalogResponse = (rooms: RoomCatalogItem[] = [
  {
    id: 'room-gm-301',
    name: '经管自习室 301',
    building: '光华楼 A座',
    floor: '3楼',
    capacity: 37,
    hours: '08:00–22:00',
    scope: '全校开放',
    tags: ['插座', '靠窗', '安静区'],
    resourceStatus: 'ACTIVE'
  },
  {
    id: 'room-science-201',
    name: '理工自习室 201',
    building: '理科楼',
    floor: '2楼',
    capacity: 38,
    hours: '00:00–24:00',
    scope: '全校开放',
    tags: ['24小时', '插座'],
    resourceStatus: 'ACTIVE'
  },
  {
    id: 'room-humanities-a',
    name: '文史馆阅览室 A',
    building: '文史馆',
    floor: '1楼',
    capacity: 38,
    hours: '08:00–21:00',
    scope: '全校开放',
    tags: ['靠窗', '低噪音'],
    resourceStatus: 'ACTIVE'
  },
  {
    id: 'room-news-seminar',
    name: '新闻学院研讨室',
    building: '新闻学院楼',
    floor: '4楼',
    capacity: 37,
    hours: '09:00–20:00',
    scope: '全校开放',
    tags: ['白板', '投影'],
    resourceStatus: 'ACTIVE'
  },
  {
    id: 'room-science-403',
    name: '理工自习室 403',
    building: '逸夫楼',
    floor: '4楼',
    capacity: 37,
    hours: '08:00–23:00',
    scope: '全校开放',
    tags: ['插座', '安静区'],
    resourceStatus: 'ACTIVE'
  },
  {
    id: 'room-library-zone',
    name: '图书馆自习区',
    building: '李兆基图书馆',
    floor: '2楼',
    capacity: 37,
    hours: '08:00–22:00',
    scope: '全校开放',
    tags: ['插座', '靠窗', '安静区'],
    resourceStatus: 'ACTIVE'
  }
]) =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: rooms
    }),
    { headers: { 'Content-Type': 'application/json' }, status: 200 }
  );

export const successfulStudentBookingsResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        totalCount: 3,
        activeCount: 2,
        completedCount: 1,
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
            startAt: '2026-05-29T06:00:00.000Z',
            endAt: '2026-05-29T09:00:00.000Z'
          },
          {
            id: 'booking-using',
            room: '理工自习室 201',
            location: '理科楼 2楼',
            seat: 'F12',
            time: '今日 09:00-12:00',
            status: 'using',
            tags: ['24小时'],
            canCheckIn: false,
            canCancel: false,
            startAt: '2026-05-29T01:00:00.000Z',
            endAt: '2026-05-29T04:00:00.000Z'
          },
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
          }
        ]
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

export const successfulStudentBookingCancelResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        id: 'booking-upcoming',
        room: '经管自习室 301',
        location: '光华楼 A座 3楼',
        seat: 'C3',
        time: '今日 14:00-17:00',
        status: 'cancelled',
        tags: ['插座'],
        canCheckIn: false,
        canCancel: false,
        startAt: '2026-05-29T06:00:00.000Z',
        endAt: '2026-05-29T09:00:00.000Z'
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

export const successfulStudentBookingCreateResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
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
    }),
    {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    }
  );

export const successfulStudentCheckInSessionResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        bookingId: 'booking-current',
        roomId: 'room-gm-301',
        room: '经管自习室 301',
        seat: 'C3',
        time: '今日 14:00-17:00',
        remainingSeconds: 562,
        codeLength: 6
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

export const successfulStudentCheckInSubmitResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        bookingId: 'booking-current',
        room: '经管自习室 301',
        seat: 'C3',
        time: '今日 14:00-17:00',
        checkedInAt: '2026-05-30T06:02:00.000Z',
        status: 'CHECKED_IN'
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

export const successfulStudentAssistantResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        intent: 'availability',
        text: '今天晚上找到 1 个可用座位。',
        seats: [
          {
            roomId: 'room-gm-301',
            seatId: 'seat-gm-301-c3',
            room: '经管自习室 301',
            location: '光华楼 A座 3楼',
            seat: 'C3',
            time: '今天晚上 18:00-22:00',
            tags: ['插座', '靠窗']
          }
        ],
        bookings: [],
        suggestions: ['换个时段', '去选座页筛选', '我今天定了哪里']
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );
