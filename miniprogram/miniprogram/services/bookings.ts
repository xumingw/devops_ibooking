import { mockBookings } from './mock-data';
import { DemoBooking } from './types';

const LOCAL_BOOKINGS_KEY = 'ibooking.localBookings';

export function loadBookings(): DemoBooking[] {
  const local = wx.getStorageSync<DemoBooking[]>(LOCAL_BOOKINGS_KEY);
  return Array.isArray(local) ? [...local, ...mockBookings] : mockBookings;
}

export function addDemoBooking(input: { room: string; roomId: string; seat: string }): DemoBooking {
  const booking: DemoBooking = {
    id: `booking-${Date.now()}`,
    room: input.room,
    roomId: input.roomId,
    seat: input.seat,
    time: '今日 14:00-17:00',
    status: '待签到',
    statusTone: 'blue'
  };
  const local = wx.getStorageSync<DemoBooking[]>(LOCAL_BOOKINGS_KEY);
  wx.setStorageSync(LOCAL_BOOKINGS_KEY, [booking, ...(Array.isArray(local) ? local : [])]);
  return booking;
}
