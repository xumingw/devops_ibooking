export type ApiResponse<T> = {
  code: string;
  message: string;
  data: T;
  requestId: string;
  timestamp: string;
};

export type Role = {
  id: string;
  code: string;
  name: string;
};

export type Permission = {
  id: string;
  code: string;
  name: string;
  menuKey?: string | null;
};

export type AuthUser = {
  id: string;
  studentNo: string;
  name: string;
  departmentId: string | null;
  departmentName: string | null;
  status: 'ACTIVE' | 'DISABLED';
};

export type LoginResponse = {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
  roles: Role[];
  permissions: Permission[];
};

export type Session = LoginResponse & {
  savedAt: string;
};

export type Room = {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  scopeType: 'SCHOOL' | 'DEPARTMENT';
  departmentId: string | null;
  openHour: number;
  closeHour: number;
  overnight: boolean;
  status: 'ACTIVE' | 'INACTIVE';
};

export type RoomCard = Room & {
  available: number;
  tags: string[];
  distanceLabel: string;
  apiSource: 'backend' | 'mock';
};

export type SeatStatus = 'available' | 'taken' | 'selected' | 'maintenance';

export type SeatCell = {
  code: string;
  status: SeatStatus;
  hasPower: boolean;
  nearWindow: boolean;
};

export type DemoBooking = {
  id: string;
  room: string;
  roomId: string;
  seat: string;
  time: string;
  status: '待签到' | '使用中' | '已完成' | '违约';
  statusTone: 'blue' | 'green' | 'gray' | 'red';
};

export type ApiState = {
  source: 'backend' | 'mock';
  message: string;
};
