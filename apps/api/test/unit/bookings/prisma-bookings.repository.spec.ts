import { PrismaBookingsRepository } from '../../../src/bookings/prisma-bookings.repository';
import { PrismaService } from '../../../src/database/prisma.service';

const NOW = new Date('2026-05-30T06:00:00.000Z');

describe('PrismaBookingsRepository', () => {
  let prisma: {
    booking: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      updateMany: jest.Mock;
    };
    bookingSlot: {
      deleteMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let repository: PrismaBookingsRepository;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
    prisma = {
      booking: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
      bookingSlot: {
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
