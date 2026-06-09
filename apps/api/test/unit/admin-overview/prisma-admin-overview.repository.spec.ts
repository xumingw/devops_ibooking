import { PrismaAdminOverviewRepository } from '../../../src/admin-overview/prisma-admin-overview.repository';
import { PrismaService } from '../../../src/database/prisma.service';

const NOW = new Date('2026-06-09T12:12:00.000Z');

describe('PrismaAdminOverviewRepository', () => {
  let prisma: {
    room: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
    seat: {
      count: jest.Mock;
      findMany: jest.Mock;
    };
    bookingSlot: {
      count: jest.Mock;
      findMany: jest.Mock;
    };
    booking: {
      count: jest.Mock;
      findMany: jest.Mock;
    };
    violation: {
      count: jest.Mock;
      findMany: jest.Mock;
    };
    checkInCode: {
      findMany: jest.Mock;
    };
    systemParam: {
      findMany: jest.Mock;
    };
    auditLog: {
      findMany: jest.Mock;
    };
    user: {
      count: jest.Mock;
    };
    role: {
      count: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      room: {
        findMany: jest.fn(),
        count: jest.fn()
      },
      seat: {
        count: jest.fn(),
        findMany: jest.fn()
      },
      bookingSlot: {
        count: jest.fn(),
        findMany: jest.fn()
      },
      booking: {
        count: jest.fn(),
        findMany: jest.fn()
      },
      violation: {
        count: jest.fn(),
        findMany: jest.fn()
      },
      checkInCode: {
        findMany: jest.fn()
      },
      systemParam: {
        findMany: jest.fn()
      },
      auditLog: {
        findMany: jest.fn()
      },
      user: {
        count: jest.fn()
      },
      role: {
        count: jest.fn()
      }
    };
  });

  it('按数据库记录生成管理端所有页面需要的数据快照', async () => {
    prisma.room.findMany.mockResolvedValue([
      roomFixture('room-gm-301', '经管自习室 301', '光华楼 A座', 3, 48, 8, 22),
      roomFixture('room-science-201', '理工自习室 201', '逸夫楼', 2, 64, 0, 24, true)
    ]);
    prisma.room.count.mockResolvedValue(2);
    prisma.seat.count.mockResolvedValue(112);
    prisma.seat.findMany.mockResolvedValue([
      seatFixture('seat-gm-c3', 'room-gm-301', 'C3', '经管自习室 301'),
      seatFixture('seat-science-f8', 'room-science-201', 'F8', '理工自习室 201')
    ]);
    prisma.bookingSlot.count.mockResolvedValue(1);
    prisma.bookingSlot.findMany.mockResolvedValue([
      { slotStart: new Date('2026-06-09T11:00:00.000Z'), booking: { roomId: 'room-gm-301' } }
    ]);
    prisma.booking.count.mockResolvedValueOnce(3).mockResolvedValueOnce(4).mockResolvedValueOnce(2);
    prisma.violation.count.mockResolvedValue(1);
    prisma.user.count.mockResolvedValueOnce(6).mockResolvedValueOnce(2).mockResolvedValueOnce(1);
    prisma.role.count.mockResolvedValue(5);
    prisma.booking.findMany
      .mockResolvedValueOnce([
        bookingFixture({
          id: 'booking-admin-001',
          user: '林晓明',
          studentNo: 'stu_cse_01',
          room: '经管自习室 301',
          building: '光华楼 A座',
          floor: 3,
          seat: 'C3',
          status: 'CHECKED_IN',
          startAt: new Date('2026-06-09T11:00:00.000Z'),
          endAt: new Date('2026-06-09T13:00:00.000Z')
        })
      ])
      .mockResolvedValueOnce([
        bookingFixture({
          id: 'booking-admin-001',
          user: '林晓明',
          studentNo: 'stu_cse_01',
          room: '经管自习室 301',
          building: '光华楼 A座',
          floor: 3,
          seat: 'C3',
          status: 'CHECKED_IN',
          startAt: new Date('2026-06-09T11:00:00.000Z'),
          endAt: new Date('2026-06-09T13:00:00.000Z')
        }),
        bookingFixture({
          id: 'booking-admin-002',
          user: '张子涵',
          studentNo: 'stu_cse_02',
          room: '理工自习室 201',
          building: '逸夫楼',
          floor: 2,
          seat: 'F8',
          status: 'COMPLETED',
          startAt: new Date('2026-06-08T02:00:00.000Z'),
          endAt: new Date('2026-06-08T04:00:00.000Z')
        })
      ])
      .mockResolvedValueOnce([
        bookingFixture({
          id: 'booking-admin-001',
          user: '林晓明',
          studentNo: 'stu_cse_01',
          room: '经管自习室 301',
          building: '光华楼 A座',
          floor: 3,
          seat: 'C3',
          status: 'CHECKED_IN',
          startAt: new Date('2026-06-09T11:00:00.000Z'),
          endAt: new Date('2026-06-09T13:00:00.000Z')
        })
      ]);
    prisma.violation.findMany.mockResolvedValue([
      {
        id: 'violation-admin-001',
        reason: 'NO_CHECK_IN',
        occurredAt: new Date('2026-06-08T04:16:00.000Z'),
        booking: { id: 'booking-admin-003' },
        user: { name: '陈浩然', studentNo: 'stu_cse_03' },
        room: { name: '理工自习室 201' },
        seat: { code: 'A1' }
      }
    ]);
    prisma.checkInCode.findMany.mockResolvedValue([
      {
        id: 'code-gm-301',
        code: '739214',
        validAt: new Date('2026-06-09T00:00:00.000Z'),
        expiresAt: new Date('2026-06-10T00:00:00.000Z'),
        createdAt: new Date('2026-06-09T00:00:00.000Z'),
        room: { name: '经管自习室 301', building: '光华楼 A座' }
      }
    ]);
    prisma.systemParam.findMany.mockResolvedValue([
      {
        key: 'booking.maxHours',
        value: '4',
        valueType: 'number',
        updatedAt: new Date('2026-06-01T00:00:00.000Z')
      }
    ]);
    prisma.auditLog.findMany.mockResolvedValue([
      {
        action: '更新开放时间',
        resource: 'room',
        resourceId: 'room-gm-301',
        detail: { result: 'success', ip: '127.0.0.1', module: '自习室管理' },
        createdAt: new Date('2026-06-09T11:30:00.000Z'),
        actor: { name: '系统管理员' }
      }
    ]);

    const snapshot = await new PrismaAdminOverviewRepository(
      prisma as unknown as PrismaService
    ).getSnapshot(NOW);

    expect(snapshot.dashboard.kpis).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: '今日预约总数', value: '3' }),
        expect.objectContaining({ label: '当前在座人数', value: '1' })
      ])
    );
    expect(snapshot.bookings.records[0]).toEqual(
      expect.objectContaining({
        id: 'booking-admin-001',
        user: '林晓明',
        room: '经管自习室 301',
        seat: 'C3',
        status: 'active'
      })
    );
    expect(snapshot.violations.records[0]).toEqual(
      expect.objectContaining({
        id: 'violation-admin-001',
        bookingId: 'booking-admin-003',
        student: '陈浩然',
        reason: '未签到'
      })
    );
    expect(snapshot.dynamicCodes.records[0]).toEqual(
      expect.objectContaining({
        room: '经管自习室 301',
        webCode: '739214',
        status: 'active'
      })
    );
    expect(snapshot.params.records[0]).toEqual(
      expect.objectContaining({
        name: '最大预约时长',
        value: '4 小时',
        type: '数字'
      })
    );
    expect(snapshot.audit.records[0]).toEqual(
      expect.objectContaining({
        operator: '系统管理员',
        module: '自习室管理',
        action: '更新开放时间',
        result: 'success'
      })
    );
    expect(snapshot.reports.weeklyBookings).toEqual(
      expect.arrayContaining([
        ['二', 1]
      ])
    );
  });
});

