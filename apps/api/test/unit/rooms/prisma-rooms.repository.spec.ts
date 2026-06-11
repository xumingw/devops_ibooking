// @story US2.1.1
// @tc TC-US2.1.1-05
import { PrismaRoomsRepository } from '../../../src/rooms/prisma-rooms.repository';
import { PrismaService } from '../../../src/database/prisma.service';

describe('PrismaRoomsRepository unified room queries', () => {
  let prisma: {
    room: {
      findMany: jest.Mock;
    };
    seat: {
      findMany: jest.Mock;
    };
    booking: {
      findMany: jest.Mock;
    };
  };
  let repository: PrismaRoomsRepository;

  beforeEach(() => {
    prisma = {
      room: {
        findMany: jest.fn()
      },
      seat: {
        findMany: jest.fn()
      },
      booking: {
        findMany: jest.fn()
      }
    };
    repository = new PrismaRoomsRepository(prisma as unknown as PrismaService);
  });

  it('从统一 room/seat/department 表生成所有端共用的自习室目录', async () => {
    prisma.room.findMany.mockResolvedValue([
      roomFixture({
        id: 'room-gm-301',
        name: '经管自习室 301',
        building: '光华楼 A座',
        floor: 3,
        capacity: 48,
        openHour: 8,
        closeHour: 22,
        seats: [
          seatFixture('seat-gm-a1', 'A1', { hasPower: true }),
          seatFixture('seat-gm-b1', 'B1', { nearWindow: true }),
          seatFixture('seat-gm-c1', 'C1', { quietZone: true }),
          seatFixture('seat-gm-disabled', 'Z1', { status: 'INACTIVE' })
        ]
      }),
      roomFixture({
        id: 'room-cs-lab-b',
        name: '计算机学院自习室 B',
        building: '计算机楼',
        floor: 4,
        capacity: 24,
        scopeType: 'DEPARTMENT',
        department: { name: '计算机学院' },
        openHour: 22,
        closeHour: 7,
        overnight: true,
        seats: [seatFixture('seat-cs-a1', 'A1', { hasPower: true })]
      })
    ]);

    await expect(repository.listCatalog()).resolves.toEqual([
      {
        id: 'room-gm-301',
        name: '经管自习室 301',
        building: '光华楼 A座',
        floor: '3楼',
        capacity: 3,
        hours: '08:00–22:00',
        scope: '全校开放',
        tags: ['插座', '靠窗', '安静区'],
        resourceStatus: 'ACTIVE'
      },
      {
        id: 'room-cs-lab-b',
        name: '计算机学院自习室 B',
        building: '计算机楼',
        floor: '4楼',
        capacity: 1,
        hours: '22:00–07:00（跨天）',
        scope: '仅计算机学院',
        tags: ['24小时', '插座'],
        resourceStatus: 'ACTIVE'
      }
    ]);
  });

  it('从统一 seat/booking 表按时段 overlap 计算余位', async () => {
    prisma.seat.findMany.mockResolvedValue([
      { id: 'seat-gm-a1', roomId: 'room-gm-301' },
      { id: 'seat-gm-a2', roomId: 'room-gm-301' },
      { id: 'seat-cs-a1', roomId: 'room-cs-lab-b' }
    ]);
    prisma.booking.findMany.mockResolvedValue([
      { roomId: 'room-gm-301', seatId: 'seat-gm-a1' },
      { roomId: 'room-cs-lab-b', seatId: 'seat-cs-a1' },
      { roomId: 'room-cs-lab-b', seatId: 'seat-cs-a1' }
    ]);

    await expect(
      repository.getAvailability(
        new Date('2026-06-09T15:00:00.000Z'),
        new Date('2026-06-09T18:00:00.000Z')
      )
    ).resolves.toEqual({
      totalSeats: 3,
      availableSeats: 1,
      rooms: [
        { roomId: 'room-gm-301', totalSeats: 2, availableSeats: 1 },
        { roomId: 'room-cs-lab-b', totalSeats: 1, availableSeats: 0 }
      ]
    });
  });
});

function roomFixture(input: {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  scopeType?: 'SCHOOL' | 'DEPARTMENT';
  department?: { name: string } | null;
  openHour: number;
  closeHour: number;
  overnight?: boolean;
  seats: Array<ReturnType<typeof seatFixture>>;
}) {
  return {
    id: input.id,
    name: input.name,
    building: input.building,
    floor: input.floor,
    capacity: input.capacity,
    scopeType: input.scopeType ?? 'SCHOOL',
    departmentId: input.scopeType === 'DEPARTMENT' ? 'dept-cs' : null,
    department: input.department ?? null,
    openHour: input.openHour,
    closeHour: input.closeHour,
    overnight: input.overnight ?? false,
    status: 'ACTIVE',
    seats: input.seats
  };
}

function seatFixture(
  id: string,
  code: string,
  options: {
    hasPower?: boolean;
    nearWindow?: boolean;
    quietZone?: boolean;
    status?: 'ACTIVE' | 'INACTIVE';
  } = {}
) {
  return {
    id,
    code,
    roomId: 'room-gm-301',
    x: 1,
    y: 1,
    hasPower: options.hasPower ?? false,
    nearWindow: options.nearWindow ?? false,
    attributes: options.quietZone ? { quietZone: true } : null,
    status: options.status ?? 'ACTIVE'
  };
}
