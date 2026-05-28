// @story US2.2.1
// @tc TC-US2.2.1-01
// @story US2.3.1
// @tc TC-US2.3.1-01
import { NotFoundException } from '@nestjs/common';
import { ErrorCode, Seat } from '@ibooking/shared-types';
import {
  NormalizedSeatInput,
  SeatRepository,
  SeatsService
} from '../../../src/seats/seats.service';

class MemorySeatRepository implements SeatRepository {
  private nextId = 100;
  readonly seats = new Map<string, Seat>();
  readonly roomIds = new Set(['room-1', 'room-2']);

  constructor(fixtures: Seat[]) {
    fixtures.forEach((seat) => this.seats.set(seat.id, { ...seat }));
  }

  async list(roomId?: string): Promise<Seat[]> {
    return Array.from(this.seats.values())
      .filter((seat) => !roomId || seat.roomId === roomId)
      .map((seat) => ({ ...seat }));
  }

  async findById(id: string): Promise<Seat | null> {
    const seat = this.seats.get(id);
    return seat ? { ...seat } : null;
  }

  async findByRoomAndCode(roomId: string, code: string): Promise<Seat | null> {
    const seat = Array.from(this.seats.values()).find(
      (item) => item.roomId === roomId && item.code === code
    );
    return seat ? { ...seat } : null;
  }

  async roomExists(roomId: string): Promise<boolean> {
    return this.roomIds.has(roomId);
  }

  async create(input: NormalizedSeatInput): Promise<Seat> {
    const seat: Seat = {
      id: `seat-${this.nextId++}`,
      ...input
    };
    this.seats.set(seat.id, seat);
    return { ...seat };
  }

  async update(id: string, input: NormalizedSeatInput): Promise<Seat> {
    const current = this.seats.get(id);
    if (!current) throw new NotFoundException();
    const seat = { ...current, ...input };
    this.seats.set(id, seat);
    return { ...seat };
  }
}

describe('SeatsService', () => {
  let repository: MemorySeatRepository;
  let service: SeatsService;

  beforeEach(() => {
    repository = new MemorySeatRepository([
      seatFixture({
        id: 'seat-2',
        roomId: 'room-1',
        roomName: '经管自习室 301',
        code: 'A002',
        x: 140,
        y: 80,
        nearWindow: true
      }),
      seatFixture({
        id: 'seat-1',
        roomId: 'room-1',
        roomName: '经管自习室 301',
        code: 'A001',
        x: 80,
        y: 80,
        hasPower: true
      }),
      seatFixture({
        id: 'seat-3',
        roomId: 'room-2',
        roomName: '理工自习室 201',
        code: 'B001',
        x: 80,
        y: 120,
        status: 'INACTIVE'
      })
    ]);
    service = new SeatsService(repository);
  });

  it('返回座位列表并按自习室和座位编号排序，供后台座位管理页展示', async () => {
    const seats = await service.listSeats();

    expect(seats.map((seat) => `${seat.roomName}:${seat.code}`)).toEqual([
      '经管自习室 301:A001',
      '经管自习室 301:A002',
      '理工自习室 201:B001'
    ]);
  });

  it('新增座位时校验所属自习室并写入默认属性', async () => {
    const seat = await service.createSeat({
      roomId: 'room-1',
      code: ' A010 ',
      x: 220,
      y: 120
    });

    expect(seat).toMatchObject({
      roomId: 'room-1',
      code: 'A010',
      x: 220,
      y: 120,
      hasPower: false,
      nearWindow: false,
      quietZone: false,
      status: 'ACTIVE'
    });
  });

  it('拒绝同一自习室内重复座位编号，但允许不同自习室使用同一编号', async () => {
    await expect(
      service.createSeat({
        roomId: 'room-1',
        code: 'A001',
        x: 240,
        y: 120
      })
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: ErrorCode.SEAT_CODE_DUPLICATE })
    });

    await expect(
      service.createSeat({
        roomId: 'room-2',
        code: 'A001',
        x: 240,
        y: 120
      })
    ).resolves.toMatchObject({ roomId: 'room-2', code: 'A001' });
  });

  it('编辑座位时允许保留原编号，并可更新状态和座位属性', async () => {
    const updated = await service.updateSeat('seat-1', {
      code: 'A001',
      hasPower: false,
      nearWindow: true,
      quietZone: true,
      status: 'INACTIVE'
    });

    expect(updated).toMatchObject({
      id: 'seat-1',
      code: 'A001',
      hasPower: false,
      nearWindow: true,
      quietZone: true,
      status: 'INACTIVE'
    });
  });

  it('编辑座位时拒绝改成同房间其他已有编号', async () => {
    await expect(service.updateSeat('seat-1', { code: 'A002' })).rejects.toMatchObject({
      response: expect.objectContaining({ code: ErrorCode.SEAT_CODE_DUPLICATE })
    });
  });

  it('拒绝不存在的自习室、非法坐标和不存在的座位', async () => {
    await expect(
      service.createSeat({
        roomId: 'missing-room',
        code: 'A020',
        x: 120,
        y: 80
      })
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: ErrorCode.RESOURCE_NOT_FOUND })
    });

    await expect(
      service.createSeat({
        roomId: 'room-1',
        code: 'A020',
        x: -1,
        y: 80
      })
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: ErrorCode.PARAM_OUT_OF_RANGE })
    });

    await expect(service.updateSeat('missing-seat', { code: 'A030' })).rejects.toMatchObject({
      response: expect.objectContaining({ code: ErrorCode.RESOURCE_NOT_FOUND })
    });
  });
});

function seatFixture(input: {
  id: string;
  roomId: string;
  roomName: string;
  code: string;
  x: number;
  y: number;
  hasPower?: boolean;
  nearWindow?: boolean;
  quietZone?: boolean;
  status?: Seat['status'];
}): Seat {
  return {
    id: input.id,
    roomId: input.roomId,
    roomName: input.roomName,
    code: input.code,
    x: input.x,
    y: input.y,
    hasPower: input.hasPower ?? false,
    nearWindow: input.nearWindow ?? false,
    quietZone: input.quietZone ?? false,
    status: input.status ?? 'ACTIVE'
  };
}
