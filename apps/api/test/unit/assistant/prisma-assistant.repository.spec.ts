import { PrismaAssistantRepository } from '../../../src/assistant/prisma-assistant.repository';
import { PrismaService } from '../../../src/database/prisma.service';

const NOW = new Date('2026-05-30T10:00:00.000Z');

describe('PrismaAssistantRepository', () => {
  let prisma: {
    seat: {
      findMany: jest.Mock;
    };
    booking: {
      findMany: jest.Mock;
    };
  };
  let repository: PrismaAssistantRepository;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
    prisma = {
      seat: {
        findMany: jest.fn()
      },
      booking: {
        findMany: jest.fn()
      }
    };
    repository = new PrismaAssistantRepository(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('查询可用座位时过滤院系范围、座位标签和时段冲突', async () => {
    prisma.seat.findMany.mockResolvedValue([
      seatRowFixture({
        id: 'seat-available',
        code: 'C3',
        hasPower: true,
        nearWindow: true
      })
    ]);

    const seats = await repository.findAvailableSeats({
      userId: 'user-stu-cse-01',
      departmentId: 'dept-cs',
      filters: { hasPower: true, nearWindow: true, quietZone: false },
      timeRange: {
        startAt: new Date('2026-05-30T10:00:00.000Z'),
        endAt: new Date('2026-05-30T12:00:00.000Z')
      },
      timeLabel: '今天晚上'
    });

    expect(seats).toEqual([
      expect.objectContaining({
        seatId: 'seat-available',
        seat: 'C3',
        room: '经管自习室 301',
        tags: ['插座', '靠窗']
      })
    ]);
    expect(prisma.seat.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          hasPower: true,
          nearWindow: true,
          room: expect.objectContaining({
            OR: [{ scopeType: 'SCHOOL' }, { scopeType: 'DEPARTMENT', departmentId: 'dept-cs' }]
          }),
          bookings: {
            none: {
              status: { in: ['PENDING_CHECKIN', 'CHECKED_IN'] },
              startAt: { lt: new Date('2026-05-30T12:00:00.000Z') },
              endAt: { gt: new Date('2026-05-30T10:00:00.000Z') }
            }
          }
        }),
        include: {
          room: {
            include: {
              schedules: expect.objectContaining({
                take: 1
              })
            }
          }
        }
      })
    );
    expect(prisma.seat.findMany.mock.calls[0][0]).not.toHaveProperty('take');
  });

  it('推荐座位时排除目标日期闭馆的自习室', async () => {
    prisma.seat.findMany.mockResolvedValue([
      seatRowFixture({
        id: 'seat-closed',
        code: 'A1',
        hasPower: true,
        nearWindow: false,
        schedules: [
          {
            id: 'schedule-closed',
            roomId: 'room-gm-301',
            date: new Date('2026-05-30T00:00:00.000Z'),
            openHour: 8,
            closeHour: 22,
            closed: true,
            reason: '维护闭馆',
            createdAt: new Date('2026-05-30T05:00:00.000Z'),
            updatedAt: new Date('2026-05-30T05:00:00.000Z')
          }
        ]
      })
    ]);

    const seats = await repository.findAvailableSeats({
      userId: 'user-stu-cse-01',
      departmentId: null,
      filters: { hasPower: false, nearWindow: false, quietZone: false },
      timeRange: {
        startAt: new Date('2026-05-30T10:00:00.000Z'),
        endAt: new Date('2026-05-30T12:00:00.000Z')
      },
      timeLabel: '今天 10:00-12:00'
    });

    expect(seats).toEqual([]);
  });

  it('推荐座位时不会因为预取候选上限漏掉后续开放自习室', async () => {
    const closedRows = Array.from({ length: 20 }, (_, index) =>
      seatRowFixture({
        id: `seat-closed-${index + 1}`,
        code: `A${String(index + 1).padStart(2, '0')}`,
        hasPower: false,
        nearWindow: false,
        schedules: [closedScheduleFixture(`schedule-closed-${index + 1}`)]
      })
    );
    const availableAfterClosedRows = seatRowFixture({
      id: 'seat-open-after-closed-limit',
      code: 'B01',
      hasPower: false,
      nearWindow: false
    });
    const rows = [...closedRows, availableAfterClosedRows];

    prisma.seat.findMany.mockImplementation((args: { take?: number }) =>
      Promise.resolve(typeof args.take === 'number' ? rows.slice(0, args.take) : rows)
    );

    const seats = await repository.findAvailableSeats({
      userId: 'user-stu-cse-01',
      departmentId: null,
      filters: { hasPower: false, nearWindow: false, quietZone: false },
      timeRange: {
        startAt: new Date('2026-05-30T10:00:00.000Z'),
        endAt: new Date('2026-05-30T12:00:00.000Z')
      },
      timeLabel: '今天 10:00-12:00'
    });

    expect(seats).toEqual([
      expect.objectContaining({
        seatId: 'seat-open-after-closed-limit',
        seat: 'B01'
      })
    ]);
  });

  it('我的预约查询只读取当前用户指定日期内的预约并映射快捷动作', async () => {
    prisma.booking.findMany.mockResolvedValue([
      bookingRowFixture({
        id: 'booking-current',
        status: 'PENDING_CHECKIN',
        startAt: new Date('2026-05-30T09:50:00.000Z'),
        endAt: new Date('2026-05-30T12:00:00.000Z')
      }),
      bookingRowFixture({
        id: 'booking-future',
        status: 'PENDING_CHECKIN',
        startAt: new Date('2026-05-30T11:00:00.000Z'),
        endAt: new Date('2026-05-30T13:00:00.000Z')
      })
    ]);

    const bookings = await repository.listBookingsByUserId({
      userId: 'user-stu-cse-01',
      targetDate: new Date('2026-05-30T00:00:00.000Z'),
      dateLabel: '今天'
    });

    expect(bookings).toEqual([
      expect.objectContaining({
        bookingId: 'booking-current',
        room: '经管自习室 301',
        seat: 'C3',
        status: 'upcoming',
        actions: ['CHECK_IN', 'DETAIL']
      }),
      expect.objectContaining({
        bookingId: 'booking-future',
        actions: ['CANCEL', 'DETAIL']
      })
    ]);
    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user-stu-cse-01',
          startAt: expect.objectContaining({
            gte: expect.any(Date),
            lt: expect.any(Date)
          })
        })
      })
    );
  });
});

