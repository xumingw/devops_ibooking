export type UserStatus = 'ACTIVE' | 'DISABLED';
export type RoomScopeType = 'SCHOOL' | 'DEPARTMENT';
export type ResourceStatus = 'ACTIVE' | 'INACTIVE';
export type BookingStatus =
  | 'PENDING_CHECKIN'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED_BY_USER'
  | 'CANCELLED_BY_ADMIN'
  | 'CANCELLED_AUTO_NO_CHECKIN';

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface User {
  id: string;
  studentNo: string;
  name: string;
  email?: string | null;
  departmentId: string | null;
  departmentName?: string | null;
  status: UserStatus;
  roles?: Role[];
  updatedAt?: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  userCount?: number;
  permissions?: Permission[];
  updatedAt?: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  menuKey?: string | null;
}

export interface AuthUser {
  id: string;
  studentNo: string;
  name: string;
  departmentId: string | null;
  departmentName: string | null;
  status: UserStatus;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
  roles: Role[];
  permissions: Permission[];
}

export interface MeResponse {
  user: AuthUser;
  roles: Role[];
  permissions: Permission[];
}

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  scopeType: RoomScopeType;
  departmentId: string | null;
  openHour: number;
  closeHour: number;
  overnight: boolean;
  status: ResourceStatus;
}

export interface Seat {
  id: string;
  roomId: string;
  roomName?: string;
  code: string;
  x: number;
  y: number;
  hasPower: boolean;
  nearWindow: boolean;
  quietZone?: boolean;
  status: ResourceStatus;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  seatId: string;
  startAt: string;
  endAt: string;
  status: BookingStatus;
}

export interface Violation {
  id: string;
  userId: string;
  bookingId: string;
  reason: 'NO_CHECK_IN' | 'MANUAL';
  occurredAt: string;
}

export interface StudentViolationRecord {
  id: string;
  room: string;
  seat: string;
  date: string;
  reason: string;
  count: number;
  status: 'confirmed' | 'appealed';
  occurredAt: string;
}

export interface StudentViolationSummary {
  totalCount: number;
  restrictionThreshold: number;
  severeThreshold: number;
  records: StudentViolationRecord[];
}
