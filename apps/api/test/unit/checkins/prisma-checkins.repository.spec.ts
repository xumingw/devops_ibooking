import { BadRequestException } from '@nestjs/common';
import { PrismaCheckInsRepository } from '../../../src/checkins/prisma-checkins.repository';
import { PrismaService } from '../../../src/database/prisma.service';

const NOW = new Date('2026-05-30T06:00:00.000Z');

describe('PrismaCheckInsRepository', () => {
  let prisma: {
    booking: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      updateMany: jest.Mock;
      findUnique: jest.Mock;
    };
    bookingSlot: {
      deleteMany: jest.Mock;
    };
    checkInCode: {
      findFirst: jest.Mock;
    };
    reminderLog: {
      create: jest.Mock;
    };
    violation: {
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let repository: PrismaCheckInsRepository;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
    prisma = {
      booking: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
        findUnique: jest.fn(),
      },
      bookingSlot: {
        deleteMany: jest.fn(),
      },
      checkInCode: {
        findFirst: jest.fn(),
      },
      reminderLog: {
        create: jest.fn(),
      },
      violation: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };
    repository = new PrismaCheckInsRepository(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('只查询当前学生 15 分钟签到窗口内的待签到预约', async () => {
    prisma.booking.findMany.mockResolvedValue([bookingRowFixture()]);

    const session = await repository.findCurrentByUserId('user-stu-cse-01');

    expect(session).toMatchObject({
      bookingId: 'booking-current',
      roomId: 'room-gm-301',
      room: '经管自习室 301',
      seat: 'C3',
      remainingSeconds: 600,
      codeLength: 6,
    });
    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'user-stu-cse-01',
          status: 'PENDING_CHECKIN',
          startAt: { lte: new Date('2026-05-30T06:15:00.000Z') },
          endAt: { gt: NOW },
          OR: [
            { startAt: { gt: new Date('2026-05-30T05:45:00.000Z') } },
            { createdAt: { gt: new Date('2026-05-30T05:45:00.000Z') } },
          ],
        },
        orderBy: { startAt: 'asc' },
      }),
    );
  });

  it('当前 slot 预约按订单创建时间保留 15 分钟签到窗口', async () => {
    prisma.booking.findMany.mockResolvedValue([
      bookingRowFixture({
        id: 'booking-current-slot',
        startAt: new Date('2026-05-30T05:30:00.000Z'),
        endAt: new Date('2026-05-30T08:00:00.000Z'),
        createdAt: new Date('2026-05-30T05:55:00.000Z'),
      }),
    ]);

    const session = await repository.findCurrentByUserId('user-stu-cse-01');

    expect(session).toMatchObject({
      bookingId: 'booking-current-slot',
      remainingSeconds: 600,
    });
  });

  it('只接受当前教室有效期内的动态码', async () => {
    prisma.checkInCode.findFirst.mockResolvedValue({ id: 'code-current' });

    await expect(
      repository.verifyCode({ roomId: 'room-gm-301', code: '274159' }),
    ).resolves.toBe(true);
    expect(prisma.checkInCode.findFirst).toHaveBeenCalledWith({
      where: {
        roomId: 'room-gm-301',
        code: '274159',
        validAt: { lte: NOW },
        expiresAt: { gte: NOW },
      },
      select: { id: true },
    });
  });

  it('最终写入签到状态时再次约束学生、状态和签到窗口', async () => {
    prisma.booking.updateMany.mockResolvedValue({ count: 1 });
    prisma.booking.findUnique.mockResolvedValue(bookingRowFixture());

    const result = await repository.markCheckedIn({
      bookingId: 'booking-current',
      userId: 'user-stu-cse-01',
    });

    expect(result).toMatchObject({
      bookingId: 'booking-current',
      room: '经管自习室 301',
      seat: 'C3',
      status: 'CHECKED_IN',
    });
    expect(prisma.booking.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'booking-current',
        userId: 'user-stu-cse-01',
        status: 'PENDING_CHECKIN',
        startAt: { lte: new Date('2026-05-30T06:15:00.000Z') },
        endAt: { gt: NOW },
        OR: [
          { startAt: { gt: new Date('2026-05-30T05:45:00.000Z') } },
          { createdAt: { gt: new Date('2026-05-30T05:45:00.000Z') } },
        ],
      },
      data: { status: 'CHECKED_IN' },
    });
  });

  it('预约已取消或窗口过期时拒绝最终签到写入', async () => {
    prisma.booking.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      repository.markCheckedIn({
        bookingId: 'booking-current',
        userId: 'user-stu-cse-01',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.booking.findUnique).not.toHaveBeenCalled();
  });

  it('自动取消超过开始后 15 分钟仍未签到的预约并记录违约', async () => {
    prisma.booking.findMany.mockResolvedValue([
      bookingRowFixture({
        id: 'booking-expired',
        startAt: new Date('2026-05-30T05:44:00.000Z'),
        endAt: new Date('2026-05-30T08:00:00.000Z'),
      }),
    ]);
    prisma.booking.updateMany.mockResolvedValue({ count: 1 });
    prisma.bookingSlot.deleteMany.mockResolvedValue({ count: 3 });
    prisma.violation.create.mockResolvedValue({ id: 'violation-no-show' });
    prisma.reminderLog.create.mockResolvedValue({ id: 'reminder-auto-cancel' });

    await expect(repository.expireNoShowBookings(NOW)).resolves.toBe(1);

    expect(prisma.booking.findMany).toHaveBeenCalledWith({
      where: {
        status: 'PENDING_CHECKIN',
        startAt: { lte: NOW },
        OR: [
          { startAt: { lte: new Date('2026-05-30T05:45:00.000Z') } },
          { createdAt: { lte: new Date('2026-05-30T05:45:00.000Z') } },
        ],
      },
      include: {
        room: true,
        seat: true,
      },
      orderBy: { startAt: 'asc' },
      take: 100,
    });
    expect(prisma.booking.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'booking-expired',
        status: 'PENDING_CHECKIN',
      },
      data: { status: 'CANCELLED_AUTO_NO_CHECKIN' },
    });
    expect(prisma.bookingSlot.deleteMany).toHaveBeenCalledWith({
      where: { bookingId: 'booking-expired' },
    });
    expect(prisma.violation.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-stu-cse-01',
        bookingId: 'booking-expired',
        roomId: 'room-gm-301',
        seatId: 'seat-gm-301-c3',
        reason: 'NO_CHECK_IN',
        occurredAt: NOW,
      },
    });
    expect(prisma.reminderLog.create).toHaveBeenCalledWith({
      data: {
        bookingId: 'booking-expired',
        type: 'AUTO_CANCEL_NO_CHECKIN',
        channel: 'SYSTEM',
        sentAt: NOW,
      },
    });
  });

  it('当前 slot 订单创建未满 15 分钟不会自动违约', async () => {
    prisma.booking.findMany.mockResolvedValue([
      bookingRowFixture({
        id: 'booking-current-slot',
        startAt: new Date('2026-05-30T05:30:00.000Z'),
        endAt: new Date('2026-05-30T08:00:00.000Z'),
        createdAt: new Date('2026-05-30T05:55:00.000Z'),
      }),
    ]);

    await expect(repository.expireNoShowBookings(NOW)).resolves.toBe(0);

    expect(prisma.booking.updateMany).not.toHaveBeenCalled();
    expect(prisma.violation.create).not.toHaveBeenCalled();
  });
});

function bookingRowFixture(
  input: { id?: string; startAt?: Date; endAt?: Date; createdAt?: Date } = {},
) {
  return {
    id: input.id ?? 'booking-current',
    userId: 'user-stu-cse-01',
    roomId: 'room-gm-301',
    seatId: 'seat-gm-301-c3',
    startAt: input.startAt ?? new Date('2026-05-30T05:55:00.000Z'),
    endAt: input.endAt ?? new Date('2026-05-30T08:00:00.000Z'),
    status: 'PENDING_CHECKIN',
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
