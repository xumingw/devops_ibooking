import { PrismaBookingsRepository } from '../../../src/bookings/prisma-bookings.repository';
import { PrismaService } from '../../../src/database/prisma.service';

const NOW = new Date('2026-05-30T06:00:00.000Z');

describe('PrismaBookingsRepository', () => {
  let prisma: {
    user: {
      findUnique: jest.Mock;
    };
    room: {
      findUnique: jest.Mock;
    };
    seat: {
      findFirst: jest.Mock;
    };
    booking: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      updateMany: jest.Mock;
    };
    bookingSlot: {
      createMany: jest.Mock;
      deleteMany: jest.Mock;
    };
    violation: {
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let repository: PrismaBookingsRepository;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      room: {
        findUnique: jest.fn(),
      },
      seat: {
        findFirst: jest.fn(),
      },
      booking: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
      bookingSlot: {
        createMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      violation: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };
    prisma.violation.findMany.mockResolvedValue([]);
    repository = new PrismaBookingsRepository(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('我的预约只在开始前后 15 分钟内展示立即签到入口', async () => {
    prisma.booking.findMany.mockResolvedValue([
      bookingRowFixture({
        id: 'booking-window',
        startAt: new Date('2026-05-30T05:50:00.000Z'),
        endAt: new Date('2026-05-30T08:00:00.000Z'),
      }),
      bookingRowFixture({
        id: 'booking-expired-window',
        startAt: new Date('2026-05-30T05:30:00.000Z'),
        endAt: new Date('2026-05-30T08:00:00.000Z'),
      }),
    ]);

    const records = await repository.listByUserId('user-stu-cse-01');

    expect(records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'booking-window',
          canCheckIn: true,
        }),
        expect.objectContaining({
          id: 'booking-expired-window',
          canCheckIn: false,
        }),
      ]),
    );
  });

  it('我的预约按订单创建时间倒序查询', async () => {
    prisma.booking.findMany.mockResolvedValue([]);

    await repository.listByUserId('user-stu-cse-01');

    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-stu-cse-01' },
        orderBy: { createdAt: 'desc' },
      }),
    );
  });

  it('当前 slot 预约按订单创建时间计算签到截止', async () => {
    prisma.booking.findMany.mockResolvedValue([
      bookingRowFixture({
        id: 'booking-current-slot',
        startAt: new Date('2026-05-30T05:30:00.000Z'),
        endAt: new Date('2026-05-30T08:00:00.000Z'),
        createdAt: new Date('2026-05-30T05:55:00.000Z'),
      }),
    ]);

    const records = await repository.listByUserId('user-stu-cse-01');

    expect(records[0]).toMatchObject({
      id: 'booking-current-slot',
      status: 'upcoming',
      canCheckIn: true,
      canCancel: true,
      createdAt: '2026-05-30T05:55:00.000Z',
      checkInDeadlineAt: '2026-05-30T06:10:00.000Z',
    });
  });

  it('我的预约按当前时间派生过期状态', async () => {
    prisma.booking.findMany.mockResolvedValue([
      bookingRowFixture({
        id: 'booking-ended-checked-in',
        startAt: new Date('2026-05-30T03:00:00.000Z'),
        endAt: new Date('2026-05-30T05:00:00.000Z'),
        status: 'CHECKED_IN',
      }),
      bookingRowFixture({
        id: 'booking-no-show',
        startAt: new Date('2026-05-30T05:30:00.000Z'),
        endAt: new Date('2026-05-30T08:00:00.000Z'),
        status: 'PENDING_CHECKIN',
      }),
    ]);

    const records = await repository.listByUserId('user-stu-cse-01');

    expect(records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'booking-ended-checked-in',
          status: 'completed',
          canCheckIn: false,
          canCancel: false,
        }),
        expect.objectContaining({
          id: 'booking-no-show',
          status: 'violation',
          canCheckIn: false,
          canCancel: false,
        }),
      ]),
    );
  });

  it('开始前取消当前用户预约并返回取消后的记录', async () => {
    const current = bookingRowFixture({
      id: 'booking-future',
      startAt: new Date('2026-05-30T07:00:00.000Z'),
      endAt: new Date('2026-05-30T09:00:00.000Z'),
    });
    prisma.booking.updateMany.mockResolvedValue({ count: 1 });
    prisma.booking.findUnique.mockResolvedValue({
      ...current,
      status: 'CANCELLED_BY_USER',
    });

    const record = await repository.cancelByUserId('user-stu-cse-01', 'booking-future');

    expect(prisma.booking.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'booking-future',
          userId: 'user-stu-cse-01',
          status: 'PENDING_CHECKIN',
          endAt: { gt: NOW },
          OR: [
            { startAt: { gt: new Date('2026-05-30T05:45:00.000Z') } },
            { createdAt: { gt: new Date('2026-05-30T05:45:00.000Z') } },
          ],
        }),
        data: { status: 'CANCELLED_BY_USER' },
      }),
    );
    expect(prisma.bookingSlot.deleteMany).toHaveBeenCalledWith({
      where: { bookingId: 'booking-future' },
    });
    expect(record).toMatchObject({
      id: 'booking-future',
      status: 'cancelled',
      canCancel: false,
    });
  });

  it('当前 slot 在签到截止前允许取消当前用户预约', async () => {
    const current = bookingRowFixture({
      id: 'booking-current-slot',
      startAt: new Date('2026-05-30T05:30:00.000Z'),
      endAt: new Date('2026-05-30T08:00:00.000Z'),
      createdAt: new Date('2026-05-30T05:55:00.000Z'),
    });
    prisma.booking.updateMany.mockResolvedValue({ count: 1 });
    prisma.booking.findUnique.mockResolvedValue({
      ...current,
      status: 'CANCELLED_BY_USER',
    });

    const record = await repository.cancelByUserId('user-stu-cse-01', 'booking-current-slot');

    expect(prisma.booking.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'booking-current-slot',
          userId: 'user-stu-cse-01',
          status: 'PENDING_CHECKIN',
          endAt: { gt: NOW },
          OR: [
            { startAt: { gt: new Date('2026-05-30T05:45:00.000Z') } },
            { createdAt: { gt: new Date('2026-05-30T05:45:00.000Z') } },
          ],
        }),
      }),
    );
    expect(record).toMatchObject({
      id: 'booking-current-slot',
      status: 'cancelled',
      canCancel: false,
    });
  });

  it('创建半小时粒度预约时写入预约、半小时占位并按区间检查同座冲突', async () => {
    const created = bookingRowFixture({
      id: 'booking-created',
      startAt: new Date('2026-06-01T06:00:00.000Z'),
      endAt: new Date('2026-06-01T07:30:00.000Z'),
    });
    prisma.user.findUnique.mockResolvedValue({ id: 'user-stu-cse-01', departmentId: 'dept-cs' });
    prisma.room.findUnique.mockResolvedValue(created.room);
    prisma.seat.findFirst.mockResolvedValue(created.seat);
    prisma.booking.findFirst.mockResolvedValue(null);
    prisma.booking.create.mockResolvedValue(created);
    prisma.bookingSlot.createMany.mockResolvedValue({ count: 3 });

    const record = await repository.createByUserId('user-stu-cse-01', {
      roomId: 'room-gm-301',
      seatId: 'seat-gm-301-c3',
      startAt: '2026-06-01T06:00:00.000Z',
      endAt: '2026-06-01T07:30:00.000Z',
    });
    expect(prisma.booking.findFirst).toHaveBeenNthCalledWith(1, {
      where: {
        userId: 'user-stu-cse-01',
        status: { in: ['PENDING_CHECKIN', 'CHECKED_IN'] },
        startAt: { lt: new Date('2026-06-01T07:30:00.000Z') },
        endAt: { gt: new Date('2026-06-01T06:00:00.000Z') },
      },
      select: { id: true },
    });
    expect(prisma.booking.findFirst).toHaveBeenNthCalledWith(2, {
      where: {
        seatId: 'seat-gm-301-c3',
        status: { in: ['PENDING_CHECKIN', 'CHECKED_IN'] },
        startAt: { lt: new Date('2026-06-01T07:30:00.000Z') },
        endAt: { gt: new Date('2026-06-01T06:00:00.000Z') },
      },
      select: { id: true },
    });

    expect(prisma.booking.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-stu-cse-01',
        roomId: 'room-gm-301',
        seatId: 'seat-gm-301-c3',
        startAt: new Date('2026-06-01T06:00:00.000Z'),
        endAt: new Date('2026-06-01T07:30:00.000Z'),
        status: 'PENDING_CHECKIN',
      },
      include: {
        room: true,
        seat: true,
      },
    });
    expect(prisma.bookingSlot.createMany).toHaveBeenCalledWith({
      data: [
        {
          bookingId: 'booking-created',
          seatId: 'seat-gm-301-c3',
          userId: 'user-stu-cse-01',
          slotStart: new Date('2026-06-01T06:00:00.000Z'),
        },
        {
          bookingId: 'booking-created',
          seatId: 'seat-gm-301-c3',
          userId: 'user-stu-cse-01',
          slotStart: new Date('2026-06-01T06:30:00.000Z'),
        },
        {
          bookingId: 'booking-created',
          seatId: 'seat-gm-301-c3',
          userId: 'user-stu-cse-01',
          slotStart: new Date('2026-06-01T07:00:00.000Z'),
        },
      ],
    });
    expect(record).toMatchObject({
      id: 'booking-created',
      room: '经管自习室 301',
      seat: 'C3',
      status: 'upcoming',
      canCancel: true,
    });
  });

  it('学生违约达到 5 次且仍在 30 天限制期内时拒绝创建预约', async () => {
    const created = bookingRowFixture({
      id: 'booking-created',
      startAt: new Date('2026-06-01T06:00:00.000Z'),
      endAt: new Date('2026-06-01T07:30:00.000Z'),
    });
    prisma.user.findUnique.mockResolvedValue({ id: 'user-stu-cse-01', departmentId: 'dept-cs' });
    prisma.room.findUnique.mockResolvedValue(created.room);
    prisma.seat.findFirst.mockResolvedValue(created.seat);
    prisma.violation.findMany.mockResolvedValue(
      createViolationRows([
        '2026-05-29T06:00:00.000Z',
        '2026-05-28T06:00:00.000Z',
        '2026-05-27T06:00:00.000Z',
        '2026-05-26T06:00:00.000Z',
        '2026-05-25T06:00:00.000Z',
        '2026-05-24T06:00:00.000Z',
      ]),
    );
    prisma.booking.findFirst.mockResolvedValue(null);
    prisma.booking.create.mockResolvedValue(created);
    prisma.bookingSlot.createMany.mockResolvedValue({ count: 3 });

    await expect(
      repository.createByUserId('user-stu-cse-01', {
        roomId: 'room-gm-301',
        seatId: 'seat-gm-301-c3',
        startAt: '2026-06-01T06:00:00.000Z',
        endAt: '2026-06-01T07:30:00.000Z',
      }),
    ).rejects.toThrow('当前违约记录已触发 30 天预约限制');

    expect(prisma.violation.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-stu-cse-01' },
      orderBy: { occurredAt: 'desc' },
      select: { occurredAt: true },
    });
    expect(prisma.booking.create).not.toHaveBeenCalled();
    expect(prisma.bookingSlot.createMany).not.toHaveBeenCalled();
  });

  it('违约限制期已过时允许重新预约', async () => {
    const created = bookingRowFixture({
      id: 'booking-created',
      startAt: new Date('2026-06-01T06:00:00.000Z'),
      endAt: new Date('2026-06-01T07:30:00.000Z'),
    });
    prisma.user.findUnique.mockResolvedValue({ id: 'user-stu-cse-01', departmentId: 'dept-cs' });
    prisma.room.findUnique.mockResolvedValue(created.room);
    prisma.seat.findFirst.mockResolvedValue(created.seat);
    prisma.violation.findMany.mockResolvedValue(
      createViolationRows([
        '2026-04-20T06:00:00.000Z',
        '2026-04-19T06:00:00.000Z',
        '2026-04-18T06:00:00.000Z',
      ]),
    );
    prisma.booking.findFirst.mockResolvedValue(null);
    prisma.booking.create.mockResolvedValue(created);
    prisma.bookingSlot.createMany.mockResolvedValue({ count: 3 });

    await expect(
      repository.createByUserId('user-stu-cse-01', {
        roomId: 'room-gm-301',
        seatId: 'seat-gm-301-c3',
        startAt: '2026-06-01T06:00:00.000Z',
        endAt: '2026-06-01T07:30:00.000Z',
      }),
    ).resolves.toMatchObject({ id: 'booking-created' });

    expect(prisma.booking.create).toHaveBeenCalled();
  });

  it('拒绝同座位任意分钟重叠预约', async () => {
    const row = bookingRowFixture({
      id: 'booking-created',
      startAt: new Date('2026-06-01T06:17:00.000Z'),
      endAt: new Date('2026-06-01T06:20:00.000Z'),
    });
    prisma.user.findUnique.mockResolvedValue({ id: 'user-stu-cse-01', departmentId: 'dept-cs' });
    prisma.room.findUnique.mockResolvedValue(row.room);
    prisma.seat.findFirst.mockResolvedValue(row.seat);
    prisma.booking.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'booking-overlap' });

    await expect(
      repository.createByUserId('user-stu-cse-01', {
        roomId: 'room-gm-301',
        seatId: 'seat-gm-301-c3',
        startAt: '2026-06-01T06:17:00.000Z',
        endAt: '2026-06-01T06:20:00.000Z',
      }),
    ).rejects.toThrow('该座位时段已被预约');

    expect(prisma.booking.create).not.toHaveBeenCalled();
    expect(prisma.bookingSlot.createMany).not.toHaveBeenCalled();
  });

  it('允许 24 小时自习室跨天预约', async () => {
    const created = bookingRowFixture({
      id: 'booking-24h-overnight',
      startAt: new Date('2026-06-01T15:00:00.000Z'),
      endAt: new Date('2026-06-01T18:00:00.000Z'),
    });
    prisma.user.findUnique.mockResolvedValue({ id: 'user-stu-cse-01', departmentId: 'dept-cs' });
    prisma.room.findUnique.mockResolvedValue({
      ...created.room,
      openHour: 0,
      closeHour: 24,
      overnight: false,
      schedules: [],
    });
    prisma.seat.findFirst.mockResolvedValue(created.seat);
    prisma.booking.findFirst.mockResolvedValue(null);
    prisma.booking.create.mockResolvedValue(created);
    prisma.bookingSlot.createMany.mockResolvedValue({ count: 6 });

    const record = await repository.createByUserId('user-stu-cse-01', {
      roomId: 'room-science-201',
      seatId: 'seat-science-201-f12',
      startAt: '2026-06-01T15:00:00.000Z',
      endAt: '2026-06-01T18:00:00.000Z',
    });

    expect(record).toMatchObject({
      id: 'booking-24h-overnight',
      status: 'upcoming',
    });
    expect(prisma.booking.create).toHaveBeenCalled();
    expect(prisma.bookingSlot.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ slotStart: new Date('2026-06-01T15:00:00.000Z') }),
        expect.objectContaining({ slotStart: new Date('2026-06-01T17:30:00.000Z') }),
      ]),
    });
  });

  it('拒绝特殊日期关闭的自习室预约', async () => {
    const row = bookingRowFixture({
      id: 'booking-created',
      startAt: new Date('2026-06-01T06:00:00.000Z'),
      endAt: new Date('2026-06-01T09:00:00.000Z'),
    });
    prisma.user.findUnique.mockResolvedValue({ id: 'user-stu-cse-01', departmentId: 'dept-cs' });
    prisma.room.findUnique.mockResolvedValue({
      ...row.room,
      schedules: [
        {
          id: 'schedule-closed',
          roomId: 'room-gm-301',
          date: new Date('2026-06-01T00:00:00.000Z'),
          openHour: 8,
          closeHour: 22,
          closed: true,
          reason: '考试周闭馆',
          createdAt: NOW,
          updatedAt: NOW,
        },
      ],
    });
    prisma.seat.findFirst.mockResolvedValue(row.seat);

    await expect(
      repository.createByUserId('user-stu-cse-01', {
        roomId: 'room-gm-301',
        seatId: 'seat-gm-301-c3',
        startAt: '2026-06-01T06:00:00.000Z',
        endAt: '2026-06-01T09:00:00.000Z',
      }),
    ).rejects.toThrow('预约时间不在自习室开放时间内');

    expect(prisma.booking.create).not.toHaveBeenCalled();
  });

  it('拒绝跨天预约落在次日闭馆时段', async () => {
    const row = bookingRowFixture({
      id: 'booking-overnight',
      startAt: new Date('2026-06-01T14:00:00.000Z'),
      endAt: new Date('2026-06-01T18:00:00.000Z'),
    });
    prisma.user.findUnique.mockResolvedValue({ id: 'user-stu-cse-01', departmentId: 'dept-cs' });
    prisma.room.findUnique.mockResolvedValue({
      ...row.room,
      openHour: 22,
      closeHour: 6,
      overnight: true,
      schedules: [
        {
          id: 'schedule-open-start',
          roomId: 'room-gm-301',
          date: new Date('2026-06-01T00:00:00.000Z'),
          openHour: 22,
          closeHour: 6,
          closed: false,
          reason: null,
          createdAt: NOW,
          updatedAt: NOW,
        },
        {
          id: 'schedule-closed-next',
          roomId: 'room-gm-301',
          date: new Date('2026-06-02T00:00:00.000Z'),
          openHour: 22,
          closeHour: 6,
          closed: true,
          reason: '次日闭馆维护',
          createdAt: NOW,
          updatedAt: NOW,
        },
      ],
    });
    prisma.seat.findFirst.mockResolvedValue(row.seat);

    await expect(
      repository.createByUserId('user-stu-cse-01', {
        roomId: 'room-gm-301',
        seatId: 'seat-gm-301-c3',
        startAt: '2026-06-01T14:00:00.000Z',
        endAt: '2026-06-01T18:00:00.000Z',
      }),
    ).rejects.toThrow('预约时间不在自习室开放时间内');

    expect(prisma.room.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          schedules: {
            where: {
              date: {
                in: [
                  new Date('2026-06-01T00:00:00.000Z'),
                  new Date('2026-06-02T00:00:00.000Z'),
                ],
              },
            },
          },
        },
      }),
    );
    expect(prisma.booking.create).not.toHaveBeenCalled();
  });

  it('特殊日期非跨夜开放时间不会继承房间默认跨夜设置', async () => {
    const row = bookingRowFixture({
      id: 'booking-special-day',
      startAt: new Date('2026-06-01T05:00:00.000Z'),
      endAt: new Date('2026-06-01T06:00:00.000Z'),
    });
    prisma.user.findUnique.mockResolvedValue({ id: 'user-stu-cse-01', departmentId: 'dept-cs' });
    prisma.room.findUnique.mockResolvedValue({
      ...row.room,
      openHour: 22,
      closeHour: 6,
      overnight: true,
      schedules: [
        {
          id: 'schedule-daytime-only',
          roomId: 'room-gm-301',
          date: new Date('2026-06-01T00:00:00.000Z'),
          openHour: 8,
          closeHour: 12,
          closed: false,
          reason: '考试周仅上午开放',
          createdAt: NOW,
          updatedAt: NOW,
        },
      ],
    });
    prisma.seat.findFirst.mockResolvedValue(row.seat);

    await expect(
      repository.createByUserId('user-stu-cse-01', {
        roomId: 'room-gm-301',
        seatId: 'seat-gm-301-c3',
        startAt: '2026-06-01T05:00:00.000Z',
        endAt: '2026-06-01T06:00:00.000Z',
      }),
    ).rejects.toThrow('预约时间不在自习室开放时间内');

    expect(prisma.booking.create).not.toHaveBeenCalled();
  });
});

