import { PrismaStudentHomeRepository } from '../../../src/student-home/prisma-student-home.repository';
import { PrismaService } from '../../../src/database/prisma.service';

const NOW = new Date('2026-06-09T04:12:00.000Z');

describe('PrismaStudentHomeRepository', () => {
  let prisma: {
    seat: {
      count: jest.Mock;
      findMany: jest.Mock;
    };
    bookingSlot: {
      count: jest.Mock;
    };
    booking: {
      count: jest.Mock;
      findMany: jest.Mock;
    };
    favorite: {
      findMany: jest.Mock;
    };
  };
  let repository: PrismaStudentHomeRepository;

  beforeEach(() => {
    prisma = {
      seat: {
        count: jest.fn(),
        findMany: jest.fn()
      },
      bookingSlot: {
        count: jest.fn()
      },
      booking: {
        count: jest.fn(),
        findMany: jest.fn()
      },
      favorite: {
        findMany: jest.fn()
      }
    };
    repository = new PrismaStudentHomeRepository(prisma as unknown as PrismaService);
  });

  it('按真实座位、预约、收藏和完成记录聚合学生首页数据', async () => {
    prisma.seat.count.mockResolvedValue(207);
    prisma.bookingSlot.count.mockResolvedValueOnce(9).mockResolvedValueOnce(21);
    prisma.booking.count.mockResolvedValue(2);
    prisma.favorite.findMany.mockResolvedValue([
      favoriteFixture('room-gm-301', '经管自习室 301'),
      favoriteFixture('room-science-201', '理工自习室 201')
    ]);
    prisma.booking.findMany.mockResolvedValue([
      bookingFixture({
        id: 'booking-current-week-monday',
        startAt: new Date('2026-06-08T01:00:00.000Z'),
        endAt: new Date('2026-06-08T03:00:00.000Z'),
        status: 'COMPLETED'
      }),
      bookingFixture({
        id: 'booking-current-week-tuesday',
        startAt: new Date('2026-06-09T02:00:00.000Z'),
        endAt: new Date('2026-06-09T03:30:00.000Z'),
        status: 'CHECKED_IN'
      }),
      bookingFixture({
        id: 'booking-last-week',
        startAt: new Date('2026-06-03T01:00:00.000Z'),
        endAt: new Date('2026-06-03T03:00:00.000Z'),
        status: 'COMPLETED'
      })
    ]);

    await expect(repository.getSummary('user-stu-cse-01', NOW)).resolves.toEqual({
      totalSeats: 207,
      availableSeats: 198,
      availableSeatsDeltaPercent: 6,
      todayBookingCount: 2,
      dailyBookingLimit: 3,
      favoriteRooms: [
        { roomId: 'room-gm-301', room: '经管自习室 301' },
        { roomId: 'room-science-201', room: '理工自习室 201' }
      ],
      weekStudyHours: 3.5,
      lastWeekStudyHours: 2,
      weekRecords: [
        { day: '一', hours: 2 },
        { day: '二', hours: 1.5 },
        { day: '三', hours: 0 },
        { day: '四', hours: 0 },
        { day: '五', hours: 0 },
        { day: '六', hours: 0 },
        { day: '日', hours: 0 }
      ]
    });
  });

  it('按同一座位表口径返回每间自习室容量和指定时段空余数', async () => {
    prisma.seat.findMany.mockResolvedValue([
      seatFixture('seat-gm-a1', 'room-gm-301'),
      seatFixture('seat-gm-a2', 'room-gm-301'),
      seatFixture('seat-science-b1', 'room-science-201'),
      seatFixture('seat-science-b2', 'room-science-201'),
      seatFixture('seat-science-b3', 'room-science-201')
    ]);
    prisma.booking.findMany.mockResolvedValue([
      { roomId: 'room-gm-301', seatId: 'seat-gm-a1' },
      { roomId: 'room-science-201', seatId: 'seat-science-b2' },
      { roomId: 'room-science-201', seatId: 'seat-science-b2' }
    ]);

    await expect(
      repository.getRoomAvailability(
        new Date('2026-06-09T06:00:00.000Z'),
        new Date('2026-06-09T08:00:00.000Z')
      )
    ).resolves.toEqual({
      totalSeats: 5,
      availableSeats: 3,
      rooms: [
        { roomId: 'room-gm-301', totalSeats: 2, availableSeats: 1 },
        { roomId: 'room-science-201', totalSeats: 3, availableSeats: 2 }
      ]
    });
  });
});

function favoriteFixture(roomId: string, room: string) {
  return {
    roomId,
    room: {
      id: roomId,
      name: room
    }
  };
}

function seatFixture(id: string, roomId: string) {
  return {
    id,
    roomId
  };
}

function bookingFixture(input: {
  id: string;
  startAt: Date;
  endAt: Date;
  status: 'COMPLETED' | 'CHECKED_IN';
}) {
  return {
    id: input.id,
    userId: 'user-stu-cse-01',
    roomId: 'room-gm-301',
    seatId: 'seat-gm-301-c3',
    startAt: input.startAt,
    endAt: input.endAt,
    status: input.status,
    createdAt: input.startAt,
    updatedAt: input.endAt
  };
}