function roomFixture(
  id: string,
  name: string,
  building: string,
  floor: number,
  capacity: number,
  openHour: number,
  closeHour: number,
  overnight = false
) {
  return {
    id,
    name,
    building,
    floor,
    capacity,
    scopeType: 'SCHOOL',
    departmentId: null,
    openHour,
    closeHour,
    overnight,
    status: 'ACTIVE',
    seats: []
  };
}

function seatFixture(id: string, roomId: string, code: string, roomName: string) {
  return {
    id,
    roomId,
    code,
    x: 0,
    y: 0,
    hasPower: true,
    nearWindow: false,
    attributes: { quietZone: true },
    status: 'ACTIVE',
    room: { name: roomName }
  };
}

function bookingFixture(input: {
  id: string;
  user: string;
  studentNo: string;
  room: string;
  building: string;
  floor: number;
  seat: string;
  status: string;
  startAt: Date;
  endAt: Date;
}) {
  return {
    id: input.id,
    status: input.status,
    startAt: input.startAt,
    endAt: input.endAt,
    createdAt: input.startAt,
    user: {
      name: input.user,
      studentNo: input.studentNo
    },
    room: {
      id: `room-${input.room}`,
      name: input.room,
      building: input.building,
      floor: input.floor
    },
    seat: {
      code: input.seat,
      hasPower: true,
      nearWindow: false,
      attributes: { quietZone: true }
    },
    reminderLogs: [
      {
        type: 'CHECK_IN_SUCCESS',
        sentAt: new Date(input.startAt.getTime() + 5 * 60 * 1000)
      }
    ],
    violation: null
  };
}