function bookingRowFixture(input: {
  id: string;
  startAt: Date;
  endAt: Date;
  createdAt?: Date;
  status?: 'PENDING_CHECKIN' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED_AUTO_NO_CHECKIN' | 'CANCELLED_BY_USER' | 'CANCELLED_BY_ADMIN';
}) {
  return {
    id: input.id,
    userId: 'user-stu-cse-01',
    roomId: 'room-gm-301',
    seatId: 'seat-gm-301-c3',
    startAt: input.startAt,
    endAt: input.endAt,
    status: input.status ?? 'PENDING_CHECKIN',
    createdAt: input.createdAt ?? new Date('2026-05-30T05:00:00.000Z'),
    updatedAt: new Date('2026-05-30T05:00:00.000Z'),
    room: {
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
      status: 'ACTIVE',
      createdAt: new Date('2026-05-30T05:00:00.000Z'),
      updatedAt: new Date('2026-05-30T05:00:00.000Z'),
      schedules: [],
    },
    seat: {
      id: 'seat-gm-301-c3',
      roomId: 'room-gm-301',
      code: 'C3',
      x: 3,
      y: 3,
      hasPower: true,
      nearWindow: true,
      attributes: null,
      status: 'ACTIVE',
      createdAt: new Date('2026-05-30T05:00:00.000Z'),
      updatedAt: new Date('2026-05-30T05:00:00.000Z'),
    },
  };
}

function createViolationRows(occurredAtValues: string[]) {
  return occurredAtValues.map((occurredAt) => ({ occurredAt: new Date(occurredAt) }));
}
