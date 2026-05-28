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
