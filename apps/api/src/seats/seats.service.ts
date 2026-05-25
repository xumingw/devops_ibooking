import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  CreateSeatRequestDto,
  ErrorCode,
  SeatResponseDto,
  SeatStatus,
  UpdateSeatRequestDto,
} from '@ibooking/shared-types';
import { businessError } from '../common/business-error';
import { SeatsStore, seatsStore } from './seats.store';

@Injectable()
export class SeatsService {
  constructor(@Inject('SEATS_STORE') private readonly store: SeatsStore = seatsStore) {}

  list(roomId: string): SeatResponseDto[] {
    return this.store.listByRoom(roomId);
  }

  create(roomId: string, dto: CreateSeatRequestDto): SeatResponseDto {
    this.assertUniqueCode(roomId, dto.code);
    return this.store.create({ roomId, ...dto });
  }

  update(id: string, dto: UpdateSeatRequestDto): SeatResponseDto {
    const existing = this.store.getById(id);
    if (!existing) {
      throw businessError(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND, '座位不存在');
    }

    if (dto.code && dto.code !== existing.code) {
      this.assertUniqueCode(existing.roomId, dto.code);
    }

    return this.store.update(id, dto) as SeatResponseDto;
  }

  updateStatus(id: string, status: SeatStatus): SeatResponseDto {
    const updated = this.store.updateStatus(id, status);
    if (!updated) {
      throw businessError(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND, '座位不存在');
    }
    return updated;
  }

  getActiveSeat(id: string): SeatResponseDto {
    const seat = this.store.getById(id);
    if (!seat) {
      throw businessError(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND, '座位不存在');
    }
    if (seat.status !== 'ACTIVE') {
      throw businessError(HttpStatus.CONFLICT, ErrorCode.SEAT_UNAVAILABLE, '座位不可预约');
    }
    return seat;
  }

  private assertUniqueCode(roomId: string, code: string): void {
    if (this.store.findByRoomAndCode(roomId, code)) {
      throw businessError(
        HttpStatus.CONFLICT,
        ErrorCode.SEAT_CODE_DUPLICATE,
        '同一自习室内座位编号已存在',
      );
    }
  }
}