function seatRowFixture(input: {
  id: string;
  code: string;
  hasPower: boolean;
  nearWindow: boolean;
  schedules?: Array<{
    id: string;
    roomId: string;
    date: Date;
    openHour: number;
    closeHour: number;
    closed: boolean;
    reason: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
}) {
  return {
    ...input,
    roomId: 'room-gm-301',
    x: 3,
    y: 3,
    attributes: null,
    status: 'ACTIVE',
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
      schedules: input.schedules ?? []
    }
  };
}

function closedScheduleFixture(id: string) {
  return {
    id,
    roomId: 'room-gm-301',
    date: new Date('2026-05-30T00:00:00.000Z'),
    openHour: 8,
    closeHour: 22,
    closed: true,
    reason: '维护闭馆',
    createdAt: new Date('2026-05-30T05:00:00.000Z'),
    updatedAt: new Date('2026-05-30T05:00:00.000Z')
  };
}

function bookingRowFixture(input: {
  id: string;
  status: 'PENDING_CHECKIN';
  startAt: Date;
  endAt: Date;
}) {
  return {
    id: input.id,
    userId: 'user-stu-cse-01',
    roomId: 'room-gm-301',
    seatId: 'seat-gm-301-c3',
    startAt: input.startAt,
    endAt: input.endAt,
    status: input.status,
    createdAt: new Date('2026-05-30T05:00:00.000Z'),
    updatedAt: new Date('2026-05-30T05:00:00.000Z'),
    room: {
      id: 'room-gm-301',
      name: '经管自习室 301',
      building: '光华楼 A座',
      floor: 3
    },
    seat: {
      id: 'seat-gm-301-c3',
      code: 'C3',
      hasPower: true,
      nearWindow: true,
      attributes: null
    }
  };
}
