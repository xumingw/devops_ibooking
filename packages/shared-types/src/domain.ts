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

export type StudentNotificationGroupLabel = '今天' | '昨天' | '更早';
export type StudentNotificationIconType = 'bell' | 'clock' | 'check' | 'alert';
export type StudentNotificationTone = 'teal' | 'gold' | 'green' | 'red';

export interface StudentNotificationRecord {
  id: string;
  group: StudentNotificationGroupLabel;
  iconType: StudentNotificationIconType;
  tone: StudentNotificationTone;
  title: string;
  description: string;
  timeLabel: string;
  read: boolean;
  occurredAt: string;
}

export interface StudentNotificationGroup {
  date: StudentNotificationGroupLabel;
  items: StudentNotificationRecord[];
}

export interface StudentNotificationSummary {
  unreadCount: number;
  groups: StudentNotificationGroup[];
}

export interface StudentRoomFavoriteRecord {
  roomId: string;
  room: string;
}

export interface StudentRoomFavoriteSummary {
  favoriteRoomIds: string[];
  favorites: StudentRoomFavoriteRecord[];
}

export type StudentBookingStatus = 'upcoming' | 'using' | 'completed' | 'cancelled' | 'violation';

export interface StudentBookingRecord {
  id: string;
  room: string;
  location: string;
  seat: string;
  time: string;
  status: StudentBookingStatus;
  tags: string[];
  canCheckIn: boolean;
  canCancel: boolean;
  startAt: string;
  endAt: string;
}

export interface StudentBookingSummary {
  totalCount: number;
  activeCount: number;
  completedCount: number;
  records: StudentBookingRecord[];
}

export interface StudentCheckInSession {
  bookingId: string;
  roomId: string;
  room: string;
  seat: string;
  time: string;
  remainingSeconds: number;
  codeLength: number;
}

export interface StudentCheckInResult {
  bookingId: string;
  room: string;
  seat: string;
  time: string;
  checkedInAt: string;
  status: 'CHECKED_IN';
}

export type StudentAssistantIntent = 'availability' | 'seat_search' | 'my_bookings' | 'fallback';

export type StudentAssistantAction = 'BOOK' | 'CHECK_IN' | 'CANCEL' | 'DETAIL';

export interface StudentAssistantSeatCandidate {
  roomId: string;
  seatId: string;
  room: string;
  location: string;
  seat: string;
  time: string;
  tags: string[];
}

export interface StudentAssistantBookingCandidate {
  bookingId: string;
  room: string;
  location: string;
  seat: string;
  time: string;
  status: StudentBookingStatus;
  actions: StudentAssistantAction[];
}

export interface StudentAssistantReply {
  intent: StudentAssistantIntent;
  text: string;
  seats: StudentAssistantSeatCandidate[];
  bookings: StudentAssistantBookingCandidate[];
  suggestions: string[];
}
