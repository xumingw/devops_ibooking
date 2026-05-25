// @story US2.1.1
// @tc TC-US2.1.1-01
// @tc TC-US2.1.1-02
import { NotFoundException } from '@nestjs/common';
import { ErrorCode, Room, RoomScopeType } from '@ibooking/shared-types';
import {
  RoomRepository,
  RoomsService,
  RoomWriteInput
} from '../../../src/rooms/rooms.service';

class MemoryRoomRepository implements RoomRepository {
  private nextId = 100;
  readonly rooms = new Map<string, Room>();

  constructor(fixtures: Room[]) {
    fixtures.forEach((room) => this.rooms.set(room.id, { ...room }));
  }

  async list(): Promise<Room[]> {
    return Array.from(this.rooms.values()).map((room) => ({ ...room }));
  }

  async findById(id: string): Promise<Room | null> {
    const room = this.rooms.get(id);
    return room ? { ...room } : null;
  }

  async findByName(name: string): Promise<Room | null> {
    const room = Array.from(this.rooms.values()).find((item) => item.name === name);
    return room ? { ...room } : null;
  }

  async create(input: Required<RoomWriteInput>): Promise<Room> {
    const room: Room = {
      id: `room-${this.nextId++}`,
      ...input,
      status: 'ACTIVE'
    };
    this.rooms.set(room.id, room);
    return { ...room };
  }

  async update(id: string, input: Required<RoomWriteInput>): Promise<Room> {
    const current = this.rooms.get(id);
    if (!current) throw new NotFoundException();
    const room = { ...current, ...input };
    this.rooms.set(id, room);
    return { ...room };
  }
}

describe('RoomsService', () => {
  let repository: MemoryRoomRepository;
  let service: RoomsService;

  beforeEach(() => {
    repository = new MemoryRoomRepository([
      roomFixture({
        id: 'room-1',
        name: '经管自习室 301',
        building: '光华楼 A座',
        floor: 3,
        capacity: 48
      }),
      roomFixture({
        id: 'room-2',
        name: '理工自习室 201',
        building: '理科楼',
        floor: 2,
        capacity: 36
      })
    ]);
    service = new RoomsService(repository);
  });

  it('返回自习室列表，供后台管理页展示', async () => {
    const rooms = await service.listRooms();

    expect(rooms.map((room) => room.name)).toEqual(['经管自习室 301', '理工自习室 201']);
  });

  it('新增自习室时写入基础信息和默认开放规则', async () => {
    const room = await service.createRoom({
      name: '新闻学院研讨室 B',
      building: '新闻学院楼',
      floor: 4,
      capacity: 24
    });

    expect(room).toMatchObject({
      name: '新闻学院研讨室 B',
      building: '新闻学院楼',
      floor: 4,
      capacity: 24,
      scopeType: 'SCHOOL',
      departmentId: null,
      openHour: 7,
      closeHour: 22,
      overnight: false,
      status: 'ACTIVE'
    });
  });

  it('拒绝重复的自习室名称', async () => {
    await expect(
      service.createRoom({
        name: '经管自习室 301',
        building: '光华楼 A座',
        floor: 3,
        capacity: 48
      })
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: ErrorCode.ROOM_NAME_DUPLICATE })
    });
  });

  it('编辑自习室时允许保留原名称，但拒绝改成其他已有名称', async () => {
    const updated = await service.updateRoom('room-1', {
      name: '经管自习室 301',
      building: '光华楼 A座',
      floor: 3,
      capacity: 60
    });

    expect(updated.capacity).toBe(60);

    await expect(
      service.updateRoom('room-1', {
        name: '理工自习室 201',
        building: '光华楼 A座',
        floor: 3,
        capacity: 60
      })
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: ErrorCode.ROOM_NAME_DUPLICATE })
    });
  });

  it('拒绝非法容量和非过夜房间的反向开放时间', async () => {
    await expect(
      service.createRoom({
        name: '容量错误房间',
        building: '光华楼',
        floor: 1,
        capacity: 0
      })
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: ErrorCode.PARAM_OUT_OF_RANGE })
    });

    await expect(
      service.createRoom({
        name: '时间错误房间',
        building: '光华楼',
        floor: 1,
        capacity: 20,
        openHour: 22,
        closeHour: 7,
        overnight: false
      })
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: ErrorCode.PARAM_INVALID_RELATION })
    });
  });

  it('编辑不存在的自习室返回 RESOURCE_NOT_FOUND', async () => {
    await expect(service.updateRoom('missing-room', { capacity: 30 })).rejects.toMatchObject({
      response: expect.objectContaining({ code: ErrorCode.RESOURCE_NOT_FOUND })
    });
  });
});

function roomFixture(input: {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  scopeType?: RoomScopeType;
}): Room {
  return {
    id: input.id,
    name: input.name,
    building: input.building,
    floor: input.floor,
    capacity: input.capacity,
    scopeType: input.scopeType ?? 'SCHOOL',
    departmentId: null,
    openHour: 7,
    closeHour: 22,
    overnight: false,
    status: 'ACTIVE'
  };
}
