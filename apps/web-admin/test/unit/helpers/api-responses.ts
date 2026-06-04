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
