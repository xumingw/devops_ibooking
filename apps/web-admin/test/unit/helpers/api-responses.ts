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
