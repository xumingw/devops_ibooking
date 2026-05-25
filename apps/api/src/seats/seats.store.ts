import { SeatResponseDto, SeatStatus } from '@ibooking/shared-types';

export type SeatRecord = SeatResponseDto;

export class SeatsStore {
  private readonly seats = new Map<string, SeatRecord>();
  private nextId = 1;

  listByRoom(roomId: string): SeatRecord[] {
    return [...this.seats.values()].filter((seat) => seat.roomId === roomId);
  }

  getById(id: string): SeatRecord | undefined {
    return this.seats.get(id);
  }

  findByRoomAndCode(roomId: string, code: string): SeatRecord | undefined {
    return [...this.seats.values()].find((seat) => seat.roomId === roomId && seat.code === code);
  }

  create(input: { roomId: string; code: string; x: number; y: number }): SeatRecord {
    const seat: SeatRecord = {
      id: `seat_${this.nextId++}`,
      roomId: input.roomId,
      code: input.code,
      x: input.x,
      y: input.y,
      status: 'ACTIVE',
    };
    this.seats.set(seat.id, seat);
    return seat;
  }

  update(id: string, input: Partial<Pick<SeatRecord, 'code' | 'x' | 'y'>>): SeatRecord | undefined {
    const existing = this.seats.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...input };
    this.seats.set(id, updated);
    return updated;
  }

  updateStatus(id: string, status: SeatStatus): SeatRecord | undefined {
    const existing = this.seats.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, status };
    this.seats.set(id, updated);
    return updated;
  }

  clear(): void {
    this.seats.clear();
    this.nextId = 1;
  }
}

export const seatsStore = new SeatsStore();
export const SEATS_STORE = 'SEATS_STORE';
