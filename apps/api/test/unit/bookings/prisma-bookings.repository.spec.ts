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
      $transaction: jest.fn((callback) => callback(prisma)),
    };
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
          startAt: { gt: NOW },
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

  it('创建预约时写入预约和每半小时占位', async () => {
    const created = bookingRowFixture({
      id: 'booking-created',
      startAt: new Date('2026-06-01T06:30:00.000Z'),
      endAt: new Date('2026-06-01T08:00:00.000Z'),
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
      startAt: '2026-06-01T06:30:00.000Z',
      endAt: '2026-06-01T08:00:00.000Z',
    });

    expect(prisma.booking.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-stu-cse-01',
        roomId: 'room-gm-301',
        seatId: 'seat-gm-301-c3',
        startAt: new Date('2026-06-01T06:30:00.000Z'),
        endAt: new Date('2026-06-01T08:00:00.000Z'),
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
          slotStart: new Date('2026-06-01T06:30:00.000Z'),
        },
        {
          bookingId: 'booking-created',
          seatId: 'seat-gm-301-c3',
          userId: 'user-stu-cse-01',
          slotStart: new Date('2026-06-01T07:00:00.000Z'),
        },
        {
          bookingId: 'booking-created',
          seatId: 'seat-gm-301-c3',
          userId: 'user-stu-cse-01',
          slotStart: new Date('2026-06-01T07:30:00.000Z'),
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

function bookingRowFixture(input: { id: string; startAt: Date; endAt: Date }) {
  return {
    id: input.id,
    userId: 'user-stu-cse-01',
    roomId: 'room-gm-301',
    seatId: 'seat-gm-301-c3',
    startAt: input.startAt,
    endAt: input.endAt,
    status: 'PENDING_CHECKIN',
    createdAt: new Date('2026-05-30T05:00:00.000Z'),
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
