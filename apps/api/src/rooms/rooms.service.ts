import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import {
  ErrorCode,
  Room,
  RoomAvailabilitySummary,
  RoomCatalogItem,
  RoomScopeType
} from '@ibooking/shared-types';

export const ROOM_REPOSITORY = 'ROOM_REPOSITORY';

export type RoomWriteInput = {
  name: string;
  building: string;
  floor: number;
  capacity: number;
  scopeType?: RoomScopeType;
  departmentId?: string | null;
  openHour?: number;
  closeHour?: number;
  overnight?: boolean;
};

export type RoomUpdateInput = Partial<RoomWriteInput>;
export type NormalizedRoomInput = Required<RoomWriteInput>;

export interface RoomRepository {
  list(): Promise<Room[]>;
  listCatalog(): Promise<RoomCatalogItem[]>;
  getAvailability(startAt: Date, endAt: Date): Promise<RoomAvailabilitySummary>;
  findById(id: string): Promise<Room | null>;
  findByName(name: string): Promise<Room | null>;
  create(input: NormalizedRoomInput): Promise<Room>;
  update(id: string, input: NormalizedRoomInput): Promise<Room>;
}

@Injectable()
export class RoomsService {
  constructor(@Inject(ROOM_REPOSITORY) private readonly repository: RoomRepository) {}

  async listRooms(): Promise<Room[]> {
    const rooms = await this.repository.list();
    return rooms.sort((left, right) => left.name.localeCompare(right.name, 'zh-Hans-CN'));
  }

  async listRoomCatalog(): Promise<RoomCatalogItem[]> {
    const rooms = await this.repository.listCatalog();
    return rooms.sort((left, right) => {
      const buildingOrder = left.building.localeCompare(right.building, 'zh-Hans-CN');
      if (buildingOrder !== 0) return buildingOrder;
      const floorOrder = Number.parseInt(left.floor, 10) - Number.parseInt(right.floor, 10);
      if (floorOrder !== 0) return floorOrder;
      return left.name.localeCompare(right.name, 'zh-Hans-CN');
    });
  }

  getRoomAvailability(input: { startAt: string; endAt: string }): Promise<RoomAvailabilitySummary> {
    const startAt = this.parseDate(input.startAt, '开始时间');
    const endAt = this.parseDate(input.endAt, '结束时间');
    if (endAt <= startAt) {
      throw new BadRequestException({
        code: ErrorCode.PARAM_INVALID_RELATION,
        message: '结束时间必须晚于开始时间'
      });
    }
    return this.repository.getAvailability(startAt, endAt);
  }

  async createRoom(input: RoomWriteInput): Promise<Room> {
    const normalized = this.normalizeCreate(input);
    await this.assertNameAvailable(normalized.name);
    return this.repository.create(normalized);
  }

  async updateRoom(id: string, input: RoomUpdateInput): Promise<Room> {
    const current = await this.repository.findById(id);
    if (!current) throw this.notFound();

    const normalized = this.normalizeUpdate(current, input);
    await this.assertNameAvailable(normalized.name, id);
    return this.repository.update(id, normalized);
  }

  private normalizeCreate(input: RoomWriteInput): NormalizedRoomInput {
    return this.validateRoom({
      name: this.normalizeRequiredText(input.name, '自习室名称'),
      building: this.normalizeRequiredText(input.building, '楼宇'),
      floor: input.floor,
      capacity: input.capacity,
      scopeType: input.scopeType ?? 'SCHOOL',
      departmentId: input.departmentId ?? null,
      openHour: input.openHour ?? 7,
      closeHour: input.closeHour ?? 22,
      overnight: input.overnight ?? false
    });
  }

  private normalizeUpdate(current: Room, input: RoomUpdateInput): NormalizedRoomInput {
    return this.validateRoom({
      name:
        input.name === undefined
          ? current.name
          : this.normalizeRequiredText(input.name, '自习室名称'),
      building:
        input.building === undefined
          ? current.building
          : this.normalizeRequiredText(input.building, '楼宇'),
      floor: input.floor ?? current.floor,
      capacity: input.capacity ?? current.capacity,
      scopeType: input.scopeType ?? current.scopeType,
      departmentId: input.departmentId === undefined ? current.departmentId : input.departmentId,
      openHour: input.openHour ?? current.openHour,
      closeHour: input.closeHour ?? current.closeHour,
      overnight: input.overnight ?? current.overnight
    });
  }

  private validateRoom(input: NormalizedRoomInput): NormalizedRoomInput {
    const floor = this.assertIntegerInRange(input.floor, 0, 99, '楼层');
    const capacity = this.assertIntegerInRange(input.capacity, 1, 1000, '座位数');
    const openHour = this.assertIntegerInRange(input.openHour, 0, 23, '开放开始小时');
    const closeHour = this.assertIntegerInRange(input.closeHour, 1, 24, '开放结束小时');
    const departmentId = this.normalizeDepartment(input.scopeType, input.departmentId);

    if (input.overnight ? openHour <= closeHour : openHour >= closeHour) {
      throw new BadRequestException({
        code: ErrorCode.PARAM_INVALID_RELATION,
        message: input.overnight
          ? '过夜自习室的结束小时必须早于开始小时'
          : '非过夜自习室的结束小时必须晚于开始小时'
      });
    }

    return {
      ...input,
      floor,
      capacity,
      openHour,
      closeHour,
      departmentId
    };
  }

  private normalizeRequiredText(value: string, label: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: `${label}不能为空`
      });
    }
    return value.trim();
  }

  private assertIntegerInRange(value: number, min: number, max: number, label: string): number {
    if (!Number.isInteger(value) || value < min || value > max) {
      throw new BadRequestException({
        code: ErrorCode.PARAM_OUT_OF_RANGE,
        message: `${label}必须在 ${min}-${max} 范围内`
      });
    }
    return value;
  }

  private parseDate(value: string, label: string): Date {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: `${label}无效`
      });
    }
    return date;
  }

  private normalizeDepartment(scopeType: RoomScopeType, departmentId: string | null): string | null {
    if (scopeType === 'SCHOOL') return null;
    const normalized = departmentId?.trim();
    if (!normalized) {
      throw new BadRequestException({
        code: ErrorCode.PARAM_INVALID_RELATION,
        message: '院系自习室必须关联院系'
      });
    }
    return normalized;
  }

  private async assertNameAvailable(name: string, currentRoomId?: string): Promise<void> {
    const sameNameRoom = await this.repository.findByName(name);
    if (sameNameRoom && sameNameRoom.id !== currentRoomId) {
      throw new ConflictException({
        code: ErrorCode.ROOM_NAME_DUPLICATE,
        message: '自习室名称已存在'
      });
    }
  }

  private notFound(): NotFoundException {
    return new NotFoundException({
      code: ErrorCode.RESOURCE_NOT_FOUND,
      message: '自习室不存在'
    });
  }
}
