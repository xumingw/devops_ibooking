import { PrismaNotificationsRepository } from '../../../src/notifications/prisma-notifications.repository';
import { PrismaService } from '../../../src/database/prisma.service';

const NOW = new Date('2026-05-30T06:00:00.000Z');

describe('PrismaNotificationsRepository', () => {
  let prisma: {
    reminderLog: {
      findMany: jest.Mock;
    };
  };
  let repository: PrismaNotificationsRepository;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
    prisma = {
      reminderLog: {
        findMany: jest.fn(),
      },
    };
    repository = new PrismaNotificationsRepository(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('自动取消未签到通知展示为取消和违约结果', async () => {
    prisma.reminderLog.findMany.mockResolvedValue([
      reminderLogFixture({
        id: 'notice-auto-cancel',
        type: 'AUTO_CANCEL_NO_CHECKIN',
        sentAt: NOW,
      }),
    ]);

    const records = await repository.listByUserId('user-stu-cse-01');

    expect(records).toEqual([
      expect.objectContaining({
        id: 'notice-auto-cancel',
        group: '今天',
        iconType: 'alert',
        tone: 'red',
        title: '预约自动取消',
        description: '开始后 15 分钟未签到，座位已释放并记录一次违约',
        read: false,
      }),
    ]);
  });
});

function reminderLogFixture(input: { id: string; type: string; sentAt: Date }) {
  return {
    ...input,
    bookingId: 'booking-expired',
    channel: 'SYSTEM',
    createdAt: input.sentAt,
    booking: {
      id: 'booking-expired',
      userId: 'user-stu-cse-01',
      roomId: 'room-gm-301',
      seatId: 'seat-gm-301-c3',
      startAt: new Date('2026-05-30T05:44:00.000Z'),
      endAt: new Date('2026-05-30T08:00:00.000Z'),
      status: 'CANCELLED_AUTO_NO_CHECKIN',
      createdAt: new Date('2026-05-30T05:00:00.000Z'),
      updatedAt: input.sentAt,
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
        updatedAt: input.sentAt,
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
        updatedAt: input.sentAt,
      },
    },
  };
}
