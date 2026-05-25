import { BookingResponseDto, MinimalBookingStatus } from '@ibooking/shared-types';

export type BookingRecord = BookingResponseDto;

export interface BookingSlotRecord {
  bookingId: string;
  seatId: string;
  slotStart: string;
}

export class BookingsStore {
  private readonly bookings = new Map<string, BookingRecord>();
  private readonly slots = new Map<string, BookingSlotRecord>();
  private nextId = 1;

  listByUser(userId: string): BookingRecord[] {
    return [...this.bookings.values()].filter((booking) => booking.userId === userId);
  }

  getById(id: string): BookingRecord | undefined {
    return this.bookings.get(id);
  }

  hasSlot(seatId: string, slotStart: string): boolean {
    return this.slots.has(this.slotKey(seatId, slotStart));
  }

  create(input: {
    userId: string;
    roomId: string;
    seatId: string;
    startAt: string;
    endAt: string;
    slots: string[];
  }): BookingRecord {
    const booking: BookingRecord = {
      id: `booking_${this.nextId++}`,
      userId: input.userId,
      roomId: input.roomId,
      seatId: input.seatId,
      startAt: input.startAt,
      endAt: input.endAt,
      status: 'PENDING_CHECKIN',
    };

    this.bookings.set(booking.id, booking);
    for (const slotStart of input.slots) {
      this.slots.set(this.slotKey(input.seatId, slotStart), {
        bookingId: booking.id,
        seatId: input.seatId,
        slotStart,
      });
    }
    return booking;
  }

  updateStatus(id: string, status: MinimalBookingStatus): BookingRecord | undefined {
    const existing = this.bookings.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, status };
    this.bookings.set(id, updated);
    return updated;
  }

  releaseSlots(bookingId: string): void {
    for (const [key, slot] of this.slots.entries()) {
      if (slot.bookingId === bookingId) {
        this.slots.delete(key);
      }
    }
  }

  clear(): void {
    this.bookings.clear();
    this.slots.clear();
    this.nextId = 1;
  }

  private slotKey(seatId: string, slotStart: string): string {
    return `${seatId}:${slotStart}`;
  }
}

export const bookingsStore = new BookingsStore();
export const BOOKINGS_STORE = 'BOOKINGS_STORE';
