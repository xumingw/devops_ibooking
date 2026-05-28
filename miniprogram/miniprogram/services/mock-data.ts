import { DemoBooking, DemoNotification, DemoViolationRecord, Room, SeatCell } from './types';

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

export const mockNotifications: DemoNotification[] = [
  {
    id: 'notice-booking-start',
    group: '今天',
    iconType: 'bell',
    tone: 'teal',
    title: '预约提醒',
    description: '您今日 14:00 在经管自习室 301 的预约将在 30 分钟后开始',
    timeLabel: '13:30',
    read: false,
    targetMode: 'reLaunch',
    targetUrl: '/pages/bookings/bookings'
  },
  {
    id: 'notice-checkin-late',
    group: '今天',
    iconType: 'clock',
    tone: 'gold',
    title: '未签到提醒',
    description: '预约已开始 10 分钟，请尽快完成签到',
    timeLabel: '14:10',
    read: false,
    targetMode: 'navigateTo',
    targetUrl: '/pages/checkin/checkin?roomId=room-gm-301&room=%E7%BB%8F%E7%AE%A1%E8%87%AA%E4%B9%A0%E5%AE%A4%20301&seat=C3'
  },
  {
    id: 'notice-checkin-done',
    group: '昨天',
    iconType: 'check',
    tone: 'green',
    title: '签到成功',
    description: '您已完成经管自习室 301 · C3 签到',
    timeLabel: '昨天 13:52',
    read: true,
    targetMode: 'reLaunch',
    targetUrl: '/pages/bookings/bookings'
  },
  {
    id: 'notice-violation',
    group: '更早',
    iconType: 'alert',
    tone: 'red',
    title: '违约记录',
    description: '开始后 15 分钟未签到，座位已释放并记录一次违约',
    timeLabel: '4月18日',
    read: true,
    targetMode: 'navigateTo',
    targetUrl: '/pages/violations/violations'
  }
];

export const mockViolationRecords: DemoViolationRecord[] = [
  {
    id: 'violation-gm-301-d8',
    room: '经管自习室 301 · D8',
    seat: 'D8',
    date: '4月18日',
    reason: '未签到（签到超时自动取消）',
    count: 1,
    status: 'confirmed',
    occurredAt: '2026-04-18T02:15:00.000Z'
  },
  {
    id: 'violation-humanities-b14',
    room: '文史馆阅览室 · B14',
    seat: 'B14',
    date: '3月12日',
    reason: '提前离座超 30 分钟',
    count: 0.5,
    status: 'confirmed',
    occurredAt: '2026-03-12T07:30:00.000Z'
  },
  {
    id: 'violation-science-a3',
    room: '理工自习室 201 · A3',
    seat: 'A3',
    date: '2月28日',
    reason: '1小时内取消预约',
    count: 0.5,
    status: 'appealed',
    occurredAt: '2026-02-28T01:30:00.000Z'
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
