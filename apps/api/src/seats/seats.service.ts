import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ErrorCode, ResourceStatus, Seat } from '@ibooking/shared-types';

export const SEAT_REPOSITORY = 'SEAT_REPOSITORY';

export type SeatWriteInput = {
  roomId: string;
  code: string;
  x: number;
  y: number;
  hasPower?: boolean;
  nearWindow?: boolean;
  quietZone?: boolean;
  status?: ResourceStatus;
};

export type SeatUpdateInput = Partial<SeatWriteInput>;
export type NormalizedSeatInput = Required<SeatWriteInput>;

export interface SeatRepository {
  list(roomId?: string): Promise<Seat[]>;
  findById(id: string): Promise<Seat | null>;
  findByRoomAndCode(roomId: string, code: string): Promise<Seat | null>;
  roomExists(roomId: string): Promise<boolean>;
  create(input: NormalizedSeatInput): Promise<Seat>;
  update(id: string, input: NormalizedSeatInput): Promise<Seat>;
}

@Injectable()
export class SeatsService {
  constructor(@Inject(SEAT_REPOSITORY) private readonly repository: SeatRepository) {}

  async listSeats(roomId?: string): Promise<Seat[]> {
    const normalizedRoomId = roomId?.trim();
    const seats = await this.repository.list(normalizedRoomId || undefined);
    return seats.sort((left, right) => {
      const roomCompare = (left.roomName ?? '').localeCompare(right.roomName ?? '', 'zh-Hans-CN');
      if (roomCompare !== 0) return roomCompare;
      return left.code.localeCompare(right.code, 'zh-Hans-CN', { numeric: true });
    });
  }

  async createSeat(input: SeatWriteInput): Promise<Seat> {
    const normalized = this.normalizeCreate(input);
    await this.assertRoomExists(normalized.roomId);
    await this.assertCodeAvailable(normalized.roomId, normalized.code);
    return this.repository.create(normalized);
  }

  async updateSeat(id: string, input: SeatUpdateInput): Promise<Seat> {
    const current = await this.repository.findById(id);
    if (!current) throw this.seatNotFound();

    const normalized = this.normalizeUpdate(current, input);
    await this.assertRoomExists(normalized.roomId);
    await this.assertCodeAvailable(normalized.roomId, normalized.code, id);
    return this.repository.update(id, normalized);
  }

  private normalizeCreate(input: SeatWriteInput): NormalizedSeatInput {
    return this.validateSeat({
      roomId: this.normalizeRequiredText(input.roomId, '自习室'),
      code: this.normalizeRequiredText(input.code, '座位编号'),
      x: input.x,
      y: input.y,
      hasPower: input.hasPower ?? false,
      nearWindow: input.nearWindow ?? false,
      quietZone: input.quietZone ?? false,
      status: input.status ?? 'ACTIVE'
    });
  }

  private normalizeUpdate(current: Seat, input: SeatUpdateInput): NormalizedSeatInput {
    return this.validateSeat({
      roomId:
        input.roomId === undefined
          ? current.roomId
          : this.normalizeRequiredText(input.roomId, '自习室'),
      code:
        input.code === undefined ? current.code : this.normalizeRequiredText(input.code, '座位编号'),
      x: input.x ?? current.x,
      y: input.y ?? current.y,
      hasPower: input.hasPower ?? current.hasPower,
      nearWindow: input.nearWindow ?? current.nearWindow,
      quietZone: input.quietZone ?? current.quietZone ?? false,
      status: input.status ?? current.status
    });
  }

  private validateSeat(input: NormalizedSeatInput): NormalizedSeatInput {
    const x = this.assertIntegerInRange(input.x, 0, 10000, '座位 X 坐标');
    const y = this.assertIntegerInRange(input.y, 0, 10000, '座位 Y 坐标');
    if (!['ACTIVE', 'INACTIVE'].includes(input.status)) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: '座位状态不合法'
      });
    }
    return { ...input, x, y };
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

  private async assertRoomExists(roomId: string): Promise<void> {
    const exists = await this.repository.roomExists(roomId);
    if (!exists) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: '自习室不存在'
      });
    }
  }

  private async assertCodeAvailable(
    roomId: string,
    code: string,
    currentSeatId?: string
  ): Promise<void> {
    const sameCodeSeat = await this.repository.findByRoomAndCode(roomId, code);
    if (sameCodeSeat && sameCodeSeat.id !== currentSeatId) {
      throw new ConflictException({
        code: ErrorCode.SEAT_CODE_DUPLICATE,
        message: '同一自习室内座位编号已存在'
      });
    }
  }

  private seatNotFound(): NotFoundException {
    return new NotFoundException({
      code: ErrorCode.RESOURCE_NOT_FOUND,
      message: '座位不存在'
    });
  }
}
