import { DemoBooking, Room, SeatCell } from './types';

export const mockRooms: Room[] = [
  {
    id: 'room-gm-301',
    name: '经管自习室 301',
    building: '光华楼 A座',
    floor: 3,
    capacity: 48,
    scopeType: 'SCHOOL',
    departmentId: null,
    openHour: 8,
    closeHour: 22,
    overnight: false,
    status: 'ACTIVE'
  },
  {
    id: 'room-science-201',
    name: '理工自习室 201',
    building: '理科楼',
    floor: 2,
    capacity: 36,
    scopeType: 'SCHOOL',
    departmentId: null,
    openHour: 7,
    closeHour: 24,
    overnight: false,
    status: 'ACTIVE'
  },
  {
    id: 'room-humanities-a',
    name: '文史馆阅览室 A',
    building: '文史馆',
    floor: 1,
    capacity: 72,
    scopeType: 'SCHOOL',
    departmentId: null,
    openHour: 9,
    closeHour: 21,
    overnight: false,
    status: 'ACTIVE'
  },
  {
    id: 'room-cs-lab-b',
    name: '计算机学院自习室 B',
    building: '计算机楼',
    floor: 4,
    capacity: 24,
    scopeType: 'DEPARTMENT',
    departmentId: 'dept-cs',
    openHour: 22,
    closeHour: 7,
    overnight: true,
    status: 'ACTIVE'
  }
];

export const mockBookings: DemoBooking[] = [
  {
    id: 'booking-next',
    room: '经管自习室 301',
    roomId: 'room-gm-301',
    seat: 'C3',
    time: '今日 14:00-17:00',
    status: '待签到',
    statusTone: 'blue'
  },
  {
    id: 'booking-done',
    room: '理工自习室 201',
    roomId: 'room-science-201',
    seat: 'F8',
    time: '昨日 09:00-12:00',
    status: '已完成',
    statusTone: 'green'
  },
  {
    id: 'booking-violation',
    room: '文史馆阅览室 A',
    roomId: 'room-humanities-a',
    seat: 'A5',
    time: '5月20日 14:00-16:00',
    status: '违约',
    statusTone: 'red'
  }
];

const seatRows = ['A', 'B', 'C', 'D'];

export function createSeatGrid(selectedCode = 'C4'): SeatCell[][] {
  return seatRows.map((row, rowIndex) =>
    Array.from({ length: 8 }, (_, columnIndex) => {
      const code = `${row}${columnIndex + 1}`;
      const taken = (rowIndex + columnIndex) % 5 === 0;
      const maintenance = row === 'B' && columnIndex === 3;
      return {
        code,
        status: code === selectedCode ? 'selected' : maintenance ? 'maintenance' : taken ? 'taken' : 'available',
        hasPower: columnIndex === 0 || columnIndex === 4 || row === 'C',
        nearWindow: row === 'A'
      };
    })
  );
}
