import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QRCode } from 'antd';
import { F } from '@ibooking/design-tokens';
import type {
  AdminAuditSnapshot,
  AdminBookingRecord,
  AdminBookingRecordPage,
  AdminBookingRecordsSnapshot,
  AdminDashboardSnapshot,
  AdminDynamicCodeSnapshot,
  AdminOverviewSnapshot,
  AdminReportSnapshot,
  AdminScheduleSnapshot,
  AdminSystemParamSnapshot,
  AdminViolationRecord,
  AdminViolationRecordPage,
  AdminViolationSnapshot,
  RoomAvailabilitySummary,
  RoomCatalogItem
} from '@ibooking/shared-types';

export type EntryKind = 'student' | 'admin';

type RoleView = {
  name: string;
  code: string;
};

type Feedback = {
  type: 'success' | 'error';
  text: string;
};

export type SessionView = {
  kind: EntryKind;
  name: string;
  roles: RoleView[];
  permissions: AdminRolePermission[];
  accessToken: string;
};

type LoginPayload = {
  code?: string;
  message?: string;
  data?: {
    accessToken: string;
    expiresAt: string;
    user: {
      name: string;
      departmentName?: string | null;
    };
    roles?: RoleView[];
    permissions?: AdminRolePermission[];
  };
};

type ApiRuntimeEnv = {
  VITE_API_BASE_URL?: string;
  PROD?: boolean;
};

type LoginRequestInput = {
  account: string;
  password: string;
};

type RoomScopeType = 'SCHOOL' | 'DEPARTMENT';
type RoomStatus = 'ACTIVE' | 'INACTIVE';

type AdminRoom = {
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
  status: RoomStatus;
};

type AdminRoomFormState = {
  name: string;
  building: string;
  floor: number;
  capacity: number;
  scopeType: RoomScopeType;
  departmentId: string;
  openHour: number;
  closeHour: number;
  overnight: boolean;
};

type AdminRoomEditor =
  | { mode: 'create'; room: null }
  | { mode: 'edit'; room: AdminRoomRow };

type AdminRoomRow = AdminRoom & {
  code: string;
  departmentLabel: string;
  hours: string;
  statusLabel: string;
};

type SaveRoomOptions = {
  accessToken: string;
  roomId?: string;
};

type AdminSeat = {
  id: string;
  roomId: string;
  roomName: string;
  code: string;
  x: number;
  y: number;
  hasPower: boolean;
  nearWindow: boolean;
  quietZone: boolean;
  status: RoomStatus;
  updatedAt: string;
};

type AdminSeatFormState = {
  roomId: string;
  code: string;
  x: number;
  y: number;
  hasPower: boolean;
  nearWindow: boolean;
  quietZone: boolean;
  status: RoomStatus;
};

type AdminSeatEditor =
  | { mode: 'create'; seat: null }
  | { mode: 'edit'; seat: AdminSeat };

type SaveSeatOptions = {
  accessToken: string;
  seatId?: string;
};

type AdminSeatPayload = Omit<AdminSeat, 'roomName' | 'quietZone' | 'updatedAt'> & {
  roomName?: string;
  quietZone?: boolean;
  updatedAt?: string;
};

type AdminUserStatus = 'ACTIVE' | 'DISABLED';

type AdminUser = {
  id: string;
  studentNo: string;
  name: string;
  email?: string | null;
  departmentId: string | null;
  departmentName?: string | null;
  status: AdminUserStatus;
  roles?: RoleView[];
  updatedAt?: string;
};

type AdminUserFilters = {
  keyword?: string;
  status?: AdminUserStatus;
  departmentId?: string;
  roleCode?: string;
};

type AdminUserRow = {
  id: string;
  name: string;
  account: string;
  department: string;
  role: string;
  source: string;
  lastUpdated: string;
  status: 'active' | 'disabled';
};

type AdminRolePermission = {
  id: string;
  code: string;
  name: string;
  menuKey?: string | null;
};

type AdminRole = {
  id: string;
  code: string;
  name: string;
  userCount?: number;
  permissions?: AdminRolePermission[];
  updatedAt?: string;
};

type AdminRoleFilters = {
  keyword?: string;
};

type AdminRoleRow = {
  id: string;
  name: string;
  users: string;
  scope: string;
  spaceAccess: string;
  operationAccess: string;
  menuAccess: string;
  updatedAt: string;
  status: 'active' | 'pending' | 'disabled';
  searchText: string;
};

type StudentViolationStatus = 'confirmed' | 'appealed';

type StudentViolationRecord = {
  id: string;
  room: string;
  seat: string;
  date: string;
  reason: string;
  count: number;
  status: StudentViolationStatus;
  occurredAt?: string;
};

type StudentViolationSummary = {
  totalCount: number;
  restrictionThreshold: number;
  severeThreshold: number;
  records: StudentViolationRecord[];
};

type StudentViolationRecordView = StudentViolationRecord & {
  countLabel: string;
  statusLabel: string;
};

type StudentViolationSummaryView = Omit<StudentViolationSummary, 'records'> & {
  semesterCountLabel: string;
  totalCountLabel: string;
  restrictionLabel: string;
  severeProgressLabel: string;
  progressAriaLabel: string;
  progressPercent: number;
  records: StudentViolationRecordView[];
};

type StudentNotificationGroupLabel = '今天' | '昨天' | '更早';
type StudentNotificationIconType = 'bell' | 'clock' | 'check' | 'alert';
type StudentNotificationTone = 'teal' | 'gold' | 'green' | 'red';

type StudentNotificationRecord = {
  id: string;
  group: StudentNotificationGroupLabel;
  iconType: StudentNotificationIconType;
  tone: StudentNotificationTone;
  title: string;
  description: string;
  timeLabel: string;
  read: boolean;
  occurredAt: string;
};

type StudentNotificationGroup = {
  date: StudentNotificationGroupLabel;
  items: StudentNotificationRecord[];
};

type StudentNotificationSummary = {
  unreadCount: number;
  groups: StudentNotificationGroup[];
};

type StudentRoomFavoriteRecord = {
  roomId: string;
  room: string;
};

type StudentRoomFavoriteSummary = {
  favoriteRoomIds?: string[];
  favorites?: StudentRoomFavoriteRecord[];
};

type StudentRoomAvailabilitySummary = RoomAvailabilitySummary;

type StudentWeekdayLabel = '一' | '二' | '三' | '四' | '五' | '六' | '日';

type StudentHomeWeekRecord = {
  day: StudentWeekdayLabel;
  hours: number;
};

type StudentHomeSummary = {
  totalSeats: number;
  availableSeats: number;
  availableSeatsDeltaPercent: number;
  todayBookingCount: number;
  dailyBookingLimit: number;
  favoriteRooms: StudentRoomFavoriteRecord[];
  weekStudyHours: number;
  lastWeekStudyHours: number;
  weekRecords: StudentHomeWeekRecord[];
};

type StudentNotificationItemView = Omit<StudentNotificationRecord, 'tone'> & {
  icon: DashboardIconName;
  tone: string;
  desc: string;
  time: string;
};

type StudentNotificationSummaryView = {
  unreadCount: number;
  groups: Array<{
    date: string;
    items: StudentNotificationItemView[];
  }>;
};

type StudentBookingStatus = 'upcoming' | 'using' | 'completed' | 'cancelled' | 'violation';

type StudentBookingRecord = {
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
  createdAt?: string;
  checkInDeadlineAt?: string;
};

type StudentBookingSubmitResult = {
  type: 'success' | 'error';
  message: string;
  booking?: StudentBookingRecord;
};

type StudentBookingSummary = {
  totalCount: number;
  activeCount: number;
  completedCount: number;
  records: StudentBookingRecord[];
};

type StudentBookingRecordView = StudentBookingRecord & {
  statusLabel: string;
  statusVariant: 'blue' | 'green' | 'red' | 'gray';
  statusIcon: DashboardIconName;
};

type StudentBookingSummaryView = Omit<StudentBookingSummary, 'records'> & {
  records: StudentBookingRecordView[];
};

type StudentCheckInSession = {
  bookingId: string;
  roomId: string;
  room: string;
  seat: string;
  time: string;
  remainingSeconds: number;
  codeLength: number;
};

type StudentCheckInResult = {
  bookingId: string;
  room: string;
  seat: string;
  time: string;
  checkedInAt: string;
  status: 'CHECKED_IN';
};

type StudentAssistantIntent = 'availability' | 'seat_search' | 'my_bookings' | 'fallback';
type StudentAssistantAction = 'BOOK' | 'CHECK_IN' | 'CANCEL' | 'DETAIL';

type StudentAssistantSeatCandidate = {
  roomId: string;
  seatId: string;
  room: string;
  location: string;
  seat: string;
  time: string;
  tags: string[];
};

type StudentAssistantBookingCandidate = {
  bookingId: string;
  room: string;
  location: string;
  seat: string;
  time: string;
  status: StudentBookingStatus;
  actions: StudentAssistantAction[];
};

type StudentAssistantReply = {
  intent: StudentAssistantIntent;
  text: string;
  seats: StudentAssistantSeatCandidate[];
  bookings: StudentAssistantBookingCandidate[];
  suggestions: string[];
};

type StudentAssistantMessageView = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  seats?: StudentAssistantSeatCandidate[];
  bookings?: StudentAssistantBookingCandidate[];
  suggestions?: string[];
  quickActions?: StudentAssistantQuickAction[];
};

type StudentAssistantQuickAction = {
  label: string;
  action: StudentAssistantAction;
  seat?: StudentAssistantSeatCandidate;
  booking?: StudentAssistantBookingCandidate;
};

type StudentAssistantSuggestionAction = 'send' | 'select' | 'checkin' | 'bookings';

type StudentAssistantBookingActionContext = {
  booking: StudentAssistantBookingCandidate;
  action: Exclude<StudentAssistantAction, 'BOOK'>;
};

export type CreateStudentBookingRequest = {
  roomId: string;
  seatId: string;
  startAt: string;
  endAt: string;
};

const AUTH_REMEMBER_KEY = 'ibooking.auth.remember';
const ADMIN_ACCESS_TOKEN_KEY = 'ibooking.admin.accessToken';
const STUDENT_ACCESS_TOKEN_KEY = 'ibooking.student.accessToken';
const PASSWORD_ICON_PATH = 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z';

const ENTRY_PRESETS: Record<EntryKind, { account: string; password: string }> = {
  student: { account: 'stu_cse_01', password: 'Pass123!' },
  admin: { account: 'admin_full', password: 'Admin123!' }
};

type AuthSessionPayload = NonNullable<LoginPayload['data']>;
type AuthSessionStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
type AuthTokenStorage = Pick<Storage, 'setItem' | 'removeItem'>;
type AuthenticatedRequestOptions = {
  onSessionExpired?: () => void;
  onSessionRefresh?: (session: SessionView) => void;
  storage?: AuthTokenStorage;
};
type InFlightSessionRefresh = {
  apiBaseUrl: string;
  fetcher: typeof fetch;
  promise: Promise<SessionView>;
};

export const resolveApiBaseUrl = (env: ApiRuntimeEnv = import.meta.env) => {
  const configuredApiBaseUrl = env.VITE_API_BASE_URL?.trim();
  if (configuredApiBaseUrl) {
    return configuredApiBaseUrl.replace(/\/+$/, '');
  }

  if (env.PROD) {
    throw new Error('生产构建缺少 VITE_API_BASE_URL，无法连接认证服务');
  }

  return 'http://localhost:3000';
};

export const requestLogin = async (
  input: LoginRequestInput,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl()
): Promise<AuthSessionPayload> => {
  const response = await fetcher(`${apiBaseUrl}/api/v1/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentNo: input.account.trim(), password: input.password })
  });
  const payload = (await response.json().catch(() => null)) as LoginPayload | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '登录失败，请稍后重试');
  }

  return payload.data;
};

export const requestRefresh = async (
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl()
): Promise<AuthSessionPayload> => {
  const response = await fetcher(`${apiBaseUrl}/api/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include'
  });
  const payload = (await response.json().catch(() => null)) as LoginPayload | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '会话已过期，请重新登录');
  }

  return payload.data;
};

export const requestLogout = async (
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl()
) => {
  const response = await fetcher(`${apiBaseUrl}/api/v1/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message || '退出登录失败，请稍后重试');
  }
};

export const logoutSession = async (
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  storage: Pick<Storage, 'removeItem'> = localStorage
) => {
  try {
    await requestLogout(fetcher, apiBaseUrl);
  } finally {
    storage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
    storage.removeItem(STUDENT_ACCESS_TOKEN_KEY);
  }
};

const toSessionView = (authSession: AuthSessionPayload): SessionView => {
  const kind = resolveSessionKind(authSession.roles);
  return {
    kind,
    name: authSession.user.name,
    roles: authSession.roles ?? [],
    permissions: authSession.permissions ?? [],
    accessToken: authSession.accessToken
  };
};

const persistSessionAccessToken = (
  session: SessionView,
  storage: AuthTokenStorage
) => {
  const activeTokenKey =
    session.kind === 'admin' ? ADMIN_ACCESS_TOKEN_KEY : STUDENT_ACCESS_TOKEN_KEY;
  const inactiveTokenKey =
    session.kind === 'admin' ? STUDENT_ACCESS_TOKEN_KEY : ADMIN_ACCESS_TOKEN_KEY;
  storage.setItem(activeTokenKey, session.accessToken);
  storage.removeItem(inactiveTokenKey);
};

export const restoreRememberedSession = async (
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  storage: AuthSessionStorage = localStorage
): Promise<SessionView | null> => {
  if (storage.getItem(AUTH_REMEMBER_KEY) !== '1') return null;

  try {
    const session = toSessionView(await requestRefresh(fetcher, apiBaseUrl));
    persistSessionAccessToken(session, storage);
    return session;
  } catch {
    storage.removeItem(AUTH_REMEMBER_KEY);
    storage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
    storage.removeItem(STUDENT_ACCESS_TOKEN_KEY);
    return null;
  }
};

const resolveAuthTokenStorage = (storage?: AuthTokenStorage): AuthTokenStorage | null => {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

const clearStoredSession = (storage?: AuthTokenStorage) => {
  const targetStorage = resolveAuthTokenStorage(storage);
  if (!targetStorage) return;
  targetStorage.removeItem(AUTH_REMEMBER_KEY);
  targetStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  targetStorage.removeItem(STUDENT_ACCESS_TOKEN_KEY);
};

let inFlightSessionRefresh: InFlightSessionRefresh | null = null;

const requestSharedSessionRefresh = (
  fetcher: typeof fetch,
  apiBaseUrl: string
): Promise<SessionView> => {
  if (
    !inFlightSessionRefresh ||
    inFlightSessionRefresh.fetcher !== fetcher ||
    inFlightSessionRefresh.apiBaseUrl !== apiBaseUrl
  ) {
    const promise = requestRefresh(fetcher, apiBaseUrl).then(toSessionView);
    inFlightSessionRefresh = { apiBaseUrl, fetcher, promise };
    const clearInFlightRefresh = () => {
      if (inFlightSessionRefresh?.promise === promise) {
        inFlightSessionRefresh = null;
      }
    };
    void promise.then(clearInFlightRefresh, clearInFlightRefresh);
  }

  return inFlightSessionRefresh.promise;
};

const refreshAccessTokenForRetry = async (
  fetcher: typeof fetch,
  apiBaseUrl: string,
  options: AuthenticatedRequestOptions
): Promise<string> => {
  try {
    const nextSession = await requestSharedSessionRefresh(fetcher, apiBaseUrl);
    const storage = resolveAuthTokenStorage(options.storage);
    if (storage) persistSessionAccessToken(nextSession, storage);
    options.onSessionRefresh?.(nextSession);
    return nextSession.accessToken;
  } catch (error) {
    clearStoredSession(options.storage);
    options.onSessionExpired?.();
    throw error;
  }
};

const fetchWithSessionRefresh = async (
  accessToken: string,
  request: (nextAccessToken: string) => Promise<Response>,
  fetcher: typeof fetch,
  apiBaseUrl: string,
  options: AuthenticatedRequestOptions = {}
): Promise<Response> => {
  const response = await request(accessToken);
  if (response.status !== 401) return response;

  const nextAccessToken = await refreshAccessTokenForRetry(fetcher, apiBaseUrl, options);
  return request(nextAccessToken);
};

export const requestAdminOverview = async (
  accessToken: string,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<AdminOverviewSnapshot> => {
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/admin/overview`, {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: AdminOverviewSnapshot;
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '管理端数据加载失败');
  }

  return payload.data;
};

export const requestAdminBookingRecords = async (
  accessToken: string,
  query: { page: number; size: number },
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<AdminBookingRecordPage> => {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size)
  });
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/admin/bookings?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: AdminBookingRecordPage;
  } | null;
  if (
    !response.ok ||
    payload?.code !== 'SUCCESS' ||
    !payload.data ||
    !Array.isArray(payload.data.items) ||
    typeof payload.data.total !== 'number'
  ) {
    throw new Error(payload?.message || '预约记录加载失败');
  }

  return payload.data;
};

export const requestAdminViolationRecords = async (
  accessToken: string,
  query: { page: number; size: number },
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<AdminViolationRecordPage> => {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size)
  });
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/admin/violations?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: AdminViolationRecordPage;
  } | null;
  if (
    !response.ok ||
    payload?.code !== 'SUCCESS' ||
    !payload.data ||
    !Array.isArray(payload.data.items) ||
    typeof payload.data.total !== 'number'
  ) {
    throw new Error(payload?.message || '违约记录加载失败');
  }

  return payload.data;
};

export const requestRooms = async (
  accessToken: string,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<AdminRoom[]> => {
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/rooms`, {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: AdminRoom[];
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '自习室列表加载失败');
  }

  return payload.data;
};

export const saveAdminRoom = async (
  input: AdminRoomFormState,
  options: SaveRoomOptions,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<AdminRoom> => {
  const isEdit = Boolean(options.roomId);
  const url = isEdit
    ? `${apiBaseUrl}/api/v1/rooms/${options.roomId}`
    : `${apiBaseUrl}/api/v1/rooms`;
  const response = await fetchWithSessionRefresh(
    options.accessToken,
    (nextAccessToken) =>
      fetcher(url, {
        method: isEdit ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${nextAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: input.name,
          building: input.building,
          floor: Number(input.floor),
          capacity: Number(input.capacity),
          scopeType: input.scopeType,
          departmentId: input.scopeType === 'DEPARTMENT' ? input.departmentId || 'dept-cs' : null,
          openHour: Number(input.openHour),
          closeHour: Number(input.closeHour),
          overnight: Boolean(input.overnight)
        })
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: AdminRoom;
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '保存失败');
  }

  return payload.data;
};

export const requestSeats = async (
  accessToken: string,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<AdminSeat[]> => {
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/seats`, {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: AdminSeatPayload[];
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '座位列表加载失败');
  }

  return payload.data.map(toAdminSeat);
};

export const requestUsers = async (
  accessToken: string,
  filters: AdminUserFilters = {},
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<AdminUser[]> => {
  const params = new URLSearchParams();
  const keyword = filters.keyword?.trim();
  const status = filters.status?.trim();
  const departmentId = filters.departmentId?.trim();
  const roleCode = filters.roleCode?.trim();

  if (keyword) params.set('keyword', keyword);
  if (status) params.set('status', status);
  if (departmentId) params.set('departmentId', departmentId);
  if (roleCode) params.set('roleCode', roleCode);

  const query = params.toString();
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/users${query ? `?${query}` : ''}`, {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: AdminUser[];
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '用户列表加载失败');
  }

  return payload.data;
};

export const requestRoles = async (
  accessToken: string,
  filters: AdminRoleFilters = {},
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<AdminRole[]> => {
  const params = new URLSearchParams();
  const keyword = filters.keyword?.trim();
  if (keyword) params.set('keyword', keyword);

  const query = params.toString();
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/roles${query ? `?${query}` : ''}`, {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: AdminRole[];
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '角色列表加载失败');
  }

  return payload.data;
};

export const requestStudentViolationSummary = async (
  accessToken: string,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<StudentViolationSummary> => {
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/violations/me`, {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: StudentViolationSummary;
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '违约记录加载失败');
  }

  return payload.data;
};

export const requestStudentNotifications = async (
  accessToken: string,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<StudentNotificationSummary> => {
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/notifications/me`, {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: StudentNotificationSummary;
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '通知中心加载失败');
  }

  return payload.data;
};

export const requestStudentNotificationsMarkAllRead = async (
  accessToken: string,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<StudentNotificationSummary> => {
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/notifications/me/read-all`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: StudentNotificationSummary;
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '通知已读状态保存失败');
  }

  return payload.data;
};

export const requestStudentRoomFavorites = async (
  accessToken: string,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<StudentRoomFavoriteSummary> => {
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/favorites/me/rooms`, {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: StudentRoomFavoriteSummary;
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '收藏列表加载失败');
  }

  return payload.data;
};

export const requestStudentRoomFavoriteSet = async (
  accessToken: string,
  roomId: string,
  favorite: boolean,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<StudentRoomFavoriteSummary> => {
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/favorites/me/rooms/${roomId}`, {
        method: favorite ? 'PUT' : 'DELETE',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: StudentRoomFavoriteSummary;
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '收藏状态保存失败');
  }

  return payload.data;
};

export const requestStudentHomeSummary = async (
  accessToken: string,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<StudentHomeSummary> => {
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/students/me/home`, {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: StudentHomeSummary;
  } | null;
  if (
    !response.ok ||
    payload?.code !== 'SUCCESS' ||
    !payload.data ||
    typeof payload.data.totalSeats !== 'number' ||
    typeof payload.data.availableSeats !== 'number' ||
    !Array.isArray(payload.data.favoriteRooms) ||
    !Array.isArray(payload.data.weekRecords)
  ) {
    throw new Error(payload?.message || '首页概览加载失败');
  }

  return payload.data;
};

export const requestRoomCatalog = async (
  accessToken: string,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<RoomCatalogItem[]> => {
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/rooms/catalog`, {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: RoomCatalogItem[];
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !Array.isArray(payload.data)) {
    throw new Error(payload?.message || '自习室目录加载失败');
  }

  return payload.data;
};

export const requestStudentRoomAvailability = async (
  accessToken: string,
  input: { startAt: string; endAt: string },
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<StudentRoomAvailabilitySummary> => {
  const params = new URLSearchParams({ startAt: input.startAt, endAt: input.endAt });
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/rooms/availability?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: StudentRoomAvailabilitySummary;
  } | null;
  if (
    !response.ok ||
    payload?.code !== 'SUCCESS' ||
    !payload.data ||
    !Array.isArray(payload.data.rooms)
  ) {
    throw new Error(payload?.message || '自习室座位统计加载失败');
  }

  return payload.data;
};

export const requestStudentBookings = async (
  accessToken: string,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<StudentBookingSummary> => {
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/bookings/me`, {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: StudentBookingSummary;
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '我的预约加载失败');
  }

  return payload.data;
};

export const requestStudentBookingCancel = async (
  accessToken: string,
  bookingId: string,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<StudentBookingRecord> => {
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/bookings/me/${bookingId}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: StudentBookingRecord;
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '取消预约失败');
  }

  return payload.data;
};

export const requestStudentBookingCreate = async (
  accessToken: string,
  input: CreateStudentBookingRequest,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<StudentBookingRecord> => {
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/bookings/me`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${nextAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: StudentBookingRecord;
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '预约提交失败');
  }

  return payload.data;
};

export const getStudentBookingConfirmUiState = ({
  submitted,
  submitting
}: {
  submitted: boolean;
  submitting: boolean;
}) => {
  if (submitted) {
    return {
      primaryDisabled: true,
      primaryLabel: '预约已提交'
    };
  }

  if (submitting) {
    return {
      primaryDisabled: true,
      primaryLabel: '提交中'
    };
  }

  return {
    primaryDisabled: false,
    primaryLabel: '确认提交预约'
  };
};

export const requestStudentCheckInSession = async (
  accessToken: string,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<StudentCheckInSession | null> => {
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/checkins/me/current`, {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${nextAccessToken}` }
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: StudentCheckInSession | null;
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || payload.data === undefined) {
    throw new Error(payload?.message || '签到信息加载失败');
  }

  return payload.data;
};

export const requestStudentCheckInCode = async (
  accessToken: string,
  code: string,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<StudentCheckInResult> => {
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/checkins/me`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${nextAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: StudentCheckInResult;
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '签到失败，请核对动态码');
  }

  return payload.data;
};

export const requestStudentAssistantMessage = async (
  accessToken: string,
  message: string,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<StudentAssistantReply> => {
  const response = await fetchWithSessionRefresh(
    accessToken,
    (nextAccessToken) =>
      fetcher(`${apiBaseUrl}/api/v1/assistant/me/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${nextAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: StudentAssistantReply;
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '智能助手暂时不可用');
  }

  return payload.data;
};

export const resolveStudentAssistantSuggestionAction = (
  suggestion: string
): StudentAssistantSuggestionAction => {
  if (/我的预约|查看预约/.test(suggestion)) return 'bookings';
  if (/选座|筛选|预约/.test(suggestion)) return 'select';
  if (/签到/.test(suggestion)) return 'checkin';
  return 'send';
};

export const saveAdminSeat = async (
  input: AdminSeatFormState,
  options: SaveSeatOptions,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl(),
  authOptions: AuthenticatedRequestOptions = {}
): Promise<AdminSeat> => {
  const isEdit = Boolean(options.seatId);
  const url = isEdit
    ? `${apiBaseUrl}/api/v1/seats/${options.seatId}`
    : `${apiBaseUrl}/api/v1/seats`;
  const response = await fetchWithSessionRefresh(
    options.accessToken,
    (nextAccessToken) =>
      fetcher(url, {
        method: isEdit ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${nextAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId: input.roomId,
          code: input.code.trim(),
          x: Number(input.x),
          y: Number(input.y),
          hasPower: Boolean(input.hasPower),
          nearWindow: Boolean(input.nearWindow),
          quietZone: Boolean(input.quietZone),
          status: input.status
        })
      }),
    fetcher,
    apiBaseUrl,
    authOptions
  );
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
    data?: AdminSeatPayload;
  } | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '保存失败');
  }

  return toAdminSeat(payload.data);
};

const ADMIN_ROLE_CODES = new Set([
  'ROLE_FULL_ADMIN',
  'ROLE_ROOM_ADMIN',
  'ROLE_AUDIT',
  'ROLE_DEPARTMENT_ADMIN'
]);

export const resolveSessionKind = (roles: RoleView[] = []): EntryKind =>
  roles.some((role) => ADMIN_ROLE_CODES.has(role.code)) ? 'admin' : 'student';

const ADMIN_ROLE_LABELS: Record<string, string> = {
  ROLE_FULL_ADMIN: '超级管理员',
  ROLE_ROOM_ADMIN: '自习室管理员',
  ROLE_AUDIT: '数据审计员',
  ROLE_DEPARTMENT_ADMIN: '院系管理员'
};

export const resolveAdminRoleLabel = (roles: RoleView[] = []) => {
  const adminRole = roles.find((role) => ADMIN_ROLE_CODES.has(role.code));
  if (adminRole?.name) return adminRole.name;
  if (adminRole?.code) return ADMIN_ROLE_LABELS[adminRole.code] ?? '管理员';
  return roles[0]?.name ?? '管理员';
};

export const resolveAvatarInitial = (name: string) => name.trim().charAt(0) || '管';

export const canSubmitStudentCheckIn = (input: {
  accessToken?: string;
  hasSession: boolean;
  enteredCode: string;
  codeLength: number;
  loading: boolean;
  submitting: boolean;
  submitted: boolean;
  remainingSeconds: number;
}) =>
  Boolean(input.accessToken && input.hasSession) &&
  input.enteredCode.length === input.codeLength &&
  input.remainingSeconds > 0 &&
  !input.loading &&
  !input.submitting &&
  !input.submitted;

export const STUDENT_CHECKIN_TIMER_CIRCUMFERENCE = 389.56;

export const calculateStudentCheckInTimerDashOffset = (
  remainingSeconds: number,
  totalSeconds: number
) => {
  const safeTotalSeconds = Math.max(1, totalSeconds);
  const progress = Math.max(0, Math.min(1, remainingSeconds / safeTotalSeconds));
  return STUDENT_CHECKIN_TIMER_CIRCUMFERENCE * (1 - progress);
};

const pushAppPath = (path: string) => {
  if (typeof window !== 'undefined') {
    window.history.pushState(null, '', path);
  }
};

const replaceAppPath = (path: string) => {
  if (typeof window !== 'undefined') {
    window.history.replaceState(null, '', path);
  }
};

const isProtectedAppPath = (pathname: string) =>
  pathname === '/student' ||
  pathname.startsWith('/student/') ||
  pathname === '/dashboard' ||
  pathname.startsWith('/dashboard/');

function FieldIcon({ type }: { type: 'account' | 'password' }) {
  const path =
    type === 'account'
      ? 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z'
      : PASSWORD_ICON_PATH;

  return (
    <svg
      aria-hidden="true"
      className="input-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      {path.split(' M ').map((segment, index) => (
        <path
          d={index === 0 ? segment : `M ${segment}`}
          key={segment}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

const DASHBOARD_ICON_PATHS = {
  home: 'M3 11l9-8 9 8 M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10',
  chart: 'M18 20V10 M12 20V4 M6 20v-6',
  building:
    'M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18 M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2 M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  move:
    'M5 9l-3 3 3 3 M9 5l3-3 3 3 M15 19l-3 3-3-3 M19 9l3 3-3 3 M2 12h20 M12 2v20',
  calendar:
    'M8 2v3 M16 2v3 M3 9h18 M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z',
  log:
    'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  alert:
    'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
  qr: 'M3 3h6v6H3z M15 3h6v6h-6z M3 15h6v6H3z M15 15h.01 M19 15h.01 M15 19h.01 M19 19h.01 M17 15v4',
  scan: 'M3 7V5a2 2 0 012-2h2 M17 3h2a2 2 0 012 2v2 M21 17v2a2 2 0 01-2 2h-2 M7 21H5a2 2 0 01-2-2v-2 M7 12h10',
  users:
    'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 7a4 4 0 100 8 4 4 0 000-8z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  settings:
    'M12 15a3 3 0 100-6 3 3 0 000 6z M12 2v2 M12 20v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M2 12h2 M20 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z',
  download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  refresh: 'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15',
  trash:
    'M3 6h18 M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2 M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6 M10 11v6 M14 11v6',
  info: 'M12 22a10 10 0 100-20 10 10 0 000 20z M12 16v-4 M12 8h.01',
  'check-circle': 'M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3',
  'arrow-right': 'M5 12h14 M12 5l7 7-7 7',
  plus: 'M12 5v14 M5 12h14',
  search: 'M21 21l-4.35-4.35 M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z',
  pin: 'M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1118 0z M12 13a3 3 0 100-6 3 3 0 000 6z',
  star:
    'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z',
  clock: 'M12 22a10 10 0 100-20 10 10 0 000 20z M12 6v6l4 2',
  zap: 'M13 2L3 14h7l-1 8 10-12h-7l1-8z',
  bell: 'M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M13.73 21a2 2 0 01-3.46 0',
  mic: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z M19 10v2a7 7 0 01-14 0v-2 M12 19v4 M8 23h8',
  send: 'M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z',
  edit: 'M12 20h9 M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z',
  x: 'M18 6L6 18 M6 6l12 12',
  check: 'M20 6L9 17l-5-5',
  'chevron-down': 'M6 9l6 6 6-6',
  'more-v': 'M12 8h.01 M12 12h.01 M12 16h.01'
} as const;

type DashboardIconName = keyof typeof DASHBOARD_ICON_PATHS;

function DashboardIcon({
  name,
  size = 16,
  color = 'currentColor'
}: {
  name: DashboardIconName;
  size?: number;
  color?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className="dashboard-icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {DASHBOARD_ICON_PATHS[name].split(' M ').map((segment, index) => (
        <path
          d={index === 0 ? segment : `M ${segment}`}
          key={`${name}-${segment}`}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

type StudentTimeDropdownOption = {
  value: string;
  disabled?: boolean;
};

function StudentTimeDropdown({
  ariaLabel,
  onChange,
  options,
  unit,
  value
}: {
  ariaLabel: string;
  onChange: (value: string) => void;
  options: StudentTimeDropdownOption[];
  unit: '时' | '分';
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleChange = (nextValue: string) => {
    const option = options.find((candidate) => candidate.value === nextValue);
    if (!option || option.disabled) return;
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className="student-time-select" ref={rootRef}>
      <select
        aria-label={ariaLabel}
        className="student-time-native-select"
        onChange={(event) => handleChange(event.target.value)}
        tabIndex={-1}
        value={value}
      >
        {options.map((option) => (
          <option disabled={option.disabled} key={option.value} value={option.value}>
            {option.value}
          </option>
        ))}
      </select>
      <button
        aria-expanded={open}
        aria-label={ariaLabel}
        className="student-time-trigger"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <strong>{value}</strong>
        <span className="student-time-unit">{unit}</span>
        <DashboardIcon name="chevron-down" size={12} />
      </button>
      {open ? (
        <div className="student-time-menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <button
              aria-selected={option.value === value}
              className={option.value === value ? 'is-active' : ''}
              disabled={option.disabled}
              key={option.value}
              onClick={() => handleChange(option.value)}
              role="option"
              type="button"
            >
              {option.value}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function App() {
  const [loginMode, setLoginMode] = useState<'password' | 'sso'>('password');
  const [account, setAccount] = useState(ENTRY_PRESETS.admin.account);
  const [password, setPassword] = useState(ENTRY_PRESETS.admin.password);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [session, setSession] = useState<SessionView | null>(null);

  const primaryStyle = useMemo(
    () =>
      ({
        '--admin-primary': F.navy,
        '--admin-primary-dark': F.navy2,
        '--admin-teal': F.teal,
        '--admin-gold': F.gold,
        '--admin-line': F.line,
        '--admin-bg': F.bg,
        '--admin-ink': F.ink,
        '--admin-muted': F.muted,
        '--admin-white': F.white
      }) as CSSProperties,
    []
  );

  useEffect(() => {
    let active = true;

    void restoreRememberedSession().then((restoredSession) => {
      if (!active) return;
      if (!restoredSession) {
        if (isProtectedAppPath(window.location.pathname)) {
          replaceAppPath('/');
        }
        return;
      }
      setSession(restoredSession);
      pushAppPath(resolvePostLoginPath(restoredSession.kind));
    });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const loginSession = await requestLogin({ account, password });
      const nextSession = toSessionView(loginSession);

      localStorage.setItem(AUTH_REMEMBER_KEY, remember ? '1' : '0');
      persistSessionAccessToken(nextSession, localStorage);
      setSession(nextSession);
      pushAppPath(resolvePostLoginPath(nextSession.kind));
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : '登录失败，请稍后重试'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutSession();
    } catch {
      // 本地退出仍然继续，后端失败时下次访问会重新走认证。
    }
    setSession(null);
    pushAppPath('/');
  };

  const handleSessionRefresh = useCallback((nextSession: SessionView) => {
    setSession(nextSession);
  }, []);

  const handleSessionExpired = useCallback(() => {
    setSession(null);
    pushAppPath('/');
  }, []);

  if (session?.kind === 'admin') {
    return (
      <AdminDashboard
        accessToken={session.accessToken}
        adminName={session.name}
        adminPermissions={session.permissions}
        adminRoles={session.roles}
        onLogout={handleLogout}
        onSessionExpired={handleSessionExpired}
        onSessionRefresh={handleSessionRefresh}
      />
    );
  }

  if (session?.kind === 'student') {
    return (
      <StudentHomePreview
        accessToken={session.accessToken}
        studentName={session.name}
        onLogout={handleLogout}
        onSessionExpired={handleSessionExpired}
        onSessionRefresh={handleSessionRefresh}
      />
    );
  }

  return (
    <main className="admin-login-page" style={primaryStyle}>
      <section className="admin-brand-panel" aria-label="复旦大学自习室预约系统">
        <span className="brand-blob brand-blob-primary" />
        <span className="brand-blob brand-blob-gold" />
        <span className="brand-blob brand-blob-mint" />
        <span className="brand-frost" />
        <div className="brand-heading">
          <div className="brand-seal">旦</div>
          <div>
            <div className="brand-name">复旦大学</div>
            <div className="brand-en">FUDAN UNIVERSITY</div>
          </div>
        </div>

        <div className="brand-copy">
          <h1>
            自习室
            <br />
            预约系统
          </h1>
          <p>智慧空间管理 · 高效学习体验</p>
        </div>

        <div className="brand-stats" aria-label="系统概览">
          <div>
            <strong>48</strong>
            <span>自习室</span>
          </div>
          <div>
            <strong>2,840</strong>
            <span>座位</span>
          </div>
          <div>
            <strong>92%</strong>
            <span>今日出勤</span>
          </div>
        </div>

        <div className="rule-panel">
          <span>使用须知</span>
          <p><i />每人每天最多预约 3 场</p>
          <p><i />需在 15 分钟内完成签到</p>
          <p><i />连续 3 次违约将被限制预约</p>
        </div>
      </section>

      <section className="admin-form-panel" aria-label="统一登录">
        <span className="form-blob form-blob-primary" />
        <span className="form-blob form-blob-gold" />
        <div className="login-card">
          <div className="login-title">
            <h2>统一登录</h2>
            <p>请使用复旦学工号登录，系统会按账号权限进入对应工作台</p>
          </div>

          <div className="mode-switch" aria-label="登录方式">
            <button
              className={loginMode === 'password' ? 'is-active' : ''}
              type="button"
              onClick={() => setLoginMode('password')}
            >
              账号登录
            </button>
            <button
              className={loginMode === 'sso' ? 'is-active' : ''}
              type="button"
              onClick={() => setLoginMode('sso')}
            >
              统一身份认证
            </button>
          </div>

          {loginMode === 'password' ? (
            <form className="login-form" onSubmit={handleSubmit}>
              <label>
                <span>学工号</span>
                <div className="input-shell">
                  <FieldIcon type="account" />
                  <input
                    autoComplete="username"
                    value={account}
                    onChange={(event) => setAccount(event.target.value)}
                    placeholder="请输入学工号"
                  />
                </div>
              </label>
              <label>
                <span>密码</span>
                <div className="input-shell">
                  <FieldIcon type="password" />
                  <input
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="请输入密码"
                    type="password"
                  />
                </div>
              </label>

              <div className="form-row">
                <label className="remember-option">
                  <input
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    type="checkbox"
                  />
                  <span>记住登录状态</span>
                </label>
                <button className="text-action" type="button">
                  忘记密码？
                </button>
              </div>

              {feedback && (
                <div className={`login-feedback is-${feedback.type}`}>{feedback.text}</div>
              )}

              <button className="submit-button" disabled={submitting} type="submit">
                {submitting ? '登录中…' : '登 录'}
              </button>
            </form>
          ) : (
            <div className="sso-panel">
              <div className="qr-mark">SSO</div>
              <p>前往 passport.fudan.edu.cn 完成统一身份认证</p>
            </div>
          )}

          <div className="agreement">登录即代表同意《自习室使用规则》与《数据隐私声明》</div>
        </div>
      </section>
    </main>
  );
}

type DashboardProps = {
  accessToken?: string;
  adminName: string;
  adminRoles?: RoleView[];
  adminPermissions?: AdminRolePermission[];
  initialAdminOverview?: AdminOverviewSnapshot;
  initialActive?: AdminMenuId;
  onLogout?: () => void;
  onSessionExpired?: () => void;
  onSessionRefresh?: (session: SessionView) => void;
};

type StudentDashboardProps = {
  accessToken?: string;
  studentName: string;
  initialActive?: StudentPageId;
  onLogout?: () => void;
  onSessionExpired?: () => void;
  onSessionRefresh?: (session: SessionView) => void;
};

const ADMIN_MENU_IDS = [
  'dashboard',
  'rooms',
  'seats',
  'editor',
  'schedule',
  'bookings',
  'violations',
  'qrcode',
  'users',
  'roles',
  'params',
  'audit',
  'reports'
] as const;

type AdminMenuId = (typeof ADMIN_MENU_IDS)[number];

const STUDENT_MENU_IDS = [
  'home',
  'rooms',
  'bookings',
  'checkin',
  'assistant',
  'notify',
  'violation'
] as const;

type StudentMenuId = (typeof STUDENT_MENU_IDS)[number];
type StudentPageId = StudentMenuId | 'select' | 'confirm';

type AdminMenuAction = {
  id?: 'create-room' | 'refresh-rooms' | 'create-seat';
  label: string;
  icon: DashboardIconName;
};

type AdminActionSignal = {
  menu: AdminMenuId;
  label: string;
  nonce: number;
};

type StudentMenuItem = {
  id: StudentMenuId;
  label: string;
  icon: DashboardIconName;
  badge?: string;
};

type AdminModuleMetric = {
  label: string;
  value: string;
  tone: string;
};

type AdminMenuMeta = {
  title: string;
  sub: string;
  description: string;
  actions: AdminMenuAction[];
  metrics: AdminModuleMetric[];
  tableTitle: string;
  tableNote: string;
  tableHead: string[];
  rows: string[][];
};

const DASHBOARD_NAV_GROUPS: Array<{
  label: string;
  items: Array<{ id: AdminMenuId; label: string; icon: DashboardIconName }>;
}> = [
  { label: '概览', items: [{ id: 'dashboard', label: '管理仪表盘', icon: 'chart' }] },
  {
    label: '空间管理',
    items: [
      { id: 'rooms', label: '自习室管理', icon: 'building' },
      { id: 'seats', label: '座位管理', icon: 'grid' },
      { id: 'editor', label: '平面图编辑器', icon: 'move' },
      { id: 'schedule', label: '开放时间', icon: 'calendar' }
    ]
  },
  {
    label: '运营管理',
    items: [
      { id: 'bookings', label: '预约记录', icon: 'log' },
      { id: 'violations', label: '违约记录', icon: 'alert' },
      { id: 'qrcode', label: '动态码管理', icon: 'qr' }
    ]
  },
  {
    label: '系统与权限',
    items: [
      { id: 'users', label: '用户管理', icon: 'users' },
      { id: 'roles', label: '角色权限', icon: 'shield' },
      { id: 'params', label: '系统参数', icon: 'settings' },
      { id: 'audit', label: '审计日志', icon: 'eye' },
      { id: 'reports', label: '数据报表', icon: 'download' }
    ]
  }
];

const newRoomForm = (): AdminRoomFormState => ({
  name: '',
  building: '',
  floor: 1,
  capacity: 40,
  scopeType: 'SCHOOL',
  departmentId: '',
  openHour: 7,
  closeHour: 22,
  overnight: false
});

const formatRoomHour = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

const formatRoomHours = (room: AdminRoom) =>
  room.overnight
    ? `${formatRoomHour(room.openHour)}–次日 ${formatRoomHour(room.closeHour)}`
    : `${formatRoomHour(room.openHour)}–${formatRoomHour(room.closeHour)}`;

const getRoomDepartmentLabel = (room: Pick<AdminRoom, 'scopeType' | 'departmentId'>) => {
  if (room.scopeType === 'SCHOOL') return '全校';
  if (room.departmentId === 'dept-cs') return '计算机学院';
  return '院系限定';
};

const toAdminRoomRow = (room: AdminRoom, index: number): AdminRoomRow => ({
  ...room,
  code: `R${String(index + 1).padStart(3, '0')}`,
  departmentLabel: getRoomDepartmentLabel(room),
  hours: formatRoomHours(room),
  statusLabel: room.status === 'ACTIVE' ? '开放中' : '已停用'
});

const roomToForm = (room: AdminRoom): AdminRoomFormState => ({
  name: room.name,
  building: room.building,
  floor: room.floor,
  capacity: room.capacity,
  scopeType: room.scopeType,
  departmentId: room.departmentId ?? '',
  openHour: room.openHour,
  closeHour: room.closeHour,
  overnight: room.overnight
});

const newSeatForm = (): AdminSeatFormState => ({
  roomId: 'room-gm-301',
  code: '',
  x: 100,
  y: 100,
  hasPower: false,
  nearWindow: false,
  quietZone: false,
  status: 'ACTIVE'
});

const seatToForm = (seat: AdminSeat): AdminSeatFormState => ({
  roomId: seat.roomId,
  code: seat.code,
  x: seat.x,
  y: seat.y,
  hasPower: seat.hasPower,
  nearWindow: seat.nearWindow,
  quietZone: seat.quietZone,
  status: seat.status
});

const getSeatTags = (seat: Pick<AdminSeat, 'hasPower' | 'nearWindow' | 'quietZone'>) => {
  const tags = [
    seat.hasPower ? '带插座' : '',
    seat.nearWindow ? '靠窗' : '',
    seat.quietZone ? '安静区' : ''
  ].filter(Boolean);
  return tags.length > 0 ? tags : ['普通座'];
};

const getSeatCodeParts = (code: string) => /^([A-Za-z]+)(\d+)$/.exec(code.trim());

const getSeatRowIndex = (seat: Pick<AdminSeat, 'code' | 'y'>) => {
  if (Number.isFinite(seat.y) && seat.y > 0) return seat.y;
  const rowLetters = getSeatCodeParts(seat.code)?.[1]?.toUpperCase();
  if (!rowLetters) return Number.MAX_SAFE_INTEGER;
  return rowLetters
    .split('')
    .reduce((value, letter) => value * 26 + letter.charCodeAt(0) - 64, 0);
};

const getSeatColumnIndex = (seat: Pick<AdminSeat, 'code' | 'x'>) => {
  if (Number.isFinite(seat.x) && seat.x > 0) return seat.x;
  return Number(getSeatCodeParts(seat.code)?.[2] ?? Number.MAX_SAFE_INTEGER);
};

const getSeatRowLabel = (seat: Pick<AdminSeat, 'code' | 'y'>) => {
  const codeRow = getSeatCodeParts(seat.code)?.[1]?.toUpperCase();
  if (codeRow) return codeRow;
  return Number.isFinite(seat.y) && seat.y > 0 ? `${seat.y}` : '未分组';
};

const compareSeatsByLayout = (left: AdminSeat, right: AdminSeat) => {
  const rowDiff = getSeatRowIndex(left) - getSeatRowIndex(right);
  if (rowDiff !== 0) return rowDiff;
  const colDiff = getSeatColumnIndex(left) - getSeatColumnIndex(right);
  if (colDiff !== 0) return colDiff;
  return left.code.localeCompare(right.code, 'zh-CN');
};

const buildFloorSeatRows = (seats: AdminSeat[]): FloorSeatRow[] => {
  const groupedRows = new Map<number, FloorSeatRow>();
  [...seats].sort(compareSeatsByLayout).forEach((seat) => {
    const rowIndex = getSeatRowIndex(seat);
    const existingRow = groupedRows.get(rowIndex);
    if (existingRow) {
      existingRow.seats.push(seat);
      return;
    }
    groupedRows.set(rowIndex, {
      key: `${rowIndex}-${getSeatRowLabel(seat)}`,
      label: getSeatRowLabel(seat),
      seats: [seat]
    });
  });
  return Array.from(groupedRows.values());
};

const getFloorSeatStatus = (
  seat: Pick<AdminSeat, 'id' | 'nearWindow' | 'status'>,
  selectedSeatId: string
): FloorSeatStatus => {
  if (seat.id === selectedSeatId) return 'selected';
  if (seat.status !== 'ACTIVE') return 'disabled';
  if (seat.nearWindow) return 'window';
  return 'available';
};

const formatSeatUpdatedAt = (updatedAt?: string) => {
  if (!updatedAt) return '刚刚';
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return updatedAt;
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const toAdminSeat = (seat: AdminSeatPayload): AdminSeat => ({
  id: seat.id,
  roomId: seat.roomId,
  roomName: seat.roomName || seat.roomId,
  code: seat.code,
  x: seat.x,
  y: seat.y,
  hasPower: seat.hasPower,
  nearWindow: seat.nearWindow,
  quietZone: seat.quietZone ?? false,
  status: seat.status,
  updatedAt: formatSeatUpdatedAt(seat.updatedAt)
});

type FloorSeatStatus = 'available' | 'window' | 'taken' | 'selected' | 'disabled';
type FloorSeatRow = {
  key: string;
  label: string;
  seats: AdminSeat[];
};
type FloorEditorToolId =
  | 'select'
  | 'add'
  | 'delete'
  | 'annotate'
  | 'grid'
  | 'refresh'
  | 'info'
  | 'export';

const FLOOR_EDITOR_TOOLS: Array<{
  id: FloorEditorToolId;
  icon: DashboardIconName;
  label: string;
}> = [
  { id: 'select', icon: 'move', label: '选择' },
  { id: 'add', icon: 'plus', label: '添加座位' },
  { id: 'delete', icon: 'trash', label: '删除' },
  { id: 'annotate', icon: 'edit', label: '标注属性' },
  { id: 'grid', icon: 'grid', label: '吸附网格' },
  { id: 'refresh', icon: 'refresh', label: '撤销' }
];

const FLOOR_EDITOR_SUPPORT_TOOLS: Array<{
  id: FloorEditorToolId;
  icon: DashboardIconName;
  label: string;
}> = [
  { id: 'info', icon: 'info', label: '说明' },
  { id: 'export', icon: 'download', label: '导出' }
];

const FLOOR_STATUS_LABELS: Record<FloorSeatStatus, string> = {
  available: '可预约',
  window: '靠窗',
  taken: '已预约',
  selected: '已选择',
  disabled: '停用'
};

const createDraftFloorSeat = (room: AdminRoom, existingSeats: AdminSeat[]): AdminSeat => {
  const occupiedCodes = new Set(existingSeats.map((seat) => seat.code.toUpperCase()));
  for (let rowIndex = 0; rowIndex < 26; rowIndex += 1) {
    const row = String.fromCharCode(65 + rowIndex);
    for (let column = 1; column <= 12; column += 1) {
      const code = `${row}${column}`;
      if (!occupiedCodes.has(code)) {
        return {
          id: `draft-${room.id}-${code.toLowerCase()}-${Date.now()}`,
          roomId: room.id,
          roomName: room.name,
          code,
          x: column,
          y: rowIndex + 1,
          hasPower: false,
          nearWindow: false,
          quietZone: false,
          status: 'ACTIVE',
          updatedAt: '草稿'
        };
      }
    }
  }

  const nextIndex = existingSeats.length + 1;
  return {
    id: `draft-${room.id}-seat-${nextIndex}-${Date.now()}`,
    roomId: room.id,
    roomName: room.name,
    code: `新座位${nextIndex}`,
    x: (nextIndex % 12) + 1,
    y: Math.floor(nextIndex / 12) + 1,
    hasPower: false,
    nearWindow: false,
    quietZone: false,
    status: 'ACTIVE',
    updatedAt: '草稿'
  };
};

export const formatAdminDateLabel = (date: Date = new Date()) =>
  `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;

export const formatAdminMonthLabel = (date: Date = new Date()) =>
  `${date.getFullYear()}年${date.getMonth() + 1}月`;

const ADMIN_DEMO_DATE = new Date();
const ADMIN_DEMO_DATE_LABEL = formatAdminDateLabel(ADMIN_DEMO_DATE);
const ADMIN_DEMO_MONTH_LABEL = formatAdminMonthLabel(ADMIN_DEMO_DATE);

const ADMIN_BOOKING_STATUS_META = {
  active: { label: '使用中', variant: 'green' },
  done: { label: '已完成', variant: 'gray' },
  violation: { label: '违约', variant: 'red' },
  pending: { label: '待签到', variant: 'blue' },
  cancelled: { label: '已取消', variant: 'gray' }
} as const;

const ADMIN_BOOKING_PAGE_SIZE = 10;

const resolveAdminBookingPage = (
  page: AdminBookingRecordPage | undefined,
  records: AdminBookingRecord[]
): AdminBookingRecordPage =>
  page ?? {
    items: records,
    total: records.length,
    page: 1,
    size: ADMIN_BOOKING_PAGE_SIZE
  };

const ADMIN_VIOLATION_STATUS_META = {
  confirmed: { label: '已记录', variant: 'red' },
  recorded: { label: '已记录', variant: 'red' },
  review: { label: '待复核', variant: 'gold' },
  appeal: { label: '申诉中', variant: 'blue' },
  restricted: { label: '限制中', variant: 'gray' }
} as const;

const ADMIN_VIOLATION_PAGE_SIZE = 10;

const resolveAdminViolationPage = (
  page: AdminViolationRecordPage | undefined,
  records: AdminViolationRecord[]
): AdminViolationRecordPage =>
  page ?? {
    items: records,
    total: records.length,
    page: 1,
    size: ADMIN_VIOLATION_PAGE_SIZE
  };

const formatAdminRecordCode = (value: string) => {
  const normalized = value.trim();
  if (normalized.length <= 20) return normalized;
  return `${normalized.slice(0, 8)}…${normalized.slice(-6)}`;
};

const ADMIN_DYNAMIC_CODE_STATUS_META = {
  active: { label: '正常', variant: 'green' },
  expiring: { label: '即将过期', variant: 'gold' },
  expired: { label: '已过期', variant: 'gray' },
  pending: { label: '待处理', variant: 'gold' },
  closed: { label: '维护中', variant: 'gray' }
} as const;

const formatDynamicCodeQrValue = (
  record: AdminDynamicCodeSnapshot['preview'] | undefined | null
) => {
  if (!record) return 'fudan-ibooking://checkin';
  const params = new URLSearchParams({
    room: record.room,
    building: record.building,
    code: record.webCode
  });
  return `fudan-ibooking://checkin?${params.toString()}`;
};

const ADMIN_USER_STATUS_META = {
  active: { label: '正常', variant: 'green' },
  disabled: { label: '停用', variant: 'red' }
} as const;

const formatAdminUserUpdatedAt = (updatedAt?: string) => {
  if (!updatedAt) return '未记录';
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return updatedAt;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hour}:${minute}`;
};

const getAdminUserSource = (user: Pick<AdminUser, 'roles'>) =>
  user.roles?.some((role) => role.code === 'ROLE_STUDENT') ? '统一认证' : '后台创建';

const toAdminUserRow = (user: AdminUser): AdminUserRow => ({
  id: user.id,
  name: user.name,
  account: user.studentNo,
  department: user.departmentName || '未分配',
  role: user.roles?.map((role) => role.name).join('、') || '未绑定角色',
  source: getAdminUserSource(user),
  lastUpdated: formatAdminUserUpdatedAt(user.updatedAt),
  status: user.status === 'ACTIVE' ? 'active' : 'disabled'
});

const ADMIN_ROLE_STATUS_META = {
  active: { label: '启用', variant: 'green' },
  pending: { label: '待审批', variant: 'gold' },
  disabled: { label: '禁用', variant: 'gray' }
} as const;

const formatAdminRoleUpdatedAt = (updatedAt?: string) => {
  if (!updatedAt) return '未记录';
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return updatedAt;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hour}:${minute}`;
};

const getRolePermissionCodes = (role: Pick<AdminRole, 'permissions'>) =>
  new Set((role.permissions ?? []).map((permission) => permission.code));

const getRoleMenuKeys = (role: Pick<AdminRole, 'permissions'>) =>
  Array.from(
    new Set(
      (role.permissions ?? [])
        .map((permission) => permission.menuKey)
        .filter((menuKey): menuKey is string => Boolean(menuKey))
    )
  );

const hasAnyPermission = (permissionCodes: Set<string>, codes: string[]) =>
  codes.some((code) => permissionCodes.has(code));

const getRoleScope = (role: Pick<AdminRole, 'code' | 'name' | 'permissions'>) => {
  const permissionCodes = getRolePermissionCodes(role);
  if (role.code === 'ROLE_FULL_ADMIN') return '全部院系';
  if (role.name.includes('院系')) return '院系范围';
  if (hasAnyPermission(permissionCodes, ['audit.read', 'reports.read'])) return '审计范围';
  if (
    hasAnyPermission(permissionCodes, [
      'room.read',
      'room.write',
      'room.manage',
      'rooms.read',
      'rooms.write',
      'rooms.manage',
      'seat.read',
      'seat.write',
      'seat.manage',
      'seats.read',
      'seats.write',
      'seats.manage'
    ])
  ) {
    return '全校空间';
  }
  return '未配置';
};

const getRoleSpaceAccess = (role: Pick<AdminRole, 'code' | 'permissions'>) => {
  const permissionCodes = getRolePermissionCodes(role);
  if (role.code === 'ROLE_FULL_ADMIN') return '全部';
  if (
    hasAnyPermission(permissionCodes, [
      'room.manage',
      'rooms.manage',
      'seat.manage',
      'seats.manage'
    ])
  ) {
    return '全部';
  }
  if (
    hasAnyPermission(permissionCodes, [
      'room.write',
      'rooms.write',
      'seat.write',
      'seats.write'
    ])
  ) {
    return '可编辑';
  }
  if (
    hasAnyPermission(permissionCodes, [
      'room.read',
      'rooms.read',
      'seat.read',
      'seats.read'
    ])
  ) {
    return '只读';
  }
  return '无';
};

const getRoleOperationAccess = (role: Pick<AdminRole, 'code' | 'permissions'>) => {
  const permissionCodes = getRolePermissionCodes(role);
  if (role.code === 'ROLE_FULL_ADMIN') return '全部';
  if (
    hasAnyPermission(permissionCodes, [
      'booking.manage',
      'bookings.manage',
      'violation.manage',
      'violations.manage'
    ])
  ) {
    return '全部';
  }
  if (
    hasAnyPermission(permissionCodes, [
      'checkin_code.manage',
      'booking.create',
      'booking.write',
      'bookings.write',
      'violation.write',
      'violations.write',
      'qrcode.manage',
      'qrcode.write'
    ])
  ) {
    return '可处理';
  }
  if (
    hasAnyPermission(permissionCodes, [
      'booking.read',
      'bookings.read',
      'violation.read',
      'violations.read',
      'audit.read',
      'reports.read'
    ])
  ) {
    return '只读';
  }
  return '无';
};

export const mapAdminRoleToRow = (role: AdminRole): AdminRoleRow => {
  const menuKeys = role.code === 'ROLE_FULL_ADMIN' ? ADMIN_MENU_IDS : getRoleMenuKeys(role);
  const status = role.name.includes('临时') || menuKeys.length === 0 ? 'pending' : 'active';
  return {
    id: role.id,
    name: role.name,
    users: `${role.userCount ?? 0}`,
    scope: getRoleScope(role),
    spaceAccess: getRoleSpaceAccess(role),
    operationAccess: getRoleOperationAccess(role),
    menuAccess: `${menuKeys.length}/${ADMIN_MENU_IDS.length}`,
    updatedAt: formatAdminRoleUpdatedAt(role.updatedAt),
    status,
    searchText: [
      role.name,
      role.code,
      ...(role.permissions ?? []).map((permission) => permission.name),
      ...(role.permissions ?? []).map((permission) => permission.code),
      ...menuKeys
    ]
      .join(' ')
      .toLowerCase()
  };
};

type AdminRolePermissionGroupView = {
  group: string;
  permissions: string[];
};

type AdminRolePermissionMatrixView = {
  title: string;
  scope: string;
  checked: string;
};

const getAdminRoleMenuLabel = (menuKey?: string | null) =>
  isAdminMenuId(menuKey ?? undefined) ? ADMIN_MENU_META[menuKey as AdminMenuId].title : '未分配菜单';

const buildAdminRolePermissionGroups = (roles: AdminRole[]): AdminRolePermissionGroupView[] => {
  const groups = new Map<string, Set<string>>();
  roles.forEach((role) => {
    (role.permissions ?? []).forEach((permission) => {
      const group = getAdminRoleMenuLabel(permission.menuKey);
      const permissions = groups.get(group) ?? new Set<string>();
      permissions.add(permission.name || permission.code);
      groups.set(group, permissions);
    });
  });

  return Array.from(groups, ([group, permissions]) => ({
    group,
    permissions: Array.from(permissions).sort((left, right) => left.localeCompare(right, 'zh-CN'))
  })).sort((left, right) => left.group.localeCompare(right.group, 'zh-CN'));
};

const buildAdminRolePermissionMatrix = (roles: AdminRole[]): AdminRolePermissionMatrixView[] => {
  const groups = new Map<string, { roles: Set<string>; permissions: Set<string> }>();
  roles.forEach((role) => {
    (role.permissions ?? []).forEach((permission) => {
      const title = getAdminRoleMenuLabel(permission.menuKey);
      const current = groups.get(title) ?? { roles: new Set<string>(), permissions: new Set<string>() };
      current.roles.add(role.name);
      current.permissions.add(permission.code);
      groups.set(title, current);
    });
  });

  return Array.from(groups, ([title, value]) => ({
    title,
    scope: `${value.roles.size} 个角色`,
    checked: `${value.permissions.size} 个权限点`
  })).sort((left, right) => left.title.localeCompare(right.title, 'zh-CN'));
};

const ADMIN_PARAM_STATUS_META = {
  active: { label: '已生效', variant: 'green' },
  pending: { label: '待发布', variant: 'gold' },
  review: { label: '待发布', variant: 'gold' }
} as const;

const ADMIN_AUDIT_STATUS_META = {
  success: { label: '成功', variant: 'green' },
  pending: { label: '待处理', variant: 'gold' },
  failed: { label: '失败', variant: 'red' },
  review: { label: '待审批', variant: 'gold' },
  risk: { label: '异常', variant: 'red' }
} as const;

const ADMIN_REPORT_FILTER_OPTIONS = {
  month: [ADMIN_DEMO_MONTH_LABEL, '近 30 天', '本周'],
  scope: ['全校范围', '普通自习室', '院系自习室'],
  granularity: ['按月统计', '按周统计', '按日统计']
} as const;

type AdminReportExportFormat = 'csv' | 'excel';
type AdminReportFilterKey = keyof typeof ADMIN_REPORT_FILTER_OPTIONS;
type AdminReportFilterState = Record<AdminReportFilterKey, number>;
type AdminReportExportSignal = {
  format: AdminReportExportFormat;
  nonce: number;
};

const DEFAULT_ADMIN_REPORT_FILTER_STATE: AdminReportFilterState = {
  month: 0,
  scope: 0,
  granularity: 0
};

const getAdminReportFilterLabel = (
  filters: AdminReportFilterState,
  key: AdminReportFilterKey
) => {
  const options = ADMIN_REPORT_FILTER_OPTIONS[key];
  return options[filters[key] % options.length];
};

const getAdminReportFilterSummary = (filters: AdminReportFilterState) =>
  [
    getAdminReportFilterLabel(filters, 'month'),
    getAdminReportFilterLabel(filters, 'scope'),
    getAdminReportFilterLabel(filters, 'granularity')
  ].join(' / ');

const escapeCsvCell = (value: string | number) => {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const escapeHtmlCell = (value: string | number) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildAdminReportRows = (
  overview: AdminReportSnapshot,
  filters: AdminReportFilterState
): string[][] => [
  ['筛选条件', getAdminReportFilterSummary(filters)],
  ['数据来源', '后端聚合：预约、签到、座位、用户和角色数据'],
  [],
  ['关键指标', '数值', '说明'],
  ...overview.summary.map((item) => [item.label, item.value, item.note]),
  [],
  ['本周每日预约量', '预约量'],
  ...overview.weeklyBookings.map(([day, value]) => [day, String(value)]),
  [],
  ['热门自习室', '预约次数', '占比'],
  ...overview.topRooms.map((room) => [room.name, String(room.count), `${room.pct}%`]),
  [],
  ['热门座位', '自习室', '使用次数', '特征'],
  ...overview.topSeats,
  [],
  ['低利用率时段', '利用率', '建议'],
  ...overview.lowPeriods
];

export const buildAdminReportExportContent = (
  overview: AdminReportSnapshot,
  filters: AdminReportFilterState,
  format: AdminReportExportFormat
) => {
  const rows = buildAdminReportRows(overview, filters);
  if (format === 'excel') {
    const tableRows = rows
      .map((row) =>
        `<tr>${(row.length > 0 ? row : [''])
          .map((cell) => `<td>${escapeHtmlCell(cell)}</td>`)
          .join('')}</tr>`
      )
      .join('');
    return `<!doctype html><html><head><meta charset="utf-8"></head><body><table>${tableRows}</table></body></html>`;
  }

  return `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n')}`;
};

const downloadAdminReport = (
  overview: AdminReportSnapshot,
  filters: AdminReportFilterState,
  format: AdminReportExportFormat
) => {
  if (
    typeof document === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    return false;
  }

  const content = buildAdminReportExportContent(overview, filters, format);
  const extension = format === 'excel' ? 'xls' : 'csv';
  const mime =
    format === 'excel'
      ? 'application/vnd.ms-excel;charset=utf-8'
      : 'text/csv;charset=utf-8';
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ibooking-report-${getAdminReportFilterLabel(filters, 'month').replace(/\s+/g, '-')}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
};

const STUDENT_MENU_GROUPS: Array<{ label: string; items: StudentMenuItem[] }> = [
  {
    label: '学习空间',
    items: [
      { id: 'home', label: '首页概览', icon: 'home' },
      { id: 'rooms', label: '自习室列表', icon: 'building' }
    ]
  },
  {
    label: '个人服务',
    items: [
      { id: 'bookings', label: '我的预约', icon: 'calendar' },
      { id: 'checkin', label: '签到', icon: 'check-circle' },
      { id: 'assistant', label: '智能助手', icon: 'zap' },
      { id: 'notify', label: '通知中心', icon: 'bell', badge: '3' },
      { id: 'violation', label: '违约记录', icon: 'alert' }
    ]
  }
];

const STUDENT_HOME_STATS = [
  {
    label: '今日全校空座',
    value: '284',
    note: '共 2,840 个座位',
    icon: 'grid',
    tone: F.navy,
    trend: '较昨日 +12%'
  },
  {
    label: '今日我的预约',
    value: '1',
    note: '还有 2 次可用',
    icon: 'calendar',
    tone: '#3A6FA8',
    trend: '14:00 开始'
  },
  {
    label: '常用自习室',
    value: '3',
    note: '光华楼 · 文史馆 · 图书馆',
    icon: 'star',
    tone: F.gold,
    trend: '已收藏'
  },
  {
    label: '本周学习时长',
    value: '12h',
    note: '较上周 +2.5h',
    icon: 'clock',
    tone: F.success,
    trend: '持续提升'
  }
] satisfies Array<{
  label: string;
  value: string;
  note: string;
  icon: DashboardIconName;
  tone: string;
  trend: string;
}>;

const STUDENT_RECOMMENDED_ROOMS = [
  {
    name: '经管自习室 301',
    location: '光华楼 A座 3楼',
    seats: '12 / 48',
    status: '空余充足',
    tags: ['插座', '靠窗', '安静区'],
    tone: F.navy
  },
  {
    name: '理工自习室 201',
    location: '逸夫楼 2楼',
    seats: '31 / 64',
    status: '24小时',
    tags: ['通宵开放', '插座'],
    tone: '#3A6FA8'
  },
  {
    name: '文史馆阅览室',
    location: '文史馆 1楼',
    seats: '5 / 80',
    status: '较繁忙',
    tags: ['靠窗', '低噪音'],
    tone: '#C8820A'
  }
] as const;

const STUDENT_HOME_BOOKING = {
  title: '光华楼 A座 3楼 · 经管自习室 301 · A15 号座位',
  startClock: '14:00',
  endClock: '17:00'
} as const;

const STUDENT_ROOM_LIST = [
  {
    id: 'room-gm-301',
    name: '经管自习室 301',
    building: '光华楼 A座',
    floor: '3楼',
    capacity: 48,
    available: 12,
    hours: '08:00–22:00',
    scope: '全校开放',
    tags: ['插座', '靠窗', '安静区'],
    resourceStatus: 'ACTIVE'
  },
  {
    id: 'room-science-201',
    name: '理工自习室 201',
    building: '逸夫楼',
    floor: '2楼',
    capacity: 64,
    available: 31,
    hours: '00:00–24:00',
    scope: '全校开放',
    tags: ['24小时', '插座', '白板'],
    resourceStatus: 'ACTIVE'
  },
  {
    id: 'room-humanities-a',
    name: '文史馆阅览室 A',
    building: '文史馆',
    floor: '1楼',
    capacity: 80,
    available: 5,
    hours: '08:00–21:00',
    scope: '文理兼容',
    tags: ['靠窗', '低噪音'],
    resourceStatus: 'ACTIVE'
  },
  {
    id: 'room-news-seminar',
    name: '新闻学院研讨室',
    building: '新闻学院楼',
    floor: '4楼',
    capacity: 20,
    available: 0,
    hours: '09:00–20:00',
    scope: '仅新闻学院',
    tags: ['白板', '投影'],
    resourceStatus: 'ACTIVE'
  },
  {
    id: 'room-science-403',
    name: '理工自习室 403',
    building: '逸夫楼',
    floor: '4楼',
    capacity: 56,
    available: 28,
    hours: '08:00–23:00',
    scope: '全校开放',
    tags: ['插座', '安静区'],
    resourceStatus: 'ACTIVE'
  },
  {
    id: 'room-library-zone',
    name: '图书馆自习区',
    building: '李兆基图书馆',
    floor: '2楼',
    capacity: 120,
    available: 44,
    hours: '08:00–22:00',
    scope: '全校开放',
    tags: ['插座', '靠窗', '安静区'],
    resourceStatus: 'ACTIVE'
  }
] satisfies Array<RoomCatalogItem & { available: number }>;

const STUDENT_ROOM_STATUS_META = {
  open: { label: '开放中', variant: 'green' },
  busy: { label: '较繁忙', variant: 'gold' },
  full: { label: '已满座', variant: 'red' }
} as const;
type StudentRoomStatus = keyof typeof STUDENT_ROOM_STATUS_META;
type StudentRoomCatalogSource = RoomCatalogItem & { available?: number };
type StudentRoomListItem = RoomCatalogItem & {
  available: number;
  status: StudentRoomStatus;
};
const getStudentRoomAvailabilityStatus = (
  available: number,
  capacity: number
): StudentRoomStatus => {
  if (capacity <= 0 || available <= 0) return 'full';
  return available / capacity <= 0.2 ? 'busy' : 'open';
};

const STUDENT_ROOM_FILTERS = ['全部楼栋', '全校开放', '有空位', '有插座', '靠窗', '我的收藏'] as const;
type StudentRoomFilter = (typeof STUDENT_ROOM_FILTERS)[number];
const STUDENT_DEFAULT_FAVORITE_ROOM_IDS = ['room-gm-301', 'room-science-201', 'room-humanities-a'] as const;
const STUDENT_ROOM_DATE_OPTIONS = ['今天', '明天', '后天'] as const;
type StudentRoomDateOption = (typeof STUDENT_ROOM_DATE_OPTIONS)[number];
const STUDENT_ROOM_MINUTE_STEP = 30;
const STUDENT_ROOM_MINUTE_OPTIONS = ['00', '30'] as const;
const STUDENT_ROOM_MIN_OPEN_MINUTES = 0;
const STUDENT_ROOM_MAX_CLOSE_MINUTES = 24 * 60;
const STUDENT_ROOM_DEFAULT_CLOSE_MINUTES = 22 * 60;
const normalizeStudentClockMinutes = (minutes: number) =>
  ((minutes % STUDENT_ROOM_MAX_CLOSE_MINUTES) + STUDENT_ROOM_MAX_CLOSE_MINUTES) %
  STUDENT_ROOM_MAX_CLOSE_MINUTES;
const formatStudentClockFromMinutes = (minutes: number) =>
  `${String(Math.floor(normalizeStudentClockMinutes(minutes) / 60)).padStart(2, '0')}:${String(
    normalizeStudentClockMinutes(minutes) % 60
  ).padStart(2, '0')}`;
const createStudentRoomTimeOptions = (startMinutes: number, endMinutes: number) =>
  Array.from(
    { length: Math.floor((endMinutes - startMinutes) / STUDENT_ROOM_MINUTE_STEP) + 1 },
    (_, index) => formatStudentClockFromMinutes(startMinutes + index * STUDENT_ROOM_MINUTE_STEP)
  );
const createStudentRoomHourOptions = (startHour: number, endHour: number) =>
  Array.from({ length: endHour - startHour + 1 }, (_, index) =>
    String(startHour + index).padStart(2, '0')
  );
const STUDENT_ROOM_START_TIMES = createStudentRoomTimeOptions(
  STUDENT_ROOM_MIN_OPEN_MINUTES,
  STUDENT_ROOM_MAX_CLOSE_MINUTES - STUDENT_ROOM_MINUTE_STEP
);
const STUDENT_ROOM_END_TIMES = createStudentRoomTimeOptions(
  STUDENT_ROOM_MIN_OPEN_MINUTES,
  STUDENT_ROOM_MAX_CLOSE_MINUTES - STUDENT_ROOM_MINUTE_STEP
);
const STUDENT_ROOM_START_HOUR_OPTIONS = createStudentRoomHourOptions(0, 23);
const STUDENT_ROOM_END_HOUR_OPTIONS = createStudentRoomHourOptions(0, 23);

type StudentSeatStatus = 'available' | 'window' | 'taken' | 'selected' | 'disabled';

const STUDENT_SEAT_DATES = ['今天', '明天', '后天'] as const;
const STUDENT_SEAT_BUILDINGS = ['光华楼 A座', '逸夫楼', '文史馆', '李兆基图书馆'] as const;
const STUDENT_SEAT_FEATURES = ['插座', '靠窗', '安静区', '白板附近', '无障碍'] as const;

type StudentSeatRoomContext = {
  name: string;
  location: string;
  building: string;
  roomId: string;
  capacity: number;
  available: number;
  hours: string;
  statusLabel: string;
  tags: string[];
};

const STUDENT_ROOM_ID_BY_NAME: Record<string, string> = {
  '经管自习室 301': 'room-gm-301',
  '理工自习室 201': 'room-science-201',
  '文史馆阅览室 A': 'room-humanities-a',
  文史馆阅览室: 'room-humanities-a',
  新闻学院研讨室: 'room-news-seminar',
  '理工自习室 403': 'room-science-403',
  图书馆自习区: 'room-library-zone'
};

const resolveStudentRoomId = (roomName: string) =>
  STUDENT_ROOM_ID_BY_NAME[roomName] ?? `room-${roomName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

const normalizeStudentRoomFavoriteIds = (
  summary: StudentRoomFavoriteSummary,
  rooms: readonly Pick<RoomCatalogItem, 'id' | 'name'>[] = STUDENT_ROOM_LIST
) => {
  const knownRoomIds = new Set(rooms.map((room) => room.id));
  const favoriteIds = new Set<string>();

  (summary.favoriteRoomIds ?? []).forEach((roomId) => {
    if (knownRoomIds.has(roomId)) favoriteIds.add(roomId);
  });
  (summary.favorites ?? []).forEach((favorite) => {
    if (knownRoomIds.has(favorite.roomId)) {
      favoriteIds.add(favorite.roomId);
      return;
    }
    const roomId = resolveStudentRoomId(favorite.room);
    if (knownRoomIds.has(roomId)) favoriteIds.add(roomId);
  });

  return Array.from(favoriteIds);
};

const formatStudentFavoriteRoomSummary = (
  favoriteRoomIds: string[],
  rooms: readonly Pick<RoomCatalogItem, 'id' | 'building'>[] = STUDENT_ROOM_LIST
) => {
  if (favoriteRoomIds.length === 0) return '暂无收藏自习室';
  const roomNames = favoriteRoomIds
    .map((roomId) => rooms.find((room) => room.id === roomId)?.building)
    .filter((building): building is string => Boolean(building));
  return Array.from(new Set(roomNames)).slice(0, 3).join(' · ') || '已收藏自习室';
};

const formatStudentFavoriteRoomNameSummary = (favorites: StudentRoomFavoriteRecord[]) => {
  if (favorites.length === 0) return '暂无收藏自习室';
  return favorites
    .map((favorite) => favorite.room)
    .filter(Boolean)
    .slice(0, 3)
    .join(' · ');
};

const formatStudentHourValue = (hours: number) =>
  Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;

const formatStudentSignedPercent = (value: number) => {
  if (value === 0) return '持平';
  return `${value > 0 ? '+' : ''}${value}%`;
};

const formatStudentAvailableSeatTrend = (deltaPercent: number) =>
  deltaPercent === 0 ? '较昨日持平' : `较昨日 ${formatStudentSignedPercent(deltaPercent)}`;

const formatStudentWeekHourTrend = (currentHours: number, previousHours: number) => {
  const deltaHours = Math.round((currentHours - previousHours) * 10) / 10;
  if (deltaHours === 0) return '较上周持平';
  return `较上周 ${deltaHours > 0 ? '+' : ''}${formatStudentHourValue(deltaHours)}`;
};

const formatStudentStudyTrendLabel = (currentHours: number, previousHours: number) => {
  if (currentHours > previousHours) return '持续提升';
  if (currentHours < previousHours) return '有所下降';
  return '保持稳定';
};

const createStudentSeatId = (roomId: string, seat: string) => {
  if (roomId === 'room-gm-301' && seat === 'C3') return 'seat-gm-301-c3';
  return `seat-${roomId.replace(/^room-/, '')}-${seat.toLowerCase()}`;
};

type StudentSeatBookingDraft = {
  room: string;
  location: string;
  seat: string;
  tags: string[];
  dateLabel: string;
  time: string;
  roomId: string;
  seatId: string;
};

const DEFAULT_STUDENT_SEAT_ROOM_CONTEXT: StudentSeatRoomContext = {
  name: '经管自习室 301',
  location: '光华楼 A座 · 3楼',
  building: '光华楼 A座',
  roomId: 'room-gm-301',
  capacity: 48,
  available: 12,
  hours: '08:00–22:00',
  statusLabel: '开放中',
  tags: ['插座', '靠窗', '安静区']
};

const parseStudentRoomBuildingFromLocation = (location: string) =>
  location.replace(/\s*[·-]?\s*\d+楼$/, '').trim() || location;

const parseStudentRoomSeatCounts = (seats: string) => {
  const [available, capacity] = seats.split('/').map((part) => Number.parseInt(part.trim(), 10));
  return {
    available: Number.isFinite(available) ? available : DEFAULT_STUDENT_SEAT_ROOM_CONTEXT.available,
    capacity: Number.isFinite(capacity) ? capacity : DEFAULT_STUDENT_SEAT_ROOM_CONTEXT.capacity
  };
};

const createStudentRoomListItem = (
  room: StudentRoomCatalogSource,
  stats?: { totalSeats?: number; availableSeats?: number },
  availabilityById: Record<string, number> = {}
): StudentRoomListItem => {
  const capacity = stats?.totalSeats ?? room.capacity;
  const fallbackAvailable = room.available ?? capacity;
  const available = stats?.availableSeats ?? availabilityById[room.id] ?? fallbackAvailable;
  return {
    ...room,
    capacity,
    available,
    status: getStudentRoomAvailabilityStatus(available, capacity)
  };
};

const createStudentSeatRoomContextFromRoom = (
  room: StudentRoomListItem
): StudentSeatRoomContext => ({
  name: room.name,
  location: `${room.building} · ${room.floor}`,
  building: room.building,
  roomId: room.id,
  capacity: room.capacity,
  available: room.available,
  hours: room.hours,
  statusLabel: STUDENT_ROOM_STATUS_META[room.status].label,
  tags: [...room.tags]
});

const createStudentSeatRoomContextFromRecommendedRoom = (
  room: (typeof STUDENT_RECOMMENDED_ROOMS)[number]
): StudentSeatRoomContext => {
  const roomId = resolveStudentRoomId(room.name);
  const matchedRoom = STUDENT_ROOM_LIST.find(
    (candidate) => candidate.id === roomId || candidate.name === room.name
  );
  if (matchedRoom) return createStudentSeatRoomContextFromRoom(createStudentRoomListItem(matchedRoom));

  const seatCounts = parseStudentRoomSeatCounts(room.seats);
  return {
    name: room.name,
    location: room.location,
    building: parseStudentRoomBuildingFromLocation(room.location),
    roomId: resolveStudentRoomId(room.name),
    capacity: seatCounts.capacity,
    available: seatCounts.available,
    hours: '08:00–22:00',
    statusLabel: room.status,
    tags: [...room.tags]
  };
};

const createStudentSeatRoomContextFromName = (roomName: string): StudentSeatRoomContext => {
  const normalizedRoomName = roomName.split('·')[0].trim();
  const matchedRoom = STUDENT_ROOM_LIST.find(
    (room) => normalizedRoomName.includes(room.name) || room.name.includes(normalizedRoomName)
  );
  if (matchedRoom) return createStudentSeatRoomContextFromRoom(createStudentRoomListItem(matchedRoom));
  return {
    ...DEFAULT_STUDENT_SEAT_ROOM_CONTEXT,
    name: normalizedRoomName || roomName,
    roomId: resolveStudentRoomId(normalizedRoomName || roomName)
  };
};

const createStudentSeatBookingDraft = (
  roomContext: StudentSeatRoomContext,
  seat: string,
  tags: string[],
  time = '14:00 – 17:00（3小时）',
  dateLabel = formatStudentBookingDateLabel(getDefaultStudentBookingDateParts())
): StudentSeatBookingDraft => ({
  room: roomContext.name,
  location: roomContext.location,
  seat,
  tags,
  dateLabel,
  time,
  roomId: roomContext.roomId,
  seatId: createStudentSeatId(roomContext.roomId, seat)
});

const updateStudentSeatBookingDraftPosition = (
  draft: StudentSeatBookingDraft,
  seat: string,
  tags: string[]
): StudentSeatBookingDraft => ({
  ...draft,
  seat,
  tags,
  seatId: createStudentSeatId(draft.roomId, seat)
});

const parseStudentClockMinutes = (clock: string) => {
  const [hour = '0', minute = '0'] = clock.split(':');
  return Number(hour) * 60 + Number(minute);
};

const splitStudentClock = (clock: string) => {
  const [hour = '00', minute = '00'] = clock.split(':');
  return {
    hour: String(Number(hour)).padStart(2, '0'),
    minute: (STUDENT_ROOM_MINUTE_OPTIONS as readonly string[]).includes(minute) ? minute : '00'
  };
};

const createStudentClock = (hour: string, minute: string) =>
  `${String(Number(hour)).padStart(2, '0')}:${minute}`;

const getStudentRoomForwardEndMinutes = (startClock: string, endClock: string) => {
  const startMinutes = parseStudentClockMinutes(startClock);
  const endMinutes = parseStudentClockMinutes(endClock);
  return endMinutes <= startMinutes
    ? endMinutes + STUDENT_ROOM_MAX_CLOSE_MINUTES
    : endMinutes;
};

const getStudentRoomDurationMinutes = (startClock: string, endClock: string) =>
  getStudentRoomForwardEndMinutes(startClock, endClock) - parseStudentClockMinutes(startClock);

const formatStudentBookingDurationLabel = (startClock: string, endClock: string) => {
  const durationMinutes = Math.max(STUDENT_ROOM_MINUTE_STEP, getStudentRoomDurationMinutes(startClock, endClock));
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (minutes === 0) return `${hours}小时`;
  if (hours === 0) return `${minutes}分钟`;
  return `${hours}小时${minutes}分钟`;
};

const isStudentRoomStartClockBookable = (
  dateLabel: (typeof STUDENT_ROOM_DATE_OPTIONS)[number],
  startClock: string,
  now = new Date()
) =>
  STUDENT_ROOM_START_TIMES.includes(startClock) &&
  !isStudentRoomPastStartTime(dateLabel, startClock, now);

const isStudentRoomEndClockBookable = (startClock: string, endClock: string) => {
  const durationMinutes = getStudentRoomDurationMinutes(startClock, endClock);
  return (
    STUDENT_ROOM_END_TIMES.includes(endClock) &&
    durationMinutes >= STUDENT_ROOM_MINUTE_STEP &&
    durationMinutes <= 240
  );
};

const getStudentRoomBookableStartMinutes = (
  dateLabel: (typeof STUDENT_ROOM_DATE_OPTIONS)[number],
  hour: string,
  now = new Date()
) =>
  STUDENT_ROOM_MINUTE_OPTIONS.filter((minute) =>
    isStudentRoomStartClockBookable(dateLabel, createStudentClock(hour, minute), now)
  );

const getStudentRoomBookableEndMinutes = (startClock: string, hour: string) =>
  STUDENT_ROOM_MINUTE_OPTIONS.filter((minute) =>
    isStudentRoomEndClockBookable(startClock, createStudentClock(hour, minute))
  );

const normalizeStudentRoomEndTime = (startClock: string, endClock: string) => {
  const startMinutes = parseStudentClockMinutes(startClock);
  if (isStudentRoomEndClockBookable(startClock, endClock)) {
    return endClock;
  }
  return formatStudentClockFromMinutes(getStudentRoomPreferredEndMinutes(startMinutes));
};

const getStudentShanghaiClockMinutes = (now = new Date()) => {
  const shanghaiTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return shanghaiTime.getUTCHours() * 60 + shanghaiTime.getUTCMinutes();
};

const getStudentShanghaiCurrentSlotStartMinutes = (now = new Date()) =>
  Math.floor(getStudentShanghaiClockMinutes(now) / STUDENT_ROOM_MINUTE_STEP) *
  STUDENT_ROOM_MINUTE_STEP;

const isStudentRoomPastStartTime = (
  dateLabel: (typeof STUDENT_ROOM_DATE_OPTIONS)[number],
  startClock: string,
  now = new Date()
) =>
  dateLabel === '今天' &&
  parseStudentClockMinutes(startClock) < getStudentShanghaiCurrentSlotStartMinutes(now);

const getStudentRoomBookableStartTimes = (
  dateLabel: (typeof STUDENT_ROOM_DATE_OPTIONS)[number],
  now = new Date()
) => STUDENT_ROOM_START_TIMES.filter((time) => !isStudentRoomPastStartTime(dateLabel, time, now));

const getStudentRoomPreferredEndMinutes = (startMinutes: number) => {
  const preferredEndMinutes = startMinutes + 180;
  if (
    startMinutes < STUDENT_ROOM_DEFAULT_CLOSE_MINUTES &&
    preferredEndMinutes > STUDENT_ROOM_DEFAULT_CLOSE_MINUTES
  ) {
    return Math.max(startMinutes + STUDENT_ROOM_MINUTE_STEP, STUDENT_ROOM_DEFAULT_CLOSE_MINUTES);
  }
  return preferredEndMinutes;
};

const getStudentRoomDefaultEndTime = (startClock: string) =>
  formatStudentClockFromMinutes(getStudentRoomPreferredEndMinutes(parseStudentClockMinutes(startClock)));

const createStudentRoomSearchTimeState = (
  dateLabel: StudentRoomDateOption,
  now = new Date(),
  preferredStart = '14:00',
  preferredEnd?: string
): {
  selectedDate: (typeof STUDENT_ROOM_DATE_OPTIONS)[number];
  startTime: string;
  endTime: string;
} => {
  const bookableStartTimes = getStudentRoomBookableStartTimes(dateLabel, now);
  const shouldPreferTomorrow =
    dateLabel === '今天' &&
    !(bookableStartTimes as readonly string[]).includes(preferredStart) &&
    getStudentShanghaiCurrentSlotStartMinutes(now) >= STUDENT_ROOM_DEFAULT_CLOSE_MINUTES;
  const normalizedDate = bookableStartTimes.length > 0 && !shouldPreferTomorrow ? dateLabel : '明天';
  const normalizedStartTimes = getStudentRoomBookableStartTimes(normalizedDate, now);
  const startTime = (normalizedStartTimes as readonly string[]).includes(preferredStart)
    ? preferredStart
    : normalizedStartTimes.includes('14:00')
      ? '14:00'
      : normalizedStartTimes[0] ?? preferredStart;
  const endTime = normalizeStudentRoomEndTime(
    startTime,
    preferredEnd ?? getStudentRoomDefaultEndTime(startTime)
  );

  return { selectedDate: normalizedDate, startTime, endTime };
};

const normalizeStudentBookingDateOption = (
  dateLabel: string | undefined,
  now = new Date()
): StudentRoomDateOption => {
  if (/今天|今日/.test(dateLabel ?? '')) return '今天';
  if (/明天/.test(dateLabel ?? '')) return '明天';
  if (/后天/.test(dateLabel ?? '')) return '后天';

  const absoluteMatch = dateLabel?.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (absoluteMatch) {
    const key = `${absoluteMatch[1]}-${String(Number(absoluteMatch[2])).padStart(2, '0')}-${String(
      Number(absoluteMatch[3])
    ).padStart(2, '0')}`;
    if (key === formatStudentDatePartsKey(getShanghaiDateParts(now, 0))) return '今天';
    if (key === formatStudentDatePartsKey(getShanghaiDateParts(now, 1))) return '明天';
    if (key === formatStudentDatePartsKey(getShanghaiDateParts(now, 2))) return '后天';
  }

  return '明天';
};

const updateStudentSeatBookingDraftTime = (
  draft: StudentSeatBookingDraft,
  dateLabel: StudentRoomDateOption,
  startClock: string,
  endClock: string
): StudentSeatBookingDraft => ({
  ...draft,
  dateLabel,
  time: formatStudentRoomBookingTime(startClock, endClock)
});

const buildStudentRoomAvailabilityRange = (
  dateLabel: StudentRoomDateOption,
  startClock: string,
  endClock: string,
  now = new Date()
) => {
  const sourceTime = `${dateLabel} ${formatStudentRoomBookingTime(startClock, endClock)}`;
  const startDateParts = resolveStudentBookingDateParts(sourceTime, now);
  const endDateParts =
    parseStudentClockMinutes(endClock) <= parseStudentClockMinutes(startClock)
      ? addStudentBookingDateParts(startDateParts, 1)
      : startDateParts;

  return {
    startAt: toShanghaiIso(startDateParts.year, startDateParts.month, startDateParts.day, startClock),
    endAt: toShanghaiIso(endDateParts.year, endDateParts.month, endDateParts.day, endClock)
  };
};

const buildStudentCurrentRoomAvailabilityRange = (now = new Date()) => {
  const startMinutes = getStudentShanghaiCurrentSlotStartMinutes(now);
  const startClock = formatStudentClockFromMinutes(startMinutes);
  const endClock = formatStudentClockFromMinutes(startMinutes + STUDENT_ROOM_MINUTE_STEP);
  return buildStudentRoomAvailabilityRange('今天', startClock, endClock, now);
};

const mapStudentRoomAvailableSeatsById = (summary: StudentRoomAvailabilitySummary) =>
  summary.rooms.reduce<Record<string, number>>(
    (availableSeatsById, room) => ({
      ...availableSeatsById,
      [room.roomId]: room.availableSeats
    }),
    {}
  );

const mapStudentRoomTotalSeatsById = (summary: StudentRoomAvailabilitySummary) =>
  summary.rooms.reduce<Record<string, number>>(
    (totalSeatsById, room) => ({
      ...totalSeatsById,
      [room.roomId]: room.totalSeats
    }),
    {}
  );

const isStudentRoomOpenForTime = (
  room: Pick<RoomCatalogItem, 'hours'>,
  startClock: string,
  endClock: string
) => {
  const match = room.hours.match(/(\d{1,2}:\d{2})\s*[–-]\s*(?:次日\s*)?(\d{1,2}:\d{2})/);
  if (!match) return true;
  const [, openClock, closeClock] = match;
  const openMinutes = parseStudentClockMinutes(openClock);
  const closeMinutes = parseStudentClockMinutes(closeClock);
  if (openMinutes === 0 && closeMinutes === STUDENT_ROOM_MAX_CLOSE_MINUTES) return true;
  const normalizedCloseMinutes =
    closeMinutes <= openMinutes ? closeMinutes + STUDENT_ROOM_MAX_CLOSE_MINUTES : closeMinutes;
  let startMinutes = parseStudentClockMinutes(startClock);
  let endMinutes = getStudentRoomForwardEndMinutes(startClock, endClock);

  if (normalizedCloseMinutes > STUDENT_ROOM_MAX_CLOSE_MINUTES && startMinutes < openMinutes) {
    startMinutes += STUDENT_ROOM_MAX_CLOSE_MINUTES;
    endMinutes += STUDENT_ROOM_MAX_CLOSE_MINUTES;
  }

  return startMinutes >= openMinutes && endMinutes <= normalizedCloseMinutes;
};

const formatStudentRoomBookingTime = (startClock: string, endClock: string) =>
  `${startClock} – ${endClock}（${formatStudentBookingDurationLabel(startClock, endClock)}）`;

type StudentRoomWithContext = StudentRoomListItem & {
  roomContext: StudentSeatRoomContext;
};

const groupStudentRoomsByBuilding = (rooms: StudentRoomListItem[]) =>
  rooms.map((room) => ({
    ...room,
    roomContext: createStudentSeatRoomContextFromRoom(room)
  })).reduce(
    (groups, room) => {
      const buildingGroup =
        groups.find((group) => group.building === room.building) ??
        (() => {
          const nextGroup = {
            building: room.building,
            floors: [] as Array<{ floor: string; rooms: StudentRoomWithContext[] }>
          };
          groups.push(nextGroup);
          return nextGroup;
        })();
      const floorGroup =
        buildingGroup.floors.find((floor) => floor.floor === room.floor) ??
        (() => {
          const nextFloor = { floor: room.floor, rooms: [] as StudentRoomWithContext[] };
          buildingGroup.floors.push(nextFloor);
          return nextFloor;
        })();
      floorGroup.rooms.push(room);
      return groups;
    },
    [] as Array<{
      building: string;
      floors: Array<{
        floor: string;
        rooms: StudentRoomWithContext[];
      }>;
    }>
  );

const STUDENT_SEAT_ROWS: StudentSeatStatus[][] = [
  ['available', 'available', 'taken', 'available', 'taken', 'available', 'available', 'available'],
  ['window', 'window', 'window', 'window', 'window', 'window', 'window', 'window'],
  ['taken', 'available', 'selected', 'taken', 'available', 'taken', 'available', 'taken'],
  ['available', 'taken', 'available', 'available', 'available', 'taken', 'available', 'available'],
  ['available', 'available', 'taken', 'taken', 'available', 'available', 'taken', 'available'],
  ['taken', 'available', 'available', 'available', 'taken', 'available', 'available', 'taken'],
  ['disabled', 'disabled', 'available', 'taken', 'available', 'available', 'taken', 'disabled']
];

const STUDENT_SEAT_STATUS_LABELS: Record<StudentSeatStatus, string> = {
  available: '空闲',
  window: '靠窗',
  taken: '已占',
  selected: '已选',
  disabled: '停用'
};

const STUDENT_SEAT_LEGEND: Array<{
  status: StudentSeatStatus;
  label: string;
}> = [
  { status: 'available', label: '空闲' },
  { status: 'taken', label: '已占' },
  { status: 'selected', label: '已选' },
  { status: 'window', label: '靠窗' },
  { status: 'disabled', label: '停用' }
];

const STUDENT_SEAT_TIME_SLOTS = [
  { time: '08:00–12:00', label: '空闲', status: 'available' },
  { time: '12:00–14:00', label: '已占用', status: 'taken' },
  { time: '14:00–17:00', label: '已选', status: 'selected' },
  { time: '17:00–22:00', label: '空闲', status: 'available' }
] as const;

const DEFAULT_STUDENT_BOOKING_START_CLOCK = '14:00';
const DEFAULT_STUDENT_BOOKING_END_CLOCK = '17:00';

const STUDENT_BOOKING_RULES = [
  ['签到规则', '开始时间后 15 分钟内扫码/输码签到，逾期自动取消并记录违约 1 次'],
  ['提前离开', '可通过系统提前结束，不记违约；无故离席超 30 分钟视同违约'],
  ['取消规则', '开始前 1 小时以上取消不记违约；1 小时内取消记违约 0.5 次'],
  ['违约累计', '本学期累计 3 次违约将被限制预约 7 天；5 次限制 30 天']
] as const;

const STUDENT_REMINDER_OPTIONS = ['微信服务通知', '邮件提醒', '不提醒'] as const;

const STUDENT_BOOKING_FILTERS = ['全部', '待签到', '使用中', '已完成', '已取消', '违约'] as const;

const STUDENT_BOOKING_LIST = [
  {
    seat: 'C3',
    room: '经管自习室 301',
    location: '光华楼 A座',
    time: '今日 14:00–17:00',
    status: 'upcoming',
    tags: ['插座']
  },
  {
    seat: 'F12',
    room: '理工自习室 201',
    location: '逸夫楼 2楼',
    time: '4月22日 09:00–12:00',
    status: 'completed',
    tags: ['24小时']
  },
  {
    seat: 'A5',
    room: '文史馆阅览室',
    location: '文史馆 1楼',
    time: '4月20日 14:00–16:00',
    status: 'completed',
    tags: ['靠窗']
  },
  {
    seat: 'D8',
    room: '经管自习室 301',
    location: '光华楼 A座',
    time: '4月18日 10:00–12:00',
    status: 'violation',
    tags: []
  },
  {
    seat: 'B3',
    room: '理工自习室 201',
    location: '逸夫楼 2楼',
    time: '4月15日 19:00–22:00',
    status: 'cancelled',
    tags: []
  }
] satisfies Array<{
  seat: string;
  room: string;
  location: string;
  time: string;
  status: StudentBookingStatus;
  tags: string[];
}>;

const STUDENT_BOOKING_STATUS_META: Record<
  StudentBookingStatus,
  {
    label: string;
    variant: 'blue' | 'green' | 'red' | 'gray';
    icon: DashboardIconName;
  }
> = {
  upcoming: { label: '待签到', variant: 'blue', icon: 'clock' },
  using: { label: '使用中', variant: 'green', icon: 'check-circle' },
  completed: { label: '已完成', variant: 'green', icon: 'check-circle' },
  violation: { label: '违约', variant: 'red', icon: 'alert' },
  cancelled: { label: '已取消', variant: 'gray', icon: 'x' }
};

const STUDENT_DAILY_BOOKING_LIMIT = 3;

const getStudentBookingStatusLabel = (status: StudentBookingStatus) =>
  STUDENT_BOOKING_STATUS_META[status].label;

const getStudentBookingFallbackSummary = (): StudentBookingSummaryView =>
  mapStudentBookingSummaryToView({
    totalCount: STUDENT_BOOKING_LIST.length,
    activeCount: STUDENT_BOOKING_LIST.filter((booking) => booking.status === 'upcoming').length,
    completedCount: STUDENT_BOOKING_LIST.filter((booking) => booking.status === 'completed')
      .length,
    records: STUDENT_BOOKING_LIST.map((booking) => ({
      id: `fallback-${booking.room}-${booking.seat}-${booking.time}`,
      room: booking.room,
      location: booking.location,
      seat: booking.seat,
      time: booking.time,
      status: booking.status,
      tags: [...booking.tags],
      canCheckIn: booking.status === 'upcoming',
      canCancel: booking.status === 'upcoming',
      startAt: '',
      endAt: ''
    }))
  });

const createEmptyStudentBookingSummary = (): StudentBookingSummaryView => ({
  totalCount: 0,
  activeCount: 0,
  completedCount: 0,
  records: []
});

export const mapStudentBookingSummaryToView = (
  summary: StudentBookingSummary
): StudentBookingSummaryView => ({
  totalCount: summary.totalCount,
  activeCount: summary.activeCount,
  completedCount: summary.completedCount,
  records: summary.records.map((record) => {
    const meta = STUDENT_BOOKING_STATUS_META[record.status];
    return {
      ...record,
      statusLabel: meta.label,
      statusVariant: meta.variant,
      statusIcon: meta.icon
    };
  })
});

export const formatStudentBookingSubtitle = (
  summary: Pick<StudentBookingSummaryView, 'totalCount' | 'completedCount'>
) => `本学期共 ${summary.totalCount} 次预约 · ${summary.completedCount} 次完成`;

const formatStudentAssistantBookingActionNotice = (
  context: StudentAssistantBookingActionContext
) => {
  const actionLabel = STUDENT_ASSISTANT_ACTION_LABELS[context.action];
  return `已从智能助手定位：${context.booking.room} · ${context.booking.seat} · ${context.booking.time}，当前操作：${actionLabel}`;
};

const createStudentSeatBookingSummary = (
  seat?: StudentAssistantSeatCandidate,
  draft?: Pick<StudentSeatBookingDraft, 'location' | 'time' | 'dateLabel'>
) =>
  seat
    ? [
        ['推荐时段', seat.time],
        ['楼栋', seat.location],
        ['座位', `${seat.room} · ${seat.seat}`]
      ]
    : [
        ['日期', draft?.dateLabel ?? formatStudentBookingDateLabel(getDefaultStudentBookingDateParts())],
        ['时间', draft?.time ?? '14:00 – 17:00（3小时）'],
        ['楼栋', draft?.location ?? DEFAULT_STUDENT_SEAT_ROOM_CONTEXT.location]
      ];

const parseStudentAssistantTimeRange = (time?: string): [string, string] => {
  const match = time?.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
  return match ? [match[1], match[2]] : ['14:00', '17:00'];
};

const createStudentSeatBookingDraftFromAssistantSeat = (
  seat: StudentAssistantSeatCandidate,
  now = new Date()
): StudentSeatBookingDraft => {
  const [startClock, endClock] = parseStudentAssistantTimeRange(seat.time);
  return {
    room: seat.room,
    location: seat.location,
    seat: seat.seat,
    tags: [...seat.tags],
    dateLabel: normalizeStudentBookingDateOption(seat.time, now),
    time: formatStudentRoomBookingTime(startClock, endClock),
    roomId: seat.roomId,
    seatId: seat.seatId
  };
};

const createStudentBookingConfirmDetails = (
  seat?: StudentAssistantSeatCandidate,
  draft?: StudentSeatBookingDraft
) => {
  if (seat) {
    return [
      ['自习室', seat.room],
      ['楼栋位置', seat.location],
      ['座位编号', formatStudentSeatWithTags(seat.seat, seat.tags)],
      ['预约日期', draft?.dateLabel ?? normalizeStudentBookingDateOption(seat.time)],
      ['预约时间', draft?.time ?? seat.time]
    ];
  }

  if (draft) {
    return [
      ['自习室', draft.room],
      ['楼栋位置', draft.location],
      ['座位编号', formatStudentSeatWithTags(draft.seat, draft.tags)],
      ['预约日期', draft.dateLabel],
      ['预约时间', draft.time]
    ];
  }

  return createDefaultStudentBookingConfirmDetails();
};

export const buildStudentBookingRequest = (
  seat?: StudentAssistantSeatCandidate,
  now = new Date(),
  draft?: StudentSeatBookingDraft
): CreateStudentBookingRequest => {
  const sourceTime = draft ? `${draft.dateLabel} ${draft.time}` : seat?.time;
  const [startClock, endClock] = parseStudentAssistantTimeRange(sourceTime);
  const startDateParts = resolveStudentBookingDateParts(sourceTime, now);
  const endDateParts =
    parseStudentClockMinutes(endClock) <= parseStudentClockMinutes(startClock)
      ? addStudentBookingDateParts(startDateParts, 1)
      : startDateParts;

  return {
    roomId: draft?.roomId ?? seat?.roomId ?? 'room-gm-301',
    seatId: draft?.seatId ?? seat?.seatId ?? 'seat-gm-301-c3',
    startAt: toShanghaiIso(startDateParts.year, startDateParts.month, startDateParts.day, startClock),
    endAt: toShanghaiIso(endDateParts.year, endDateParts.month, endDateParts.day, endClock)
  };
};

const formatStudentBookingRecordTimeFromDraft = (draft: StudentSeatBookingDraft) =>
  `${draft.dateLabel} ${draft.time.replace(/（[^）]*）/g, '').trim()}`;

const mergeStudentBookingRecordWithDraft = (
  booking: StudentBookingRecord,
  draft: StudentSeatBookingDraft,
  request: CreateStudentBookingRequest
): StudentBookingRecord => ({
  ...booking,
  room: draft.room,
  location: draft.location,
  seat: draft.seat,
  time: formatStudentBookingRecordTimeFromDraft(draft),
  tags: [...draft.tags],
  startAt: request.startAt,
  endAt: request.endAt
});

const createDefaultStudentBookingConfirmDetails = () => [
  ['自习室', '经管自习室 301'],
  ['楼栋位置', '光华楼 A座 3楼'],
  ['座位编号', 'C3（插座 · 安静区）'],
  ['预约日期', formatStudentBookingDateLabel(getDefaultStudentBookingDateParts())],
  ['开始时间', DEFAULT_STUDENT_BOOKING_START_CLOCK],
  ['结束时间', `${DEFAULT_STUDENT_BOOKING_END_CLOCK}（共3小时）`]
];

type StudentBookingDateParts = {
  year: string;
  month: string;
  day: string;
};

const resolveStudentBookingDateParts = (
  label?: string,
  now = new Date()
): StudentBookingDateParts => {
  const absoluteMatch = label?.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (absoluteMatch) {
    return {
      year: absoluteMatch[1],
      month: String(Number(absoluteMatch[2])).padStart(2, '0'),
      day: String(Number(absoluteMatch[3])).padStart(2, '0')
    };
  }

  if (/今天/.test(label ?? '')) return getShanghaiDateParts(now, 0);
  if (/明天/.test(label ?? '')) return getShanghaiDateParts(now, 1);
  if (/后天/.test(label ?? '')) return getShanghaiDateParts(now, 2);
  return getDefaultStudentBookingDateParts(now);
};

const getDefaultStudentBookingDateParts = (now = new Date()) => getShanghaiDateParts(now, 1);

const getShanghaiDateParts = (date: Date, dayOffset: number): StudentBookingDateParts => {
  const shanghaiDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  shanghaiDate.setUTCDate(shanghaiDate.getUTCDate() + dayOffset);
  const [year, month, day] = shanghaiDate.toISOString().slice(0, 10).split('-');
  return { year, month, day };
};

const addStudentBookingDateParts = (
  parts: StudentBookingDateParts,
  dayOffset: number
): StudentBookingDateParts => {
  const date = new Date(
    Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + dayOffset)
  );
  return {
    year: String(date.getUTCFullYear()),
    month: String(date.getUTCMonth() + 1).padStart(2, '0'),
    day: String(date.getUTCDate()).padStart(2, '0')
  };
};

const formatStudentBookingDateLabel = ({ year, month, day }: StudentBookingDateParts) => {
  const date = new Date(`${year}-${month}-${day}T00:00:00+08:00`);
  const weekday = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    weekday: 'short'
  }).format(date);
  return `${year}年${Number(month)}月${Number(day)}日（${weekday}）`;
};

const formatStudentHomeDateLabel = (now = new Date()) => {
  const { year, month, day } = getShanghaiDateParts(now, 0);
  return `${year}年${Number(month)}月${Number(day)}日`;
};

const createStudentShanghaiClockDate = (now: Date, clock: string) => {
  const { year, month, day } = getShanghaiDateParts(now, 0);
  return new Date(`${year}-${month}-${day}T${clock}:00+08:00`);
};

const formatStudentRelativeDuration = (minutes: number) => {
  const safeMinutes = Math.max(0, Math.ceil(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  return hours > 0 ? `${hours}小时${remainingMinutes}分` : `${remainingMinutes}分`;
};

type StudentHomeBookingActionState = 'upcoming' | 'checkin' | 'active' | 'ended' | 'empty';

type StudentHomeBookingBanner = {
  actionState: StudentHomeBookingActionState;
  label: string;
  statTrend: string;
  statusPrefix: string;
  statusValue: string;
  timeRangeLabel: string;
  title: string;
};

const normalizeStudentBookingTimeRangeLabel = (time: string) => time.replace(/\s*-\s*/g, ' – ');

const getStudentBookingCheckInDeadline = (booking: StudentBookingRecord, fallbackStartAt: Date) => {
  const serverDeadlineAt = booking.checkInDeadlineAt ? new Date(booking.checkInDeadlineAt) : null;
  if (serverDeadlineAt && !Number.isNaN(serverDeadlineAt.getTime())) return serverDeadlineAt;

  const createdAt = booking.createdAt ? new Date(booking.createdAt) : null;
  const deadlineBaseAt =
    createdAt && !Number.isNaN(createdAt.getTime()) && createdAt > fallbackStartAt
      ? createdAt
      : fallbackStartAt;
  return new Date(deadlineBaseAt.getTime() + 15 * 60 * 1000);
};

const getStudentBookingClockLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai'
  }).format(date);
};

const formatStudentDatePartsKey = ({ year, month, day }: StudentBookingDateParts) =>
  `${year}-${month}-${day}`;

const getStudentShanghaiDateKey = (date: Date) => formatStudentDatePartsKey(getShanghaiDateParts(date, 0));

const isStudentActiveBookingRecord = (record: StudentBookingRecord) =>
  record.status === 'upcoming' || record.status === 'using';

const resolveStudentBookingStartDateKey = (record: StudentBookingRecord, now: Date) => {
  const startAt = new Date(record.startAt);
  if (!Number.isNaN(startAt.getTime())) return getStudentShanghaiDateKey(startAt);
  if (/今天|今日/.test(record.time)) return getStudentShanghaiDateKey(now);
  if (/明天/.test(record.time)) return formatStudentDatePartsKey(getShanghaiDateParts(now, 1));
  if (/后天/.test(record.time)) return formatStudentDatePartsKey(getShanghaiDateParts(now, 2));
  return '';
};

const getStudentTodayActiveBookings = (summary: StudentBookingSummaryView, now: Date) => {
  const todayKey = getStudentShanghaiDateKey(now);
  return summary.records.filter(
    (record) =>
      isStudentActiveBookingRecord(record) && resolveStudentBookingStartDateKey(record, now) === todayKey
  );
};

const formatStudentTodayBookingStatTrend = (
  bookings: StudentBookingRecord[],
  now: Date
) => {
  if (bookings.length === 0) return '今日暂无';
  if (bookings.some((booking) => booking.status === 'using')) return '进行中';

  const nextBooking = [...bookings]
    .map((booking) => ({ booking, startAt: new Date(booking.startAt) }))
    .filter(({ startAt }) => !Number.isNaN(startAt.getTime()))
    .sort((left, right) => left.startAt.getTime() - right.startAt.getTime())
    .find(({ startAt }) => startAt.getTime() >= now.getTime());
  const startLabel = nextBooking ? getStudentBookingClockLabel(nextBooking.booking.startAt) : '';
  return startLabel ? `${startLabel} 开始` : '待签到';
};

const createStudentRoomAvailabilityByBookingSummary = (
  summary: StudentBookingSummaryView
): Record<string, number> => {
  const reservedCountByRoomId = summary.records.reduce<Record<string, number>>((counts, record) => {
    if (!isStudentActiveBookingRecord(record)) return counts;
    const roomId = resolveStudentRoomId(record.room);
    return {
      ...counts,
      [roomId]: (counts[roomId] ?? 0) + 1
    };
  }, {});

  return STUDENT_ROOM_LIST.reduce<Record<string, number>>((availabilityById, room) => {
    const reservedCount = reservedCountByRoomId[room.id] ?? 0;
    return {
      ...availabilityById,
      [room.id]: Math.max(0, room.available - reservedCount)
    };
  }, {});
};

const createStudentHomeEmptyBookingBanner = (): StudentHomeBookingBanner => ({
  actionState: 'empty',
  label: '暂无预约',
  statTrend: '暂无待签到',
  statusPrefix: '可从自习室列表预约新的学习时段',
  statusValue: '',
  timeRangeLabel: '当前没有待开始或进行中的预约',
  title: '暂无预约'
});

const createStudentHomeBookingBannerFromSummary = (
  summary: StudentBookingSummaryView,
  now = new Date()
): StudentHomeBookingBanner => {
  const booking =
    summary.records.find((record) => record.status === 'using') ??
    summary.records.find((record) => record.status === 'upcoming');

  if (!booking) return createStudentHomeEmptyBookingBanner();

  const startAt = new Date(booking.startAt);
  const endAt = new Date(booking.endAt);
  const hasStartAt = !Number.isNaN(startAt.getTime());
  const hasEndAt = !Number.isNaN(endAt.getTime());
  const title = `${booking.location} · ${booking.room} · ${booking.seat} 号座位`;
  const timeRangeLabel = normalizeStudentBookingTimeRangeLabel(booking.time);

  if (booking.status === 'using') {
    return {
      actionState: 'active',
      label: '进行中预约',
      statTrend: '进行中',
      statusPrefix: hasEndAt ? '距结束还有' : '正在使用中',
      statusValue: hasEndAt ? formatStudentRelativeDuration((endAt.getTime() - now.getTime()) / 60000) : '',
      timeRangeLabel,
      title
    };
  }

  if (booking.status === 'upcoming' && hasStartAt && hasEndAt && now >= startAt && now < endAt) {
    const checkInDeadlineAt = getStudentBookingCheckInDeadline(booking, startAt);
    if (booking.canCheckIn !== false && now < checkInDeadlineAt) {
      return {
        actionState: 'checkin',
        label: '待签到预约',
        statTrend: '待签到',
        statusPrefix: '距签到截止还有',
        statusValue: formatStudentRelativeDuration((checkInDeadlineAt.getTime() - now.getTime()) / 60000),
        timeRangeLabel,
        title
      };
    }

    return {
      actionState: 'ended',
      label: '待处理预约',
      statTrend: '签到超时',
      statusPrefix: '已超过签到时间，请查看记录',
      statusValue: '',
      timeRangeLabel,
      title
    };
  }

  if (hasEndAt && now >= endAt) {
    return {
      actionState: 'ended',
      label: '最近预约',
      statTrend: '已结束',
      statusPrefix: `已于 ${getStudentBookingClockLabel(booking.endAt) || '结束时间'} 结束`,
      statusValue: '',
      timeRangeLabel,
      title
    };
  }

  return {
    actionState: 'upcoming',
    label: '下一场预约',
    statTrend: `${getStudentBookingClockLabel(booking.startAt) || '预约时间'} 开始`,
    statusPrefix: hasStartAt ? '距开始还有' : '待开始',
    statusValue: hasStartAt ? formatStudentRelativeDuration((startAt.getTime() - now.getTime()) / 60000) : '',
    timeRangeLabel,
    title
  };
};

const createStudentHomeBookingBanner = (
  now = new Date(),
  summary?: StudentBookingSummaryView
): StudentHomeBookingBanner => {
  if (summary) return createStudentHomeBookingBannerFromSummary(summary, now);

  const startAt = createStudentShanghaiClockDate(now, STUDENT_HOME_BOOKING.startClock);
  const endAt = createStudentShanghaiClockDate(now, STUDENT_HOME_BOOKING.endClock);
  const timeRangeLabel = `今日 ${STUDENT_HOME_BOOKING.startClock} – ${STUDENT_HOME_BOOKING.endClock}`;

  if (now.getTime() < startAt.getTime()) {
    return {
      actionState: 'upcoming',
      label: '下一场预约',
      statTrend: `${STUDENT_HOME_BOOKING.startClock} 开始`,
      statusPrefix: '距开始还有',
      statusValue: formatStudentRelativeDuration((startAt.getTime() - now.getTime()) / 60000),
      timeRangeLabel,
      title: STUDENT_HOME_BOOKING.title
    };
  }

  if (now.getTime() < endAt.getTime()) {
    return {
      actionState: 'active',
      label: '进行中预约',
      statTrend: '进行中',
      statusPrefix: '距结束还有',
      statusValue: formatStudentRelativeDuration((endAt.getTime() - now.getTime()) / 60000),
      timeRangeLabel,
      title: STUDENT_HOME_BOOKING.title
    };
  }

  return {
    actionState: 'ended',
    label: '最近预约',
    statTrend: '已结束',
    statusPrefix: `已于 ${STUDENT_HOME_BOOKING.endClock} 结束`,
    statusValue: '',
    timeRangeLabel,
    title: STUDENT_HOME_BOOKING.title
  };
};

const toShanghaiIso = (year: string, month: string, day: string, clock: string) =>
  new Date(`${year}-${month}-${day}T${clock}:00+08:00`).toISOString();

const STUDENT_CHECKIN_CODE_LENGTH = 6;

const createStudentCheckInDigits = (length = STUDENT_CHECKIN_CODE_LENGTH) =>
  Array.from({ length }, () => '');

const formatStudentCheckInRemaining = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const restSeconds = safeSeconds % 60;
  return `${minutes}:${String(restSeconds).padStart(2, '0')}`;
};

export const getStudentCheckInTimerUiState = ({
  remainingSeconds,
  submitted
}: {
  remainingSeconds: number;
  submitted: boolean;
}) => {
  if (submitted) {
    return {
      ariaLabel: '签到已完成',
      caption: '签到状态',
      label: '已完成'
    };
  }

  const label = formatStudentCheckInRemaining(remainingSeconds);
  return {
    ariaLabel: `剩余签到时间 ${label}`,
    caption: '剩余签到时间',
    label
  };
};

export const tickStudentCheckInRemaining = (seconds: number) => Math.max(0, seconds - 1);

const formatStudentCheckInDisplayTime = (time: string) =>
  time.replace(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/g, '$1–$2');

const STUDENT_CHECKIN_DIGITS = ['2', '7', '4', '', '', ''] as const;
const STUDENT_CHECKIN_KEYPAD = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'] as const;
const STUDENT_CHECKIN_FALLBACK_SESSION: StudentCheckInSession = {
  bookingId: 'fallback-checkin',
  roomId: 'fallback-room',
  room: '经管自习室 301',
  seat: 'C3',
  time: '今日 14:00–17:00',
  remainingSeconds: 562,
  codeLength: STUDENT_CHECKIN_CODE_LENGTH
};

const STUDENT_ASSISTANT_CARDS = [
  {
    name: '经管自习室 301 · C3',
    tags: ['插座', '安静区'],
    avail: '14:00–22:00',
    dist: '光华楼'
  },
  {
    name: '理工自习室 201 · F7',
    tags: ['安静区', '24小时'],
    avail: '全天可用',
    dist: '逸夫楼'
  },
  {
    name: '图书馆自习区 · B6',
    tags: ['靠窗'],
    avail: '14:00–20:00',
    dist: '图书馆'
  }
] as const;

const STUDENT_ASSISTANT_SHORTCUTS = [
  '今天晚上还有空座吗',
  '找靠窗座位',
  '我今天定了哪里',
  '图书馆什么时候关'
] as const;

const STUDENT_ASSISTANT_HISTORY = [
  '推荐安静的自习室',
  '下午有没有插座',
  '我的违约次数',
  '图书馆几点关门'
] as const;

const STUDENT_ASSISTANT_CAPABILITIES = [
  ['找座推荐', '描述你的需求，系统按空座、插座、靠窗等条件匹配'],
  ['预约引导', '对话结果可直接进入选座和预约流程'],
  ['政策咨询', '签到、违约政策和开放时间可直接查询']
] as const;

const STUDENT_ASSISTANT_ACTION_LABELS: Record<StudentAssistantAction, string> = {
  BOOK: '立即预约',
  CHECK_IN: '去签到',
  CANCEL: '取消预约',
  DETAIL: '查看详情'
};

const createStudentAssistantMessageId = (role: StudentAssistantMessageView['role']) =>
  `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createStudentAssistantSampleSeats = (): StudentAssistantSeatCandidate[] =>
  STUDENT_ASSISTANT_CARDS.map((card) => {
    const [room, seat] = card.name.split(' · ');
    const roomId = resolveStudentRoomId(room);
    const seatCode = seat ?? card.name;
    return {
      roomId,
      seatId: createStudentSeatId(roomId, seatCode),
      room,
      location: card.dist,
      seat: seatCode,
      time: card.avail,
      tags: [...card.tags]
    };
  });

const createStudentAssistantInitialMessages = (): StudentAssistantMessageView[] => {
  const sampleSeats = createStudentAssistantSampleSeats();

  return [
    {
      id: 'assistant-user-sample',
      role: 'user',
      text: '今天下午有空位吗？我想要有插座的座位'
    },
    {
      id: 'assistant-reply-sample',
      role: 'assistant',
      text: '根据您的偏好，今天下午（14:00 后）共找到 3 个合适选项：',
      seats: sampleSeats,
      suggestions: ['今晚还有空座吗', '找靠窗座位', '我今天定了哪里']
    },
    {
      id: 'assistant-user-confirm-sample',
      role: 'user',
      text: '帮我预约第一个，时间 14:00 到 17:00'
    },
    {
      id: 'assistant-reply-confirm-sample',
      role: 'assistant',
      text: '已为您找到 经管自习室 301 · C3 号座位，时间 2026年4月24日 14:00–17:00。请确认是否预约？',
      quickActions: [
        {
          label: '确认预约',
          action: 'BOOK',
          seat: { ...sampleSeats[0], time: '2026年4月24日 14:00–17:00' }
        }
      ]
    }
  ];
};

const toStudentAssistantMessage = (reply: StudentAssistantReply): StudentAssistantMessageView => ({
  id: createStudentAssistantMessageId('assistant'),
  role: 'assistant',
  text: reply.text,
  seats: reply.seats,
  bookings: reply.bookings,
  suggestions: reply.suggestions
});

const STUDENT_NOTIFICATION_GROUPS = [
  {
    date: '今天',
    items: [
      {
        icon: 'check-circle',
        tone: '#2D9A5C',
        title: '签到成功',
        desc: '经管自习室 301 · C3 · 14:02 签到成功，使用至 17:00',
        time: '14:02',
        read: false
      },
      {
        icon: 'bell',
        tone: F.navy,
        title: '预约提醒',
        desc: '您今日 14:00 在经管自习室 301 的预约将在 15 分钟后开始',
        time: '13:45',
        read: false
      },
      {
        icon: 'calendar',
        tone: '#3A6FA8',
        title: '预约成功',
        desc: '座位 C3 已成功预约，2026年4月24日 14:00–17:00',
        time: '09:15',
        read: false
      }
    ]
  },
  {
    date: '昨天',
    items: [
      {
        icon: 'alert',
        tone: '#C8820A',
        title: '未签到提醒',
        desc: '您在理工自习室 201 的预约（F8）开始后 10 分钟仍未签到',
        time: '08:10',
        read: true
      },
      {
        icon: 'check-circle',
        tone: '#2D9A5C',
        title: '使用结束',
        desc: '理工自习室 201 · F8 · 使用已结束，感谢使用',
        time: '12:02',
        read: true
      },
      {
        icon: 'alert',
        tone: '#C84040',
        title: '预约自动取消',
        desc: '开始后 15 分钟未签到，座位已释放并记录一次违约',
        time: '08:15',
        read: true
      }
    ]
  },
  {
    date: '系统公告',
    items: [
      {
        icon: 'info',
        tone: '#7A52A8',
        title: '五一假期安排',
        desc: '5月1日–3日，全校自习室照常开放，预约系统正常运行',
        time: '4月21日',
        read: true
      }
    ]
  }
] satisfies Array<{
  date: string;
  items: Array<{
    icon: DashboardIconName;
    tone: string;
    title: string;
    desc: string;
    time: string;
    read: boolean;
  }>;
}>;

const STUDENT_NOTIFICATION_ICON_META: Record<
  StudentNotificationIconType,
  { icon: DashboardIconName; tone: string }
> = {
  bell: { icon: 'bell', tone: F.navy },
  clock: { icon: 'clock', tone: '#c8820a' },
  check: { icon: 'check-circle', tone: F.success },
  alert: { icon: 'alert', tone: F.danger }
};

const getStudentNotificationFallbackSummary = (): StudentNotificationSummaryView => ({
  unreadCount: STUDENT_NOTIFICATION_GROUPS.reduce(
    (sum, group) => sum + group.items.filter((item) => !item.read).length,
    0
  ),
  groups: STUDENT_NOTIFICATION_GROUPS.map((group) => ({
    date: group.date,
    items: group.items.map((item) => ({
      id: `fallback-${group.date}-${item.title}`,
      group:
        group.date === '今天' || group.date === '昨天'
          ? (group.date as StudentNotificationGroupLabel)
          : '更早',
      iconType: 'bell',
      icon: item.icon,
      tone: item.tone,
      title: item.title,
      description: item.desc,
      desc: item.desc,
      timeLabel: item.time,
      time: item.time,
      read: item.read,
      occurredAt: ''
    }))
  }))
});

export const mapStudentNotificationSummaryToView = (
  summary: StudentNotificationSummary
): StudentNotificationSummaryView => ({
  unreadCount: summary.unreadCount,
  groups: summary.groups.map((group) => ({
    date: group.date,
    items: group.items.map((item) => {
      const meta = STUDENT_NOTIFICATION_ICON_META[item.iconType];
      return {
        ...item,
        icon: meta.icon,
        tone: meta.tone,
        desc: item.description,
        time: item.timeLabel
      };
    })
  }))
});

const markStudentNotificationSummaryRead = (
  summary: StudentNotificationSummaryView
): StudentNotificationSummaryView => ({
  unreadCount: 0,
  groups: summary.groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({ ...item, read: true }))
  }))
});

export const formatStudentNotificationSubtitle = (
  summary: Pick<StudentNotificationSummaryView, 'unreadCount'>
) => `${summary.unreadCount} 条未读`;

const STUDENT_VIOLATION_FALLBACK_SUMMARY: StudentViolationSummary = {
  totalCount: 2,
  restrictionThreshold: 3,
  severeThreshold: 5,
  records: [
    {
      id: 'student-violation-fallback-1',
      date: '4月18日',
      room: '经管自习室 301 · D8',
      seat: 'D8',
      reason: '未签到（签到超时自动取消）',
      count: 1,
      status: 'confirmed',
      occurredAt: '2026-04-18T06:15:00.000Z'
    },
    {
      id: 'student-violation-fallback-2',
      date: '3月12日',
      room: '文史馆阅览室 · B14',
      seat: 'B14',
      reason: '提前离座超 30 分钟',
      count: 0.5,
      status: 'confirmed',
      occurredAt: '2026-03-12T09:30:00.000Z'
    },
    {
      id: 'student-violation-fallback-3',
      date: '2月28日',
      room: '理工自习室 201 · A3',
      seat: 'A3',
      reason: '1小时内取消预约',
      count: 0.5,
      status: 'appealed',
      occurredAt: '2026-02-28T01:10:00.000Z'
    }
  ]
};

const formatStudentViolationCount = (value: number) =>
  Number.isInteger(value) ? `${value}` : value.toFixed(1);

const formatStudentViolationTotal = (value: number) => value.toFixed(1);

const getStudentViolationProgressPercent = (summary: StudentViolationSummary) => {
  if (summary.severeThreshold <= 0) return 0;
  return Math.min(100, Math.round((summary.totalCount / summary.severeThreshold) * 100));
};

export const mapStudentViolationSummaryToView = (
  summary: StudentViolationSummary
): StudentViolationSummaryView => ({
  ...summary,
  semesterCountLabel: formatStudentViolationTotal(summary.totalCount),
  totalCountLabel: formatStudentViolationTotal(summary.totalCount),
  restrictionLabel: `/ ${formatStudentViolationTotal(summary.restrictionThreshold)} 限制`,
  severeProgressLabel: `${formatStudentViolationTotal(summary.totalCount)} / ${formatStudentViolationTotal(
    summary.severeThreshold
  )}（30天限制）`,
  progressAriaLabel: `违约进度 ${formatStudentViolationTotal(summary.totalCount)} / ${formatStudentViolationTotal(
    summary.severeThreshold
  )}`,
  progressPercent: getStudentViolationProgressPercent(summary),
  records: summary.records.map((record) => ({
    ...record,
    countLabel: formatStudentViolationCount(record.count),
    statusLabel: record.status === 'appealed' ? '申诉中' : '已确认'
  }))
});

export const formatStudentViolationSubtitle = (summary: StudentViolationSummaryView) =>
  `本学期违约 ${summary.totalCountLabel} 次（累计 ${summary.totalCountLabel} 次）`;

const getStudentSeatNumber = (rowIndex: number, colIndex: number) =>
  `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`;

const getStudentSeatFeatures = (
  rowIndex: number,
  colIndex: number,
  status: StudentSeatStatus
) => {
  const features: string[] = [];
  if ([0, 2, 4].includes(rowIndex)) features.push('插座');
  if (status === 'window') features.push('靠窗');
  if (rowIndex >= 4) features.push('安静区');
  if (rowIndex === 0 && colIndex <= 1) features.push('白板附近');
  if (rowIndex === 6 && [2, 4].includes(colIndex)) features.push('无障碍');
  return features;
};

const isStudentSeatBookableStatus = (status: StudentSeatStatus) =>
  status !== 'taken' && status !== 'disabled';

const doesStudentSeatMatchFeatures = (seatFeatures: string[], selectedFeatures: string[]) =>
  selectedFeatures.length === 0 || selectedFeatures.every((feature) => seatFeatures.includes(feature));

const formatStudentSeatWithTags = (seat: string, tags: string[]) =>
  `${seat}${tags.length > 0 ? `（${tags.join(' · ')}）` : ''}`;

const STUDENT_QUICK_ACTIONS = [
  { label: '立即找座', icon: 'search', tone: F.navy },
  { label: '扫码签到', icon: 'scan', tone: F.success },
  { label: '我的收藏', icon: 'star', tone: F.gold },
  { label: '智能推荐', icon: 'zap', tone: '#7A52A8' }
] satisfies Array<{
  label: string;
  icon: DashboardIconName;
  tone: string;
}>;

const STUDENT_WEEK_RECORDS = [
  ['一', 2],
  ['二', 3.5],
  ['三', 1.5],
  ['四', 4],
  ['五', 2.5],
  ['六', 0],
  ['日', 1]
] as const;

const ADMIN_MENU_META: Record<AdminMenuId, AdminMenuMeta> = {
  dashboard: {
    title: '管理仪表盘',
    sub: `${ADMIN_DEMO_DATE_LABEL} · 实时数据`,
    description: '汇总今日预约、签到、违约与空间利用率，帮助管理员快速判断运行状态。',
    actions: [
      { label: '刷新', icon: 'refresh' },
      { label: '导出报告', icon: 'download' }
    ],
    metrics: [],
    tableTitle: '',
    tableNote: '',
    tableHead: [],
    rows: []
  },
  rooms: {
    title: '自习室管理',
    sub: '资源配置与开放范围',
    description: '维护自习室基础信息、开放范围、院系限制与当前运营状态。',
    actions: [
      { id: 'create-room', label: '新增自习室', icon: 'plus' },
      { id: 'refresh-rooms', label: '资源状态同步', icon: 'refresh' }
    ],
    metrics: [],
    tableTitle: '',
    tableNote: '',
    tableHead: [],
    rows: []
  },
  seats: {
    title: '座位管理',
    sub: '座位属性与状态维护',
    description: '维护座位编号、插座标记、禁用状态与可预约区域。',
    actions: [
      { id: 'create-seat', label: '新增座位', icon: 'plus' },
      { label: '批量导入', icon: 'download' }
    ],
    metrics: [],
    tableTitle: '',
    tableNote: '',
    tableHead: [],
    rows: []
  },
  editor: {
    title: '座位平面图编辑器',
    sub: '按自习室维护座位布局',
    description: '调整座位坐标、通道、门窗和插座图层，发布后同步到学生端选座图。',
    actions: [],
    metrics: [],
    tableTitle: '',
    tableNote: '',
    tableHead: [],
    rows: []
  },
  schedule: {
    title: '开放时间管理',
    sub: '默认开放 07:00–22:00',
    description: '配置普通开放、夜间开放、节假日调整和临时闭馆规则。',
    actions: [
      { label: '新增开放规则', icon: 'calendar' },
      { label: '同步节假日', icon: 'refresh' }
    ],
    metrics: [],
    tableTitle: '',
    tableNote: '',
    tableHead: [],
    rows: []
  },
  bookings: {
    title: '预约记录管理',
    sub: '预约、签到与取消记录',
    description: '查询预约、签到、取消与超时记录，支持按学生、自习室和时段筛选。',
    actions: [
      { label: '代预约', icon: 'plus' },
      { label: '导出 Excel', icon: 'download' }
    ],
    metrics: [],
    tableTitle: '',
    tableNote: '',
    tableHead: [],
    rows: []
  },
  violations: {
    title: '违约记录管理',
    sub: '违约、限制与申诉处理',
    description: '跟踪未签到、超时取消和限制预约记录，支持人工复核与申诉处理。',
    actions: [
      { label: '处理申诉', icon: 'alert' },
      { label: '导出违约', icon: 'download' }
    ],
    metrics: [],
    tableTitle: '',
    tableNote: '',
    tableHead: [],
    rows: []
  },
  qrcode: {
    title: '动态码管理',
    sub: '每间自习室每日更新',
    description: '管理网页动态签到码和小程序二维码，防止截图复用。',
    actions: [
      { label: '生成动态码', icon: 'qr' },
      { label: '打印签到码', icon: 'download' }
    ],
    metrics: [],
    tableTitle: '',
    tableNote: '',
    tableHead: [],
    rows: []
  },
  users: {
    title: '用户管理',
    sub: '学生与管理员账号统一维护',
    description: '查看用户账号、院系归属、启用状态和最近更新时间。',
    actions: [
      { label: '新增用户', icon: 'users' },
      { label: '导入名单', icon: 'download' }
    ],
    metrics: [],
    tableTitle: '',
    tableNote: '',
    tableHead: [],
    rows: []
  },
  roles: {
    title: '角色权限管理',
    sub: '角色权限 · 菜单级过滤',
    description: '配置管理员角色、权限边界和菜单可见范围，符合 RBAC 要求。',
    actions: [
      { label: '新建角色', icon: 'shield' },
      { label: '分配权限', icon: 'settings' }
    ],
    metrics: [],
    tableTitle: '',
    tableNote: '',
    tableHead: [],
    rows: []
  },
  params: {
    title: '系统参数管理',
    sub: '预约规则与提醒策略',
    description: '维护最大预约时长、签到窗口、提醒节奏和违约限制参数。',
    actions: [
      { label: '保存参数', icon: 'settings' },
      { label: '恢复默认', icon: 'refresh' }
    ],
    metrics: [],
    tableTitle: '',
    tableNote: '',
    tableHead: [],
    rows: []
  },
  audit: {
    title: '审计日志管理',
    sub: '操作留痕与风险复核',
    description: '记录登录、资源变更、权限调整和关键运营操作，便于追踪。',
    actions: [
      { label: '筛选模块', icon: 'eye' },
      { label: '导出日志', icon: 'download' }
    ],
    metrics: [],
    tableTitle: '',
    tableNote: '',
    tableHead: [],
    rows: []
  },
  reports: {
    title: '数据报表',
    sub: '运营指标与资源分析',
    description: '查看座位利用率、违约趋势、热门时段和院系统计。',
    actions: [
      { label: '导出 CSV', icon: 'download' },
      { label: '导出 Excel', icon: 'download' }
    ],
    metrics: [],
    tableTitle: '',
    tableNote: '',
    tableHead: [],
    rows: []
  }
};

const BOOKING_STATUS_META = {
  active: { label: '使用中', variant: 'green' },
  pending: { label: '待签到', variant: 'blue' },
  done: { label: '已完成', variant: 'gray' },
  violation: { label: '违约', variant: 'red' },
  cancelled: { label: '已取消', variant: 'gray' }
} as const;

const isAdminMenuId = (value: string | undefined): value is AdminMenuId =>
  ADMIN_MENU_IDS.includes(value as AdminMenuId);

const getDefaultAdminMenu = (menuIds: readonly AdminMenuId[]) =>
  menuIds.includes('dashboard') ? 'dashboard' : menuIds[0] ?? 'dashboard';

export const resolveAuthorizedAdminMenuIds = (
  roles: RoleView[] = [],
  permissions?: AdminRolePermission[]
): AdminMenuId[] => {
  const hasExplicitAccessPolicy = roles.length > 0 || permissions !== undefined;
  if (!hasExplicitAccessPolicy || roles.some((role) => role.code === 'ROLE_FULL_ADMIN')) {
    return [...ADMIN_MENU_IDS];
  }

  const menuIds = new Set<AdminMenuId>(['dashboard']);
  (permissions ?? []).forEach((permission) => {
    const menuKey = permission.menuKey ?? undefined;
    if (isAdminMenuId(menuKey)) {
      menuIds.add(menuKey);
    }
  });

  return ADMIN_MENU_IDS.filter((menuId) => menuIds.has(menuId));
};

const isStudentMenuId = (value: string | undefined): value is StudentMenuId =>
  STUDENT_MENU_IDS.includes(value as StudentMenuId);

const isStudentPageId = (value: string | undefined): value is StudentPageId =>
  value === 'select' || value === 'confirm' || isStudentMenuId(value);

const normalizeStudentPageId = (page: StudentPageId): StudentMenuId =>
  page === 'select' || page === 'confirm' ? 'rooms' : page;

const resolveInitialAdminMenu = (allowedMenuIds: readonly AdminMenuId[] = ADMIN_MENU_IDS): AdminMenuId => {
  if (typeof window === 'undefined') {
    return getDefaultAdminMenu(allowedMenuIds);
  }

  const [, section] = window.location.pathname.match(/^\/dashboard\/([^/]+)/) ?? [];
  return isAdminMenuId(section) && allowedMenuIds.includes(section)
    ? section
    : getDefaultAdminMenu(allowedMenuIds);
};

const resolveInitialStudentMenu = (): StudentPageId => {
  if (typeof window === 'undefined') {
    return 'home';
  }

  const [, section] = window.location.pathname.match(/^\/student\/([^/]+)/) ?? [];
  if (section === 'select' || section === 'confirm') return 'rooms';
  return isStudentPageId(section) ? section : 'home';
};

export const resolvePostLoginPath = (
  sessionKind: EntryKind,
  pathname = typeof window === 'undefined' ? '/' : window.location.pathname
) => {
  if (sessionKind === 'admin') {
    const [, section] = pathname.match(/^\/dashboard\/([^/]+)/) ?? [];
    if (pathname === '/dashboard' || isAdminMenuId(section)) return pathname;
    return '/dashboard';
  }

  const [, section] = pathname.match(/^\/student\/([^/]+)/) ?? [];
  if (section === 'select' || section === 'confirm') return '/student/rooms';
  if (pathname === '/student' || isStudentPageId(section)) return pathname;
  return '/student';
};

export function AdminDashboard({
  accessToken,
  adminName,
  initialAdminOverview,
  adminPermissions,
  adminRoles = [],
  initialActive,
  onLogout,
  onSessionExpired,
  onSessionRefresh
}: DashboardProps) {
  const authorizedMenuIds = useMemo(
    () => resolveAuthorizedAdminMenuIds(adminRoles, adminPermissions),
    [adminPermissions, adminRoles]
  );
  const authorizedMenuKey = authorizedMenuIds.join('|');
  const authorizedMenuSet = useMemo(() => new Set(authorizedMenuIds), [authorizedMenuKey]);
  const visibleNavGroups = useMemo(
    () =>
      DASHBOARD_NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => authorizedMenuSet.has(item.id))
      })).filter((group) => group.items.length > 0),
    [authorizedMenuSet]
  );
  const [activeMenu, setActiveMenu] = useState<AdminMenuId>(
    () => {
      const requestedMenu = initialActive ?? resolveInitialAdminMenu(authorizedMenuIds);
      return authorizedMenuSet.has(requestedMenu)
        ? requestedMenu
        : getDefaultAdminMenu(authorizedMenuIds);
    }
  );
  const [roomCreateSignal, setRoomCreateSignal] = useState(0);
  const [roomRefreshSignal, setRoomRefreshSignal] = useState(0);
  const [seatCreateSignal, setSeatCreateSignal] = useState(0);
  const [adminOverview, setAdminOverview] = useState<AdminOverviewSnapshot | undefined>(
    initialAdminOverview
  );
  const [adminOverviewLoading, setAdminOverviewLoading] = useState(false);
  const [adminOverviewError, setAdminOverviewError] = useState('');
  const [bookingPageNumber, setBookingPageNumber] = useState(1);
  const [bookingPage, setBookingPage] = useState<AdminBookingRecordPage | undefined>();
  const [bookingPageLoading, setBookingPageLoading] = useState(false);
  const [bookingPageError, setBookingPageError] = useState('');
  const [violationPageNumber, setViolationPageNumber] = useState(1);
  const [violationPage, setViolationPage] = useState<AdminViolationRecordPage | undefined>();
  const [violationPageLoading, setViolationPageLoading] = useState(false);
  const [violationPageError, setViolationPageError] = useState('');
  const [reportExportSignal, setReportExportSignal] = useState<AdminReportExportSignal | null>(
    null
  );
  const [adminActionSignal, setAdminActionSignal] = useState<AdminActionSignal | null>(null);
  useEffect(() => {
    if (!authorizedMenuSet.has(activeMenu)) {
      setActiveMenu(getDefaultAdminMenu(authorizedMenuIds));
    }
  }, [activeMenu, authorizedMenuIds, authorizedMenuSet]);
  useEffect(() => {
    let alive = true;
    if (!accessToken) {
      setAdminOverview(undefined);
      setAdminOverviewLoading(false);
      setAdminOverviewError('请先使用管理账号登录');
      return () => {
        alive = false;
      };
    }

    setAdminOverviewLoading(true);
    requestAdminOverview(accessToken, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
    })
      .then((overview) => {
        if (!alive) return;
        setAdminOverview(overview);
        setAdminOverviewError('');
      })
      .catch((error) => {
        if (!alive) return;
        setAdminOverview(undefined);
        setAdminOverviewError(error instanceof Error ? error.message : '管理端数据加载失败');
      })
      .finally(() => {
        if (alive) setAdminOverviewLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [accessToken, onSessionExpired, onSessionRefresh]);
  useEffect(() => {
    let alive = true;
    if (activeMenu !== 'bookings') return () => {
      alive = false;
    };
    if (!accessToken) {
      setBookingPage(undefined);
      setBookingPageLoading(false);
      setBookingPageError(adminOverviewError || '请先使用管理账号登录');
      return () => {
        alive = false;
      };
    }

    setBookingPageLoading(true);
    requestAdminBookingRecords(
      accessToken,
      { page: bookingPageNumber, size: ADMIN_BOOKING_PAGE_SIZE },
      fetch,
      resolveApiBaseUrl(),
      { onSessionExpired, onSessionRefresh }
    )
      .then((page) => {
        if (!alive) return;
        setBookingPage(page);
        setBookingPageError('');
      })
      .catch((error) => {
        if (!alive) return;
        setBookingPage(undefined);
        setBookingPageError(error instanceof Error ? error.message : '预约记录加载失败');
      })
      .finally(() => {
        if (alive) setBookingPageLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [
    accessToken,
    activeMenu,
    adminOverviewError,
    bookingPageNumber,
    onSessionExpired,
    onSessionRefresh
  ]);
  useEffect(() => {
    let alive = true;
    if (activeMenu !== 'violations') return () => {
      alive = false;
    };
    if (!accessToken) {
      setViolationPage(undefined);
      setViolationPageLoading(false);
      setViolationPageError(adminOverviewError || '请先使用管理账号登录');
      return () => {
        alive = false;
      };
    }

    setViolationPageLoading(true);
    requestAdminViolationRecords(
      accessToken,
      { page: violationPageNumber, size: ADMIN_VIOLATION_PAGE_SIZE },
      fetch,
      resolveApiBaseUrl(),
      { onSessionExpired, onSessionRefresh }
    )
      .then((page) => {
        if (!alive) return;
        setViolationPage(page);
        setViolationPageError('');
      })
      .catch((error) => {
        if (!alive) return;
        setViolationPage(undefined);
        setViolationPageError(error instanceof Error ? error.message : '违约记录加载失败');
      })
      .finally(() => {
        if (alive) setViolationPageLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [
    accessToken,
    activeMenu,
    adminOverviewError,
    onSessionExpired,
    onSessionRefresh,
    violationPageNumber
  ]);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.pathname.startsWith('/dashboard')) {
      return;
    }
    const nextPath = activeMenu === 'dashboard' ? '/dashboard' : `/dashboard/${activeMenu}`;
    if (window.location.pathname !== nextPath) {
      replaceAppPath(nextPath);
    }
  }, [activeMenu]);
  const activeMeta = ADMIN_MENU_META[activeMenu];
  const adminAvatar = resolveAvatarInitial(adminName);
  const adminRoleLabel = resolveAdminRoleLabel(adminRoles);

  const handleMenuChange = (nextMenu: AdminMenuId) => {
    if (!authorizedMenuSet.has(nextMenu)) return;
    setActiveMenu(nextMenu);
    pushAppPath(nextMenu === 'dashboard' ? '/dashboard' : `/dashboard/${nextMenu}`);
  };

  const handleTopbarAction = (action: AdminMenuAction) => {
    if (action.id === 'create-room') {
      setRoomCreateSignal((current) => current + 1);
    }
    if (action.id === 'refresh-rooms') {
      setRoomRefreshSignal((current) => current + 1);
    }
    if (action.id === 'create-seat') {
      setSeatCreateSignal((current) => current + 1);
    }
    if (activeMenu === 'reports' && action.label === '导出 CSV') {
      setReportExportSignal({ format: 'csv', nonce: Date.now() });
    }
    if (activeMenu === 'reports' && action.label === '导出 Excel') {
      setReportExportSignal({ format: 'excel', nonce: Date.now() });
    }
    setAdminActionSignal({ menu: activeMenu, label: action.label, nonce: Date.now() });
  };

  return (
    <main className="admin-dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="brand-seal">旦</div>
          <div>
            <strong>复旦自习系统</strong>
            <span>管理后台</span>
          </div>
        </div>
        <nav className="dashboard-nav" aria-label="管理菜单">
          {visibleNavGroups.map((group) => (
            <div className="dashboard-nav-group" key={group.label}>
              <div className="dashboard-nav-label">{group.label}</div>
              {group.items.map((item) => (
                <button
                  aria-current={item.id === activeMenu ? 'page' : undefined}
                  className={item.id === activeMenu ? 'is-active' : ''}
                  key={item.id}
                  type="button"
                  onClick={() => handleMenuChange(item.id)}
                >
                  <DashboardIcon name={item.icon} size={13} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="dashboard-sidebar-user">
          <div className="dashboard-avatar">{adminAvatar}</div>
          <div>
            <strong>{adminName}</strong>
            <span>{adminRoleLabel}</span>
          </div>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h1>{activeMeta.title}</h1>
            <p>{activeMeta.sub}</p>
          </div>
          <div className="dashboard-actions">
            {activeMeta.actions.map((action) => (
              <button
                className="dashboard-secondary-button"
                key={action.label}
                type="button"
                onClick={() => handleTopbarAction(action)}
              >
                <DashboardIcon name={action.icon} size={13} />
                {action.label}
              </button>
            ))}
            <div className="dashboard-bell" aria-label="通知">
              <span />
            </div>
            <div className="dashboard-avatar">{adminAvatar}</div>
            <button type="button" onClick={onLogout}>
              退出登录
            </button>
          </div>
        </header>

        {activeMenu === 'dashboard' ? (
          <DashboardOverview
            actionSignal={adminActionSignal}
            loading={adminOverviewLoading}
            overview={adminOverview?.dashboard}
            error={adminOverviewError}
            onViewAllBookings={
              authorizedMenuSet.has('bookings') ? () => handleMenuChange('bookings') : undefined
            }
          />
        ) : activeMenu === 'rooms' ? (
          <RoomManagementPanel
            accessToken={accessToken}
            actionSignal={adminActionSignal}
            createSignal={roomCreateSignal}
            onSessionExpired={onSessionExpired}
            onSessionRefresh={onSessionRefresh}
            refreshSignal={roomRefreshSignal}
          />
        ) : activeMenu === 'seats' ? (
          <SeatManagementPanel
            accessToken={accessToken}
            actionSignal={adminActionSignal}
            createSignal={seatCreateSignal}
            onSessionExpired={onSessionExpired}
            onSessionRefresh={onSessionRefresh}
          />
        ) : activeMenu === 'editor' ? (
          <FloorEditorPanel
            accessToken={accessToken}
            onSessionExpired={onSessionExpired}
            onSessionRefresh={onSessionRefresh}
          />
        ) : activeMenu === 'schedule' ? (
          <ScheduleManagementPanel
            actionSignal={adminActionSignal}
            loading={adminOverviewLoading}
            overview={adminOverview?.schedule}
            error={adminOverviewError}
          />
        ) : activeMenu === 'bookings' ? (
          <BookingRecordsPanel
            actionSignal={adminActionSignal}
            loading={adminOverviewLoading}
            overview={adminOverview?.bookings}
            error={adminOverviewError}
            page={bookingPage}
            pageError={bookingPageError}
            pageLoading={bookingPageLoading}
            onPageChange={setBookingPageNumber}
          />
        ) : activeMenu === 'violations' ? (
          <ViolationRecordsPanel
            actionSignal={adminActionSignal}
            loading={adminOverviewLoading}
            overview={adminOverview?.violations}
            error={adminOverviewError}
            page={violationPage}
            pageError={violationPageError}
            pageLoading={violationPageLoading}
            onPageChange={setViolationPageNumber}
          />
        ) : activeMenu === 'qrcode' ? (
          <DynamicCodePanel
            actionSignal={adminActionSignal}
            loading={adminOverviewLoading}
            overview={adminOverview?.dynamicCodes}
            error={adminOverviewError}
          />
        ) : activeMenu === 'users' ? (
          <UserManagementPanel
            accessToken={accessToken}
            actionSignal={adminActionSignal}
            onSessionExpired={onSessionExpired}
            onSessionRefresh={onSessionRefresh}
          />
        ) : activeMenu === 'roles' ? (
          <RoleManagementPanel
            accessToken={accessToken}
            actionSignal={adminActionSignal}
            onSessionExpired={onSessionExpired}
            onSessionRefresh={onSessionRefresh}
          />
        ) : activeMenu === 'params' ? (
          <SystemParameterPanel
            actionSignal={adminActionSignal}
            loading={adminOverviewLoading}
            overview={adminOverview?.params}
            error={adminOverviewError}
          />
        ) : activeMenu === 'audit' ? (
          <AuditLogPanel
            actionSignal={adminActionSignal}
            loading={adminOverviewLoading}
            overview={adminOverview?.audit}
            error={adminOverviewError}
          />
        ) : activeMenu === 'reports' ? (
          <DataReportsPanel
            loading={adminOverviewLoading}
            overview={adminOverview?.reports}
            error={adminOverviewError}
            exportSignal={reportExportSignal}
          />
        ) : (
          <AdminModulePanel meta={activeMeta} />
        )}
      </section>
    </main>
  );
}

type AdminDataPanelProps<T> = {
  overview?: T;
  loading: boolean;
  error: string;
  actionSignal?: AdminActionSignal | null;
};

function AdminActionNotice({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="admin-action-notice" role="status" aria-live="polite">
      <DashboardIcon name="check-circle" size={14} />
      {message}
    </div>
  );
}

function AdminDataState({
  error,
  loading,
  label
}: {
  error: string;
  loading: boolean;
  label: string;
}) {
  return (
    <section className="dashboard-card admin-data-state" aria-label={`${label}数据状态`}>
      <DashboardIcon name={error ? 'alert' : 'refresh'} size={16} />
      <strong>{error || (loading ? `正在加载${label}数据…` : `${label}暂无数据`)}</strong>
      <span>管理端业务数据由后端接口提供。</span>
    </section>
  );
}

type DashboardOverviewProps = AdminDataPanelProps<AdminDashboardSnapshot> & {
  onViewAllBookings?: () => void;
};

function DashboardOverview({
  actionSignal,
  error,
  loading,
  onViewAllBookings,
  overview
}: DashboardOverviewProps) {
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    if (actionSignal?.menu !== 'dashboard') return;
    setActionNotice(
      actionSignal.label === '导出报告'
        ? '管理仪表盘：已生成当前概览报告。'
        : `管理仪表盘：${actionSignal.label}已触发。`
    );
  }, [actionSignal?.label, actionSignal?.menu, actionSignal?.nonce]);

  if (!overview) {
    return <AdminDataState error={error} loading={loading} label="管理仪表盘" />;
  }

  return (
    <>
        <AdminActionNotice message={actionNotice} />

        <section className="dashboard-kpi-row" aria-label="自习室运行概览">
          {overview.kpis.map((kpi) => (
            <article className="dashboard-card dashboard-kpi-card" key={kpi.label}>
              <div className="dashboard-kpi-head">
                <span className="dashboard-kpi-icon" style={{ color: kpi.tone }}>
                  <DashboardIcon name={kpi.icon} size={16} />
                </span>
                <small style={{ color: kpi.tone }}>{kpi.trend ?? kpi.note}</small>
              </div>
              <strong>{kpi.value}</strong>
              <span>{kpi.label}</span>
            </article>
          ))}
        </section>

        <div className="dashboard-grid-row">
          <section className="dashboard-card dashboard-heatmap-card">
            <header className="dashboard-card-title">
              <h2>本周座位利用率热力图</h2>
              <span>颜色深度 = 占用率</span>
            </header>
            <div className="heatmap-wrap">
              <div className="heatmap-days">
                {overview.heatmapDays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="heatmap-main">
                <div className="heatmap-hours">
                  {overview.heatmapHours.map((hour) => (
                    <span key={hour}>{hour}</span>
                  ))}
                </div>
                {overview.heatmapData.map((row, dayIndex) => (
                  <div className="heatmap-row" key={overview.heatmapDays[dayIndex] ?? dayIndex}>
                    {row.map((value, hourIndex) => (
                      <span
                        key={`${overview.heatmapDays[dayIndex]}-${overview.heatmapHours[hourIndex]}`}
                        style={{ opacity: Math.max(0.08, value * 0.9 + 0.06) }}
                        title={`${overview.heatmapDays[dayIndex]} ${overview.heatmapHours[hourIndex]}: ${Math.round(value * 100)}%`}
                      />
                    ))}
                  </div>
                ))}
                <div className="heatmap-legend">
                  <span>低</span>
                  {[0.1, 0.25, 0.45, 0.65, 0.85, 1].map((opacity) => (
                    <i key={opacity} style={{ opacity }} />
                  ))}
                  <span>高</span>
                </div>
              </div>
            </div>
          </section>

          <section className="dashboard-card dashboard-room-card">
            <header className="dashboard-card-title">
              <h2>自习室实时状态</h2>
            </header>
            {overview.roomStatuses.map((room) => (
              <div className="room-status-row" data-status={room.status} key={room.name}>
                <div>
                  <span>{room.name}</span>
                  <strong>
                    {room.status === 'closed'
                      ? '已关闭'
                      : `${room.availableSeats} 空余 / ${room.totalSeats}`}
                  </strong>
                </div>
                <div className="room-status-bar">
                  <i style={{ width: `${room.pct}%` }} />
                </div>
              </div>
            ))}
          </section>
        </div>

        <section className="dashboard-card dashboard-booking-card">
          <header className="dashboard-card-title">
            <h2>最近预约记录</h2>
            {onViewAllBookings ? (
              <button type="button" onClick={onViewAllBookings}>
                查看全部
                <DashboardIcon name="arrow-right" size={13} />
              </button>
            ) : null}
          </header>
          <div className="booking-table">
            <div className="booking-table-head">
              {['预约编号', '用户', '自习室', '座位', '时间段', '状态'].map((head) => (
                <span key={head}>{head}</span>
              ))}
            </div>
            {overview.recentBookings.map((booking) => {
              const status = BOOKING_STATUS_META[booking.status];
              return (
                <div className="booking-table-row" key={booking.id}>
                  <span>{booking.id}</span>
                  <span>{booking.user}</span>
                  <span>{booking.room}</span>
                  <span>{booking.seat}</span>
                  <span>{booking.time}</span>
                  <span>
                    <mark data-variant={status.variant}>{status.label}</mark>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
    </>
  );
}

function AdminModulePanel({ meta }: { meta: AdminMenuMeta }) {
  const [actionNotice, setActionNotice] = useState('');
  const tableColumns = `minmax(150px, 1.35fr) repeat(${Math.max(
    meta.tableHead.length - 1,
    1
  )}, minmax(86px, 1fr))`;

  return (
    <div className="dashboard-module-stack">
      <section className="dashboard-card dashboard-module-hero">
        <div>
          <span>管理模块</span>
          <h2>{meta.title}</h2>
          <p>{meta.description}</p>
        </div>
        <div className="dashboard-module-actions">
          {meta.actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => setActionNotice(`${meta.title}：${action.label}已触发。`)}
            >
              <DashboardIcon name={action.icon} size={13} />
              {action.label}
            </button>
          ))}
        </div>
      </section>

      <AdminActionNotice message={actionNotice} />

      <section className="dashboard-kpi-row dashboard-module-metrics" aria-label={`${meta.title}关键指标`}>
        {meta.metrics.map((metric) => (
          <article className="dashboard-card dashboard-kpi-card" key={metric.label}>
            <div className="dashboard-module-metric-dot" style={{ color: metric.tone }}>
              <span />
            </div>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-card dashboard-module-table-card">
        <header className="dashboard-card-title">
          <h2>{meta.tableTitle}</h2>
          <span>{meta.tableNote}</span>
        </header>
        <div className="dashboard-module-table">
          <div className="dashboard-module-table-head" style={{ gridTemplateColumns: tableColumns }}>
            {meta.tableHead.map((head) => (
              <span key={head}>{head}</span>
            ))}
          </div>
          {meta.rows.map((row) => (
            <div
              className="dashboard-module-table-row"
              key={row.join('-')}
              style={{ gridTemplateColumns: tableColumns }}
            >
              {row.map((cell, index) => (
                <span key={`${cell}-${index}`}>{cell}</span>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function RoomManagementPanel({
  accessToken,
  actionSignal,
  createSignal,
  onSessionExpired,
  onSessionRefresh,
  refreshSignal
}: {
  accessToken?: string;
  actionSignal?: AdminActionSignal | null;
  createSignal: number;
  onSessionExpired?: () => void;
  onSessionRefresh?: (session: SessionView) => void;
  refreshSignal: number;
}) {
  const [rooms, setRooms] = useState<AdminRoomRow[]>([]);
  const [query, setQuery] = useState('');
  const [roomStatusFilter, setRoomStatusFilter] = useState('全部状态');
  const [roomBuildingFilter, setRoomBuildingFilter] = useState('全部楼栋');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [editor, setEditor] = useState<AdminRoomEditor | null>(null);
  const [form, setForm] = useState<AdminRoomFormState>(() => newRoomForm());
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const announceRoomAction = (message: string) => {
    setActionNotice(`自习室管理：${message}`);
  };

  useEffect(() => {
    let alive = true;
    if (!accessToken) {
      setRooms([]);
      setLoadError('请先使用管理账号登录');
      setLoading(false);
      return () => {
        alive = false;
      };
    }

    setLoading(true);
    requestRooms(accessToken, fetch, resolveApiBaseUrl(), { onSessionExpired, onSessionRefresh })
      .then((nextRooms) => {
        if (!alive) return;
        setRooms(nextRooms.map(toAdminRoomRow));
        setLoadError('');
      })
      .catch((error) => {
        if (!alive) return;
        setRooms([]);
        setLoadError(error instanceof Error ? error.message : '自习室列表加载失败');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [accessToken, onSessionExpired, onSessionRefresh, refreshSignal]);

  useEffect(() => {
    if (createSignal === 0) return;
    setEditor({ mode: 'create', room: null });
    setForm(newRoomForm());
    setFormError('');
    announceRoomAction('已打开新增自习室表单。');
  }, [createSignal]);

  useEffect(() => {
    if (actionSignal?.menu !== 'rooms') return;
    if (actionSignal.label === '资源状态同步') {
      announceRoomAction('已重新同步资源状态。');
      return;
    }
    if (actionSignal.label === '新增自习室') {
      announceRoomAction('已打开新增自习室表单。');
      return;
    }
    announceRoomAction(`${actionSignal.label}已触发。`);
  }, [actionSignal?.label, actionSignal?.menu, actionSignal?.nonce]);

  const filteredRooms = rooms.filter((room) => {
    const keyword = query.trim().toLowerCase();
    const matchesKeyword =
      !keyword ||
      [room.name, room.building, room.departmentLabel].some((field) =>
        field.toLowerCase().includes(keyword)
      );
    const matchesStatus =
      roomStatusFilter === '全部状态' || room.statusLabel === roomStatusFilter;
    const matchesBuilding =
      roomBuildingFilter === '全部楼栋' || room.building === roomBuildingFilter;
    return matchesKeyword && matchesStatus && matchesBuilding;
  });
  const roomStatusOptions = useMemo(
    () => ['全部状态', ...Array.from(new Set(rooms.map((room) => room.statusLabel))).sort()],
    [rooms]
  );
  const roomBuildingOptions = useMemo(
    () => ['全部楼栋', ...Array.from(new Set(rooms.map((room) => room.building))).sort()],
    [rooms]
  );

  const openCreate = () => {
    setEditor({ mode: 'create', room: null });
    setForm(newRoomForm());
    setFormError('');
  };

  const openEdit = (room: AdminRoomRow) => {
    setEditor({ mode: 'edit', room });
    setForm(roomToForm(room));
    setFormError('');
  };

  const updateForm = <Key extends keyof AdminRoomFormState>(
    key: Key,
    value: AdminRoomFormState[Key]
  ) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === 'scopeType') {
        next.departmentId = value === 'DEPARTMENT' ? current.departmentId || 'dept-cs' : '';
      }
      return next;
    });
  };

  const handleSaveRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) {
      setFormError('请先使用管理账号登录后再保存');
      return;
    }

    const isEdit = editor?.mode === 'edit';
    setSaving(true);
    setFormError('');
    try {
      const savedRoom = await saveAdminRoom(form, {
        accessToken,
        roomId: isEdit ? editor.room.id : undefined
      }, fetch, resolveApiBaseUrl(), { onSessionExpired, onSessionRefresh });
      setRooms((currentRooms) => {
        const nextRooms = isEdit
          ? currentRooms.map((room) => (room.id === savedRoom.id ? savedRoom : room))
          : [...currentRooms, savedRoom];
        return nextRooms.map(toAdminRoomRow);
      });
      setEditor(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="room-management-panel" aria-label="自习室管理">
      <div className="room-toolbar">
        <label className="room-search">
          <DashboardIcon name="search" size={14} />
          <input
            aria-label="搜索自习室"
            placeholder="搜索自习室名称、楼栋"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="自习室状态筛选"
            value={roomStatusFilter}
            onChange={(event) => {
              setRoomStatusFilter(event.target.value);
              announceRoomAction(`已按状态筛选：${event.target.value}。`);
            }}
          >
            {roomStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <DashboardIcon name="chevron-down" size={12} />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="自习室楼栋筛选"
            value={roomBuildingFilter}
            onChange={(event) => {
              setRoomBuildingFilter(event.target.value);
              announceRoomAction(`已按楼栋筛选：${event.target.value}。`);
            }}
          >
            {roomBuildingOptions.map((building) => (
              <option key={building} value={building}>
                {building}
              </option>
            ))}
          </select>
          <DashboardIcon name="chevron-down" size={12} />
        </label>
        <button
          className="room-secondary-button"
          type="button"
          onClick={() => announceRoomAction(`已导出 ${filteredRooms.length} 间自习室。`)}
        >
          <DashboardIcon name="download" size={13} />
          导出
        </button>
        <button className="room-primary-button" type="button" onClick={openCreate}>
          <DashboardIcon name="plus" size={13} />
          新增自习室
        </button>
      </div>

      <AdminActionNotice message={actionNotice} />

      {(loading || loadError) && (
        <div className={`room-message ${loadError ? 'is-error' : ''}`}>
          <DashboardIcon name={loadError ? 'alert' : 'refresh'} size={14} />
          {loadError || '正在加载自习室列表…'}
        </div>
      )}

      <div className="dashboard-card room-table-card">
        <div className="room-table-head">
          {['编号', '自习室名称', '楼栋', '楼层', '容量', '开放对象', '状态', '开放时间', '操作'].map(
            (head) => (
              <span key={head}>{head}</span>
            )
          )}
        </div>
        {filteredRooms.map((room) => (
          <div className="room-table-row" key={room.id}>
            <span>{room.code}</span>
            <strong>{room.name}</strong>
            <span>{room.building}</span>
            <span>{room.floor}楼</span>
            <span>{room.capacity}</span>
            <span>
              <mark data-variant={room.scopeType === 'DEPARTMENT' ? 'purple' : 'navy'}>
                {room.departmentLabel}
              </mark>
            </span>
            <span>
              <mark data-variant={room.status === 'ACTIVE' ? 'green' : 'gray'}>
                {room.statusLabel}
              </mark>
            </span>
            <span>{room.hours}</span>
            <span className="room-row-actions">
              <button type="button" onClick={() => openEdit(room)}>
                <DashboardIcon name="edit" size={12} />
                编辑
              </button>
              <button
                type="button"
                onClick={() => announceRoomAction(`已定位到${room.name}的平面图入口。`)}
              >
                <DashboardIcon name="move" size={12} />
                平面图
              </button>
              <button
                aria-label={`${room.name} 更多操作`}
                type="button"
                onClick={() => announceRoomAction(`已展开${room.name}的更多操作。`)}
              >
                <DashboardIcon name="more-v" size={12} />
              </button>
            </span>
          </div>
        ))}
        {filteredRooms.length === 0 && <div className="room-empty">没有匹配的自习室</div>}
      </div>

      {editor && (
        <div className="room-editor-layer">
          <button
            aria-label="关闭编辑面板"
            className="room-editor-backdrop"
            type="button"
            onClick={() => setEditor(null)}
          />
          <form className="dashboard-card room-editor" onSubmit={handleSaveRoom}>
            <header className="room-editor-head">
              <div>
                <h2>{editor.mode === 'create' ? '新增自习室' : '编辑自习室'}</h2>
                <p>维护名称、楼栋、容量与开放规则</p>
              </div>
              <button aria-label="关闭" type="button" onClick={() => setEditor(null)}>
                <DashboardIcon name="x" size={14} />
              </button>
            </header>

            <RoomFormField label="自习室名称">
              <input
                required
                value={form.name}
                onChange={(event) => updateForm('name', event.target.value)}
              />
            </RoomFormField>
            <RoomFormField label="楼栋">
              <input
                required
                value={form.building}
                onChange={(event) => updateForm('building', event.target.value)}
              />
            </RoomFormField>
            <div className="room-form-grid">
              <RoomFormField label="楼层">
                <input
                  max="99"
                  min="0"
                  required
                  type="number"
                  value={form.floor}
                  onChange={(event) => updateForm('floor', Number(event.target.value))}
                />
              </RoomFormField>
              <RoomFormField label="容量">
                <input
                  max="1000"
                  min="1"
                  required
                  type="number"
                  value={form.capacity}
                  onChange={(event) => updateForm('capacity', Number(event.target.value))}
                />
              </RoomFormField>
            </div>
            <div className="room-form-grid">
              <RoomFormField label="开放对象">
                <select
                  value={form.scopeType}
                  onChange={(event) => updateForm('scopeType', event.target.value as RoomScopeType)}
                >
                  <option value="SCHOOL">全校</option>
                  <option value="DEPARTMENT">院系</option>
                </select>
              </RoomFormField>
              <RoomFormField label="院系">
                <select
                  disabled={form.scopeType !== 'DEPARTMENT'}
                  value={form.scopeType === 'DEPARTMENT' ? form.departmentId || 'dept-cs' : ''}
                  onChange={(event) => updateForm('departmentId', event.target.value)}
                >
                  <option value="">无</option>
                  <option value="dept-cs">计算机学院</option>
                </select>
              </RoomFormField>
            </div>
            <div className="room-form-grid">
              <RoomFormField label="开始小时">
                <input
                  max="23"
                  min="0"
                  required
                  type="number"
                  value={form.openHour}
                  onChange={(event) => updateForm('openHour', Number(event.target.value))}
                />
              </RoomFormField>
              <RoomFormField label="结束小时">
                <input
                  max="24"
                  min="1"
                  required
                  type="number"
                  value={form.closeHour}
                  onChange={(event) => updateForm('closeHour', Number(event.target.value))}
                />
              </RoomFormField>
            </div>
            <label className="room-checkbox">
              <input
                checked={form.overnight}
                type="checkbox"
                onChange={(event) => updateForm('overnight', event.target.checked)}
              />
              过夜开放
            </label>

            {formError && <div className="room-form-error">{formError}</div>}

            <div className="room-editor-actions">
              <button type="button" onClick={() => setEditor(null)}>
                取消
              </button>
              <button className="room-primary-button" disabled={saving} type="submit">
                <DashboardIcon name="check" size={13} />
                {saving ? '保存中…' : '保存'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function RoomFormField({
  children,
  label
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="room-form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function SeatManagementPanel({
  accessToken,
  actionSignal,
  createSignal,
  onSessionExpired,
  onSessionRefresh
}: {
  accessToken?: string;
  actionSignal?: AdminActionSignal | null;
  createSignal: number;
  onSessionExpired?: () => void;
  onSessionRefresh?: (session: SessionView) => void;
}) {
  const [seats, setSeats] = useState<AdminSeat[]>([]);
  const [query, setQuery] = useState('');
  const [seatRoomFilter, setSeatRoomFilter] = useState('全部自习室');
  const [seatTagFilter, setSeatTagFilter] = useState('全部标签');
  const [seatStatusFilter, setSeatStatusFilter] = useState('全部状态');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [editor, setEditor] = useState<AdminSeatEditor | null>(null);
  const [form, setForm] = useState<AdminSeatFormState>(() => newSeatForm());
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const announceSeatAction = (message: string) => {
    setActionNotice(`座位管理：${message}`);
  };

  useEffect(() => {
    let alive = true;
    if (!accessToken) {
      setSeats([]);
      setLoadError('请先使用管理账号登录');
      setLoading(false);
      return () => {
        alive = false;
      };
    }

    setLoading(true);
    requestSeats(accessToken, fetch, resolveApiBaseUrl(), { onSessionExpired, onSessionRefresh })
      .then((nextSeats) => {
        if (!alive) return;
        setSeats(nextSeats);
        setLoadError('');
      })
      .catch((error) => {
        if (!alive) return;
        setSeats([]);
        setLoadError(error instanceof Error ? error.message : '座位列表加载失败');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [accessToken, onSessionExpired, onSessionRefresh]);

  useEffect(() => {
    if (createSignal === 0) return;
    setEditor({ mode: 'create', seat: null });
    setForm(newSeatForm());
    setFormError('');
    announceSeatAction('已打开新增座位表单。');
  }, [createSignal]);

  useEffect(() => {
    if (actionSignal?.menu !== 'seats') return;
    if (actionSignal.label === '新增座位') {
      announceSeatAction('已打开新增座位表单。');
      return;
    }
    if (actionSignal.label === '批量导入') {
      announceSeatAction('已准备座位批量导入流程。');
      return;
    }
    announceSeatAction(`${actionSignal.label}已触发。`);
  }, [actionSignal?.label, actionSignal?.menu, actionSignal?.nonce]);

  const roomOptions = useMemo(() => {
    const options = new Map<string, string>();
    seats.forEach((seat) => options.set(seat.roomId, seat.roomName));
    return Array.from(options, ([id, name]) => ({ id, name }));
  }, [seats]);

  const filteredSeats = seats.filter((seat) => {
    const keyword = query.trim().toLowerCase();
    const tags = getSeatTags(seat);
    const matchesKeyword =
      !keyword ||
      [seat.code, seat.roomName, ...tags].some((field) => field.toLowerCase().includes(keyword));
    const matchesRoom = seatRoomFilter === '全部自习室' || seat.roomName === seatRoomFilter;
    const matchesTag = seatTagFilter === '全部标签' || tags.includes(seatTagFilter);
    const statusLabel = seat.status === 'ACTIVE' ? '可预约' : '禁用';
    const matchesStatus = seatStatusFilter === '全部状态' || statusLabel === seatStatusFilter;
    return matchesKeyword && matchesRoom && matchesTag && matchesStatus;
  });
  const seatRoomOptions = useMemo(
    () => ['全部自习室', ...Array.from(new Set(seats.map((seat) => seat.roomName))).sort()],
    [seats]
  );
  const seatTagOptions = useMemo(
    () => ['全部标签', ...Array.from(new Set(seats.flatMap((seat) => getSeatTags(seat)))).sort()],
    [seats]
  );

  const openCreate = () => {
    setEditor({ mode: 'create', seat: null });
    setForm(newSeatForm());
    setFormError('');
  };

  const openEdit = (seat: AdminSeat) => {
    setEditor({ mode: 'edit', seat });
    setForm(seatToForm(seat));
    setFormError('');
  };

  const updateForm = <Key extends keyof AdminSeatFormState>(
    key: Key,
    value: AdminSeatFormState[Key]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSaveSeat = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) {
      setFormError('请先使用管理账号登录后再保存');
      return;
    }

    const isEdit = editor?.mode === 'edit';
    setSaving(true);
    setFormError('');
    try {
      const savedSeat = await saveAdminSeat(form, {
        accessToken,
        seatId: isEdit ? editor.seat.id : undefined
      }, fetch, resolveApiBaseUrl(), { onSessionExpired, onSessionRefresh });
      setSeats((currentSeats) =>
        isEdit
          ? currentSeats.map((seat) => (seat.id === savedSeat.id ? savedSeat : seat))
          : [...currentSeats, savedSeat]
      );
      setEditor(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const totalCount = seats.length;
  const powerCount = seats.filter((seat) => seat.hasPower).length;
  const windowCount = seats.filter((seat) => seat.nearWindow).length;
  const disabledCount = seats.filter((seat) => seat.status === 'INACTIVE').length;

  return (
    <section className="seat-management-panel" aria-label="座位管理">
      <div className="seat-summary-grid" aria-label="座位关键指标">
        {[
          { label: '座位总数', value: `${totalCount}`, tone: F.navy },
          { label: '带插座', value: `${powerCount}`, tone: F.gold },
          { label: '靠窗', value: `${windowCount}`, tone: '#3A6FA8' },
          { label: '禁用', value: `${disabledCount}`, tone: '#C84040' }
        ].map((metric) => (
          <article className="dashboard-card seat-summary-card" key={metric.label}>
            <span style={{ color: metric.tone }} />
            <strong>{metric.value}</strong>
            <small>{metric.label}</small>
          </article>
        ))}
      </div>

      <div className="seat-toolbar">
        <label className="seat-search">
          <DashboardIcon name="search" size={14} />
          <input
            aria-label="搜索座位"
            placeholder="搜索座位编号、自习室"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="座位自习室筛选"
            value={seatRoomFilter}
            onChange={(event) => {
              setSeatRoomFilter(event.target.value);
              announceSeatAction(`已按自习室筛选：${event.target.value}。`);
            }}
          >
            {seatRoomOptions.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
          <DashboardIcon name="chevron-down" size={12} />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="座位标签筛选"
            value={seatTagFilter}
            onChange={(event) => {
              setSeatTagFilter(event.target.value);
              announceSeatAction(`已按标签筛选：${event.target.value}。`);
            }}
          >
            {seatTagOptions.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <DashboardIcon name="chevron-down" size={12} />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="座位状态筛选"
            value={seatStatusFilter}
            onChange={(event) => {
              setSeatStatusFilter(event.target.value);
              announceSeatAction(`已按状态筛选：${event.target.value}。`);
            }}
          >
            {['全部状态', '可预约', '禁用'].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <DashboardIcon name="chevron-down" size={12} />
        </label>
        <button className="seat-primary-action" type="button" onClick={openCreate}>
          <DashboardIcon name="plus" size={13} />
          新增座位
        </button>
        <button type="button" onClick={() => announceSeatAction('已进入批量维护流程。')}>
          <DashboardIcon name="settings" size={13} />
          批量维护
        </button>
      </div>

      <AdminActionNotice message={actionNotice} />

      {(loading || loadError) && (
        <div className={`room-message ${loadError ? 'is-error' : ''}`}>
          <DashboardIcon name={loadError ? 'alert' : 'refresh'} size={14} />
          {loadError || '正在加载座位列表…'}
        </div>
      )}

      <div className="dashboard-card seat-table-card">
        <div className="seat-table-head">
          {['座位编号', '自习室', '坐标', '标签', '状态', '最近更新', '操作'].map((head) => (
            <span key={head}>{head}</span>
          ))}
        </div>
        {filteredSeats.map((seat) => (
          <div className="seat-table-row" key={seat.id}>
            <strong>{seat.code}</strong>
            <span>{seat.roomName}</span>
            <span>
              X {seat.x} / Y {seat.y}
            </span>
            <span className="seat-tag-list">
              {getSeatTags(seat).map((tag) => (
                <mark data-variant={tag === '带插座' ? 'gold' : tag === '靠窗' ? 'blue' : 'gray'} key={tag}>
                  {tag}
                </mark>
              ))}
            </span>
            <span>
              <mark data-variant={seat.status === 'ACTIVE' ? 'green' : 'red'}>
                {seat.status === 'ACTIVE' ? '可预约' : '禁用'}
              </mark>
            </span>
            <span>{seat.updatedAt}</span>
            <span className="seat-row-actions">
              <button type="button" onClick={() => openEdit(seat)}>
                <DashboardIcon name="edit" size={12} />
                编辑
              </button>
              <button
                type="button"
                onClick={() => announceSeatAction(`已定位${seat.roomName} ${seat.code}。`)}
              >
                <DashboardIcon name="move" size={12} />
                定位
              </button>
            </span>
          </div>
        ))}
        {filteredSeats.length === 0 && <div className="seat-empty">没有匹配的座位</div>}
      </div>

      {editor && (
        <div className="seat-editor-layer">
          <button
            aria-label="关闭座位编辑面板"
            className="seat-editor-backdrop"
            type="button"
            onClick={() => setEditor(null)}
          />
          <form className="dashboard-card seat-editor" onSubmit={handleSaveSeat}>
            <header className="seat-editor-head">
              <div>
                <h2>{editor.mode === 'create' ? '新增座位' : '编辑座位'}</h2>
                <p>维护座位编号、坐标、插座与靠窗标记</p>
              </div>
              <button aria-label="关闭" type="button" onClick={() => setEditor(null)}>
                <DashboardIcon name="x" size={14} />
              </button>
            </header>

            <RoomFormField label="座位编号">
              <input
                required
                value={form.code}
                onChange={(event) => updateForm('code', event.target.value)}
              />
            </RoomFormField>
            <RoomFormField label="所属自习室">
              <select
                value={form.roomId}
                onChange={(event) => updateForm('roomId', event.target.value)}
              >
                {roomOptions.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </RoomFormField>
            <div className="seat-form-grid">
              <RoomFormField label="X 坐标">
                <input
                  min="0"
                  required
                  type="number"
                  value={form.x}
                  onChange={(event) => updateForm('x', Number(event.target.value))}
                />
              </RoomFormField>
              <RoomFormField label="Y 坐标">
                <input
                  min="0"
                  required
                  type="number"
                  value={form.y}
                  onChange={(event) => updateForm('y', Number(event.target.value))}
                />
              </RoomFormField>
            </div>
            <RoomFormField label="状态">
              <select
                value={form.status}
                onChange={(event) => updateForm('status', event.target.value as RoomStatus)}
              >
                <option value="ACTIVE">可预约</option>
                <option value="INACTIVE">禁用</option>
              </select>
            </RoomFormField>
            {[
              ['hasPower', '带插座'],
              ['nearWindow', '靠窗'],
              ['quietZone', '安静区']
            ].map(([key, label]) => (
              <label className="seat-checkbox" key={key}>
                <input
                  checked={Boolean(form[key as keyof AdminSeatFormState])}
                  type="checkbox"
                  onChange={(event) =>
                    updateForm(key as keyof AdminSeatFormState, event.target.checked as never)
                  }
                />
                {label}
              </label>
            ))}

            {formError && <div className="room-form-error">{formError}</div>}

            <div className="seat-editor-actions">
              <button type="button" onClick={() => setEditor(null)}>
                取消
              </button>
              <button className="seat-primary-action" disabled={saving} type="submit">
                <DashboardIcon name="check" size={13} />
                {saving ? '保存中…' : '保存'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function FloorEditorPanel({
  accessToken,
  onSessionExpired,
  onSessionRefresh
}: {
  accessToken?: string;
  onSessionExpired?: () => void;
  onSessionRefresh?: (session: SessionView) => void;
}) {
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [seats, setSeats] = useState<AdminSeat[]>([]);
  const [draftSeats, setDraftSeats] = useState<AdminSeat[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedSeatId, setSelectedSeatId] = useState('');
  const [loadError, setLoadError] = useState('');
  const [activeTool, setActiveTool] = useState<FloorEditorToolId>('select');
  const [gridEnabled, setGridEnabled] = useState(true);
  const [editorNotice, setEditorNotice] = useState('选择工具后可新增、删除或标注座位。');

  useEffect(() => {
    let alive = true;
    if (!accessToken) {
      setRooms([]);
      setSeats([]);
      setDraftSeats([]);
      setLoadError('请先使用管理账号登录');
      return () => {
        alive = false;
      };
    }

    Promise.all([
      requestRooms(accessToken, fetch, resolveApiBaseUrl(), { onSessionExpired, onSessionRefresh }),
      requestSeats(accessToken, fetch, resolveApiBaseUrl(), { onSessionExpired, onSessionRefresh })
    ])
      .then(([nextRooms, nextSeats]) => {
        if (!alive) return;
        setRooms(nextRooms);
        setSeats(nextSeats);
        setDraftSeats(nextSeats);
        setLoadError('');
        setEditorNotice('平面图数据已加载，可直接编辑草稿布局。');
        setSelectedRoomId((currentRoomId) =>
          nextRooms.some((room) => room.id === currentRoomId)
            ? currentRoomId
            : nextRooms[0]?.id ?? ''
        );
      })
      .catch((error) => {
        if (!alive) return;
        setRooms([]);
        setSeats([]);
        setDraftSeats([]);
        setLoadError(error instanceof Error ? error.message : '平面图资源加载失败');
      });

    return () => {
      alive = false;
    };
  }, [accessToken, onSessionExpired, onSessionRefresh]);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0];
  const selectedRoomSeats = selectedRoom
    ? draftSeats.filter((seat) => seat.roomId === selectedRoom.id)
    : [];

  useEffect(() => {
    setSelectedSeatId((currentSeatId) =>
      selectedRoomSeats.some((seat) => seat.id === currentSeatId)
        ? currentSeatId
        : selectedRoomSeats[0]?.id ?? ''
    );
  }, [selectedRoom?.id, draftSeats]);

  if (!selectedRoom) {
    return <AdminDataState error={loadError} loading={!loadError} label="座位平面图编辑器" />;
  }

  const selectedRoomLabel = `${selectedRoom.name} · ${selectedRoom.building} ${selectedRoom.floor}楼`;
  const selectedRoomHours = formatRoomHours(selectedRoom);
  const floorRows = buildFloorSeatRows(selectedRoomSeats);
  const selectedSeat = selectedRoomSeats.find((seat) => seat.id === selectedSeatId);
  const selectedSeatTags = selectedSeat ? getSeatTags(selectedSeat) : [];

  const addDraftSeat = () => {
    const nextSeat = createDraftFloorSeat(selectedRoom, selectedRoomSeats);
    setDraftSeats((currentSeats) => [...currentSeats, nextSeat]);
    setSelectedSeatId(nextSeat.id);
    setActiveTool('add');
    setEditorNotice(`已新增 ${nextSeat.code}，当前为草稿布局，保存后生效。`);
  };

  const deleteSelectedSeat = () => {
    if (!selectedSeat) {
      setEditorNotice('请先选择一个座位，再执行删除。');
      return;
    }
    const nextSelectedSeatId =
      selectedRoomSeats.find((seat) => seat.id !== selectedSeat.id)?.id ?? '';
    setDraftSeats((currentSeats) => currentSeats.filter((seat) => seat.id !== selectedSeat.id));
    setSelectedSeatId(nextSelectedSeatId);
    setActiveTool('delete');
    setEditorNotice(`已从草稿中删除 ${selectedSeat.code}。`);
  };

  const toggleSelectedSeatPower = () => {
    if (!selectedSeat) {
      setEditorNotice('请先选择一个座位，再标注属性。');
      return;
    }
    const nextHasPower = !selectedSeat.hasPower;
    setDraftSeats((currentSeats) =>
      currentSeats.map((seat) =>
        seat.id === selectedSeat.id
          ? { ...seat, hasPower: nextHasPower, updatedAt: '草稿' }
          : seat
      )
    );
    setActiveTool('annotate');
    setEditorNotice(
      `${selectedSeat.code} 已${nextHasPower ? '标注为带插座座位' : '取消插座标注'}。`
    );
  };

  const resetDraftSeats = () => {
    setDraftSeats(seats);
    setActiveTool('refresh');
    setEditorNotice('已撤销未保存的平面图草稿。');
  };

  const handleFloorToolClick = (toolId: FloorEditorToolId) => {
    if (toolId === 'add') {
      addDraftSeat();
      return;
    }
    if (toolId === 'delete') {
      deleteSelectedSeat();
      return;
    }
    if (toolId === 'annotate') {
      toggleSelectedSeatPower();
      return;
    }
    if (toolId === 'grid') {
      setGridEnabled((current) => {
        const next = !current;
        setEditorNotice(next ? '已开启吸附网格。' : '已隐藏吸附网格。');
        return next;
      });
      setActiveTool('grid');
      return;
    }
    if (toolId === 'refresh') {
      resetDraftSeats();
      return;
    }
    if (toolId === 'info') {
      setActiveTool('info');
      setEditorNotice('编辑器支持选择、添加座位、删除座位、标注插座和撤销草稿。');
      return;
    }
    if (toolId === 'export') {
      setActiveTool('export');
      setEditorNotice(`已准备导出 ${selectedRoom.name} 的当前平面图草稿。`);
      return;
    }
    setActiveTool('select');
    setEditorNotice('选择工具已启用，可点击座位查看属性。');
  };

  const saveDraftSeats = () => {
    setSeats(draftSeats);
    setEditorNotice('布局草稿已保存到当前页面状态。');
  };

  return (
    <section className="floor-editor-panel" aria-label="座位平面图编辑器">
      <div className="floor-editor-head">
        <div className="floor-editor-title">
          <span>{selectedRoom.building}空间草稿</span>
          <h2>座位平面图编辑器</h2>
          <p>{selectedRoomLabel}</p>
          <label className="floor-room-picker">
            <span>编辑自习室</span>
            <select
              aria-label="选择平面图自习室"
              value={selectedRoom.id}
              onChange={(event) => setSelectedRoomId(event.target.value)}
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} · {room.building} {room.floor}楼
                </option>
              ))}
            </select>
          </label>
          {loadError && <div className="floor-load-error">{loadError}</div>}
        </div>
        <div className="floor-editor-head-actions">
          <button type="button" onClick={() => handleFloorToolClick('export')}>
            <DashboardIcon name="eye" size={13} />
            预览
          </button>
          <button className="floor-primary-action" type="button" onClick={saveDraftSeats}>
            <DashboardIcon name="check" size={13} />
            保存布局
          </button>
        </div>
      </div>
      <div className="floor-editor-notice" role="status">
        <DashboardIcon name="info" size={13} />
        {editorNotice}
      </div>

      <div className="floor-editor-workbench">
        <aside className="floor-toolbar" aria-label="编辑工具">
          {FLOOR_EDITOR_TOOLS.map((tool) => (
            <button
              aria-label={tool.label}
              className={activeTool === tool.id ? 'is-active' : ''}
              key={tool.label}
              title={tool.label}
              type="button"
              onClick={() => handleFloorToolClick(tool.id)}
            >
              <DashboardIcon name={tool.icon} size={16} />
            </button>
          ))}
          <div className="floor-toolbar-spacer" />
          {FLOOR_EDITOR_SUPPORT_TOOLS.map((tool) => (
            <button
              aria-label={tool.label}
              className={activeTool === tool.id ? 'is-active' : ''}
              key={tool.label}
              title={tool.label}
              type="button"
              onClick={() => handleFloorToolClick(tool.id)}
            >
              <DashboardIcon name={tool.icon} size={15} />
            </button>
          ))}
        </aside>

        <div
          className={`floor-canvas${gridEnabled ? '' : ' is-grid-off'}`}
          aria-label="座位平面图画布"
        >
          <div className="floor-canvas-card">
            <div className="floor-canvas-room-label">
              <strong>{selectedRoom.name}</strong>
              <span>
                {selectedRoom.capacity} 座 · {selectedRoomHours}
              </span>
            </div>
            <div className="floor-entry-label">入 口</div>
            <div className="floor-seat-map">
              {floorRows.length === 0 && (
                <div className="floor-empty-state">后台暂无座位数据，请先在座位管理中新增座位。</div>
              )}
              {floorRows.map((row, rowIndex) => {
                const leftSeats = row.seats.slice(0, 4);
                const rightSeats = row.seats.slice(4);
                return (
                  <div className="floor-row-wrap" key={row.key}>
                    {rowIndex === 3 && floorRows.length > 4 && (
                      <span className="floor-aisle" aria-label="主通道" />
                    )}
                    <div className="floor-row">
                      <span className="floor-row-label">{row.label}</span>
                      <div className="floor-seat-group">
                        {leftSeats.map((seat) => (
                          <FloorSeatCell
                            key={seat.id}
                            seat={seat}
                            status={getFloorSeatStatus(seat, selectedSeatId)}
                            onSelect={() => setSelectedSeatId(seat.id)}
                          />
                        ))}
                      </div>
                      {rightSeats.length > 0 && (
                        <>
                          <span className="floor-seat-gap" />
                          <div className="floor-seat-group">
                            {rightSeats.map((seat) => (
                              <FloorSeatCell
                                key={seat.id}
                                seat={seat}
                                status={getFloorSeatStatus(seat, selectedSeatId)}
                                onSelect={() => setSelectedSeatId(seat.id)}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="floor-window-line" aria-label="靠窗区域">
              靠窗座位
            </div>
          </div>
        </div>

        <aside className="floor-properties" aria-label="属性面板">
          <h3>属性面板</h3>
          <div className="floor-room-summary">
            <span>当前自习室</span>
            <strong>{selectedRoom.name}</strong>
            <small>
              {selectedRoom.building} · {selectedRoom.floor}楼 ·{' '}
              {selectedRoom.scopeType === 'DEPARTMENT'
                ? getRoomDepartmentLabel(selectedRoom)
                : '全校开放'}
            </small>
          </div>
          <div className="floor-selected-card">
            <span>已选座位</span>
            <strong>{selectedSeat?.code ?? '未选择'}</strong>
          </div>
          {[
            ['已配置座位', `${selectedRoomSeats.length} 个`],
            ['登记容量', `${selectedRoom.capacity} 座`],
            ['开放时间', selectedRoomHours],
            [
              '选中座位',
              selectedSeat ? `${selectedSeat.code} · ${selectedSeatTags.join('、')}` : '未选择'
            ]
          ].map(([label, value]) => (
            <div className="floor-prop-row" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
          <div className="floor-tag-section">
            <span>标签</span>
            <div className="floor-tag-list">
              {(selectedSeatTags.length > 0 ? selectedSeatTags : ['未选择座位']).map((tag) => (
                <button
                  className={selectedSeat ? 'is-active' : ''}
                  key={tag}
                  type="button"
                  onClick={() =>
                    setEditorNotice(
                      selectedSeat
                        ? `已选中 ${selectedSeat.code} 的 ${tag} 标签。`
                        : '请选择座位后再查看标签。'
                    )
                  }
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="floor-property-actions">
            <button className="floor-primary-action" type="button" onClick={toggleSelectedSeatPower}>
              应用更改
            </button>
            <button className="floor-danger-action" type="button" onClick={deleteSelectedSeat}>
              <DashboardIcon name="trash" size={13} />
              删除座位
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function FloorSeatCell({
  onSelect,
  seat,
  status
}: {
  onSelect: () => void;
  seat: AdminSeat;
  status: FloorSeatStatus;
}) {
  const tagText = getSeatTags(seat).join('、');
  return (
    <button
      aria-label={`${seat.code} ${FLOOR_STATUS_LABELS[status]} ${tagText}`}
      className="floor-seat-cell"
      data-status={status}
      onClick={onSelect}
      type="button"
    >
      {seat.code}
    </button>
  );
}

function ScheduleManagementPanel({
  actionSignal,
  error,
  loading,
  overview
}: AdminDataPanelProps<AdminScheduleSnapshot>) {
  const [actionNotice, setActionNotice] = useState('');
  const announceScheduleAction = (message: string) => {
    setActionNotice(`开放时间管理：${message}`);
  };

  useEffect(() => {
    if (actionSignal?.menu !== 'schedule') return;
    if (actionSignal.label === '新增开放规则') {
      announceScheduleAction('已打开新增开放规则表单。');
      return;
    }
    if (actionSignal.label === '同步节假日') {
      announceScheduleAction('已同步节假日特殊规则。');
      return;
    }
    announceScheduleAction(`${actionSignal.label}已触发。`);
  }, [actionSignal?.label, actionSignal?.menu, actionSignal?.nonce]);

  if (!overview) {
    return <AdminDataState error={error} loading={loading} label="开放时间管理" />;
  }

  return (
    <section className="schedule-management-panel" aria-label="开放时间管理">
      <AdminActionNotice message={actionNotice} />

      <div className="schedule-summary-grid" aria-label="开放时间关键指标">
        {overview.summary.map((item) => (
          <article className="dashboard-card schedule-summary-card" key={item.label}>
            <span className="schedule-summary-icon" style={{ color: item.tone }}>
              <DashboardIcon name={item.icon} size={16} />
            </span>
            <strong>{item.value}</strong>
            <small>{item.label}</small>
            <p>{item.note}</p>
          </article>
        ))}
      </div>

      <div className="schedule-workspace">
        <section className="dashboard-card schedule-editor-card">
          <header className="schedule-section-head">
            <div>
              <span>规则编辑</span>
              <h2>开放时间管理</h2>
            </div>
            <button
              className="schedule-primary-action"
              type="button"
              onClick={() => announceScheduleAction('已保存为待审批开放时间变更。')}
            >
              <DashboardIcon name="check" size={13} />
              保存开放时间
            </button>
          </header>

          <div className="schedule-form-grid">
            <RoomFormField label="自习室">
              <select defaultValue={overview.roomOptions[0] ?? ''}>
                {overview.roomOptions.map((room) => (
                  <option key={room}>{room}</option>
                ))}
              </select>
            </RoomFormField>
            <RoomFormField label="适用日期">
              <select defaultValue="工作日">
                <option>工作日</option>
                <option>每日</option>
                <option>考试周</option>
                <option>指定日期</option>
              </select>
            </RoomFormField>
            <RoomFormField label="开始小时">
              <input defaultValue="07:00" />
            </RoomFormField>
            <RoomFormField label="结束小时">
              <input defaultValue="22:00" />
            </RoomFormField>
          </div>

          <div className="schedule-option-list">
            {overview.options.map((option) => (
              <label className="schedule-option" key={option.label}>
                <input checked={option.enabled} readOnly type="checkbox" />
                <span>
                  <strong>{option.label}</strong>
                  <small>{option.desc}</small>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="dashboard-card schedule-priority-card">
          <header className="schedule-section-head">
            <div>
              <span>规则优先级</span>
              <h2>特殊日期优先</h2>
            </div>
          </header>
          <div className="schedule-priority-list">
            {overview.priorities.map((priority) => (
              <div className="schedule-priority-item" key={priority.title}>
                <span>{priority.order}</span>
                <div>
                  <strong>{priority.title}</strong>
                  <small>{priority.desc}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="schedule-grid-row">
        <section className="dashboard-card schedule-table-card">
          <header className="schedule-section-head">
            <div>
              <span>开放规则</span>
              <h2>房间时段配置</h2>
            </div>
            <button type="button" onClick={() => announceScheduleAction('已打开新增开放规则表单。')}>
              <DashboardIcon name="plus" size={13} />
              新增开放规则
            </button>
          </header>
          <div className="schedule-table">
            <div className="schedule-table-head">
              {['自习室', '适用日期', '开放时段', '规则类型', '状态', '说明'].map((head) => (
                <span key={head}>{head}</span>
              ))}
            </div>
            {overview.rules.map((rule) => (
              <div className="schedule-table-row" key={`${rule.room}-${rule.scope}`}>
                <strong>{rule.room}</strong>
                <span>{rule.scope}</span>
                <span>{rule.time}</span>
                <span>
                  <mark data-variant={rule.type === '闭馆维护' ? 'red' : rule.type === '跨天开放' ? 'blue' : 'green'}>
                    {rule.type}
                  </mark>
                </span>
                <span>{rule.status}</span>
                <span>{rule.note}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-card schedule-special-card">
          <header className="schedule-section-head">
            <div>
              <span>特殊日期</span>
              <h2>节假日特殊规则</h2>
            </div>
            <button type="button" onClick={() => announceScheduleAction('已同步节假日特殊规则。')}>
              <DashboardIcon name="refresh" size={13} />
              同步节假日
            </button>
          </header>
          {overview.specialRules.map((rule) => (
            <article className="schedule-special-item" key={rule.title}>
              <div>
                <strong>{rule.title}</strong>
                <span>{rule.date}</span>
              </div>
              <p>{rule.target} · {rule.time}</p>
              <small>{rule.desc}</small>
            </article>
          ))}
        </section>
      </div>
    </section>
  );
}

type BookingRecordsPanelProps = AdminDataPanelProps<AdminBookingRecordsSnapshot> & {
  page?: AdminBookingRecordPage;
  pageError?: string;
  pageLoading?: boolean;
  onPageChange?: (page: number) => void;
};

function BookingRecordsPanel({
  actionSignal,
  error,
  loading,
  onPageChange,
  overview,
  page,
  pageError = '',
  pageLoading = false
}: BookingRecordsPanelProps) {
  const [bookingQuery, setBookingQuery] = useState('');
  const [bookingDateFilter, setBookingDateFilter] = useState('全部日期');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('全部状态');
  const [actionNotice, setActionNotice] = useState('');
  const announceBookingAction = (message: string) => {
    setActionNotice(`预约记录管理：${message}`);
  };

  useEffect(() => {
    if (actionSignal?.menu !== 'bookings') return;
    if (actionSignal.label === '代预约') {
      announceBookingAction('已打开管理员代预约流程。');
      return;
    }
    if (actionSignal.label === '导出 Excel') {
      announceBookingAction('已生成当前筛选结果的 Excel 导出任务。');
      return;
    }
    announceBookingAction(`${actionSignal.label}已触发。`);
  }, [actionSignal?.label, actionSignal?.menu, actionSignal?.nonce]);

  if (!overview) {
    return <AdminDataState error={error} loading={loading} label="预约记录管理" />;
  }
  const resolvedPage = resolveAdminBookingPage(page, overview.records);
  const displayedBookingRecords = resolvedPage.items.filter((record) => {
    const keyword = bookingQuery.trim().toLowerCase();
    const matchesKeyword =
      !keyword ||
      [record.id, record.uid, record.user, record.room, record.seat].some((field) =>
        field.toLowerCase().includes(keyword)
      );
    const matchesDate = bookingDateFilter === '全部日期' || record.date === bookingDateFilter;
    const statusLabel = ADMIN_BOOKING_STATUS_META[record.status].label;
    const matchesStatus =
      bookingStatusFilter === '全部状态' || statusLabel === bookingStatusFilter;
    return matchesKeyword && matchesDate && matchesStatus;
  });
  const bookingDateOptions = [
    '全部日期',
    ...Array.from(new Set(resolvedPage.items.map((record) => record.date))).sort()
  ];
  const bookingStatusOptions = [
    '全部状态',
    ...Array.from(
      new Set(resolvedPage.items.map((record) => ADMIN_BOOKING_STATUS_META[record.status].label))
    ).sort()
  ];
  const totalPages = Math.max(1, Math.ceil(resolvedPage.total / Math.max(1, resolvedPage.size)));
  const canGoPrev = resolvedPage.page > 1 && !pageLoading;
  const canGoNext = resolvedPage.page < totalPages && !pageLoading;

  return (
    <section className="booking-records-panel" aria-label="预约记录管理">
      <div className="booking-records-toolbar">
        <label className="booking-records-search">
          <DashboardIcon name="search" size={14} />
          <input
            aria-label="搜索预约记录"
            placeholder="学号、姓名、座位编号"
            value={bookingQuery}
            onChange={(event) => setBookingQuery(event.target.value)}
          />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="预约日期筛选"
            value={bookingDateFilter}
            onChange={(event) => {
              setBookingDateFilter(event.target.value);
              announceBookingAction(`已按日期筛选：${event.target.value}。`);
            }}
          >
            {bookingDateOptions.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
          <DashboardIcon name="chevron-down" size={12} />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="预约状态筛选"
            value={bookingStatusFilter}
            onChange={(event) => {
              setBookingStatusFilter(event.target.value);
              announceBookingAction(`已按状态筛选：${event.target.value}。`);
            }}
          >
            {bookingStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
            <DashboardIcon name="chevron-down" size={12} />
        </label>
        <span className="booking-records-selected">匹配 {displayedBookingRecords.length} 条</span>
        <button
          className="booking-records-danger"
          type="button"
          onClick={() => announceBookingAction('当前未选中预约记录，无法批量取消。')}
        >
          <DashboardIcon name="trash" size={13} />
          批量取消
        </button>
      </div>

      <AdminActionNotice message={actionNotice} />

      <div className="booking-records-layout">
        <section className="dashboard-card booking-records-table-card">
          <header className="booking-records-head">
            <div>
              <span>今日实时同步</span>
              <h2>预约记录管理</h2>
            </div>
            <div className="booking-records-head-actions">
              <button type="button" onClick={() => announceBookingAction('已打开管理员代预约流程。')}>
                <DashboardIcon name="plus" size={13} />
                代预约
              </button>
              <button
                type="button"
                onClick={() => announceBookingAction('已生成当前筛选结果的 Excel 导出任务。')}
              >
                <DashboardIcon name="download" size={13} />
                导出 Excel
              </button>
            </div>
          </header>

          <div className="booking-records-table">
            <div className="booking-records-table-head">
              {[
                '',
                '预约ID',
                '学号',
                '姓名',
                '自习室',
                '座位',
                '日期',
                '时间段',
                '签到时间',
                '状态',
                '操作'
              ].map((head, index) => (
                <span key={`${head}-${index}`}>{head}</span>
              ))}
            </div>
            {displayedBookingRecords.map((record) => {
              const status = ADMIN_BOOKING_STATUS_META[record.status];
              return (
                <div className="booking-records-table-row" key={record.id}>
                  <span>
                    <i aria-hidden="true" />
                  </span>
                  <strong>{record.id}</strong>
                  <span>{record.uid}</span>
                  <span>{record.user}</span>
                  <span>{record.room}</span>
                  <span>{record.seat}</span>
                  <span>{record.date}</span>
                  <span>{record.time}</span>
                  <span className={record.checkin === '—' ? 'is-missing' : ''}>
                    {record.checkin}
                  </span>
                  <span>
                    <mark data-variant={status.variant}>{status.label}</mark>
                  </span>
                  <span className="booking-records-actions">
                    <button
                      type="button"
                      onClick={() => announceBookingAction(`已打开预约 ${formatAdminRecordCode(record.id)} 详情。`)}
                    >
                      <DashboardIcon name="eye" size={12} />
                      详情
                    </button>
                    {record.status !== 'violation' && (
                      <button
                        className="is-danger"
                        type="button"
                        onClick={() => announceBookingAction(`已提交预约 ${formatAdminRecordCode(record.id)} 的取消复核。`)}
                      >
                        <DashboardIcon name="x" size={12} />
                        取消
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
            {displayedBookingRecords.length === 0 && <div className="room-empty">没有匹配的预约记录</div>}
          </div>
          <div className="admin-record-pagination" aria-label="预约记录分页">
            <span>
              {pageError ||
                (pageLoading
                  ? '正在加载预约记录...'
                  : `第 ${resolvedPage.page} / ${totalPages} 页 · 共 ${resolvedPage.total} 条`)}
            </span>
            <div>
              <button
                disabled={!canGoPrev}
                type="button"
                onClick={() => onPageChange?.(Math.max(1, resolvedPage.page - 1))}
              >
                上一页
              </button>
              <button
                disabled={!canGoNext}
                type="button"
                onClick={() => onPageChange?.(Math.min(totalPages, resolvedPage.page + 1))}
              >
                下一页
              </button>
            </div>
          </div>
        </section>

        <aside className="dashboard-card booking-operation-card">
          <header className="booking-records-head">
            <div>
              <span>代操作规则</span>
              <h2>代预约审计</h2>
            </div>
          </header>
          {overview.operationRules.map(([title, desc], index) => (
            <div className="booking-operation-item" key={title}>
              <span>{index + 1}</span>
              <div>
                <strong>{title}</strong>
                <small>{desc}</small>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

type ViolationRecordsPanelProps = AdminDataPanelProps<AdminViolationSnapshot> & {
  page?: AdminViolationRecordPage;
  pageError?: string;
  pageLoading?: boolean;
  onPageChange?: (page: number) => void;
};

function ViolationRecordsPanel({
  actionSignal,
  error,
  loading,
  onPageChange,
  overview,
  page,
  pageError = '',
  pageLoading = false
}: ViolationRecordsPanelProps) {
  const [violationQuery, setViolationQuery] = useState('');
  const [violationReasonFilter, setViolationReasonFilter] = useState('全部原因');
  const [violationStatusFilter, setViolationStatusFilter] = useState('全部状态');
  const [actionNotice, setActionNotice] = useState('');
  const announceViolationAction = (message: string) => {
    setActionNotice(`违约记录管理：${message}`);
  };

  useEffect(() => {
    if (actionSignal?.menu !== 'violations') return;
    if (actionSignal.label === '处理申诉') {
      announceViolationAction('已打开申诉处理队列。');
      return;
    }
    if (actionSignal.label === '导出违约') {
      announceViolationAction('已生成违约记录导出任务。');
      return;
    }
    announceViolationAction(`${actionSignal.label}已触发。`);
  }, [actionSignal?.label, actionSignal?.menu, actionSignal?.nonce]);

  if (!overview) {
    return <AdminDataState error={error} loading={loading} label="违约记录管理" />;
  }
  const resolvedPage = resolveAdminViolationPage(page, overview.records);
  const displayedViolationRecords = resolvedPage.items.filter((record) => {
    const keyword = violationQuery.trim().toLowerCase();
    const matchesKeyword =
      !keyword ||
      [record.id, record.bookingId, record.student, record.uid, record.room, record.seat].some(
        (field) => field.toLowerCase().includes(keyword)
      );
    const matchesReason =
      violationReasonFilter === '全部原因' || record.reason === violationReasonFilter;
    const statusLabel = ADMIN_VIOLATION_STATUS_META[record.status].label;
    const matchesStatus =
      violationStatusFilter === '全部状态' || statusLabel === violationStatusFilter;
    return matchesKeyword && matchesReason && matchesStatus;
  });
  const violationReasonOptions = [
    '全部原因',
    ...Array.from(new Set(resolvedPage.items.map((record) => record.reason))).sort()
  ];
  const violationStatusOptions = [
    '全部状态',
    ...Array.from(
      new Set(
        resolvedPage.items.map((record) => ADMIN_VIOLATION_STATUS_META[record.status].label)
      )
    ).sort()
  ];
  const totalPages = Math.max(1, Math.ceil(resolvedPage.total / Math.max(1, resolvedPage.size)));
  const canGoPrev = resolvedPage.page > 1 && !pageLoading;
  const canGoNext = resolvedPage.page < totalPages && !pageLoading;

  return (
    <section className="violation-records-panel" aria-label="违约记录管理">
      <div className="violation-summary-grid" aria-label="违约关键指标">
        {overview.summary.map((item) => (
          <article className="dashboard-card violation-summary-card" key={item.label}>
            <span className="violation-summary-icon" style={{ color: item.tone }}>
              <DashboardIcon name={item.icon} size={15} />
            </span>
            <div>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <small>{item.note}</small>
            </div>
          </article>
        ))}
      </div>

      <div className="violation-records-toolbar">
        <label className="violation-records-search">
          <DashboardIcon name="search" size={14} />
          <input
            aria-label="搜索违约记录"
            placeholder="学生、学号、预约编号"
            value={violationQuery}
            onChange={(event) => setViolationQuery(event.target.value)}
          />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="违约原因筛选"
            value={violationReasonFilter}
            onChange={(event) => {
              setViolationReasonFilter(event.target.value);
              announceViolationAction(`已按原因筛选：${event.target.value}。`);
            }}
          >
            {violationReasonOptions.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
          <DashboardIcon name="chevron-down" size={12} />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="违约状态筛选"
            value={violationStatusFilter}
            onChange={(event) => {
              setViolationStatusFilter(event.target.value);
              announceViolationAction(`已按状态筛选：${event.target.value}。`);
            }}
          >
            {violationStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
            <DashboardIcon name="chevron-down" size={12} />
        </label>
        <button
          className="violation-records-primary"
          type="button"
          onClick={() => announceViolationAction('已打开申诉处理队列。')}
        >
          <DashboardIcon name="alert" size={13} />
          处理申诉
        </button>
        <button type="button" onClick={() => announceViolationAction('已生成违约记录导出任务。')}>
          <DashboardIcon name="download" size={13} />
          导出违约
        </button>
      </div>

      <AdminActionNotice message={actionNotice} />

      <div className="violation-records-layout">
        <section className="dashboard-card violation-records-table-card">
          <header className="violation-records-head">
            <div>
              <span>按发生时间倒序</span>
              <h2>违约记录管理</h2>
            </div>
            <small>保留自动规则与人工复核轨迹</small>
          </header>

          <div className="violation-records-table">
            <div className="violation-records-table-head">
              {[
                '违约ID',
                '预约编号',
                '学生',
                '学号',
                '自习室',
                '座位',
                '原因',
                '处理动作',
                '发生时间',
                '状态',
                '操作'
              ].map((head) => (
                <span key={head}>{head}</span>
              ))}
            </div>
            {displayedViolationRecords.map((record) => {
              const status = ADMIN_VIOLATION_STATUS_META[record.status];
              return (
                <div className="violation-records-table-row" key={record.id}>
                  <strong className="violation-records-cell" title={record.id}>
                    {formatAdminRecordCode(record.id)}
                  </strong>
                  <span className="violation-records-cell" title={record.bookingId}>
                    {formatAdminRecordCode(record.bookingId)}
                  </span>
                  <span className="violation-records-cell" title={record.student}>
                    {record.student}
                  </span>
                  <span className="violation-records-cell" title={record.uid}>
                    {record.uid}
                  </span>
                  <span className="violation-records-cell" title={record.room}>
                    {record.room}
                  </span>
                  <span className="violation-records-cell" title={record.seat}>
                    {record.seat}
                  </span>
                  <span className="violation-records-cell" title={record.reason}>
                    {record.reason}
                  </span>
                  <span className="violation-records-cell" title={record.action}>
                    {record.action}
                  </span>
                  <span className="violation-records-cell" title={record.occurred}>
                    {record.occurred}
                  </span>
                  <span>
                    <mark data-variant={status.variant}>{status.label}</mark>
                  </span>
                  <span className="violation-records-actions">
                    <button
                      type="button"
                      onClick={() => announceViolationAction(`已打开违约 ${formatAdminRecordCode(record.id)} 详情。`)}
                    >
                      <DashboardIcon name="eye" size={12} />
                      详情
                    </button>
                    <button
                      type="button"
                      onClick={() => announceViolationAction(`已为违约 ${formatAdminRecordCode(record.id)} 打开备注编辑。`)}
                    >
                      <DashboardIcon name="edit" size={12} />
                      追加备注
                    </button>
                    {record.status === 'restricted' && (
                      <button
                        className="is-release"
                        type="button"
                        onClick={() => announceViolationAction(`已提交解除 ${record.student} 预约限制的复核。`)}
                      >
                        <DashboardIcon name="check-circle" size={12} />
                        解除限制
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
            {displayedViolationRecords.length === 0 && <div className="room-empty">没有匹配的违约记录</div>}
          </div>
          <div className="admin-record-pagination" aria-label="违约记录分页">
            <span>
              {pageError ||
                (pageLoading
                  ? '正在加载违约记录...'
                  : `第 ${resolvedPage.page} / ${totalPages} 页 · 共 ${resolvedPage.total} 条`)}
            </span>
            <div>
              <button
                disabled={!canGoPrev}
                type="button"
                onClick={() => onPageChange?.(Math.max(1, resolvedPage.page - 1))}
              >
                上一页
              </button>
              <button
                disabled={!canGoNext}
                type="button"
                onClick={() => onPageChange?.(Math.min(totalPages, resolvedPage.page + 1))}
              >
                下一页
              </button>
            </div>
          </div>
        </section>

        <aside className="dashboard-card violation-rule-card">
          <header className="violation-records-head">
            <div>
              <span>处理规则</span>
              <h2>签到与违约</h2>
            </div>
          </header>
          {overview.rules.map(([title, desc], index) => (
            <div className="violation-rule-item" key={title}>
              <span>{index + 1}</span>
              <div>
                <strong>{title}</strong>
                <small>{desc}</small>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

function DynamicCodePanel({
  actionSignal,
  error,
  loading,
  overview
}: AdminDataPanelProps<AdminDynamicCodeSnapshot>) {
  const [codeQuery, setCodeQuery] = useState('');
  const [codeBuildingFilter, setCodeBuildingFilter] = useState('全部楼栋');
  const [codeStatusFilter, setCodeStatusFilter] = useState('全部状态');
  const [codeRefreshFilter, setCodeRefreshFilter] = useState('刷新策略');
  const [actionNotice, setActionNotice] = useState('');
  const announceDynamicCodeAction = (message: string) => {
    setActionNotice(`动态码管理：${message}`);
  };

  useEffect(() => {
    if (actionSignal?.menu !== 'qrcode') return;
    if (actionSignal.label === '生成动态码') {
      announceDynamicCodeAction('已重新生成今日动态码任务。');
      return;
    }
    if (actionSignal.label === '打印签到码') {
      announceDynamicCodeAction('已准备当前动态码打印任务。');
      return;
    }
    announceDynamicCodeAction(`${actionSignal.label}已触发。`);
  }, [actionSignal?.label, actionSignal?.menu, actionSignal?.nonce]);

  if (!overview) {
    return <AdminDataState error={error} loading={loading} label="动态码管理" />;
  }
  const previewQrValue = formatDynamicCodeQrValue(overview.preview);
  const displayedCodeRecords = overview.records.filter((record) => {
    const keyword = codeQuery.trim().toLowerCase();
    const matchesKeyword =
      !keyword ||
      [record.room, record.building, record.webCode, record.qrStatus].some((field) =>
        field.toLowerCase().includes(keyword)
      );
    const statusLabel = ADMIN_DYNAMIC_CODE_STATUS_META[record.status].label;
    const matchesBuilding =
      codeBuildingFilter === '全部楼栋' || record.building === codeBuildingFilter;
    const matchesStatus = codeStatusFilter === '全部状态' || statusLabel === codeStatusFilter;
    const matchesRefresh = codeRefreshFilter === '刷新策略' || record.refresh === codeRefreshFilter;
    return matchesKeyword && matchesBuilding && matchesStatus && matchesRefresh;
  });
  const codeBuildingOptions = [
    '全部楼栋',
    ...Array.from(new Set(overview.records.map((record) => record.building))).sort()
  ];
  const codeStatusOptions = [
    '全部状态',
    ...Array.from(
      new Set(overview.records.map((record) => ADMIN_DYNAMIC_CODE_STATUS_META[record.status].label))
    ).sort()
  ];
  const codeRefreshOptions = [
    '刷新策略',
    ...Array.from(new Set(overview.records.map((record) => record.refresh))).sort()
  ];

  return (
    <section className="dynamic-code-panel" aria-label="动态码管理">
      <div className="dynamic-code-summary-grid" aria-label="动态码关键指标">
        {overview.summary.map((item) => (
          <article className="dashboard-card dynamic-code-summary-card" key={item.label}>
            <span className="dynamic-code-summary-icon" style={{ color: item.tone }}>
              <DashboardIcon name={item.icon} size={15} />
            </span>
            <div>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <small>{item.note}</small>
            </div>
          </article>
        ))}
      </div>

      <div className="dynamic-code-toolbar">
        <label className="dynamic-code-search">
          <DashboardIcon name="search" size={14} />
          <input
            aria-label="搜索动态码"
            placeholder="自习室、签到码、楼栋"
            value={codeQuery}
            onChange={(event) => setCodeQuery(event.target.value)}
          />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="动态码楼栋筛选"
            value={codeBuildingFilter}
            onChange={(event) => {
              setCodeBuildingFilter(event.target.value);
              announceDynamicCodeAction(`已按楼栋筛选：${event.target.value}。`);
            }}
          >
            {codeBuildingOptions.map((building) => (
              <option key={building} value={building}>
                {building}
              </option>
            ))}
          </select>
          <DashboardIcon name="chevron-down" size={12} />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="动态码状态筛选"
            value={codeStatusFilter}
            onChange={(event) => {
              setCodeStatusFilter(event.target.value);
              announceDynamicCodeAction(`已按状态筛选：${event.target.value}。`);
            }}
          >
            {codeStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <DashboardIcon name="chevron-down" size={12} />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="动态码刷新策略筛选"
            value={codeRefreshFilter}
            onChange={(event) => {
              setCodeRefreshFilter(event.target.value);
              announceDynamicCodeAction(`已按刷新策略筛选：${event.target.value}。`);
            }}
          >
            {codeRefreshOptions.map((refresh) => (
              <option key={refresh} value={refresh}>
                {refresh}
              </option>
            ))}
          </select>
            <DashboardIcon name="chevron-down" size={12} />
        </label>
        <button
          className="dynamic-code-primary"
          type="button"
          onClick={() => announceDynamicCodeAction('已重新生成今日动态码任务。')}
        >
          <DashboardIcon name="qr" size={13} />
          生成动态码
        </button>
        <button type="button" onClick={() => announceDynamicCodeAction('已准备当前动态码打印任务。')}>
          <DashboardIcon name="download" size={13} />
          打印签到码
        </button>
      </div>

      <AdminActionNotice message={actionNotice} />

      <div className="dynamic-code-layout">
        <section className="dashboard-card dynamic-code-table-card">
          <header className="dynamic-code-head">
            <div>
              <span>按自习室展示</span>
              <h2>动态码管理</h2>
            </div>
            <small>网页动态码与小程序二维码统一生成、打印和审计</small>
          </header>

          <div className="dynamic-code-table">
            <div className="dynamic-code-table-head">
              {[
                '自习室',
                '楼栋',
                '网页动态码',
                '小程序二维码',
                '刷新策略',
                '更新状态',
                '最近更新',
                '操作'
              ].map((head) => (
                <span key={head}>{head}</span>
              ))}
            </div>
            {displayedCodeRecords.map((record) => {
              const status = ADMIN_DYNAMIC_CODE_STATUS_META[record.status];
              return (
                <div className="dynamic-code-table-row" key={record.room}>
                  <strong>{record.room}</strong>
                  <span>{record.building}</span>
                  <code>{record.webCode}</code>
                  <span>{record.qrStatus}</span>
                  <span>{record.refresh}</span>
                  <span>
                    <mark data-variant={status.variant}>{status.label}</mark>
                  </span>
                  <span>{record.updatedAt}</span>
                  <span className="dynamic-code-actions">
                    <button
                      type="button"
                      onClick={() => announceDynamicCodeAction(`已重新生成${record.room}动态码。`)}
                    >
                      <DashboardIcon name="refresh" size={12} />
                      重新生成
                    </button>
                    <button
                      type="button"
                      onClick={() => announceDynamicCodeAction(`已准备打印${record.room}签到码。`)}
                    >
                      <DashboardIcon name="download" size={12} />
                      打印
                    </button>
                    <button
                      type="button"
                      onClick={() => announceDynamicCodeAction(`已打开${record.room}动态码日志。`)}
                    >
                      <DashboardIcon name="eye" size={12} />
                      查看日志
                    </button>
                  </span>
                </div>
              );
            })}
            {displayedCodeRecords.length === 0 && <div className="room-empty">没有匹配的动态码</div>}
          </div>
        </section>

        <aside className="dashboard-card dynamic-code-side-card">
          <header className="dynamic-code-head">
            <div>
              <span>签到码预览</span>
              <h2>{overview.preview?.room ?? '暂无动态码'}</h2>
            </div>
          </header>
          <div className="dynamic-code-preview">
            <div className="dynamic-code-qr-frame" data-qr-value={previewQrValue}>
              <QRCode
                aria-label={`${overview.preview?.room ?? '自习室'} 小程序二维码`}
                bgColor="#ffffff"
                bordered={false}
                className="dynamic-code-qr"
                color="#1f6f63"
                errorLevel="M"
                size={118}
                type="svg"
                value={previewQrValue}
              />
            </div>
            <strong>{overview.preview?.webCode ?? '—'}</strong>
            <span>网页动态码 · 小程序二维码</span>
          </div>
          {overview.rules.map(([title, desc]) => (
            <div className="dynamic-code-rule" key={title}>
              <span />
              <div>
                <strong>{title}</strong>
                <small>{desc}</small>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

function UserManagementPanel({
  accessToken,
  actionSignal,
  onSessionExpired,
  onSessionRefresh
}: {
  accessToken?: string;
  actionSignal?: AdminActionSignal | null;
  onSessionExpired?: () => void;
  onSessionRefresh?: (session: SessionView) => void;
}) {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [query, setQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('全部院系');
  const [roleFilter, setRoleFilter] = useState('全部角色');
  const [statusFilter, setStatusFilter] = useState('账号状态');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  const announceUserAction = (message: string) => {
    setActionNotice(`用户管理：${message}`);
  };

  useEffect(() => {
    if (actionSignal?.menu !== 'users') return;
    if (actionSignal.label === '新增用户') {
      announceUserAction('已打开新增用户流程。');
      return;
    }
    if (actionSignal.label === '导入名单') {
      announceUserAction('已准备导入名单流程。');
      return;
    }
    announceUserAction(`${actionSignal.label}已触发。`);
  }, [actionSignal?.label, actionSignal?.menu, actionSignal?.nonce]);

  useEffect(() => {
    let alive = true;
    if (!accessToken) {
      setUsers([]);
      setLoadError('请先使用管理账号登录');
      setLoading(false);
      return () => {
        alive = false;
      };
    }

    setLoading(true);
    requestUsers(accessToken, { keyword: query }, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
    })
      .then((nextUsers) => {
        if (!alive) return;
        setUsers(nextUsers.map(toAdminUserRow));
        setLoadError('');
      })
      .catch((error) => {
        if (!alive) return;
        setUsers([]);
        setLoadError(error instanceof Error ? error.message : '用户列表加载失败');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [accessToken, onSessionExpired, onSessionRefresh, query]);

  const departmentOptions = useMemo(
    () => ['全部院系', ...Array.from(new Set(users.map((user) => user.department))).sort()],
    [users]
  );
  const roleOptions = useMemo(
    () => [
      '全部角色',
      ...Array.from(
        new Set(users.flatMap((user) => user.role.split('、').filter(Boolean)))
      ).sort()
    ],
    [users]
  );

  const filteredUsers = users.filter((user) => {
    const keyword = query.trim().toLowerCase();
    const matchesKeyword =
      !keyword ||
      [user.name, user.account, user.department, user.role].some((field) =>
      field.toLowerCase().includes(keyword)
      );
    const matchesDepartment =
      departmentFilter === '全部院系' || user.department === departmentFilter;
    const matchesRole = roleFilter === '全部角色' || user.role.split('、').includes(roleFilter);
    const statusLabel = ADMIN_USER_STATUS_META[user.status].label;
    const matchesStatus = statusFilter === '账号状态' || statusLabel === statusFilter;
    return matchesKeyword && matchesDepartment && matchesRole && matchesStatus;
  });

  const handleToggleUserStatus = (user: AdminUserRow) => {
    const nextStatus = user.status === 'disabled' ? 'active' : 'disabled';
    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === user.id ? { ...currentUser, status: nextStatus } : currentUser
      )
    );
    announceUserAction(
      nextStatus === 'disabled' ? `已停用${user.name}。` : `已启用${user.name}。`
    );
  };

  const studentCount = users.filter((user) => user.source === '统一认证').length;
  const adminCount = users.length - studentCount;
  const disabledCount = users.filter((user) => user.status === 'disabled').length;
  const userSummary = [
    {
      label: '学生账号',
      value: `${studentCount}`,
      note: '学工号统一认证同步',
      icon: 'users',
      tone: '#3A6FA8'
    },
    {
      label: '管理员',
      value: `${adminCount}`,
      note: '按角色授权后台菜单',
      icon: 'shield',
      tone: F.success
    },
    {
      label: '停用账号',
      value: `${disabledCount}`,
      note: '阻止登录与预约操作',
      icon: 'alert',
      tone: '#C84040'
    },
    {
      label: '当前展示',
      value: `${filteredUsers.length}`,
      note: '按搜索条件实时过滤',
      icon: 'download',
      tone: F.gold
    }
  ] satisfies Array<{
    label: string;
    value: string;
    note: string;
    icon: DashboardIconName;
    tone: string;
  }>;

  return (
    <section className="user-management-panel" aria-label="用户管理">
      <div className="user-management-summary-grid" aria-label="用户关键指标">
        {userSummary.map((item) => (
          <article className="dashboard-card user-management-summary-card" key={item.label}>
            <span className="user-management-summary-icon" style={{ color: item.tone }}>
              <DashboardIcon name={item.icon} size={15} />
            </span>
            <div>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <small>{item.note}</small>
            </div>
          </article>
        ))}
      </div>

      <div className="user-management-toolbar">
        <label className="user-management-search">
          <DashboardIcon name="search" size={14} />
          <input
            aria-label="搜索用户"
            placeholder="姓名、学号、院系"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="院系筛选"
            value={departmentFilter}
            onChange={(event) => {
              setDepartmentFilter(event.target.value);
              announceUserAction(`已按院系筛选：${event.target.value}。`);
            }}
          >
            {departmentOptions.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
          <DashboardIcon name="chevron-down" size={12} />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="角色筛选"
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              announceUserAction(`已按角色筛选：${event.target.value}。`);
            }}
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <DashboardIcon name="chevron-down" size={12} />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="账号状态筛选"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              announceUserAction(`已按账号状态筛选：${event.target.value}。`);
            }}
          >
            {['账号状态', '正常', '停用'].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
            <DashboardIcon name="chevron-down" size={12} />
        </label>
        <button
          className="user-management-primary"
          type="button"
          onClick={() => announceUserAction('已打开新增用户流程。')}
        >
          <DashboardIcon name="users" size={13} />
          新增用户
        </button>
        <button type="button" onClick={() => announceUserAction('已准备导入名单流程。')}>
          <DashboardIcon name="download" size={13} />
          导入名单
        </button>
      </div>

      <AdminActionNotice message={actionNotice} />

      {(loading || loadError) && (
        <div className={`room-message ${loadError ? 'is-error' : ''}`}>
          <DashboardIcon name={loadError ? 'alert' : 'refresh'} size={14} />
          {loadError || '正在加载用户列表…'}
        </div>
      )}

      <div className="user-management-layout">
        <section className="dashboard-card user-management-table-card">
          <header className="user-management-head">
            <div>
              <span>展示账号与角色</span>
              <h2>账号列表</h2>
            </div>
            <small>学生账号、管理员账号与院系归属统一维护</small>
          </header>

          <div className="user-management-table">
            <div className="user-management-table-head">
              {['姓名', '账号', '院系', '角色', '账号来源', '最近更新', '状态', '操作'].map((head) => (
                <span key={head}>{head}</span>
              ))}
            </div>
            {filteredUsers.map((user) => {
              const status = ADMIN_USER_STATUS_META[user.status];
              return (
                <div className="user-management-table-row" key={user.id}>
                  <strong>{user.name}</strong>
                  <code>{user.account}</code>
                  <span>{user.department}</span>
                  <span>{user.role}</span>
                  <span>{user.source}</span>
                  <span>{user.lastUpdated}</span>
                  <span>
                    <mark data-variant={status.variant}>{status.label}</mark>
                  </span>
                  <span className="user-management-actions">
                    <button
                      type="button"
                      onClick={() => announceUserAction(`已打开${user.name}的角色分配流程。`)}
                    >
                      <DashboardIcon name="shield" size={12} />
                      分配角色
                    </button>
                    <button
                      type="button"
                      onClick={() => announceUserAction(`已生成${user.name}的密码重置任务。`)}
                    >
                      <DashboardIcon name="settings" size={12} />
                      重置密码
                    </button>
                    <button
                      className={user.status === 'disabled' ? 'is-enable' : 'is-disable'}
                      type="button"
                      onClick={() => handleToggleUserStatus(user)}
                    >
                      <DashboardIcon name={user.status === 'disabled' ? 'check-circle' : 'x'} size={12} />
                      {user.status === 'disabled' ? '启用' : '停用'}
                    </button>
                  </span>
                </div>
              );
            })}
            {filteredUsers.length === 0 && <div className="room-empty">没有匹配的用户</div>}
          </div>
        </section>

        <aside className="dashboard-card user-management-side-card">
          <header className="user-management-head">
            <div>
              <span>接口统计</span>
              <h2>账号来源</h2>
            </div>
          </header>
          {userSummary.map((item, index) => (
            <div className="user-management-rule" key={item.label}>
              <span>{index + 1}</span>
              <div>
                <strong>{item.label}</strong>
                <small>
                  {item.value} · {item.note}
                </small>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

function RoleManagementPanel({
  accessToken,
  actionSignal,
  onSessionExpired,
  onSessionRefresh
}: {
  accessToken?: string;
  actionSignal?: AdminActionSignal | null;
  onSessionExpired?: () => void;
  onSessionRefresh?: (session: SessionView) => void;
}) {
  const [roles, setRoles] = useState<AdminRoleRow[]>([]);
  const [roleRecords, setRoleRecords] = useState<AdminRole[]>([]);
  const [query, setQuery] = useState('');
  const [roleNameFilter, setRoleNameFilter] = useState('全部角色');
  const [roleScopeFilter, setRoleScopeFilter] = useState('全部范围');
  const [roleStatusFilter, setRoleStatusFilter] = useState('审批状态');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  const announceRoleAction = (message: string) => {
    setActionNotice(`角色权限管理：${message}`);
  };

  useEffect(() => {
    if (actionSignal?.menu !== 'roles') return;
    if (actionSignal.label === '新建角色') {
      announceRoleAction('已打开新建角色流程。');
      return;
    }
    if (actionSignal.label === '分配权限') {
      announceRoleAction('已打开权限分配流程。');
      return;
    }
    announceRoleAction(`${actionSignal.label}已触发。`);
  }, [actionSignal?.label, actionSignal?.menu, actionSignal?.nonce]);

  useEffect(() => {
    let alive = true;
    if (!accessToken) {
      setRoles([]);
      setRoleRecords([]);
      setLoadError('请先使用管理账号登录');
      setLoading(false);
      return () => {
        alive = false;
      };
    }

    setLoading(true);
    requestRoles(accessToken, { keyword: query }, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
    })
      .then((nextRoles) => {
        if (!alive) return;
        setRoleRecords(nextRoles);
        setRoles(nextRoles.map(mapAdminRoleToRow));
        setLoadError('');
      })
      .catch((error) => {
        if (!alive) return;
        setRoleRecords([]);
        setRoles([]);
        setLoadError(error instanceof Error ? error.message : '角色列表加载失败');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [accessToken, onSessionExpired, onSessionRefresh, query]);

  const roleNameOptions = useMemo(
    () => ['全部角色', ...Array.from(new Set(roles.map((role) => role.name))).sort()],
    [roles]
  );
  const roleScopeOptions = useMemo(
    () => ['全部范围', ...Array.from(new Set(roles.map((role) => role.scope))).sort()],
    [roles]
  );
  const filteredRoles = roles.filter((role) => {
    const keyword = query.trim().toLowerCase();
    const matchesKeyword = !keyword || role.searchText.includes(keyword);
    const matchesName = roleNameFilter === '全部角色' || role.name === roleNameFilter;
    const matchesScope = roleScopeFilter === '全部范围' || role.scope === roleScopeFilter;
    const statusLabel = ADMIN_ROLE_STATUS_META[role.status].label;
    const matchesStatus = roleStatusFilter === '审批状态' || statusLabel === roleStatusFilter;
    return matchesKeyword && matchesName && matchesScope && matchesStatus;
  });
  const permissionGroups = buildAdminRolePermissionGroups(roleRecords);
  const permissionMatrix = buildAdminRolePermissionMatrix(roleRecords);

  const handleToggleRoleStatus = (role: AdminRoleRow) => {
    const nextStatus = role.status === 'disabled' ? 'active' : 'disabled';
    setRoles((currentRoles) =>
      currentRoles.map((currentRole) =>
        currentRole.id === role.id ? { ...currentRole, status: nextStatus } : currentRole
      )
    );
    announceRoleAction(
      nextStatus === 'disabled' ? `已禁用${role.name}。` : `已启用${role.name}。`
    );
  };

  const permissionCount = new Set(
    roles.flatMap((role) =>
      role.searchText
        .split(' ')
        .filter((part) => part.includes('.') && !part.includes('/'))
    )
  ).size;
  const maxMenuCount = roles.reduce((max, role) => {
    const [current] = role.menuAccess.split('/').map((value) => Number(value));
    return Math.max(max, Number.isFinite(current) ? current : 0);
  }, 0);
  const roleSummary = [
    {
      label: '角色数',
      value: `${roles.length}`,
      note: '覆盖管理员与观察员',
      icon: 'shield',
      tone: F.success
    },
    {
      label: '权限点',
      value: `${permissionCount}`,
      note: '按模块与操作拆分',
      icon: 'settings',
      tone: '#3A6FA8'
    },
    {
      label: '待审变更',
      value: `${roles.filter((role) => role.status === 'pending').length}`,
      note: '审批后生效',
      icon: 'alert',
      tone: '#C8820A'
    },
    {
      label: '菜单级权限',
      value: `${maxMenuCount}/${ADMIN_MENU_IDS.length}`,
      note: '后台菜单按角色过滤',
      icon: 'grid',
      tone: F.gold
    }
  ] satisfies Array<{
    label: string;
    value: string;
    note: string;
    icon: DashboardIconName;
    tone: string;
  }>;

  return (
    <section className="role-management-panel" aria-label="角色权限管理">
      <div className="role-management-summary-grid" aria-label="角色权限关键指标">
        {roleSummary.map((item) => (
          <article className="dashboard-card role-management-summary-card" key={item.label}>
            <span className="role-management-summary-icon" style={{ color: item.tone }}>
              <DashboardIcon name={item.icon} size={15} />
            </span>
            <div>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <small>{item.note}</small>
            </div>
          </article>
        ))}
      </div>

      <div className="role-management-toolbar">
        <label className="role-management-search">
          <DashboardIcon name="search" size={14} />
          <input
            aria-label="搜索角色权限"
            placeholder="角色名称、权限点、菜单"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="角色筛选"
            value={roleNameFilter}
            onChange={(event) => {
              setRoleNameFilter(event.target.value);
              announceRoleAction(`已按角色筛选：${event.target.value}。`);
            }}
          >
            {roleNameOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <DashboardIcon name="chevron-down" size={12} />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="权限范围筛选"
            value={roleScopeFilter}
            onChange={(event) => {
              setRoleScopeFilter(event.target.value);
              announceRoleAction(`已按权限范围筛选：${event.target.value}。`);
            }}
          >
            {roleScopeOptions.map((scope) => (
              <option key={scope} value={scope}>
                {scope}
              </option>
            ))}
          </select>
          <DashboardIcon name="chevron-down" size={12} />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="审批状态筛选"
            value={roleStatusFilter}
            onChange={(event) => {
              setRoleStatusFilter(event.target.value);
              announceRoleAction(`已按审批状态筛选：${event.target.value}。`);
            }}
          >
            {['审批状态', '启用', '待审批', '禁用'].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
            <DashboardIcon name="chevron-down" size={12} />
        </label>
        <button
          className="role-management-primary"
          type="button"
          onClick={() => announceRoleAction('已打开新建角色流程。')}
        >
          <DashboardIcon name="shield" size={13} />
          新建角色
        </button>
        <button type="button" onClick={() => announceRoleAction('已打开权限分配流程。')}>
          <DashboardIcon name="settings" size={13} />
          分配权限
        </button>
      </div>

      <AdminActionNotice message={actionNotice} />

      {(loading || loadError) && (
        <div className={`room-message ${loadError ? 'is-error' : ''}`}>
          <DashboardIcon name={loadError ? 'alert' : 'refresh'} size={14} />
          {loadError || '正在加载角色列表…'}
        </div>
      )}

      <div className="role-management-layout">
        <section className="dashboard-card role-management-table-card">
          <header className="role-management-head">
            <div>
              <span>按权限范围展示</span>
              <h2>角色列表</h2>
            </div>
            <small>RBAC 角色权限模型控制后台菜单与操作范围</small>
          </header>

          <div className="role-management-table">
            <div className="role-management-table-head">
              {['角色', '用户数', '数据范围', '空间管理', '运营管理', '菜单权限', '最近更新', '状态', '操作'].map((head) => (
                <span key={head}>{head}</span>
              ))}
            </div>
            {filteredRoles.map((role) => {
              const status = ADMIN_ROLE_STATUS_META[role.status];
              return (
                <div className="role-management-table-row" key={role.id}>
                  <strong>{role.name}</strong>
                  <span>{role.users}</span>
                  <span>{role.scope}</span>
                  <span>{role.spaceAccess}</span>
                  <span>{role.operationAccess}</span>
                  <code>{role.menuAccess}</code>
                  <span>{role.updatedAt}</span>
                  <span>
                    <mark data-variant={status.variant}>{status.label}</mark>
                  </span>
                  <span className="role-management-actions">
                    <button
                      type="button"
                      onClick={() => announceRoleAction(`已打开${role.name}权限编辑。`)}
                    >
                      <DashboardIcon name="edit" size={12} />
                      编辑权限
                    </button>
                    <button
                      type="button"
                      onClick={() => announceRoleAction(`已复制${role.name}为新角色草稿。`)}
                    >
                      <DashboardIcon name="plus" size={12} />
                      复制角色
                    </button>
                    <button
                      className={role.status === 'disabled' ? 'is-enable' : 'is-disable'}
                      type="button"
                      onClick={() => handleToggleRoleStatus(role)}
                    >
                      <DashboardIcon name={role.status === 'disabled' ? 'check-circle' : 'x'} size={12} />
                      {role.status === 'disabled' ? '启用' : '禁用'}
                    </button>
                  </span>
                </div>
              );
            })}
            {filteredRoles.length === 0 && <div className="room-empty">没有匹配的角色</div>}
          </div>
        </section>

        <aside className="dashboard-card role-management-side-card">
          <header className="role-management-head">
            <div>
              <span>菜单级过滤</span>
              <h2>权限分组</h2>
            </div>
          </header>
          {permissionGroups.map((group) => (
            <div className="role-permission-group" key={group.group}>
              <strong>{group.group}</strong>
              <div>
                {group.permissions.map((permission) => (
                  <span key={permission}>{permission}</span>
                ))}
              </div>
            </div>
          ))}
          {permissionGroups.length === 0 && <div className="room-empty">后端暂无权限点数据</div>}
          <section className="role-permission-matrix" aria-label="菜单权限矩阵">
            <strong>菜单权限矩阵</strong>
            {permissionMatrix.map((item) => (
              <div className="role-permission-matrix-row" key={item.title}>
                <span>{item.title}</span>
                <mark>{item.scope}</mark>
                <button
                  type="button"
                  onClick={() => announceRoleAction(`已定位${item.title}的菜单权限。`)}
                >
                  {item.checked}
                </button>
              </div>
            ))}
          </section>
          {roleSummary.map((item, index) => (
            <div className="role-management-rule" key={item.label}>
              <span>{index + 1}</span>
              <div>
                <strong>{item.label}</strong>
                <small>{item.note}</small>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

function SystemParameterPanel({
  actionSignal,
  error,
  loading,
  overview
}: AdminDataPanelProps<AdminSystemParamSnapshot>) {
  const [paramQuery, setParamQuery] = useState('');
  const [paramScopeFilter, setParamScopeFilter] = useState('生效范围');
  const [paramStatusFilter, setParamStatusFilter] = useState('发布状态');
  const [actionNotice, setActionNotice] = useState('');
  const announceParamAction = (message: string) => {
    setActionNotice(`系统参数管理：${message}`);
  };

  useEffect(() => {
    if (actionSignal?.menu !== 'params') return;
    if (actionSignal.label === '保存参数') {
      announceParamAction('已保存参数变更为待审批草稿。');
      return;
    }
    if (actionSignal.label === '恢复默认') {
      announceParamAction('已恢复当前筛选参数默认值预览。');
      return;
    }
    announceParamAction(`${actionSignal.label}已触发。`);
  }, [actionSignal?.label, actionSignal?.menu, actionSignal?.nonce]);

  if (!overview) {
    return <AdminDataState error={error} loading={loading} label="系统参数管理" />;
  }
  const displayedParams = overview.records.filter((param) => {
    const keyword = paramQuery.trim().toLowerCase();
    const matchesKeyword =
      !keyword ||
      [param.name, param.value, param.defaultValue, param.scope, param.type, param.note].some(
        (field) => field.toLowerCase().includes(keyword)
      );
    const statusLabel = ADMIN_PARAM_STATUS_META[param.status].label;
    const matchesScope = paramScopeFilter === '生效范围' || param.scope === paramScopeFilter;
    const matchesStatus = paramStatusFilter === '发布状态' || statusLabel === paramStatusFilter;
    return matchesKeyword && matchesScope && matchesStatus;
  });
  const paramScopeOptions = [
    '生效范围',
    ...Array.from(new Set(overview.records.map((param) => param.scope))).sort()
  ];
  const paramStatusOptions = [
    '发布状态',
    ...Array.from(
      new Set(overview.records.map((param) => ADMIN_PARAM_STATUS_META[param.status].label))
    ).sort()
  ];

  return (
    <section className="system-parameter-panel" aria-label="系统参数管理">
      <AdminActionNotice message={actionNotice} />

      <div className="system-parameter-summary-grid" aria-label="系统参数关键指标">
        {overview.summary.map((item) => (
          <article className="dashboard-card system-parameter-summary-card" key={item.label}>
            <span className="system-parameter-summary-icon" style={{ color: item.tone }}>
              <DashboardIcon name={item.icon} size={15} />
            </span>
            <div>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <small>{item.note}</small>
            </div>
          </article>
        ))}
      </div>

      <div className="system-parameter-toolbar">
        <label className="system-parameter-search">
          <DashboardIcon name="search" size={14} />
          <input
            aria-label="搜索系统参数"
            placeholder="参数名称、取值、适用范围"
            value={paramQuery}
            onChange={(event) => setParamQuery(event.target.value)}
          />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="参数范围筛选"
            value={paramScopeFilter}
            onChange={(event) => {
              setParamScopeFilter(event.target.value);
              announceParamAction(`已按生效范围筛选：${event.target.value}。`);
            }}
          >
            {paramScopeOptions.map((scope) => (
              <option key={scope} value={scope}>
                {scope}
              </option>
            ))}
          </select>
          <DashboardIcon name="chevron-down" size={12} />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="参数状态筛选"
            value={paramStatusFilter}
            onChange={(event) => {
              setParamStatusFilter(event.target.value);
              announceParamAction(`已按发布状态筛选：${event.target.value}。`);
            }}
          >
            {paramStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
            <DashboardIcon name="chevron-down" size={12} />
        </label>
        <button
          className="system-parameter-primary"
          type="button"
          onClick={() => announceParamAction('已保存参数变更为待审批草稿。')}
        >
          <DashboardIcon name="settings" size={13} />
          保存参数
        </button>
        <button type="button" onClick={() => announceParamAction('已恢复当前筛选参数默认值预览。')}>
          <DashboardIcon name="refresh" size={13} />
          恢复默认
        </button>
      </div>

      <div className="system-parameter-layout">
        <section className="dashboard-card system-parameter-table-card">
          <header className="system-parameter-head">
            <div>
              <span>与需求文档保持一致</span>
              <h2>参数配置</h2>
            </div>
            <small>修改预约、签到、提醒和违约参数后，需要审批发布才会影响业务规则。</small>
          </header>

          <div className="system-parameter-table">
            <div className="system-parameter-table-head">
              {['参数', '当前值', '默认值', '适用范围', '类型', '状态', '说明'].map((head) => (
                <span key={head}>{head}</span>
              ))}
            </div>
            {displayedParams.map((param) => {
              const status = ADMIN_PARAM_STATUS_META[param.status];
              return (
                <div className="system-parameter-table-row" key={param.name}>
                  <strong>{param.name}</strong>
                  <code>{param.value}</code>
                  <span>{param.defaultValue}</span>
                  <span>{param.scope}</span>
                  <span>{param.type}</span>
                  <span>
                    <mark data-variant={status.variant}>{status.label}</mark>
                  </span>
                  <small>{param.note}</small>
                </div>
              );
            })}
            {displayedParams.length === 0 && <div className="room-empty">没有匹配的系统参数</div>}
          </div>
        </section>

        <aside className="dashboard-card system-parameter-side-card">
          <header className="system-parameter-head">
            <div>
              <span>提醒与取消</span>
              <h2>生效时间线</h2>
            </div>
          </header>
          <div className="system-parameter-timeline">
            {overview.timeline.map(([time, title, desc]) => (
              <div className="system-parameter-timeline-item" key={time}>
                <span>{time}</span>
                <div>
                  <strong>{title}</strong>
                  <small>{desc}</small>
                </div>
              </div>
            ))}
          </div>

          <section className="system-parameter-scope-list" aria-label="参数生效范围">
            <strong>生效范围</strong>
            {overview.scopes.map(([scope, desc]) => (
              <div className="system-parameter-scope-item" key={scope}>
                <span>{scope}</span>
                <small>{desc}</small>
              </div>
            ))}
          </section>

          {overview.rules.map(([title, desc], index) => (
            <div className="system-parameter-rule" key={title}>
              <span>{index + 1}</span>
              <div>
                <strong>{title}</strong>
                <small>{desc}</small>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

function AuditLogPanel({
  actionSignal,
  error,
  loading,
  overview
}: AdminDataPanelProps<AdminAuditSnapshot>) {
  const [auditQuery, setAuditQuery] = useState('');
  const [auditModuleFilter, setAuditModuleFilter] = useState('全部模块');
  const [auditResultFilter, setAuditResultFilter] = useState('全部结果');
  const [actionNotice, setActionNotice] = useState('');
  const announceAuditAction = (message: string) => {
    setActionNotice(`审计日志管理：${message}`);
  };

  useEffect(() => {
    if (actionSignal?.menu !== 'audit') return;
    if (actionSignal.label === '筛选模块') {
      announceAuditAction('已打开模块筛选面板。');
      return;
    }
    if (actionSignal.label === '导出日志') {
      announceAuditAction('已生成审计日志导出任务。');
      return;
    }
    announceAuditAction(`${actionSignal.label}已触发。`);
  }, [actionSignal?.label, actionSignal?.menu, actionSignal?.nonce]);

  if (!overview) {
    return <AdminDataState error={error} loading={loading} label="审计日志管理" />;
  }
  const displayedAuditRecords = overview.records.filter((record) => {
    const keyword = auditQuery.trim().toLowerCase();
    const matchesKeyword =
      !keyword ||
      [
        record.time,
        record.operator,
        record.module,
        record.action,
        record.target,
        record.ip,
        record.detail
      ].some((field) => field.toLowerCase().includes(keyword));
    const resultLabel = ADMIN_AUDIT_STATUS_META[record.result].label;
    const matchesModule = auditModuleFilter === '全部模块' || record.module === auditModuleFilter;
    const matchesResult = auditResultFilter === '全部结果' || resultLabel === auditResultFilter;
    return matchesKeyword && matchesModule && matchesResult;
  });
  const auditModuleOptions = [
    '全部模块',
    ...Array.from(new Set(overview.records.map((record) => record.module))).sort()
  ];
  const auditResultOptions = [
    '全部结果',
    ...Array.from(
      new Set(overview.records.map((record) => ADMIN_AUDIT_STATUS_META[record.result].label))
    ).sort()
  ];

  return (
    <section className="audit-log-panel" aria-label="审计日志管理">
      <AdminActionNotice message={actionNotice} />

      <div className="audit-log-summary-grid" aria-label="审计日志关键指标">
        {overview.summary.map((item) => (
          <article className="dashboard-card audit-log-summary-card" key={item.label}>
            <span className="audit-log-summary-icon" style={{ color: item.tone }}>
              <DashboardIcon name={item.icon} size={15} />
            </span>
            <div>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <small>{item.note}</small>
            </div>
          </article>
        ))}
      </div>

      <div className="audit-log-toolbar">
        <label className="audit-log-search">
          <DashboardIcon name="search" size={14} />
          <input
            aria-label="搜索审计日志"
            placeholder="操作者、模块、预约编号"
            value={auditQuery}
            onChange={(event) => setAuditQuery(event.target.value)}
          />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="审计模块筛选"
            value={auditModuleFilter}
            onChange={(event) => {
              setAuditModuleFilter(event.target.value);
              announceAuditAction(`已按模块筛选：${event.target.value}。`);
            }}
          >
            {auditModuleOptions.map((module) => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </select>
          <DashboardIcon name="chevron-down" size={12} />
        </label>
        <label className="admin-filter-select">
          <select
            aria-label="审计结果筛选"
            value={auditResultFilter}
            onChange={(event) => {
              setAuditResultFilter(event.target.value);
              announceAuditAction(`已按结果筛选：${event.target.value}。`);
            }}
          >
            {auditResultOptions.map((result) => (
              <option key={result} value={result}>
                {result}
              </option>
            ))}
          </select>
            <DashboardIcon name="chevron-down" size={12} />
        </label>
        <button
          className="audit-log-primary"
          type="button"
          onClick={() => announceAuditAction('已打开模块筛选面板。')}
        >
          <DashboardIcon name="eye" size={13} />
          筛选模块
        </button>
        <button type="button" onClick={() => announceAuditAction('已生成审计日志导出任务。')}>
          <DashboardIcon name="download" size={13} />
          导出日志
        </button>
      </div>

      <div className="audit-log-layout">
        <section className="dashboard-card audit-log-table-card">
          <header className="audit-log-head">
            <div>
              <span>保留管理员操作痕迹</span>
              <h2>审计流水</h2>
            </div>
            <small>记录登录、资源变更、权限调整和关键运营操作，支持追踪与复盘。</small>
          </header>

          <div className="audit-log-table">
            <div className="audit-log-table-head">
              {['时间', '操作者', '模块', '动作', '对象', '来源 IP', '结果', '详情'].map((head) => (
                <span key={head}>{head}</span>
              ))}
            </div>
            {displayedAuditRecords.map((record) => {
              const status = ADMIN_AUDIT_STATUS_META[record.result];
              return (
                <div className="audit-log-table-row" key={`${record.time}-${record.action}`}>
                  <code>{record.time}</code>
                  <strong>{record.operator}</strong>
                  <span>{record.module}</span>
                  <span>{record.action}</span>
                  <span>{record.target}</span>
                  <span>{record.ip}</span>
                  <span>
                    <mark data-variant={status.variant}>{status.label}</mark>
                  </span>
                  <small>{record.detail}</small>
                </div>
              );
            })}
            {displayedAuditRecords.length === 0 && <div className="room-empty">没有匹配的审计日志</div>}
          </div>
        </section>

        <aside className="dashboard-card audit-log-side-card">
          <header className="audit-log-head">
            <div>
              <span>异常与复核</span>
              <h2>风险事件</h2>
            </div>
          </header>
          <div className="audit-risk-list">
            {overview.risks.map(([title, meta, desc]) => (
              <div className="audit-risk-item" key={title}>
                <strong>{title}</strong>
                <span>{meta}</span>
                <small>{desc}</small>
              </div>
            ))}
          </div>

          {overview.rules.map(([title, desc], index) => (
            <div className="audit-log-rule" key={title}>
              <span>{index + 1}</span>
              <div>
                <strong>{title}</strong>
                <small>{desc}</small>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

function DataReportsPanel({
  error,
  exportSignal,
  loading,
  overview
}: AdminDataPanelProps<AdminReportSnapshot> & {
  exportSignal?: AdminReportExportSignal | null;
}) {
  const [filters, setFilters] = useState<AdminReportFilterState>(
    DEFAULT_ADMIN_REPORT_FILTER_STATE
  );
  const [reportNotice, setReportNotice] = useState(
    '报表数据来自后端聚合，可按筛选条件导出。'
  );

  const handleReportExport = (format: AdminReportExportFormat) => {
    if (!overview) return;
    const downloaded = downloadAdminReport(overview, filters, format);
    setReportNotice(
      downloaded
        ? `已导出 ${format === 'excel' ? 'Excel' : 'CSV'}：${getAdminReportFilterSummary(filters)}。`
        : `已生成 ${format === 'excel' ? 'Excel' : 'CSV'} 导出内容，当前环境不支持自动下载。`
    );
  };

  useEffect(() => {
    if (!exportSignal || !overview) return;
    handleReportExport(exportSignal.format);
  }, [exportSignal?.nonce]);

  if (!overview) {
    return <AdminDataState error={error} loading={loading} label="数据报表" />;
  }

  const maxWeeklyBookings = Math.max(...overview.weeklyBookings.map(([, value]) => value), 1);
  const filterEntries: Array<[AdminReportFilterKey, string]> = [
    ['month', '统计月份'],
    ['scope', '统计范围'],
    ['granularity', '统计粒度']
  ];

  const cycleFilter = (key: AdminReportFilterKey, label: string) => {
    setFilters((current) => {
      const options = ADMIN_REPORT_FILTER_OPTIONS[key];
      const next = {
        ...current,
        [key]: (current[key] + 1) % options.length
      };
      setReportNotice(`已切换${label}：${getAdminReportFilterLabel(next, key)}。`);
      return next;
    });
  };

  return (
    <section className="data-reports-panel" aria-label="数据报表">
      <div className="data-reports-summary-grid" aria-label="数据报表关键指标">
        {overview.summary.map((item) => (
          <article className="dashboard-card data-reports-summary-card" key={item.label}>
            <span className="data-reports-summary-icon" style={{ color: item.tone }}>
              <DashboardIcon name={item.icon} size={15} />
            </span>
            <div>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <small>{item.note}</small>
            </div>
          </article>
        ))}
      </div>

      <div className="data-reports-toolbar">
        {filterEntries.map(([key, label]) => (
          <button
            aria-label={label}
            key={key}
            type="button"
            onClick={() => cycleFilter(key, label)}
          >
            {getAdminReportFilterLabel(filters, key)}
            <DashboardIcon name="chevron-down" size={12} />
          </button>
        ))}
        <button className="data-reports-primary" type="button" onClick={() => handleReportExport('csv')}>
          <DashboardIcon name="download" size={13} />
          导出 CSV
        </button>
        <button type="button" onClick={() => handleReportExport('excel')}>
          <DashboardIcon name="download" size={13} />
          导出 Excel
        </button>
      </div>
      <div className="data-reports-notice" role="status" aria-live="polite">
        <DashboardIcon name="info" size={13} />
        {reportNotice}
      </div>

      <div className="data-reports-layout">
        <section className="dashboard-card data-reports-chart-card">
          <header className="data-reports-head">
            <div>
              <span>近一周趋势</span>
              <h2>本周每日预约量</h2>
            </div>
            <small>来自后端近 30 天有效预约聚合，按本周日期归档。</small>
          </header>

          <div className="data-reports-bar-chart" aria-label="本周每日预约量柱状图">
            {overview.weeklyBookings.map(([day, value]) => {
              const height = value > 0 ? Math.max(12, Math.round((value / maxWeeklyBookings) * 132)) : 4;
              return (
                <div className="data-reports-bar-item" key={day}>
                  <strong>{value > 0 ? value.toLocaleString('zh-CN') : '—'}</strong>
                  <span className={value === maxWeeklyBookings ? 'is-peak' : ''} style={{ height }} />
                  <small>{day}</small>
                </div>
              );
            })}
          </div>
        </section>

        <section className="dashboard-card data-reports-room-card">
          <header className="data-reports-head">
            <div>
              <span>空间排行</span>
              <h2>热门自习室 Top 5</h2>
            </div>
            <small>按后端近 30 天有效预约量排序。</small>
          </header>
          <div className="data-reports-room-list">
            {overview.topRooms.map((room, index) => (
              <div className="data-reports-room-item" key={room.name}>
                <div>
                  <mark>{index + 1}</mark>
                  <strong>{room.name}</strong>
                  <small>{room.count.toLocaleString('zh-CN')} 次</small>
                </div>
                <span>
                  <i style={{ width: `${room.pct}%` }} />
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="data-reports-detail-grid">
        <section className="dashboard-card data-reports-table-card">
          <header className="data-reports-head">
            <div>
              <span>座位分析</span>
              <h2>热门座位</h2>
            </div>
            <small>按后端近 30 天有效预约使用次数排序。</small>
          </header>
          <div className="data-reports-table">
            <div className="data-reports-table-head">
              {['座位', '自习室', '使用次数', '特征'].map((head) => (
                <span key={head}>{head}</span>
              ))}
            </div>
            {overview.topSeats.map(([seat, room, count, feature]) => (
              <div className="data-reports-table-row" key={seat}>
                <strong>{seat}</strong>
                <span>{room}</span>
                <code>{count}</code>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="dashboard-card data-reports-side-card">
          <header className="data-reports-head">
            <div>
              <span>资源调整</span>
              <h2>低利用率时段</h2>
            </div>
          </header>
          <div className="data-reports-low-list">
            {overview.lowPeriods.map(([period, pct, label]) => (
              <div className="data-reports-low-item" key={period}>
                <strong>{period}</strong>
                <span>{pct}</span>
                <small>{label}</small>
              </div>
            ))}
          </div>
          {overview.rules.map(([title, desc], index) => (
            <div className="data-reports-rule" key={title}>
              <span>{index + 1}</span>
              <div>
                <strong>{title}</strong>
                <small>{desc}</small>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

export function StudentHomePreview({
  accessToken,
  studentName,
  initialActive,
  onLogout,
  onSessionExpired,
  onSessionRefresh
}: StudentDashboardProps) {
  const initialStudentPage = normalizeStudentPageId(initialActive ?? resolveInitialStudentMenu());
  const [activeMenu, setActiveMenu] = useState<StudentPageId>(() => initialStudentPage);
  const [studentViolationSummary, setStudentViolationSummary] =
    useState<StudentViolationSummaryView>(() =>
      mapStudentViolationSummaryToView(STUDENT_VIOLATION_FALLBACK_SUMMARY)
    );
  const [studentNotificationSummary, setStudentNotificationSummary] =
    useState<StudentNotificationSummaryView>(() => getStudentNotificationFallbackSummary());
  const [studentBookingSummary, setStudentBookingSummary] = useState<StudentBookingSummaryView>(
    () =>
      accessToken || initialStudentPage === 'bookings'
        ? createEmptyStudentBookingSummary()
        : getStudentBookingFallbackSummary()
  );
  const [studentHomeSummary, setStudentHomeSummary] = useState<StudentHomeSummary | null>(null);
  const [studentRoomCatalog, setStudentRoomCatalog] = useState<RoomCatalogItem[]>([]);
  const [checkInNotice, setCheckInNotice] = useState('');
  const [studentActionNotice, setStudentActionNotice] = useState('');
  const [notificationMarkingRead, setNotificationMarkingRead] = useState(false);
  const [assistantResetKey, setAssistantResetKey] = useState(0);
  const [assistantSeatSelection, setAssistantSeatSelection] =
    useState<StudentAssistantSeatCandidate | null>(null);
  const [seatBookingDraft, setSeatBookingDraft] = useState<StudentSeatBookingDraft>(() =>
    createStudentSeatBookingDraft(DEFAULT_STUDENT_SEAT_ROOM_CONTEXT, 'C3', ['插座', '安静区'])
  );
  const [roomInitialFilter, setRoomInitialFilter] = useState<StudentRoomFilter>('全部楼栋');
  const [favoriteRoomIds, setFavoriteRoomIds] = useState<string[]>(() => [
    ...STUDENT_DEFAULT_FAVORITE_ROOM_IDS
  ]);
  const [studentRoomAvailabilityById, setStudentRoomAvailabilityById] = useState<Record<string, number>>({});
  const [studentRoomCapacityById, setStudentRoomCapacityById] = useState<Record<string, number>>({});
  const [bookingConfirmOpen, setBookingConfirmOpen] = useState(false);
  const [assistantBookingAction, setAssistantBookingAction] =
    useState<StudentAssistantBookingActionContext | null>(null);
  const activeNavMenu: StudentMenuId =
    activeMenu === 'select' || activeMenu === 'confirm' ? 'rooms' : activeMenu;
  const currentStudentNow = new Date();
  const homeBookingBanner = createStudentHomeBookingBanner(
    currentStudentNow,
    accessToken ? studentBookingSummary : undefined
  );
  const studentTodayActiveBookings = getStudentTodayActiveBookings(
    studentBookingSummary,
    currentStudentNow
  );
  const studentTodayBookingCount = studentTodayActiveBookings.length;
  const studentTodayBookingStatTrend = formatStudentTodayBookingStatTrend(
    studentTodayActiveBookings,
    currentStudentNow
  );
  const studentHomeTodayBookingCount =
    studentHomeSummary?.todayBookingCount ?? studentTodayBookingCount;
  const studentHomeDailyBookingLimit = studentHomeSummary?.dailyBookingLimit ?? STUDENT_DAILY_BOOKING_LIMIT;
  const studentHomeFavoriteCount = studentHomeSummary?.favoriteRooms?.length ?? favoriteRoomIds.length;
  const studentHomeFavoriteSummary = studentHomeSummary
    ? formatStudentFavoriteRoomNameSummary(studentHomeSummary.favoriteRooms ?? [])
    : formatStudentFavoriteRoomSummary(favoriteRoomIds, studentRoomCatalog.length > 0 ? studentRoomCatalog : STUDENT_ROOM_LIST);
  const studentHomeWeekRecords =
    studentHomeSummary?.weekRecords ??
    STUDENT_WEEK_RECORDS.map(([day, hours]) => ({ day, hours }));
  const studentHomeWeekMaxHours = Math.max(
    4,
    ...studentHomeWeekRecords.map((record) => record.hours)
  );
  const studentHomeStats = STUDENT_HOME_STATS.map((stat) => {
    if (stat.label === '今日全校空座' && studentHomeSummary) {
      return {
        ...stat,
        value: String(studentHomeSummary.availableSeats),
        note: `共 ${studentHomeSummary.totalSeats.toLocaleString('zh-CN')} 个座位`,
        trend: formatStudentAvailableSeatTrend(studentHomeSummary.availableSeatsDeltaPercent)
      };
    }
    if (stat.label === '今日我的预约') {
      return {
        ...stat,
        value: String(studentHomeTodayBookingCount),
        note:
          studentHomeTodayBookingCount > 0
            ? `还有 ${Math.max(0, studentHomeDailyBookingLimit - studentHomeTodayBookingCount)} 次可用`
            : '今日暂无预约',
        trend:
          studentHomeTodayBookingCount > 0
            ? `今日 ${studentHomeTodayBookingCount} 场`
            : studentTodayBookingStatTrend
      };
    }
    if (stat.label === '常用自习室') {
      return {
        ...stat,
        value: String(studentHomeFavoriteCount),
        note: studentHomeFavoriteSummary,
        trend: studentHomeFavoriteCount > 0 ? '已收藏' : '可添加'
      };
    }
    if (stat.label === '本周学习时长' && studentHomeSummary) {
      return {
        ...stat,
        value: formatStudentHourValue(studentHomeSummary.weekStudyHours),
        note: formatStudentWeekHourTrend(
          studentHomeSummary.weekStudyHours,
          studentHomeSummary.lastWeekStudyHours
        ),
        trend: formatStudentStudyTrendLabel(
          studentHomeSummary.weekStudyHours,
          studentHomeSummary.lastWeekStudyHours
        )
      };
    }
    return stat;
  });
  const studentHomeRecommendedRooms = useMemo(() => {
    if (studentRoomCatalog.length > 0) {
      const tones = [F.navy, '#3A6FA8', '#C8820A'];
      return studentRoomCatalog.slice(0, 3).map((room, index) => {
        const hasStats =
          studentRoomCapacityById[room.id] !== undefined ||
          studentRoomAvailabilityById[room.id] !== undefined;
        const roomView = createStudentRoomListItem(
          room,
          hasStats
            ? {
                totalSeats: studentRoomCapacityById[room.id],
                availableSeats: studentRoomAvailabilityById[room.id]
              }
            : undefined,
          studentRoomAvailabilityById
        );
        return {
          name: roomView.name,
          location: `${roomView.building} ${roomView.floor}`,
          seats: `${roomView.available} / ${roomView.capacity}`,
          status: STUDENT_ROOM_STATUS_META[roomView.status].label,
          tags: roomView.tags,
          tone: tones[index % tones.length],
          roomContext: createStudentSeatRoomContextFromRoom(roomView)
        };
      });
    }

    return STUDENT_RECOMMENDED_ROOMS.map((room) => ({
      ...room,
      roomContext: createStudentSeatRoomContextFromRecommendedRoom(room)
    }));
  }, [studentRoomAvailabilityById, studentRoomCapacityById, studentRoomCatalog]);
  const handleStudentBookingSummaryChange = useCallback((nextSummary: StudentBookingSummaryView) => {
    setStudentBookingSummary(nextSummary);
    if (Object.keys(studentRoomCapacityById).length > 0) return;
    setStudentRoomAvailabilityById(createStudentRoomAvailabilityByBookingSummary(nextSummary));
  }, [studentRoomCapacityById]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname === '/student/select' || window.location.pathname === '/student/confirm') {
      pushAppPath('/student/rooms');
    }
  }, []);

  useEffect(() => {
    let alive = true;
    if (!accessToken) return () => {
      alive = false;
    };

    requestRoomCatalog(accessToken, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
    })
      .then((catalog) => {
        if (!alive) return;
        setStudentRoomCatalog(catalog);
      })
      .catch(() => {
        // 登录态目录接口短暂不可用时保留兜底列表，避免页面空白。
      });

    return () => {
      alive = false;
    };
  }, [accessToken, onSessionExpired, onSessionRefresh]);

  useEffect(() => {
    let alive = true;
    if (!accessToken) return () => {
      alive = false;
    };

    requestStudentNotifications(accessToken, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
    })
      .then((nextSummary) => {
        if (!alive) return;
        setStudentNotificationSummary(mapStudentNotificationSummaryToView(nextSummary));
      })
      .catch(() => {
        // Keep the local fallback summary if the notification service is temporarily unavailable.
      });

    return () => {
      alive = false;
    };
  }, [accessToken, onSessionExpired, onSessionRefresh]);

  useEffect(() => {
    let alive = true;
    if (!accessToken) {
      setStudentHomeSummary(null);
      return () => {
        alive = false;
      };
    }
    if (activeMenu !== 'home') return () => {
      alive = false;
    };

    requestStudentHomeSummary(accessToken, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
    })
      .then((nextSummary) => {
        if (!alive) return;
        setStudentHomeSummary(nextSummary);
        setFavoriteRoomIds(
          normalizeStudentRoomFavoriteIds(
            { favorites: nextSummary.favoriteRooms },
            studentRoomCatalog.length > 0 ? studentRoomCatalog : STUDENT_ROOM_LIST
          )
        );
      })
      .catch(() => {
        // 首页保留本地兜底指标，避免概览接口短暂不可用时空白。
      });

    return () => {
      alive = false;
    };
  }, [accessToken, activeMenu, onSessionExpired, onSessionRefresh, studentRoomCatalog]);

  useEffect(() => {
    let alive = true;
    if (!accessToken) return () => {
      alive = false;
    };
    if (activeMenu !== 'home') return () => {
      alive = false;
    };

    requestStudentBookings(accessToken, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
    })
      .then((nextSummary) => {
        if (!alive) return;
        handleStudentBookingSummaryChange(mapStudentBookingSummaryToView(nextSummary));
      })
      .catch(() => {
        // 首页继续保留本地摘要，避免预约服务短暂不可用时清空当前页面。
      });

    return () => {
      alive = false;
    };
  }, [accessToken, activeMenu, handleStudentBookingSummaryChange, onSessionExpired, onSessionRefresh]);

  useEffect(() => {
    let alive = true;
    if (!accessToken) return () => {
      alive = false;
    };
    if (activeMenu !== 'home') return () => {
      alive = false;
    };

    requestStudentRoomAvailability(
      accessToken,
      buildStudentCurrentRoomAvailabilityRange(new Date()),
      fetch,
      resolveApiBaseUrl(),
      {
        onSessionExpired,
        onSessionRefresh
      }
    )
      .then((summary) => {
        if (!alive) return;
        setStudentRoomAvailabilityById(mapStudentRoomAvailableSeatsById(summary));
        setStudentRoomCapacityById(mapStudentRoomTotalSeatsById(summary));
      })
      .catch(() => {
        // 首页推荐卡片保留本地兜底座位数，列表页仍会按选择时段重新加载真实统计。
      });

    return () => {
      alive = false;
    };
  }, [accessToken, activeMenu, onSessionExpired, onSessionRefresh]);

  const handleStudentMenuChange = (nextMenu: StudentMenuId) => {
    const normalizedMenu = normalizeStudentPageId(nextMenu);
    setRoomInitialFilter('全部楼栋');
    setActiveMenu(normalizedMenu);
    setStudentActionNotice('');
    setBookingConfirmOpen(false);
    pushAppPath(normalizedMenu === 'home' ? '/student' : `/student/${normalizedMenu}`);
  };

  const handleStudentPageChange = (nextPage: StudentPageId, notice = '') => {
    const normalizedPage = normalizeStudentPageId(nextPage);
    setActiveMenu(normalizedPage);
    setStudentActionNotice(notice);
    setBookingConfirmOpen(false);
    pushAppPath(normalizedPage === 'home' ? '/student' : `/student/${normalizedPage}`);
  };

  const showStudentActionNotice = (message: string) => {
    setStudentActionNotice(message);
  };

  const handleStudentNotificationsMarkAllRead = () => {
    if (notificationMarkingRead) return;
    if (!accessToken) {
      const nextSummary = markStudentNotificationSummaryRead(studentNotificationSummary);
      setStudentNotificationSummary(nextSummary);
      showStudentActionNotice('已将当前通知标记为已读。');
      return;
    }

    setNotificationMarkingRead(true);
    requestStudentNotificationsMarkAllRead(accessToken, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
    })
      .then((nextSummary) => {
        setStudentNotificationSummary(mapStudentNotificationSummaryToView(nextSummary));
        showStudentActionNotice('已将全部通知标记为已读。');
      })
      .catch((error) => {
        showStudentActionNotice(error instanceof Error ? error.message : '通知已读状态保存失败');
      })
      .finally(() => setNotificationMarkingRead(false));
  };

  const handleStudentRoomBook = (
    room: StudentSeatRoomContext,
    notice?: string,
    bookingOptions?: { dateLabel?: string; time?: string }
  ) => {
    setAssistantSeatSelection(null);
    setSeatBookingDraft(
      createStudentSeatBookingDraft(
        room,
        'C3',
        room.tags.includes('插座') ? ['插座'] : [],
        bookingOptions?.time,
        bookingOptions?.dateLabel
      )
    );
    setActiveMenu('rooms');
    setStudentActionNotice(notice ?? `请确认${room.name}的预约信息。`);
    setBookingConfirmOpen(true);
    pushAppPath('/student/rooms');
  };

  const handleStudentQuickAction = (label: string) => {
    if (label === '立即找座') {
      setRoomInitialFilter('全部楼栋');
      handleStudentPageChange('rooms', '已进入自习室列表，可按日期、时间、楼栋和座位属性筛选。');
      return;
    }
    if (label === '扫码签到') {
      setCheckInNotice('扫码签到请使用移动端扫描教室二维码');
      handleStudentPageChange('checkin');
      return;
    }
    if (label === '我的收藏') {
      setRoomInitialFilter('我的收藏');
      handleStudentPageChange('rooms', '已切换到常用自习室列表，可继续选择自习室预约。');
      return;
    }
    if (label === '智能推荐') {
      handleStudentPageChange('assistant');
      return;
    }
    showStudentActionNotice(`${label} 暂无可执行操作`);
  };

  const handleAssistantSeatSelect = (seat?: StudentAssistantSeatCandidate) => {
    if (seat) {
      setAssistantSeatSelection(seat);
    }
    handleStudentPageChange('rooms');
  };

  const handleAssistantSeatConfirm = (seat?: StudentAssistantSeatCandidate) => {
    if (seat) {
      setAssistantSeatSelection(seat);
    }
    handleStudentPageChange('rooms');
    setBookingConfirmOpen(true);
  };

  const handleAssistantBookingAction = (
    booking: StudentAssistantBookingCandidate,
    action: Exclude<StudentAssistantAction, 'BOOK'>
  ) => {
    if (action === 'CHECK_IN') {
      setCheckInNotice(`已从智能助手定位：${booking.room} · ${booking.seat}，请完成签到。`);
      handleStudentPageChange('checkin');
      return;
    }

    setAssistantBookingAction({ booking, action });
    handleStudentPageChange('bookings');
  };

  const handleStudentBookingSubmitted = (booking: StudentBookingRecord) => {
    const [createdRecord] = mapStudentBookingSummaryToView({
      totalCount: 1,
      activeCount: 1,
      completedCount: 0,
      records: [booking]
    }).records;
    setStudentBookingSummary((current) => ({
      ...current,
      totalCount: current.totalCount + 1,
      activeCount: current.activeCount + 1,
      records: [createdRecord, ...current.records.filter((record) => record.id !== booking.id)]
    }));
    const roomId = resolveStudentRoomId(booking.room);
    const sourceRoom =
      studentRoomCatalog.find((room) => room.id === roomId) ??
      STUDENT_ROOM_LIST.find((room) => room.id === roomId);
    if (!sourceRoom) return;
    setStudentRoomAvailabilityById((current) => {
      const fallbackAvailable =
        'available' in sourceRoom && typeof sourceRoom.available === 'number'
          ? sourceRoom.available
          : sourceRoom.capacity;
      const currentAvailable = current[roomId] ?? fallbackAvailable;
      return {
        ...current,
        [roomId]: Math.max(0, currentAvailable - 1)
      };
    });
  };

  const handleStudentBookingCancelled = (
    booking: StudentBookingRecord,
    nextSummary?: StudentBookingSummaryView
  ) => {
    if (nextSummary) {
      handleStudentBookingSummaryChange(nextSummary);
      return;
    } else {
      const [cancelledView] = mapStudentBookingSummaryToView({
        totalCount: 1,
        activeCount: 0,
        completedCount: 0,
        records: [booking]
      }).records;
      setStudentBookingSummary((current) => {
        const existingRecord = current.records.find((record) => record.id === booking.id);
        const wasActive = existingRecord?.status === 'upcoming' || existingRecord?.status === 'using';
        return {
          ...current,
          activeCount: wasActive ? Math.max(0, current.activeCount - 1) : current.activeCount,
          records: existingRecord
            ? current.records.map((record) => (record.id === booking.id ? cancelledView : record))
            : [cancelledView, ...current.records]
        };
      });
    }

    const roomId = resolveStudentRoomId(booking.room);
    const sourceRoom =
      studentRoomCatalog.find((room) => room.id === roomId) ??
      STUDENT_ROOM_LIST.find((room) => room.id === roomId);
    if (!sourceRoom) return;
    const capacity = studentRoomCapacityById[roomId] ?? sourceRoom.capacity;
    setStudentRoomAvailabilityById((current) => {
      const fallbackAvailable =
        'available' in sourceRoom && typeof sourceRoom.available === 'number'
          ? sourceRoom.available
          : sourceRoom.capacity;
      const currentAvailable = current[roomId] ?? fallbackAvailable;
      return {
        ...current,
        [roomId]: Math.min(capacity, currentAvailable + 1)
      };
    });
  };

  const handleStudentBookingSubmitResult = (result: StudentBookingSubmitResult) => {
    setBookingConfirmOpen(false);
    handleStudentPageChange('rooms', result.message);
  };

  const pageTitleByMenu: Record<StudentMenuId, string> = {
    home: '首页概览',
    rooms: '自习室列表',
    bookings: '我的预约',
    checkin: '签到',
    assistant: '智能助手',
    notify: '通知中心',
    violation: '违约记录'
  };
  const pageSubtitleByMenu: Record<StudentMenuId, string> = {
    home: `${formatStudentHomeDateLabel(currentStudentNow)} · 学习空间实时状态`,
    rooms: `按日期、时间、楼栋、楼层筛选 · 共 ${
      studentRoomCatalog.length > 0 ? studentRoomCatalog.length : STUDENT_ROOM_LIST.length
    } 个自习室`,
    bookings: formatStudentBookingSubtitle(studentBookingSummary),
    checkin: '输入动态码或扫码完成签到',
    assistant: '自然语言找座 · 预约管理 · 政策咨询',
    notify: formatStudentNotificationSubtitle(studentNotificationSummary),
    violation: formatStudentViolationSubtitle(studentViolationSummary)
  };
  const pageTitle = pageTitleByMenu[activeNavMenu];
  const pageSubtitle = pageSubtitleByMenu[activeNavMenu];

  return (
    <main className="student-home-page">
      <aside className="student-home-sidebar">
        <div className="student-home-brand">
          <div className="brand-seal">旦</div>
          <div>
            <strong>复旦大学</strong>
            <span>自习预约系统</span>
          </div>
        </div>
        <nav className="student-home-nav" aria-label="学生菜单">
          {STUDENT_MENU_GROUPS.map((group) => (
            <div className="student-home-nav-group" key={group.label}>
              <div className="student-home-nav-label">{group.label}</div>
              {group.items.map((item) => {
                const badge =
                  item.id === 'notify'
                    ? studentNotificationSummary.unreadCount > 0
                      ? `${studentNotificationSummary.unreadCount}`
                      : ''
                    : item.badge;
                return (
                  <button
                    aria-current={item.id === activeNavMenu ? 'page' : undefined}
                    className={item.id === activeNavMenu ? 'is-active' : ''}
                    key={item.id}
                    onClick={() => handleStudentMenuChange(item.id)}
                    type="button"
                  >
                    <DashboardIcon name={item.icon} size={13} />
                    <span>{item.label}</span>
                    {badge ? <mark>{badge}</mark> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="student-home-user">
          <div className="student-home-avatar">{studentName.charAt(0)}</div>
          <div>
            <strong>{studentName}</strong>
            <span>21307001 · 计算机学院</span>
          </div>
        </div>
      </aside>

      <section className="student-home-main">
        <header className="student-home-topbar">
          <div>
            <h1>{pageTitle}</h1>
            <p>{pageSubtitle}</p>
          </div>
          <div className="student-home-actions">
            {activeMenu === 'violation' ? (
              <>
                <button
                  onClick={() =>
                    showStudentActionNotice(
                      '违约规则：开始后 15 分钟未签到自动取消并记录违约，累计 3 次将限制预约 7 天。'
                    )
                  }
                  type="button"
                >
                  <DashboardIcon name="info" size={13} />
                  违约规则
                </button>
                <button
                  onClick={() => showStudentActionNotice('申诉入口已定位，请在下方违约记录中选择具体记录提交。')}
                  type="button"
                >
                  <DashboardIcon name="edit" size={13} />
                  提交申诉
                </button>
              </>
            ) : activeMenu === 'notify' ? (
              <>
                <button
                  disabled={notificationMarkingRead}
                  onClick={handleStudentNotificationsMarkAllRead}
                  type="button"
                >
                  <DashboardIcon name="check-circle" size={13} />
                  {notificationMarkingRead ? '保存中' : '全部已读'}
                </button>
                <button
                  onClick={() => showStudentActionNotice('通知设置暂未开放，当前默认接收预约、签到和系统公告提醒。')}
                  type="button"
                >
                  <DashboardIcon name="settings" size={13} />
                  通知设置
                </button>
              </>
            ) : activeMenu === 'assistant' ? (
              <>
                <button
                  onClick={() => {
                    setAssistantResetKey((current) => current + 1);
                    showStudentActionNotice('会话已清空，可重新输入找座或预约问题。');
                  }}
                  type="button"
                >
                  <DashboardIcon name="trash" size={13} />
                  清空会话
                </button>
                <button disabled type="button">
                  <DashboardIcon name="zap" size={13} />
                  智能推荐
                </button>
              </>
            ) : activeMenu === 'checkin' ? (
              <>
                <button
                  onClick={() => setCheckInNotice('扫码签到请使用移动端扫描教室二维码')}
                  type="button"
                >
                  <DashboardIcon name="scan" size={13} />
                  扫码签到
                </button>
                <button
                  onClick={() => setCheckInNotice('请联系教室值班管理员处理签到异常')}
                  type="button"
                >
                  <DashboardIcon name="info" size={13} />
                  联系管理员
                </button>
              </>
            ) : activeMenu === 'bookings' ? (
              <>
                <button
                  onClick={() => showStudentActionNotice('可直接点击下方状态标签筛选预约记录。')}
                  type="button"
                >
                  <DashboardIcon name="search" size={13} />
                  筛选状态
                </button>
                <button
                  onClick={() => showStudentActionNotice('已生成预约记录导出任务，请在浏览器下载列表中查看。')}
                  type="button"
                >
                  <DashboardIcon name="download" size={13} />
                  导出记录
                </button>
              </>
            ) : activeMenu === 'rooms' ? (
              <>
                <button
                  onClick={() => showStudentActionNotice('可使用下方日期、时间、楼栋、楼层和教室条件搜索。')}
                  type="button"
                >
                  <DashboardIcon name="search" size={13} />
                  搜索条件
                </button>
                <button
                  onClick={() => showStudentActionNotice('自习室列表已刷新，请以当前搜索结果为准。')}
                  type="button"
                >
                  <DashboardIcon name="refresh" size={13} />
                  刷新列表
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => handleStudentPageChange('rooms')}>
                  <DashboardIcon name="search" size={13} />
                  搜索自习室
                </button>
                <button type="button" onClick={() => handleStudentPageChange('notify')}>
                  <DashboardIcon name="bell" size={13} />
                  通知
                </button>
              </>
            )}
            <button type="button" onClick={onLogout}>
              退出登录
            </button>
          </div>
        </header>
        {studentActionNotice ? (
          <div className="student-action-notice" role="status" aria-live="polite">
            <DashboardIcon name="info" size={14} />
            {studentActionNotice}
          </div>
        ) : null}

        {activeMenu === 'rooms' ? (
          <StudentRoomsPanel
            accessToken={accessToken}
            availabilityById={studentRoomAvailabilityById}
            favoriteRoomIds={favoriteRoomIds}
            initialFilter={roomInitialFilter}
            roomCatalog={studentRoomCatalog}
            onBookRoom={(room, bookingOptions) =>
              handleStudentRoomBook(
                createStudentSeatRoomContextFromRoom(room),
                `请确认${room.name}的预约信息。`,
                bookingOptions
              )
            }
            onFavoriteRoomIdsChange={setFavoriteRoomIds}
            onSessionExpired={onSessionExpired}
            onSessionRefresh={onSessionRefresh}
            onWaitlist={(room) => showStudentActionNotice(`已为你加入${room.name}候补提醒，有空位会通知。`)}
          />
        ) : activeMenu === 'confirm' ? (
          <StudentBookingConfirmPanel
            accessToken={accessToken}
            assistantSeatSelection={assistantSeatSelection ?? undefined}
            onBack={() => handleStudentPageChange('select')}
            onSessionExpired={onSessionExpired}
            onSessionRefresh={onSessionRefresh}
            onSubmitResult={handleStudentBookingSubmitResult}
            onSubmitted={handleStudentBookingSubmitted}
            seatBookingDraft={seatBookingDraft}
          />
        ) : activeMenu === 'bookings' ? (
          <StudentBookingsPanel
            accessToken={accessToken}
            assistantBookingAction={assistantBookingAction ?? undefined}
            onCheckIn={() => handleStudentPageChange('checkin')}
            onRepeatBooking={(booking) => {
              const roomContext = createStudentSeatRoomContextFromName(booking.room);
              handleStudentRoomBook(
                roomContext,
                `已带你重新预约${booking.room}，请确认新的时间段。`
              );
            }}
            onBookingCancelled={handleStudentBookingCancelled}
            onSessionExpired={onSessionExpired}
            onSessionRefresh={onSessionRefresh}
            onSummaryChange={handleStudentBookingSummaryChange}
          />
        ) : activeMenu === 'checkin' ? (
          <StudentCheckInPanel
            accessToken={accessToken}
            actionNotice={checkInNotice}
            onActionNotice={setCheckInNotice}
            onSessionExpired={onSessionExpired}
            onSessionRefresh={onSessionRefresh}
          />
        ) : activeMenu === 'assistant' ? (
          <StudentAssistantPanel
            accessToken={accessToken}
            onBookingAction={handleAssistantBookingAction}
            onBookings={() => handleStudentPageChange('bookings')}
            onCheckIn={() => handleStudentPageChange('checkin')}
            onConfirmSeat={handleAssistantSeatConfirm}
            onBookingCancelled={handleStudentBookingCancelled}
            onSessionExpired={onSessionExpired}
            onSessionRefresh={onSessionRefresh}
            onSelect={() => handleStudentPageChange('rooms')}
            onSelectSeat={handleAssistantSeatSelect}
            resetKey={assistantResetKey}
          />
        ) : activeMenu === 'notify' ? (
          <StudentNotificationPanel
            accessToken={accessToken}
            onSessionExpired={onSessionExpired}
            onSessionRefresh={onSessionRefresh}
            onSummaryChange={setStudentNotificationSummary}
            summarySnapshot={studentNotificationSummary}
          />
        ) : activeMenu === 'violation' ? (
          <StudentViolationPanel
            accessToken={accessToken}
            onSessionExpired={onSessionExpired}
            onSessionRefresh={onSessionRefresh}
            onSummaryChange={setStudentViolationSummary}
          />
        ) : (
          <>
        <section className="student-home-booking-banner" aria-label={homeBookingBanner.label}>
          <span className="student-home-banner-icon">
            <DashboardIcon name="calendar" size={24} />
          </span>
          <div>
            <small>{homeBookingBanner.label}</small>
            <h2>{homeBookingBanner.title}</h2>
            <p>
              {homeBookingBanner.timeRangeLabel} · {homeBookingBanner.statusPrefix}
              {homeBookingBanner.statusValue ? <strong>{homeBookingBanner.statusValue}</strong> : null}
            </p>
          </div>
          <div className="student-home-booking-actions">
            {homeBookingBanner.actionState === 'empty' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleStudentPageChange('rooms', '可按日期、时间和自习室条件预约新的座位。')}
                >
                  去预约
                </button>
                <button
                  type="button"
                  onClick={() => handleStudentPageChange('bookings', '当前没有待开始或进行中的预约。')}
                >
                  查看记录
                </button>
              </>
            ) : homeBookingBanner.actionState === 'ended' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleStudentPageChange('bookings', '已进入我的预约，可查看已结束预约记录。')}
                >
                  查看记录
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleStudentRoomBook(
                      createStudentSeatRoomContextFromName('经管自习室 301'),
                      '请选择新的预约时间和座位。'
                    )
                  }
                >
                  再次预约
                </button>
              </>
            ) : homeBookingBanner.actionState === 'active' ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleStudentPageChange('bookings', '当前预约已签到，正在使用中。')
                  }
                >
                  查看记录
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleStudentPageChange('rooms', '可继续预约下一场学习时段。')
                  }
                >
                  预约下一场
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setCheckInNotice(
                      homeBookingBanner.actionState === 'checkin'
                        ? '当前预约已进入签到窗口，请到教室后扫码或输入动态码。'
                        : '当前预约会在开始前 15 分钟开放签到，请到教室后扫码或输入动态码。'
                    );
                    handleStudentPageChange('checkin');
                  }}
                >
                  立即签到
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleStudentPageChange(
                      'bookings',
                      '请在我的预约列表中选择对应记录取消，开始前 1 小时以上取消不记违约。'
                    )
                  }
                >
                  取消预约
                </button>
              </>
            )}
          </div>
        </section>

        <section className="student-home-stat-grid" aria-label="学习空间关键指标">
          {studentHomeStats.map((stat) => (
            <article className="dashboard-card student-home-stat-card" key={stat.label}>
              <div>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <small>{stat.note}</small>
              </div>
              <i style={{ color: stat.tone }}>
                <DashboardIcon name={stat.icon} size={17} />
              </i>
              <mark>{stat.trend}</mark>
            </article>
          ))}
        </section>

        <div className="student-home-content-grid">
          <section className="student-home-room-section">
            <header className="student-home-section-title">
              <h2>推荐自习室</h2>
              <button type="button" onClick={() => handleStudentPageChange('rooms')}>
                全部
                <DashboardIcon name="arrow-right" size={12} />
              </button>
            </header>
            <div className="student-home-room-list">
              {studentHomeRecommendedRooms.map((room) => (
                <article className="dashboard-card student-home-room-card" key={room.name}>
                  <span className="student-home-room-icon" style={{ color: room.tone }}>
                    <DashboardIcon name="building" size={18} />
                  </span>
                  <div className="student-home-room-info">
                    <strong>{room.name}</strong>
                    <small>
                      <DashboardIcon name="pin" size={11} />
                      {room.location}
                    </small>
                  </div>
                  <div className="student-home-room-tags">
                    {room.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="student-home-room-seats">
                    <strong>{room.seats}</strong>
                    <small>{room.status}</small>
                  </div>
                  <button type="button" onClick={() => handleStudentRoomBook(room.roomContext)}>
                    去预约
                  </button>
                </article>
              ))}
            </div>
          </section>

          <aside className="student-home-side">
            <section>
              <h2>快捷操作</h2>
              <div className="student-home-quick-grid">
                {STUDENT_QUICK_ACTIONS.map((action) => (
                  <button key={action.label} onClick={() => handleStudentQuickAction(action.label)} type="button">
                    <i style={{ color: action.tone }}>
                      <DashboardIcon name={action.icon} size={17} />
                    </i>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="dashboard-card student-home-week-card">
              <h2>本周学习记录</h2>
              <div className="student-home-week-chart" aria-label="本周学习记录">
                {studentHomeWeekRecords.map((record) => (
                  <div className="student-home-week-item" key={record.day}>
                    <span
                      style={{
                        height: `${Math.max(4, (record.hours / studentHomeWeekMaxHours) * 52)}px`
                      }}
                    />
                    <small>{record.day}</small>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
          </>
        )}
        {activeMenu === 'rooms' && bookingConfirmOpen ? (
          <StudentBookingConfirmDialog
            accessToken={accessToken}
            assistantSeatSelection={assistantSeatSelection ?? undefined}
            onClose={() => setBookingConfirmOpen(false)}
            onSessionExpired={onSessionExpired}
            onSessionRefresh={onSessionRefresh}
            onSubmitResult={handleStudentBookingSubmitResult}
            onSubmitted={handleStudentBookingSubmitted}
            seatBookingDraft={seatBookingDraft}
          />
        ) : null}
      </section>
    </main>
  );
}

function StudentRoomsPanel({
  accessToken,
  availabilityById = {},
  favoriteRoomIds: controlledFavoriteRoomIds,
  initialFilter = '全部楼栋',
  onBookRoom,
  onFavoriteRoomIdsChange,
  roomCatalog = [],
  onSessionExpired,
  onSessionRefresh,
  onWaitlist
}: {
  accessToken?: string;
  availabilityById?: Record<string, number>;
  favoriteRoomIds?: string[];
  initialFilter?: StudentRoomFilter;
  onBookRoom?: (
    room: StudentRoomListItem,
    bookingOptions: { dateLabel: string; time: string }
  ) => void;
  onFavoriteRoomIdsChange?: (favoriteRoomIds: string[]) => void;
  roomCatalog?: RoomCatalogItem[];
  onSessionExpired?: () => void;
  onSessionRefresh?: (session: SessionView) => void;
  onWaitlist?: (room: StudentRoomListItem) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<StudentRoomFilter>(initialFilter);
  const [activeBuilding, setActiveBuilding] = useState('');
  const [activeFloor, setActiveFloor] = useState('');
  const roomSearchNow = useMemo(() => new Date(), []);
  const initialTimeState = useMemo(
    () => createStudentRoomSearchTimeState('今天', roomSearchNow, '14:00', '17:00'),
    [roomSearchNow]
  );
  const [selectedDate, setSelectedDate] =
    useState<(typeof STUDENT_ROOM_DATE_OPTIONS)[number]>(initialTimeState.selectedDate);
  const [startTime, setStartTime] = useState(initialTimeState.startTime);
  const [endTime, setEndTime] = useState(initialTimeState.endTime);
  const [activeRoomName, setActiveRoomName] = useState('');
  const [localFavoriteRoomIds, setLocalFavoriteRoomIds] = useState<string[]>(() => [
    ...STUDENT_DEFAULT_FAVORITE_ROOM_IDS
  ]);
  const favoriteRoomIds = controlledFavoriteRoomIds ?? localFavoriteRoomIds;
  const [roomAvailabilitySummary, setRoomAvailabilitySummary] =
    useState<StudentRoomAvailabilitySummary | null>(null);
  const [searchNotice, setSearchNotice] = useState('');
  const sourceRooms: StudentRoomCatalogSource[] =
    roomCatalog.length > 0 ? roomCatalog : STUDENT_ROOM_LIST;
  const rooms = useMemo(
    () =>
      sourceRooms.map((room) => {
        const roomStats = (roomAvailabilitySummary?.rooms ?? []).find(
          (candidate) => candidate.roomId === room.id
        );
        return createStudentRoomListItem(room, roomStats, availabilityById);
      }),
    [availabilityById, roomAvailabilitySummary, sourceRooms]
  );
  const roomTree = useMemo(() => groupStudentRoomsByBuilding(rooms), [rooms]);
  const buildingOptions = roomTree.map((building) => building.building);
  const floorOptions = useMemo(() => {
    const floors = activeBuilding
      ? (roomTree.find((building) => building.building === activeBuilding)?.floors ?? []).map(
          (floor) => floor.floor
        )
      : rooms.map((room) => room.floor);
    return Array.from(new Set(floors));
  }, [activeBuilding, roomTree, rooms]);
  const roomOptions = useMemo(
    () =>
      rooms.filter((room) => {
        if (activeBuilding && room.building !== activeBuilding) return false;
        if (activeFloor && room.floor !== activeFloor) return false;
        return isStudentRoomOpenForTime(room, startTime, endTime);
      }),
    [activeBuilding, activeFloor, rooms, startTime, endTime]
  );
  const visibleRooms = rooms.filter((room) => {
    if (activeBuilding && room.building !== activeBuilding) return false;
    if (activeFloor && room.floor !== activeFloor) return false;
    if (activeRoomName && room.name !== activeRoomName) return false;
    if (!isStudentRoomOpenForTime(room, startTime, endTime)) return false;
    if (activeFilter === '全校开放' && !room.scope.includes('全校')) return false;
    if (activeFilter === '有空位' && room.available <= 0) return false;
    if (activeFilter === '有插座' && !room.tags.includes('插座')) return false;
    if (activeFilter === '靠窗' && !room.tags.includes('靠窗')) return false;
    if (activeFilter === '我的收藏' && !favoriteRoomIds.includes(room.id)) return false;
    return true;
  });
  const bookingTime = formatStudentRoomBookingTime(startTime, endTime);
  const startClockParts = splitStudentClock(startTime);
  const endClockParts = splitStudentClock(endTime);
  const startMinuteOptions = getStudentRoomBookableStartMinutes(
    selectedDate,
    startClockParts.hour,
    roomSearchNow
  );
  const endMinuteOptions = getStudentRoomBookableEndMinutes(startTime, endClockParts.hour);

  useEffect(() => {
    if (!accessToken) {
      const fallbackFavoriteRoomIds = [...STUDENT_DEFAULT_FAVORITE_ROOM_IDS];
      setLocalFavoriteRoomIds(fallbackFavoriteRoomIds);
      onFavoriteRoomIdsChange?.(fallbackFavoriteRoomIds);
      return;
    }

    let ignore = false;
    requestStudentRoomFavorites(accessToken, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
    })
      .then((summary) => {
        if (!ignore) {
          const nextFavoriteRoomIds = normalizeStudentRoomFavoriteIds(summary, sourceRooms);
          setLocalFavoriteRoomIds(nextFavoriteRoomIds);
          onFavoriteRoomIdsChange?.(nextFavoriteRoomIds);
        }
      })
      .catch((error) => {
        if (!ignore) setSearchNotice(error instanceof Error ? error.message : '收藏列表加载失败');
      });

    return () => {
      ignore = true;
    };
  }, [accessToken, onFavoriteRoomIdsChange, onSessionExpired, onSessionRefresh, sourceRooms]);

  useEffect(() => {
    if (!accessToken) {
      setRoomAvailabilitySummary(null);
      return;
    }

    let ignore = false;
    const timeRange = buildStudentRoomAvailabilityRange(
      selectedDate,
      startTime,
      endTime,
      roomSearchNow
    );
    requestStudentRoomAvailability(accessToken, timeRange, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
    })
      .then((summary) => {
        if (!ignore) setRoomAvailabilitySummary(summary);
      })
      .catch((error) => {
        if (!ignore) setSearchNotice(error instanceof Error ? error.message : '自习室座位统计加载失败');
      });

    return () => {
      ignore = true;
    };
  }, [accessToken, selectedDate, startTime, endTime, roomSearchNow, onSessionExpired, onSessionRefresh]);

  useEffect(() => {
    if (activeFloor && !floorOptions.includes(activeFloor)) setActiveFloor('');
  }, [activeFloor, floorOptions]);

  useEffect(() => {
    setActiveFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    if (activeRoomName && !roomOptions.some((room) => room.name === activeRoomName)) {
      setActiveRoomName('');
    }
  }, [activeRoomName, roomOptions]);

  const handleStartTimeChange = (value: string) => {
    if (!isStudentRoomStartClockBookable(selectedDate, value, roomSearchNow)) return;
    setStartTime(value);
    setEndTime((current) => normalizeStudentRoomEndTime(value, current));
    setActiveRoomName('');
  };

  const handleStartHourChange = (hour: string) => {
    const minuteOptions = getStudentRoomBookableStartMinutes(selectedDate, hour, roomSearchNow);
    const nextMinute = (minuteOptions as readonly string[]).includes(startClockParts.minute)
      ? startClockParts.minute
      : minuteOptions[0];
    if (nextMinute) handleStartTimeChange(createStudentClock(hour, nextMinute));
  };

  const handleStartMinuteChange = (minute: string) => {
    handleStartTimeChange(createStudentClock(startClockParts.hour, minute));
  };

  const handleEndTimeChange = (value: string) => {
    if (!isStudentRoomEndClockBookable(startTime, value)) return;
    setEndTime(value);
    setActiveRoomName('');
  };

  const handleEndHourChange = (hour: string) => {
    const minuteOptions = getStudentRoomBookableEndMinutes(startTime, hour);
    const nextMinute = (minuteOptions as readonly string[]).includes(endClockParts.minute)
      ? endClockParts.minute
      : minuteOptions[0];
    if (nextMinute) handleEndTimeChange(createStudentClock(hour, nextMinute));
  };

  const handleEndMinuteChange = (minute: string) => {
    handleEndTimeChange(createStudentClock(endClockParts.hour, minute));
  };

  const handleSelectedDateChange = (value: (typeof STUDENT_ROOM_DATE_OPTIONS)[number]) => {
    const nextTimeState = createStudentRoomSearchTimeState(value, roomSearchNow, startTime, endTime);
    setSelectedDate(nextTimeState.selectedDate);
    setStartTime(nextTimeState.startTime);
    setEndTime(nextTimeState.endTime);
    setActiveRoomName('');
  };

  const handleStructuredSearch = () => {
    setSearchNotice(
      `已按 ${selectedDate} ${bookingTime}、${activeBuilding || '全部楼栋'}、${
        activeFloor || '全部楼层'
      }、${activeRoomName || '全部教室'} 搜索可预约自习室。`
    );
  };

  const handleFavoriteToggle = (room: StudentRoomListItem) => {
    const isFavorite = favoriteRoomIds.includes(room.id);
    const previousFavoriteRoomIds = favoriteRoomIds;
    const nextFavoriteRoomIds = isFavorite
      ? favoriteRoomIds.filter((favoriteRoomId) => favoriteRoomId !== room.id)
      : [...favoriteRoomIds, room.id];
    setLocalFavoriteRoomIds(nextFavoriteRoomIds);
    onFavoriteRoomIdsChange?.(nextFavoriteRoomIds);
    setSearchNotice(isFavorite ? `已取消收藏${room.name}` : `已收藏${room.name}`);

    if (!accessToken) return;

    requestStudentRoomFavoriteSet(accessToken, room.id, !isFavorite, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
      })
      .then((summary) => {
        const nextServerFavoriteRoomIds = normalizeStudentRoomFavoriteIds(summary, sourceRooms);
        setLocalFavoriteRoomIds(nextServerFavoriteRoomIds);
        onFavoriteRoomIdsChange?.(nextServerFavoriteRoomIds);
      })
      .catch((error) => {
        setLocalFavoriteRoomIds(previousFavoriteRoomIds);
        onFavoriteRoomIdsChange?.(previousFavoriteRoomIds);
        setSearchNotice(error instanceof Error ? error.message : '收藏状态保存失败');
      });
  };

  return (
    <section className="student-rooms-panel" aria-label="学生自习室选择">
      <div className="student-room-selection-layout">
        <div className="student-room-filter-panel">
          <div className="student-room-filter-fields">
            <label>
              <span>日期</span>
              <select
                onChange={(event) =>
                  handleSelectedDateChange(
                    event.target.value as (typeof STUDENT_ROOM_DATE_OPTIONS)[number]
                  )
                }
                value={selectedDate}
              >
                {STUDENT_ROOM_DATE_OPTIONS.map((date) => (
                  <option
                    disabled={getStudentRoomBookableStartTimes(date, roomSearchNow).length === 0}
                    key={date}
                    value={date}
                  >
                    {date}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="student-room-time-field" aria-label="开始时间">
              <legend>开始时间</legend>
              <div className="student-room-time-picker">
                <StudentTimeDropdown
                  ariaLabel="开始时间小时"
                  onChange={handleStartHourChange}
                  options={STUDENT_ROOM_START_HOUR_OPTIONS.map((hour) => ({
                    value: hour,
                    disabled:
                      getStudentRoomBookableStartMinutes(selectedDate, hour, roomSearchNow)
                        .length === 0
                  }))}
                  unit="时"
                  value={startClockParts.hour}
                />
                <StudentTimeDropdown
                  ariaLabel="开始时间分钟"
                  onChange={handleStartMinuteChange}
                  options={startMinuteOptions.map((minute) => ({ value: minute }))}
                  unit="分"
                  value={startClockParts.minute}
                />
              </div>
            </fieldset>
            <fieldset className="student-room-time-field" aria-label="结束时间">
              <legend>结束时间</legend>
              <div className="student-room-time-picker">
                <StudentTimeDropdown
                  ariaLabel="结束时间小时"
                  onChange={handleEndHourChange}
                  options={STUDENT_ROOM_END_HOUR_OPTIONS.map((hour) => ({
                    value: hour,
                    disabled: getStudentRoomBookableEndMinutes(startTime, hour).length === 0
                  }))}
                  unit="时"
                  value={endClockParts.hour}
                />
                <StudentTimeDropdown
                  ariaLabel="结束时间分钟"
                  onChange={handleEndMinuteChange}
                  options={endMinuteOptions.map((minute) => ({ value: minute }))}
                  unit="分"
                  value={endClockParts.minute}
                />
              </div>
            </fieldset>
            <label>
              <span>楼栋</span>
              <select
                onChange={(event) => {
                  setActiveBuilding(event.target.value);
                  setActiveFloor('');
                }}
                value={activeBuilding}
              >
                <option value="">全部楼栋</option>
                {buildingOptions.map((building) => (
                  <option key={building} value={building}>
                    {building}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>楼层</span>
              <select onChange={(event) => setActiveFloor(event.target.value)} value={activeFloor}>
                <option value="">全部楼层</option>
                {floorOptions.map((floor) => (
                  <option key={floor} value={floor}>
                    {floor}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>教室</span>
              <select onChange={(event) => setActiveRoomName(event.target.value)} value={activeRoomName}>
                <option value="">全部教室</option>
                {roomOptions.map((room) => (
                  <option key={room.name} value={room.name}>
                    {room.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="student-room-search-actions">
            <button onClick={handleStructuredSearch} type="button">
              <DashboardIcon name="search" size={13} />
              搜索可预约自习室
            </button>
            {searchNotice ? <span role="status">{searchNotice}</span> : null}
          </div>
          <div className="student-rooms-filterbar">
            <div>
              <h3>附加条件</h3>
              <div className="student-rooms-filterchips">
                {STUDENT_ROOM_FILTERS.map((filter) => (
                  <button
                    className={filter === activeFilter ? 'is-active' : ''}
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    type="button"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <span>
              {selectedDate} {bookingTime} · 匹配 {visibleRooms.length} 间
            </span>
          </div>
        </div>
        <div className="student-room-selection-results">
          <div className="student-rooms-grid">
            {visibleRooms.map((room) => {
              const status = STUDENT_ROOM_STATUS_META[room.status];
              const occupiedPercent = Math.round(((room.capacity - room.available) / room.capacity) * 100);
              const isFavorite = favoriteRoomIds.includes(room.id);
              return (
                <article className="dashboard-card student-room-card" key={room.id}>
                  <header>
                    <span className="student-room-icon">
                      <DashboardIcon name="building" size={20} />
                    </span>
                    <div className="student-room-card-actions">
                      <button
                        aria-label={`${isFavorite ? '取消收藏' : '收藏'} ${room.name}`}
                        className={`student-room-favorite${isFavorite ? ' is-active' : ''}`}
                        onClick={() => handleFavoriteToggle(room)}
                        title={`${isFavorite ? '取消收藏' : '收藏'}${room.name}`}
                        type="button"
                      >
                        <DashboardIcon name="star" size={15} />
                      </button>
                      <mark data-variant={status.variant}>{status.label}</mark>
                    </div>
                  </header>

                  <strong>{room.name}</strong>
                  <small>
                    <DashboardIcon name="pin" size={11} />
                    {room.building} · {room.floor}
                  </small>

                  <div className="student-room-seat-meter">
                    <div>
                      <span>座位占用</span>
                      <strong>
                        {room.available} 空余 / {room.capacity}
                      </strong>
                    </div>
                    <i>
                      <b data-variant={status.variant} style={{ width: `${occupiedPercent}%` }} />
                    </i>
                  </div>

                  <div className="student-room-tags">
                    <span>{room.scope}</span>
                    {room.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  <footer>
                    <span>
                      <DashboardIcon name="clock" size={11} />
                      {room.hours}
                    </span>
                    <button
                      className={room.status === 'full' ? 'is-waitlist' : ''}
                      onClick={() =>
                        room.status === 'full'
                          ? onWaitlist?.(room)
                          : onBookRoom?.(room, { dateLabel: selectedDate, time: bookingTime })
                      }
                      type="button"
                    >
                      {room.status === 'full' ? '加入候补' : '预约'}
                    </button>
                  </footer>
                </article>
              );
            })}
            {visibleRooms.length === 0 ? (
              <div className="student-room-empty">当前预约时间和楼栋教室条件下没有匹配的自习室。</div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

// 旧选座页已经由预约弹窗替代，暂时保留作为历史 mock 组件。
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function StudentSeatSelectorPanel({
  assistantSeatSelection,
  bookingDateLabel,
  bookingEndTime,
  bookingStartTime,
  onConfirm,
  selectedRoomContext,
  showRoomTimeFilters = true
}: {
  assistantSeatSelection?: StudentAssistantSeatCandidate;
  bookingDateLabel?: string;
  bookingEndTime?: string;
  bookingStartTime?: string;
  onConfirm?: (draft: StudentSeatBookingDraft) => void;
  selectedRoomContext?: StudentSeatRoomContext;
  showRoomTimeFilters?: boolean;
}) {
  const roomContext = selectedRoomContext ?? DEFAULT_STUDENT_SEAT_ROOM_CONTEXT;
  const defaultSelectedSeat = assistantSeatSelection?.seat ?? 'C3';
  const selectedRoom = assistantSeatSelection?.room ?? roomContext.name;
  const [selectedSeat, setSelectedSeat] = useState(defaultSelectedSeat);
  const [selectedDate, setSelectedDate] =
    useState<(typeof STUDENT_SEAT_DATES)[number]>('今天');
  const [selectedBuilding, setSelectedBuilding] = useState(roomContext.building);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['插座']);
  const [appliedFeatures, setAppliedFeatures] = useState<string[]>([]);
  const [favoriteSeats, setFavoriteSeats] = useState<string[]>([]);
  const [seatNotice, setSeatNotice] = useState('');
  const selectedSeatFavorited = favoriteSeats.includes(selectedSeat);
  const selectedLocation = assistantSeatSelection?.location ?? roomContext.location;
  const selectedTags =
    selectedFeatures.length > 0
      ? selectedFeatures
      : assistantSeatSelection && assistantSeatSelection.tags.length > 0
        ? assistantSeatSelection.tags
        : ['安静区'];
  const [assistantStartTime, assistantEndTime] = parseStudentAssistantTimeRange(
    assistantSeatSelection?.time
  );
  const effectiveStartTime = bookingStartTime ?? assistantStartTime;
  const effectiveEndTime = bookingEndTime ?? assistantEndTime;
  const effectiveDateLabel =
    bookingDateLabel ?? formatStudentBookingDateLabel(getDefaultStudentBookingDateParts());
  const bookingTime = formatStudentRoomBookingTime(effectiveStartTime, effectiveEndTime);
  const bookingSummary = createStudentSeatBookingSummary(assistantSeatSelection, {
    location: selectedLocation,
    dateLabel: effectiveDateLabel,
    time: bookingTime
  });

  useEffect(() => {
    setSelectedSeat(defaultSelectedSeat);
  }, [defaultSelectedSeat]);

  useEffect(() => {
    if (assistantSeatSelection) return;
    setSelectedBuilding(roomContext.building);
    setSelectedSeat(defaultSelectedSeat);
    setAppliedFeatures([]);
    setSeatNotice('');
  }, [assistantSeatSelection, defaultSelectedSeat, roomContext.building, roomContext.name]);

  const toggleSelectedFeature = (feature: string) => {
    setSelectedFeatures((current) =>
      current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature]
    );
  };

  const resetSeatFilters = () => {
    setSelectedDate('今天');
    setSelectedBuilding(roomContext.building);
    setSelectedFeatures(['插座']);
    setAppliedFeatures([]);
    setSelectedSeat(defaultSelectedSeat);
    setSeatNotice('筛选条件已重置。');
  };

  const applySeatFilters = () => {
    setAppliedFeatures([...selectedFeatures]);
    setSeatNotice(
      `已应用筛选：${selectedDate} · ${selectedBuilding} · ${
        selectedFeatures.length > 0 ? selectedFeatures.join('、') : '不限属性'
      }。`
    );
  };

  const filteredBookableSeatCount = STUDENT_SEAT_ROWS.reduce(
    (total, row, rowIndex) =>
      total +
      row.filter((status, colIndex) => {
        const normalizedStatus =
          status === 'selected' && getStudentSeatNumber(rowIndex, colIndex) !== selectedSeat
            ? 'available'
            : status;
        return (
          isStudentSeatBookableStatus(normalizedStatus) &&
          doesStudentSeatMatchFeatures(
            getStudentSeatFeatures(rowIndex, colIndex, status),
            appliedFeatures
          )
        );
      }).length,
    0
  );

  const toggleFavoriteSeat = () => {
    setFavoriteSeats((current) => {
      if (current.includes(selectedSeat)) {
        setSeatNotice(`已取消收藏 ${selectedSeat}。`);
        return current.filter((seat) => seat !== selectedSeat);
      }
      setSeatNotice(`已收藏 ${selectedSeat}。`);
      return [...current, selectedSeat];
    });
  };

  return (
    <section className="student-seat-selector-panel" aria-label="学生座位选择">
      <aside className="student-seat-filter-panel">
        <h2>筛选条件</h2>

        {showRoomTimeFilters ? (
          <>
            <div className="student-seat-filter-section">
              <h3>日期</h3>
              <div className="student-seat-segment" aria-label="日期">
                {STUDENT_SEAT_DATES.map((date) => (
                  <button
                    className={date === selectedDate ? 'is-active' : ''}
                    key={date}
                    onClick={() => {
                      setSelectedDate(date);
                      setSeatNotice(`已切换预约日期：${date}。`);
                    }}
                    type="button"
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>

            <div className="student-seat-filter-section">
              <h3>时间段</h3>
              <div className="student-seat-time-grid">
                {[
                  ['开始', effectiveStartTime],
                  ['结束', effectiveEndTime]
                ].map(([label, value], index) => (
                  <div key={label}>
                    <span>{label}</span>
                    <button
                      className={index === 0 ? 'is-active' : ''}
                      onClick={() => setSeatNotice('预约时间可精确到分钟，单次预约最长 4 小时。')}
                      type="button"
                    >
                      {value}
                      <DashboardIcon name="chevron-down" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="student-seat-filter-section">
              <h3>楼栋</h3>
              <div className="student-seat-building-list">
                {STUDENT_SEAT_BUILDINGS.map((building) => (
                  <button
                    className={building === selectedBuilding ? 'is-active' : ''}
                    key={building}
                    onClick={() => {
                      setSelectedBuilding(building);
                      setSeatNotice(`已切换楼栋：${building}。`);
                    }}
                    type="button"
                  >
                    <i>{building === selectedBuilding ? <DashboardIcon name="check" size={9} /> : null}</i>
                    <span>{building}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="student-seat-filter-section student-seat-room-context">
            <h3>预约时段</h3>
            <p>
              {effectiveDateLabel} {bookingTime}
            </p>
          </div>
        )}

        <div className="student-seat-filter-section">
          <h3>座位属性</h3>
          <div className="student-seat-feature-list">
            {STUDENT_SEAT_FEATURES.map((feature) => (
              <button
                className={selectedFeatures.includes(feature) ? 'is-active' : ''}
                key={feature}
                onClick={() => toggleSelectedFeature(feature)}
                type="button"
              >
                {feature}
              </button>
            ))}
          </div>
        </div>

        <div className="student-seat-filter-actions">
          <button onClick={applySeatFilters} type="button">应用筛选</button>
          <button onClick={resetSeatFilters} type="button">重置条件</button>
        </div>
      </aside>

      <div className="student-seat-floor-panel">
        <header className="student-seat-floor-head">
          <div>
            <strong>{selectedRoom}</strong>
            <mark>{assistantSeatSelection ? '推荐座位' : roomContext.statusLabel}</mark>
          </div>
          <div className="student-seat-legend" aria-label="座位图例">
            {STUDENT_SEAT_LEGEND.map((item) => (
              <span key={item.status}>
                <i data-status={item.status} />
                {item.label}
              </span>
            ))}
          </div>
        </header>

        <div className="dashboard-card student-seat-map-card">
          <div className="student-seat-entry">入 口</div>
          <div className="student-seat-window-row">
            <i />
            靠窗排
          </div>

          <div className="student-seat-grid" aria-label={`${selectedRoom} 座位图`}>
            {STUDENT_SEAT_ROWS.map((row, rowIndex) => (
              <div className="student-seat-row-block" key={`row-${rowIndex}`}>
                {rowIndex === 3 ? (
                  <div className="student-seat-aisle">
                    <span>过道</span>
                  </div>
                ) : null}
                <div className="student-seat-row">
                  <span className="student-seat-row-label">
                    {String.fromCharCode(65 + rowIndex)}
                  </span>
                  <div className="student-seat-row-side">
                    {row.slice(0, 4).map((status, colIndex) => {
                      const seatNo = getStudentSeatNumber(rowIndex, colIndex);
                      const seatFeatures = getStudentSeatFeatures(rowIndex, colIndex, status);
                      const isFilteredOut =
                        isStudentSeatBookableStatus(status) &&
                        !doesStudentSeatMatchFeatures(seatFeatures, appliedFeatures);
                      const displayStatus =
                        seatNo === selectedSeat ? 'selected' : status === 'selected' ? 'available' : status;
                      return (
                        <StudentSeatCell
                          filteredOut={isFilteredOut}
                          hasPower={seatFeatures.includes('插座')}
                          key={seatNo}
                          onSelect={() => {
                            setSelectedSeat(seatNo);
                            setSeatNotice(`已选择 ${seatNo} 号座位。`);
                          }}
                          seatNo={seatNo}
                          status={displayStatus}
                        />
                      );
                    })}
                  </div>
                  <span className="student-seat-row-gap" />
                  <div className="student-seat-row-side">
                    {row.slice(4).map((status, colIndex) => {
                      const actualColIndex = colIndex + 4;
                      const seatNo = getStudentSeatNumber(rowIndex, actualColIndex);
                      const seatFeatures = getStudentSeatFeatures(rowIndex, actualColIndex, status);
                      const isFilteredOut =
                        isStudentSeatBookableStatus(status) &&
                        !doesStudentSeatMatchFeatures(seatFeatures, appliedFeatures);
                      const displayStatus =
                        seatNo === selectedSeat ? 'selected' : status === 'selected' ? 'available' : status;
                      return (
                        <StudentSeatCell
                          filteredOut={isFilteredOut}
                          hasPower={seatFeatures.includes('插座')}
                          key={seatNo}
                          onSelect={() => {
                            setSelectedSeat(seatNo);
                            setSeatNotice(`已选择 ${seatNo} 号座位。`);
                          }}
                          seatNo={seatNo}
                          status={displayStatus}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="student-seat-column-labels" aria-hidden="true">
            <span />
            {[1, 2, 3, 4, '', 5, 6, 7, 8].map((label, index) => (
              <span key={`${label}-${index}`}>{label}</span>
            ))}
          </div>
        </div>

        <div className="student-seat-map-notes">
          <span>A排、C排、E排设有插座</span>
          <span>
            {appliedFeatures.length > 0
              ? `筛选结果：${filteredBookableSeatCount} 个可选座位符合 ${appliedFeatures.join('、')}`
              : `共 ${roomContext.capacity} 个座位 · ${roomContext.available} 空余 · 开放 ${roomContext.hours}`}
          </span>
        </div>
      </div>

      <aside className="student-seat-booking-panel">
        <h2>预约信息</h2>

        {seatNotice ? (
          <div className="student-seat-assistant-notice" role="status" aria-live="polite">
            <DashboardIcon name="info" size={13} />
            {seatNotice}
          </div>
        ) : assistantSeatSelection ? (
          <div className="student-seat-assistant-notice">
            <DashboardIcon name="zap" size={13} />
            已带入智能助手推荐座位
          </div>
        ) : null}

        <div className="student-seat-selected-card">
          <small>已选座位</small>
          <strong>{selectedSeat}</strong>
          <span>
            {selectedRoom} · {selectedLocation}
          </span>
          <div>
            {selectedTags.map((tag) => (
              <mark key={tag}>{tag}</mark>
            ))}
          </div>
        </div>

        <dl className="student-seat-booking-summary">
          {bookingSummary.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="student-seat-rule-notice">
          <DashboardIcon name="alert" size={13} />
          <span>
            请在开始时间后 <strong>15 分钟内</strong>完成签到，否则预约将自动取消并记录违约。
          </span>
        </div>

        <button
          className="student-seat-primary-action"
          type="button"
          onClick={() =>
            onConfirm?.(
              createStudentSeatBookingDraft(
                roomContext,
                selectedSeat,
                selectedTags,
                bookingTime,
                effectiveDateLabel
              )
            )
          }
        >
          确认预约
        </button>
        <button
          className="student-seat-secondary-action"
          onClick={toggleFavoriteSeat}
          type="button"
        >
          {selectedSeatFavorited ? '取消收藏' : '收藏该座位'}
        </button>

        <section className="student-seat-slot-list">
          <h3>可用时段</h3>
          {STUDENT_SEAT_TIME_SLOTS.map((slot) => (
            <div data-status={slot.status} key={slot.time}>
              <span>{slot.time}</span>
              <mark>{slot.label}</mark>
            </div>
          ))}
        </section>
      </aside>
    </section>
  );
}

function StudentBookingSeatMap({
  draft,
  onChange
}: {
  draft: StudentSeatBookingDraft;
  onChange: (draft: StudentSeatBookingDraft) => void;
}) {
  return (
    <div className="student-booking-seat-map">
      <div className="student-seat-legend" aria-label="座位图例">
        {STUDENT_SEAT_LEGEND.map((item) => (
          <span key={item.status}>
            <i data-status={item.status} />
            {item.label}
          </span>
        ))}
      </div>

      <div className="student-booking-seat-map-board">
        <div className="student-seat-entry">入 口</div>
        <div className="student-seat-window-row">
          <i />
          靠窗排
        </div>

        <div className="student-seat-grid" aria-label={`${draft.room} 座位图`}>
          {STUDENT_SEAT_ROWS.map((row, rowIndex) => (
            <div className="student-seat-row-block" key={`booking-row-${rowIndex}`}>
              {rowIndex === 3 ? (
                <div className="student-seat-aisle">
                  <span>过道</span>
                </div>
              ) : null}
              <div className="student-seat-row">
                <span className="student-seat-row-label">
                  {String.fromCharCode(65 + rowIndex)}
                </span>
                <div className="student-seat-row-side">
                  {row.slice(0, 4).map((status, colIndex) => {
                    const seatNo = getStudentSeatNumber(rowIndex, colIndex);
                    const seatFeatures = getStudentSeatFeatures(rowIndex, colIndex, status);
                    const displayStatus =
                      seatNo === draft.seat ? 'selected' : status === 'selected' ? 'available' : status;
                    return (
                      <StudentSeatCell
                        hasPower={seatFeatures.includes('插座')}
                        key={seatNo}
                        onSelect={() =>
                          onChange(updateStudentSeatBookingDraftPosition(draft, seatNo, seatFeatures))
                        }
                        seatNo={seatNo}
                        status={displayStatus}
                      />
                    );
                  })}
                </div>
                <span className="student-seat-row-gap" />
                <div className="student-seat-row-side">
                  {row.slice(4).map((status, colIndex) => {
                    const actualColIndex = colIndex + 4;
                    const seatNo = getStudentSeatNumber(rowIndex, actualColIndex);
                    const seatFeatures = getStudentSeatFeatures(rowIndex, actualColIndex, status);
                    const displayStatus =
                      seatNo === draft.seat ? 'selected' : status === 'selected' ? 'available' : status;
                    return (
                      <StudentSeatCell
                        hasPower={seatFeatures.includes('插座')}
                        key={seatNo}
                        onSelect={() =>
                          onChange(updateStudentSeatBookingDraftPosition(draft, seatNo, seatFeatures))
                        }
                        seatNo={seatNo}
                        status={displayStatus}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="student-seat-column-labels" aria-hidden="true">
          <span />
          {[1, 2, 3, 4, '', 5, 6, 7, 8].map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudentBookingTimeEditor({
  draft,
  onChange
}: {
  draft: StudentSeatBookingDraft;
  onChange: (draft: StudentSeatBookingDraft) => void;
}) {
  const bookingTimeNow = useMemo(() => new Date(), []);
  const selectedDate = normalizeStudentBookingDateOption(draft.dateLabel, bookingTimeNow);
  const [startTime, endTime] = parseStudentAssistantTimeRange(draft.time);
  const startClockParts = splitStudentClock(startTime);
  const endClockParts = splitStudentClock(endTime);
  const startMinuteOptions = getStudentRoomBookableStartMinutes(
    selectedDate,
    startClockParts.hour,
    bookingTimeNow
  );
  const endMinuteOptions = getStudentRoomBookableEndMinutes(startTime, endClockParts.hour);

  const updateTime = (
    nextDate: StudentRoomDateOption,
    nextStartTime: string,
    nextEndTime: string
  ) => {
    const normalizedEndTime = normalizeStudentRoomEndTime(nextStartTime, nextEndTime);
    onChange(updateStudentSeatBookingDraftTime(draft, nextDate, nextStartTime, normalizedEndTime));
  };

  const handleSelectedDateChange = (value: StudentRoomDateOption) => {
    const nextTimeState = createStudentRoomSearchTimeState(
      value,
      bookingTimeNow,
      startTime,
      endTime
    );
    onChange(
      updateStudentSeatBookingDraftTime(
        draft,
        nextTimeState.selectedDate,
        nextTimeState.startTime,
        nextTimeState.endTime
      )
    );
  };

  const handleStartHourChange = (hour: string) => {
    const minuteOptions = getStudentRoomBookableStartMinutes(selectedDate, hour, bookingTimeNow);
    if (minuteOptions.length === 0) return;
    const nextStartTime = createStudentClock(
      hour,
      (minuteOptions as readonly string[]).includes(startClockParts.minute)
        ? startClockParts.minute
        : minuteOptions[0]
    );
    updateTime(selectedDate, nextStartTime, endTime);
  };

  const handleStartMinuteChange = (minute: string) => {
    const nextStartTime = createStudentClock(startClockParts.hour, minute);
    if (!isStudentRoomStartClockBookable(selectedDate, nextStartTime, bookingTimeNow)) return;
    updateTime(selectedDate, nextStartTime, endTime);
  };

  const handleEndHourChange = (hour: string) => {
    const minuteOptions = getStudentRoomBookableEndMinutes(startTime, hour);
    if (minuteOptions.length === 0) return;
    const nextEndTime = createStudentClock(
      hour,
      (minuteOptions as readonly string[]).includes(endClockParts.minute)
        ? endClockParts.minute
        : minuteOptions[0]
    );
    updateTime(selectedDate, startTime, nextEndTime);
  };

  const handleEndMinuteChange = (minute: string) => {
    const nextEndTime = createStudentClock(endClockParts.hour, minute);
    if (!isStudentRoomEndClockBookable(startTime, nextEndTime)) return;
    updateTime(selectedDate, startTime, nextEndTime);
  };

  return (
    <>
      <div className="student-booking-detail-control">
        <dt>预约日期</dt>
        <dd>
          <select
            className="student-booking-detail-select"
            aria-label="预约日期"
            onChange={(event) => handleSelectedDateChange(event.target.value as StudentRoomDateOption)}
            value={selectedDate}
          >
            {STUDENT_ROOM_DATE_OPTIONS.map((date) => (
              <option
                disabled={getStudentRoomBookableStartTimes(date, bookingTimeNow).length === 0}
                key={date}
                value={date}
              >
                {date}
              </option>
            ))}
          </select>
        </dd>
      </div>
      <div className="student-booking-detail-control is-time">
        <dt>预约时间</dt>
        <dd>
          <div className="student-booking-time-editor">
            <fieldset className="student-room-time-field" aria-label="预约开始时间">
              <legend>开始</legend>
              <div className="student-room-time-picker">
                <StudentTimeDropdown
                  ariaLabel="预约开始时间小时"
                  onChange={handleStartHourChange}
                  options={STUDENT_ROOM_START_HOUR_OPTIONS.map((hour) => ({
                    value: hour,
                    disabled:
                      getStudentRoomBookableStartMinutes(selectedDate, hour, bookingTimeNow)
                        .length === 0
                  }))}
                  unit="时"
                  value={startClockParts.hour}
                />
                <StudentTimeDropdown
                  ariaLabel="预约开始时间分钟"
                  onChange={handleStartMinuteChange}
                  options={startMinuteOptions.map((minute) => ({ value: minute }))}
                  unit="分"
                  value={startClockParts.minute}
                />
              </div>
            </fieldset>
            <fieldset className="student-room-time-field" aria-label="预约结束时间">
              <legend>结束</legend>
              <div className="student-room-time-picker">
                <StudentTimeDropdown
                  ariaLabel="预约结束时间小时"
                  onChange={handleEndHourChange}
                  options={STUDENT_ROOM_END_HOUR_OPTIONS.map((hour) => ({
                    value: hour,
                    disabled: getStudentRoomBookableEndMinutes(startTime, hour).length === 0
                  }))}
                  unit="时"
                  value={endClockParts.hour}
                />
                <StudentTimeDropdown
                  ariaLabel="预约结束时间分钟"
                  onChange={handleEndMinuteChange}
                  options={endMinuteOptions.map((minute) => ({ value: minute }))}
                  unit="分"
                  value={endClockParts.minute}
                />
              </div>
            </fieldset>
          </div>
          <small className="student-booking-time-current">{draft.time}</small>
        </dd>
      </div>
    </>
  );
}

export function StudentBookingConfirmPanel({
  accessToken,
  assistantSeatSelection,
  onBack,
  onSessionExpired,
  onSessionRefresh,
  onSubmitResult,
  onSubmitted,
  seatBookingDraft
}: {
  accessToken?: string;
  assistantSeatSelection?: StudentAssistantSeatCandidate;
  onBack?: () => void;
  onSessionExpired?: () => void;
  onSessionRefresh?: (session: SessionView) => void;
  onSubmitResult?: (result: StudentBookingSubmitResult) => void;
  onSubmitted?: (booking: StudentBookingRecord) => void;
  seatBookingDraft?: StudentSeatBookingDraft;
}) {
  const initialSeatBookingDraft = useMemo(
    () =>
      assistantSeatSelection
        ? createStudentSeatBookingDraftFromAssistantSeat(assistantSeatSelection)
        : seatBookingDraft ??
      createStudentSeatBookingDraft(DEFAULT_STUDENT_SEAT_ROOM_CONTEXT, 'C3', ['插座', '安静区']),
    [assistantSeatSelection, seatBookingDraft]
  );
  const [selectedDraft, setSelectedDraft] = useState<StudentSeatBookingDraft>(initialSeatBookingDraft);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [selectedReminder, setSelectedReminder] =
    useState<(typeof STUDENT_REMINDER_OPTIONS)[number]>('微信服务通知');
  const effectiveSeatBookingDraft = selectedDraft;
  const bookingDetails = createStudentBookingConfirmDetails(undefined, effectiveSeatBookingDraft);
  const submitUiState = getStudentBookingConfirmUiState({ submitted, submitting });

  useEffect(() => {
    setSelectedDraft(initialSeatBookingDraft);
  }, [initialSeatBookingDraft]);

  const handleSubmit = () => {
    if (submitting || submitted) return;
    if (!accessToken) {
      if (onSubmitResult) {
        onSubmitResult({ type: 'error', message: '预约失败：请先登录后提交预约' });
        return;
      }
      setSubmitError('请先登录后提交预约');
      setSubmitMessage('');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitMessage('');
    const bookingRequest = buildStudentBookingRequest(
      assistantSeatSelection,
      new Date(),
      effectiveSeatBookingDraft
    );
    requestStudentBookingCreate(
      accessToken,
      bookingRequest,
      fetch,
      resolveApiBaseUrl(),
      { onSessionExpired, onSessionRefresh }
    )
      .then((booking) => {
        const displayBooking = mergeStudentBookingRecordWithDraft(
          booking,
          effectiveSeatBookingDraft,
          bookingRequest
        );
        const message = `预约成功：${displayBooking.room} · ${displayBooking.seat} · ${displayBooking.time}`;
        onSubmitted?.(displayBooking);
        if (onSubmitResult) {
          onSubmitResult({ type: 'success', message, booking: displayBooking });
          return;
        }
        setSubmitted(true);
        setSubmitMessage(message);
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : '预约提交失败';
        if (onSubmitResult) {
          onSubmitResult({ type: 'error', message: `预约失败：${errorMessage}` });
          return;
        }
        setSubmitted(false);
        setSubmitError(errorMessage);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <section className="student-booking-confirm-panel" aria-label="学生确认预约">
      <div className="student-booking-confirm-inner">
        {(submitMessage || submitError) && (
          <div className={`student-booking-submit-message${submitError ? ' is-error' : ''}`}>
            <DashboardIcon name={submitError ? 'alert' : 'check-circle'} size={14} />
            {submitError || submitMessage}
          </div>
        )}

        <article className="dashboard-card student-booking-confirm-card">
          <header>
            <DashboardIcon name="calendar" size={16} />
            <h2>预约详情</h2>
          </header>
          {assistantSeatSelection ? (
            <div className="student-seat-assistant-notice">
              <DashboardIcon name="zap" size={13} />
              已带入智能助手推荐座位
            </div>
          ) : null}
          <dl className="student-booking-detail-grid">
            {bookingDetails
              .filter(([label]) => label !== '预约日期' && label !== '预约时间')
              .map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            <StudentBookingTimeEditor draft={selectedDraft} onChange={setSelectedDraft} />
          </dl>
        </article>

        <article className="dashboard-card student-booking-position-card">
          <header>
            <DashboardIcon name="grid" size={16} />
            <h2>位置选择</h2>
          </header>
          <StudentBookingSeatMap draft={selectedDraft} onChange={setSelectedDraft} />
          <p>选择靠窗、插座或安静区座位后，预约详情和提交信息会同步更新。</p>
        </article>

        <article className="dashboard-card student-booking-confirm-card">
          <header>
            <DashboardIcon name="shield" size={16} />
            <h2>使用规则与违约须知</h2>
          </header>
          <div className="student-booking-rule-list">
            {STUDENT_BOOKING_RULES.map(([title, description]) => (
              <section key={title}>
                <i />
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </section>
            ))}
          </div>
        </article>

        <article className="dashboard-card student-booking-reminder-card">
          <h2>提醒方式</h2>
          <div>
            {STUDENT_REMINDER_OPTIONS.map((option) => (
              <button
                className={option === selectedReminder ? 'is-active' : ''}
                key={option}
                onClick={() => setSelectedReminder(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </article>

        <div className="student-booking-confirm-actions">
          <button type="button" onClick={onBack}>
            返回修改
          </button>
          <button disabled={submitUiState.primaryDisabled} onClick={handleSubmit} type="button">
            {submitUiState.primaryLabel}
          </button>
        </div>
      </div>
    </section>
  );
}

function StudentBookingConfirmDialog({
  accessToken,
  assistantSeatSelection,
  onClose,
  onSessionExpired,
  onSessionRefresh,
  onSubmitResult,
  onSubmitted,
  seatBookingDraft
}: {
  accessToken?: string;
  assistantSeatSelection?: StudentAssistantSeatCandidate;
  onClose: () => void;
  onSessionExpired?: () => void;
  onSessionRefresh?: (session: SessionView) => void;
  onSubmitResult?: (result: StudentBookingSubmitResult) => void;
  onSubmitted?: (booking: StudentBookingRecord) => void;
  seatBookingDraft?: StudentSeatBookingDraft;
}) {
  return (
    <div className="student-booking-confirm-layer" role="presentation">
      <button
        aria-label="关闭预约确认"
        className="student-dialog-backdrop"
        onClick={onClose}
        type="button"
      />
      <section
        aria-label="确认预约弹窗"
        aria-modal="true"
        className="student-booking-confirm-dialog dashboard-card"
        role="dialog"
      >
        <header className="student-booking-confirm-dialog-head">
          <div>
            <h2>确认预约</h2>
            <p>核对自习室、座位和预约时间段后提交。</p>
          </div>
          <button onClick={onClose} type="button">
            关闭
          </button>
        </header>
        <StudentBookingConfirmPanel
          accessToken={accessToken}
          assistantSeatSelection={assistantSeatSelection}
          onBack={onClose}
          onSessionExpired={onSessionExpired}
          onSessionRefresh={onSessionRefresh}
          onSubmitResult={onSubmitResult}
          onSubmitted={onSubmitted}
          seatBookingDraft={seatBookingDraft}
        />
      </section>
    </div>
  );
}

function StudentBookingsPanel({
  accessToken,
  assistantBookingAction,
  onBookingCancelled,
  onCheckIn,
  onRepeatBooking,
  onSessionExpired,
  onSessionRefresh,
  onSummaryChange
}: {
  accessToken?: string;
  assistantBookingAction?: StudentAssistantBookingActionContext;
  onBookingCancelled?: (booking: StudentBookingRecord, nextSummary?: StudentBookingSummaryView) => void;
  onCheckIn?: () => void;
  onRepeatBooking?: (booking: StudentBookingRecordView) => void;
  onSessionExpired?: () => void;
  onSessionRefresh?: (session: SessionView) => void;
  onSummaryChange?: (summary: StudentBookingSummaryView) => void;
}) {
  const [summary, setSummary] = useState<StudentBookingSummaryView>(() =>
    createEmptyStudentBookingSummary()
  );
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionNotice, setActionNotice] = useState('');
  const [cancellingBookingId, setCancellingBookingId] = useState('');
  const [activeFilter, setActiveFilter] =
    useState<(typeof STUDENT_BOOKING_FILTERS)[number]>('全部');

  useEffect(() => {
    setActionNotice(
      assistantBookingAction ? formatStudentAssistantBookingActionNotice(assistantBookingAction) : ''
    );
  }, [assistantBookingAction]);

  useEffect(() => {
    let alive = true;
    if (!accessToken) {
      const emptySummary = createEmptyStudentBookingSummary();
      setSummary(emptySummary);
      onSummaryChange?.(emptySummary);
      setLoading(false);
      setLoadError('');
      return () => {
        alive = false;
      };
    }

    setLoading(true);
    setSummary(createEmptyStudentBookingSummary());
    setLoadError('');
    requestStudentBookings(accessToken, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
    })
      .then((nextSummary) => {
        if (!alive) return;
        const nextSummaryView = mapStudentBookingSummaryToView(nextSummary);
        setSummary(nextSummaryView);
        onSummaryChange?.(nextSummaryView);
        setLoadError('');
      })
      .catch((error) => {
        if (!alive) return;
        const emptySummary = createEmptyStudentBookingSummary();
        setSummary(emptySummary);
        onSummaryChange?.(emptySummary);
        setLoadError(error instanceof Error ? error.message : '我的预约加载失败');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [accessToken, onSessionExpired, onSessionRefresh, onSummaryChange]);

  const filteredRecords = summary.records.filter((booking) => {
    if (activeFilter === '待签到') return booking.status === 'upcoming';
    if (activeFilter === '使用中') return booking.status === 'using';
    if (activeFilter === '已完成') return booking.status === 'completed';
    if (activeFilter === '已取消') return booking.status === 'cancelled';
    if (activeFilter === '违约') return booking.status === 'violation';
    return true;
  });

  return (
    <section className="student-bookings-panel" aria-label="学生我的预约">
      {(loading || loadError || actionNotice) && (
        <div className={`student-booking-message${loadError ? ' is-error' : ''}`}>
          <DashboardIcon name={loadError ? 'alert' : loading ? 'refresh' : 'info'} size={14} />
          {loadError || actionNotice || '正在加载我的预约…'}
        </div>
      )}

      <div className="student-booking-filter-tabs">
        {STUDENT_BOOKING_FILTERS.map((filter) => (
          <button
            className={filter === activeFilter ? 'is-active' : ''}
            key={filter}
            onClick={() => {
              setActiveFilter(filter);
              setActionNotice(filter === '全部' ? '' : `已筛选：${filter}`);
            }}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="student-booking-timeline">
        {filteredRecords.map((booking) => {
          const isFocused = booking.id === assistantBookingAction?.booking.bookingId;

          return (
            <article
              className={`student-booking-timeline-item${isFocused ? ' is-focused' : ''}`}
              key={booking.id}
            >
              <span className="student-booking-dot" data-status={booking.status}>
                <DashboardIcon name={booking.statusIcon} size={16} />
              </span>

              <div className="dashboard-card student-booking-card">
                <div className="student-booking-card-main">
                  <div>
                    <header>
                      <strong>{booking.seat}</strong>
                      <h2>{booking.room}</h2>
                      <mark data-variant={booking.statusVariant}>{booking.statusLabel}</mark>
                    </header>

                    <p>
                      <span>
                        <DashboardIcon name="pin" size={10} />
                        {booking.location}
                      </span>
                      <span>
                        <DashboardIcon name="clock" size={10} />
                        {booking.time}
                      </span>
                    </p>

                    {booking.tags.length > 0 ? (
                      <div className="student-booking-tags">
                        {booking.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="student-booking-card-actions">
                    {booking.status === 'upcoming' ? (
                      <>
                        {booking.canCheckIn ? (
                          <button className="is-primary" onClick={onCheckIn} type="button">
                            立即签到
                          </button>
                        ) : null}
                        {booking.canCancel ? (
                          <button
                            disabled={cancellingBookingId === booking.id}
                            onClick={() => {
                              if (!accessToken) {
                                setActionNotice('请先登录后取消预约');
                                return;
                              }
                              setCancellingBookingId(booking.id);
                              requestStudentBookingCancel(
                                accessToken,
                                booking.id,
                                fetch,
                                resolveApiBaseUrl(),
                                { onSessionExpired, onSessionRefresh }
                              )
                                .then((cancelled) => {
                                  const [cancelledView] = mapStudentBookingSummaryToView({
                                    totalCount: 1,
                                    activeCount: 0,
                                    completedCount: 0,
                                    records: [cancelled]
                                  }).records;
                                  const nextSummary = {
                                    ...summary,
                                    activeCount: Math.max(0, summary.activeCount - 1),
                                    records: summary.records.map((record) =>
                                      record.id === booking.id ? cancelledView : record
                                    )
                                  };
                                  setSummary(nextSummary);
                                  onBookingCancelled?.(cancelled, nextSummary);
                                  setActionNotice(
                                    `已取消预约：${cancelled.room} · ${cancelled.seat} · ${cancelled.time}`
                                  );
                                })
                                .catch((error) =>
                                  setActionNotice(error instanceof Error ? error.message : '取消预约失败')
                                )
                                .finally(() => setCancellingBookingId(''));
                            }}
                            type="button"
                          >
                            {cancellingBookingId === booking.id ? '取消中' : '取消'}
                          </button>
                        ) : null}
                      </>
                    ) : null}
                    {booking.status === 'completed' ? (
                      <button onClick={() => onRepeatBooking?.(booking)} type="button">再次预约</button>
                    ) : null}
                    {booking.status === 'violation' ? (
                      <button
                        onClick={() =>
                          setActionNotice(
                            `违约原因：${booking.room} · ${booking.seat} 未在规则时间内完成签到或取消。`
                          )
                        }
                        type="button"
                      >
                        <DashboardIcon name="info" size={12} />
                        查看原因
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {!loading && filteredRecords.length === 0 && (
        <div className="student-booking-empty">
          {summary.records.length === 0 ? '暂无预约记录，完成选座后会在这里展示。' : '当前筛选条件下暂无预约记录。'}
        </div>
      )}
    </section>
  );
}

function StudentCheckInPanel({
  accessToken,
  actionNotice = '',
  onActionNotice,
  onSessionExpired,
  onSessionRefresh
}: {
  accessToken?: string;
  actionNotice?: string;
  onActionNotice?: (message: string) => void;
  onSessionExpired?: () => void;
  onSessionRefresh?: (session: SessionView) => void;
}) {
  const [session, setSession] = useState<StudentCheckInSession | null>(() =>
    accessToken ? null : STUDENT_CHECKIN_FALLBACK_SESSION
  );
  const [digits, setDigits] = useState<string[]>(() =>
    accessToken ? createStudentCheckInDigits() : [...STUDENT_CHECKIN_DIGITS]
  );
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [displayRemainingSeconds, setDisplayRemainingSeconds] = useState(() =>
    accessToken ? 0 : STUDENT_CHECKIN_FALLBACK_SESSION.remainingSeconds
  );
  const [countdownTotalSeconds, setCountdownTotalSeconds] = useState(() =>
    accessToken ? 1 : STUDENT_CHECKIN_FALLBACK_SESSION.remainingSeconds
  );

  useEffect(() => {
    let alive = true;
    if (!accessToken) {
      setSession(STUDENT_CHECKIN_FALLBACK_SESSION);
      setDigits([...STUDENT_CHECKIN_DIGITS]);
      setDisplayRemainingSeconds(STUDENT_CHECKIN_FALLBACK_SESSION.remainingSeconds);
      setCountdownTotalSeconds(STUDENT_CHECKIN_FALLBACK_SESSION.remainingSeconds);
      setLoading(false);
      setLoadError('');
      setSubmitMessage('');
      setSubmitting(false);
      return () => {
        alive = false;
      };
    }

    setLoading(true);
    setLoadError('');
    setSubmitMessage('');
    requestStudentCheckInSession(accessToken, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
    })
      .then((nextSession) => {
        if (!alive) return;
        setSession(nextSession);
        setDigits(createStudentCheckInDigits(nextSession?.codeLength));
        setDisplayRemainingSeconds(nextSession?.remainingSeconds ?? 0);
        setCountdownTotalSeconds(Math.max(1, nextSession?.remainingSeconds ?? 1));
      })
      .catch((error) => {
        if (!alive) return;
        setSession(null);
        setDigits(createStudentCheckInDigits());
        setDisplayRemainingSeconds(0);
        setCountdownTotalSeconds(1);
        setLoadError(error instanceof Error ? error.message : '签到信息加载失败');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [accessToken, onSessionExpired, onSessionRefresh]);

  useEffect(() => {
    if (!session || submitMessage.includes('已签到')) return;
    const timer = window.setInterval(() => {
      setDisplayRemainingSeconds(tickStudentCheckInRemaining);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [session, submitMessage]);

  const codeLength = session?.codeLength ?? STUDENT_CHECKIN_CODE_LENGTH;
  const visibleDigits = Array.from({ length: codeLength }, (_, index) => digits[index] ?? '');
  const activeDigitIndex = visibleDigits.findIndex((digit) => digit === '');
  const enteredCode = visibleDigits.join('');
  const submitted = submitMessage.includes('已签到');
  const timerUiState = getStudentCheckInTimerUiState({
    remainingSeconds: displayRemainingSeconds,
    submitted
  });
  const timerDashOffset = calculateStudentCheckInTimerDashOffset(
    submitted ? 0 : displayRemainingSeconds,
    countdownTotalSeconds
  );
  const checkInExpired = Boolean(session) && displayRemainingSeconds <= 0 && !submitted;
  const canSubmit =
    !visibleDigits.includes('') &&
    canSubmitStudentCheckIn({
      accessToken,
      hasSession: Boolean(session),
      enteredCode,
      codeLength,
      loading,
      submitting,
      submitted,
      remainingSeconds: displayRemainingSeconds
    });

  const handleKeyPress = (key: (typeof STUDENT_CHECKIN_KEYPAD)[number]) => {
    if (key === '' || submitting || submitMessage.includes('已签到')) return;
    onActionNotice?.('');
    setSubmitMessage('');
    setDigits((current) => {
      const next = Array.from({ length: codeLength }, (_, index) => current[index] ?? '');
      if (key === '⌫') {
        const lastFilledIndex = next.map(Boolean).lastIndexOf(true);
        if (lastFilledIndex >= 0) next[lastFilledIndex] = '';
        return next;
      }

      const emptyIndex = next.findIndex((digit) => digit === '');
      if (emptyIndex >= 0) next[emptyIndex] = String(key);
      return next;
    });
  };

  const handleSubmit = () => {
    if (!accessToken || !session || !canSubmit) return;
    onActionNotice?.('');
    setSubmitting(true);
    setLoadError('');
    requestStudentCheckInCode(accessToken, enteredCode, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
    })
      .then((result) => {
        setSubmitMessage(`${result.room} · ${result.seat} 已签到`);
      })
      .catch((error) => {
        setSubmitMessage('');
        setLoadError(error instanceof Error ? error.message : '签到失败，请核对动态码');
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <section className="student-checkin-panel" aria-label="学生签到">
      <div className="student-checkin-card">
        {(loading || loadError || submitMessage || checkInExpired || actionNotice) && (
          <div
            className={`student-checkin-message${
              loadError || checkInExpired ? ' is-error' : submitMessage ? ' is-success' : ''
            }`}
          >
            <DashboardIcon
              name={
                loadError || checkInExpired ? 'alert' : submitMessage ? 'check-circle' : 'refresh'
              }
              size={14}
            />
            {loadError ||
              submitMessage ||
              (checkInExpired ? '签到时间已结束' : actionNotice || '正在加载签到信息…')}
          </div>
        )}

        <div className="student-checkin-timer" aria-label={timerUiState.ariaLabel}>
          <svg aria-hidden="true" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="62" />
            <circle
              cx="70"
              cy="70"
              r="62"
              style={{
                strokeDasharray: STUDENT_CHECKIN_TIMER_CIRCUMFERENCE,
                strokeDashoffset: timerDashOffset
              }}
            />
          </svg>
          <div>
            <strong>{timerUiState.label}</strong>
            <span>{timerUiState.caption}</span>
          </div>
        </div>

        <h2>
          {session
            ? `${session.room} · ${session.seat} 座 · ${formatStudentCheckInDisplayTime(session.time)}`
            : '当前暂无可签到预约'}
        </h2>
        <p>{session ? '请查看教室屏幕上的 6 位动态码' : '可签到预约会在开始前 15 分钟出现'}</p>

        <div
          className="student-checkin-code"
          aria-label={`当前已输入 ${visibleDigits.filter(Boolean).join('')}`}
        >
          {visibleDigits.map((digit, index) => (
            <Fragment key={`${index}-${digit || 'empty'}`}>
              {index === 3 ? <span className="student-checkin-code-break" /> : null}
              <span className={index === activeDigitIndex ? 'is-active' : digit ? 'is-filled' : ''}>
                {digit}
              </span>
            </Fragment>
          ))}
        </div>

        <div className="student-checkin-keypad" aria-label="数字键盘">
          {STUDENT_CHECKIN_KEYPAD.map((key, index) => (
            <button
              className={key === '' ? 'is-placeholder' : undefined}
              disabled={key === '' || !session || loading}
              key={`${key}-${index}`}
              onClick={() => handleKeyPress(key)}
              type="button"
            >
              {key}
            </button>
          ))}
        </div>

        <button
          className="student-checkin-submit"
          disabled={!canSubmit}
          onClick={handleSubmit}
          type="button"
        >
          {submitting ? '签 到 中' : '确 认 签 到'}
        </button>

        <div className="student-checkin-help">
          无法输入？
          <button
            onClick={() => onActionNotice?.('扫码签到请使用移动端扫描教室二维码')}
            type="button"
          >
            扫描教室二维码
          </button>{' '}
          或{' '}
          <button
            onClick={() => onActionNotice?.('请联系教室值班管理员处理签到异常')}
            type="button"
          >
            联系管理员
          </button>
        </div>
      </div>
    </section>
  );
}

function StudentAssistantPanel({
  accessToken,
  onBookingCancelled,
  onBookingAction,
  onBookings,
  onCheckIn,
  onConfirmSeat,
  onSessionExpired,
  onSessionRefresh,
  onSelect,
  onSelectSeat,
  resetKey = 0
}: {
  accessToken?: string;
  onBookingCancelled?: (booking: StudentBookingRecord) => void;
  onBookingAction?: (
    booking: StudentAssistantBookingCandidate,
    action: Exclude<StudentAssistantAction, 'BOOK'>
  ) => void;
  onBookings?: () => void;
  onCheckIn?: () => void;
  onConfirmSeat?: (seat?: StudentAssistantSeatCandidate) => void;
  onSessionExpired?: () => void;
  onSessionRefresh?: (session: SessionView) => void;
  onSelect?: () => void;
  onSelectSeat?: (seat?: StudentAssistantSeatCandidate) => void;
  resetKey?: number;
}) {
  const [messages, setMessages] = useState<StudentAssistantMessageView[]>(() =>
    createStudentAssistantInitialMessages()
  );
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMessages(createStudentAssistantInitialMessages());
    setDraft('');
    setError('');
  }, [resetKey]);

  const sendMessage = (message = draft) => {
    const trimmed = message.trim();
    if (!trimmed || submitting) return;
    if (!accessToken) {
      setError('请先登录后使用智能助手');
      return;
    }

    setError('');
    setDraft('');
    setSubmitting(true);
    setMessages((current) => [
      ...current,
      {
        id: createStudentAssistantMessageId('user'),
        role: 'user',
        text: trimmed
      }
    ]);

    requestStudentAssistantMessage(accessToken, trimmed, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
    })
      .then((reply) => {
        setMessages((current) => [...current, toStudentAssistantMessage(reply)]);
      })
      .catch((requestError) => {
        setMessages((current) => [
          ...current,
          {
            id: createStudentAssistantMessageId('assistant'),
            role: 'assistant',
            text: requestError instanceof Error ? requestError.message : '智能助手暂时不可用',
            suggestions: STUDENT_ASSISTANT_SHORTCUTS.slice(0, 3)
          }
        ]);
      })
      .finally(() => setSubmitting(false));
  };

  const handleAssistantAction = (
    action: StudentAssistantAction,
    booking?: StudentAssistantBookingCandidate,
    seat?: StudentAssistantSeatCandidate
  ) => {
    if (action === 'BOOK') {
      if (onConfirmSeat) {
        onConfirmSeat(seat);
      } else if (onSelectSeat) {
        onSelectSeat(seat);
      } else {
        onSelect?.();
      }
      return;
    }
    if (action === 'CANCEL' && booking && accessToken) {
      setError('');
      setSubmitting(true);
      requestStudentBookingCancel(
        accessToken,
        booking.bookingId,
        fetch,
        resolveApiBaseUrl(),
        { onSessionExpired, onSessionRefresh }
      )
        .then((cancelled) => {
          onBookingCancelled?.(cancelled);
          setMessages((current) => {
            const updatedMessages = current.map((message) => ({
              ...message,
              bookings: message.bookings?.map((item) =>
                item.bookingId === booking.bookingId
                  ? { ...item, status: 'cancelled' as const, actions: ['DETAIL' as const] }
                  : item
              )
            }));
            return [
              ...updatedMessages,
              {
                id: createStudentAssistantMessageId('assistant'),
                role: 'assistant',
                text: `已取消 ${cancelled.room} · ${cancelled.seat} 的预约（${cancelled.time}）。`,
                suggestions: ['查看我的预约', '重新找座']
              }
            ];
          });
        })
        .catch((requestError) => {
          setMessages((current) => [
            ...current,
            {
              id: createStudentAssistantMessageId('assistant'),
              role: 'assistant',
              text: requestError instanceof Error ? requestError.message : '取消预约失败',
              suggestions: ['查看我的预约']
            }
          ]);
        })
        .finally(() => setSubmitting(false));
      return;
    }
    if (booking) {
      onBookingAction?.(booking, action);
      return;
    }
    if (action === 'CHECK_IN') {
      onCheckIn?.();
      return;
    }
    onBookings?.();
  };

  const handleSuggestionClick = (suggestion: string) => {
    const action = resolveStudentAssistantSuggestionAction(suggestion);
    if (action === 'select') {
      onSelect?.();
      return;
    }
    if (action === 'checkin') {
      onCheckIn?.();
      return;
    }
    if (action === 'bookings') {
      onBookings?.();
      return;
    }
    sendMessage(suggestion);
  };

  return (
    <section className="student-assistant-panel" aria-label="学生智能助手">
      <div className="student-assistant-chat dashboard-card">
        <div className="student-assistant-messages" aria-label="助手会话">
          {messages.map((message) =>
            message.role === 'user' ? (
              <article className="student-assistant-message is-user" key={message.id}>
                <div>{message.text}</div>
              </article>
            ) : (
              <article className="student-assistant-message is-assistant" key={message.id}>
                <span className="student-assistant-avatar">
                  <DashboardIcon name="zap" size={15} />
                </span>
                <div className="student-assistant-bubble">
                  <p>{message.text}</p>
                  {message.seats && message.seats.length > 0 ? (
                    <div className="student-assistant-result-list">
                      {message.seats.map((seat) => (
                        <section className="student-assistant-result-card" key={seat.seatId}>
                          <div>
                            <h2>
                              {seat.room} · {seat.seat}
                            </h2>
                            <div className="student-assistant-tags">
                              {seat.tags.map((tag) => (
                                <span key={tag}>{tag}</span>
                              ))}
                            </div>
                            <small>
                              {seat.location} · {seat.time}
                            </small>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (onConfirmSeat) {
                                onConfirmSeat(seat);
                                return;
                              }
                              onSelectSeat?.(seat);
                            }}
                          >
                            立即预约
                          </button>
                        </section>
                      ))}
                    </div>
                  ) : null}
                  {message.bookings && message.bookings.length > 0 ? (
                    <div className="student-assistant-result-list">
                      {message.bookings.map((booking) => (
                        <section
                          className="student-assistant-result-card"
                          key={booking.bookingId}
                        >
                          <div>
                            <h2>
                              {booking.room} · {booking.seat}
                            </h2>
                            <div className="student-assistant-tags">
                              <span>{getStudentBookingStatusLabel(booking.status)}</span>
                            </div>
                            <small>
                              {booking.location} · {booking.time}
                            </small>
                          </div>
                          <div className="student-assistant-card-actions">
                            {booking.actions.map((action) => (
                              <button
                                key={action}
                                onClick={() => handleAssistantAction(action, booking)}
                                type="button"
                              >
                                {STUDENT_ASSISTANT_ACTION_LABELS[action]}
                              </button>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  ) : null}
                  {message.suggestions && message.suggestions.length > 0 ? (
                    <div className="student-assistant-suggestions">
                      {message.suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          type="button"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {message.quickActions && message.quickActions.length > 0 ? (
                    <div className="student-assistant-confirm-actions">
                      {message.quickActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => {
                            handleAssistantAction(action.action, action.booking, action.seat);
                          }}
                          type="button"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            )
          )}
          {submitting ? (
            <article className="student-assistant-message is-assistant">
              <span className="student-assistant-avatar">
                <DashboardIcon name="zap" size={15} />
              </span>
              <div className="student-assistant-bubble">
                <p>正在查询…</p>
              </div>
            </article>
          ) : null}
        </div>

        <div className="student-assistant-shortcuts" aria-label="快捷问题">
          {STUDENT_ASSISTANT_SHORTCUTS.map((shortcut) => (
            <button key={shortcut} onClick={() => handleSuggestionClick(shortcut)} type="button">
              {shortcut}
            </button>
          ))}
        </div>

        {error ? <div className="student-assistant-error">{error}</div> : null}

        <div className="student-assistant-composer">
          <input
            aria-label="输入助手问题"
            disabled={submitting}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') sendMessage();
            }}
            placeholder="输入问题，例如“明天上午有没有靠窗且安静的座位”…"
            value={draft}
          />
          <button
            aria-label="语音输入"
            onClick={() => setError('语音输入暂未开放，请先使用文字输入')}
            type="button"
          >
            <DashboardIcon name="mic" size={15} />
          </button>
          <button
            aria-label="发送问题"
            disabled={!draft.trim() || submitting}
            onClick={() => sendMessage()}
            type="button"
          >
            <DashboardIcon name="send" size={15} />
          </button>
        </div>
      </div>

      <aside className="student-assistant-side">
        <section className="dashboard-card student-assistant-side-card">
          <header>
            <h2>最近对话</h2>
            <button
              onClick={() => {
                setMessages(createStudentAssistantInitialMessages());
                setDraft('');
                setError('');
              }}
              type="button"
            >
              清空
            </button>
          </header>
          {STUDENT_ASSISTANT_HISTORY.map((item) => (
            <button key={item} onClick={() => sendMessage(item)} type="button">
              {item}
              <DashboardIcon name="arrow-right" size={11} />
            </button>
          ))}
        </section>

        <section className="dashboard-card student-assistant-side-card">
          <header>
            <h2>能力示例</h2>
          </header>
          {STUDENT_ASSISTANT_CAPABILITIES.map(([title, desc]) => (
            <div className="student-assistant-capability" key={title}>
              <strong>{title}</strong>
              <small>{desc}</small>
            </div>
          ))}
        </section>
      </aside>
    </section>
  );
}

function StudentNotificationPanel({
  accessToken,
  onSessionExpired,
  onSessionRefresh,
  onSummaryChange,
  summarySnapshot
}: {
  accessToken?: string;
  onSessionExpired?: () => void;
  onSessionRefresh?: (session: SessionView) => void;
  onSummaryChange?: (summary: StudentNotificationSummaryView) => void;
  summarySnapshot?: StudentNotificationSummaryView;
}) {
  const [summary, setSummary] = useState<StudentNotificationSummaryView>(() =>
    getStudentNotificationFallbackSummary()
  );
  const [loading, setLoading] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (summarySnapshot) setSummary(summarySnapshot);
  }, [summarySnapshot]);

  useEffect(() => {
    let alive = true;
    if (summarySnapshot) {
      setLoading(false);
      setLoadError('');
      return () => {
        alive = false;
      };
    }
    if (!accessToken) {
      const fallbackSummary = getStudentNotificationFallbackSummary();
      setSummary(fallbackSummary);
      onSummaryChange?.(fallbackSummary);
      setLoading(false);
      setLoadError('');
      return () => {
        alive = false;
      };
    }

    setLoading(true);
    requestStudentNotifications(accessToken, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
    })
      .then((nextSummary) => {
        if (!alive) return;
        const nextSummaryView = mapStudentNotificationSummaryToView(nextSummary);
        setSummary(nextSummaryView);
        onSummaryChange?.(nextSummaryView);
        setLoadError('');
      })
      .catch((error) => {
        if (!alive) return;
        const fallbackSummary = getStudentNotificationFallbackSummary();
        setSummary(fallbackSummary);
        onSummaryChange?.(fallbackSummary);
        setLoadError(error instanceof Error ? error.message : '通知中心加载失败');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [accessToken, onSessionExpired, onSessionRefresh, onSummaryChange, summarySnapshot]);

  const handleMarkAllRead = () => {
    if (markingRead) return;
    if (!accessToken) {
      const nextSummary = markStudentNotificationSummaryRead(summary);
      setSummary(nextSummary);
      onSummaryChange?.(nextSummary);
      return;
    }

    setMarkingRead(true);
    setLoadError('');
    requestStudentNotificationsMarkAllRead(accessToken, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
    })
      .then((nextSummary) => {
        const nextSummaryView = mapStudentNotificationSummaryToView(nextSummary);
        setSummary(nextSummaryView);
        onSummaryChange?.(nextSummaryView);
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : '通知已读状态保存失败');
      })
      .finally(() => setMarkingRead(false));
  };

  return (
    <section className="student-notify-panel" aria-label="学生通知中心">
      {(loading || loadError) && (
        <div className={`student-notify-message${loadError ? ' is-error' : ''}`}>
          <DashboardIcon name={loadError ? 'alert' : 'refresh'} size={14} />
          {loadError || '正在加载通知中心…'}
        </div>
      )}

      <div className="dashboard-card student-notify-toolbar">
        <div>
          <strong>{formatStudentNotificationSubtitle(summary)}</strong>
          <span>站内提醒会同步展示预约、签到、自动取消和系统公告。</span>
        </div>
        <button disabled={markingRead} type="button" onClick={handleMarkAllRead}>
          <DashboardIcon name="check-circle" size={13} />
          {markingRead ? '保存中' : '标记全部已读'}
        </button>
      </div>

      {summary.groups.map((group) => (
        <section className="student-notify-group" key={group.date}>
          <h2>{group.date}</h2>
          <div className="student-notify-list">
            {group.items.map((item) => (
              <article
                className={`dashboard-card student-notify-card${item.read ? ' is-read' : ''}`}
                key={item.id}
              >
                <span
                  className="student-notify-icon"
                  style={{ '--notify-tone': item.tone } as CSSProperties}
                >
                  <DashboardIcon name={item.icon} size={17} />
                </span>
                <div className="student-notify-body">
                  <header>
                    <strong>{item.title}</strong>
                    {!item.read ? <i aria-label="未读" /> : null}
                  </header>
                  <p>{item.desc}</p>
                </div>
                <time>{item.time}</time>
              </article>
            ))}
          </div>
        </section>
      ))}
      {summary.groups.length === 0 && (
        <div className="student-notify-empty">暂无通知，预约提醒和签到消息会在这里展示。</div>
      )}
    </section>
  );
}

function StudentViolationPanel({
  accessToken,
  onSessionExpired,
  onSessionRefresh,
  onSummaryChange
}: {
  accessToken?: string;
  onSessionExpired?: () => void;
  onSessionRefresh?: (session: SessionView) => void;
  onSummaryChange?: (summary: StudentViolationSummaryView) => void;
}) {
  const [summary, setSummary] = useState<StudentViolationSummaryView>(() =>
    mapStudentViolationSummaryToView(STUDENT_VIOLATION_FALLBACK_SUMMARY)
  );
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let alive = true;
    if (!accessToken) {
      const fallbackSummary = mapStudentViolationSummaryToView(STUDENT_VIOLATION_FALLBACK_SUMMARY);
      setSummary(fallbackSummary);
      onSummaryChange?.(fallbackSummary);
      setLoading(false);
      setLoadError('');
      return () => {
        alive = false;
      };
    }

    setLoading(true);
    requestStudentViolationSummary(accessToken, fetch, resolveApiBaseUrl(), {
      onSessionExpired,
      onSessionRefresh
    })
      .then((nextSummary) => {
        if (!alive) return;
        const nextSummaryView = mapStudentViolationSummaryToView(nextSummary);
        setSummary(nextSummaryView);
        onSummaryChange?.(nextSummaryView);
        setLoadError('');
      })
      .catch((error) => {
        if (!alive) return;
        const fallbackSummary = mapStudentViolationSummaryToView(STUDENT_VIOLATION_FALLBACK_SUMMARY);
        setSummary(fallbackSummary);
        onSummaryChange?.(fallbackSummary);
        setLoadError(error instanceof Error ? error.message : '违约记录加载失败');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [accessToken, onSessionExpired, onSessionRefresh, onSummaryChange]);

  return (
    <section className="student-violation-panel" aria-label="学生违约记录">
      {(loading || loadError) && (
        <div className={`student-violation-message${loadError ? ' is-error' : ''}`}>
          <DashboardIcon name={loadError ? 'alert' : 'refresh'} size={14} />
          {loadError || '正在加载违约记录…'}
        </div>
      )}

      <div className="student-violation-summary">
        <span className="student-violation-summary-icon">
          <DashboardIcon name="alert" size={22} />
        </span>
        <div>
          <strong>本学期已违约 {summary.semesterCountLabel} 次</strong>
          <p>
            累计达 {summary.restrictionThreshold} 次将被限制预约 7 天。请合理安排预约，按时签到。
          </p>
        </div>
        <aside>
          <strong>{summary.totalCountLabel}</strong>
          <span>{summary.restrictionLabel}</span>
        </aside>
      </div>

      <section className="dashboard-card student-violation-progress-card">
        <header>
          <strong>违约进度</strong>
          <span>{summary.severeProgressLabel}</span>
        </header>
        <div className="student-violation-progress" aria-label={summary.progressAriaLabel}>
          <span style={{ width: `${summary.progressPercent}%` }} />
        </div>
        <footer>
          <span>0</span>
          <strong>{summary.restrictionThreshold}次 限7天</strong>
          <strong>{summary.severeThreshold}次 限30天</strong>
        </footer>
      </section>

      <div className="student-violation-record-list">
        {summary.records.map((record) => {
          const appealed = record.status === 'appealed';
          return (
            <article className="dashboard-card student-violation-record-card" key={record.id}>
              <span
                className="student-violation-record-icon"
                data-status={record.status}
                aria-hidden="true"
              >
                <DashboardIcon name="alert" size={16} />
              </span>
              <div className="student-violation-record-main">
                <h2>{record.room}</h2>
                <p>{record.reason}</p>
                <div>
                  <span>
                    <DashboardIcon name="clock" size={11} />
                    {record.date}
                  </span>
                  <mark data-status={record.status}>{record.statusLabel}</mark>
                </div>
              </div>
              <aside className="student-violation-record-count">
                <strong>+{record.countLabel}</strong>
                <span>违约次数</span>
                {!appealed ? <button type="button">申请申诉</button> : null}
              </aside>
            </article>
          );
        })}
        {summary.records.length === 0 && (
          <div className="student-violation-empty">暂无违约记录，请继续保持按时签到。</div>
        )}
      </div>
    </section>
  );
}

function StudentSeatCell({
  filteredOut = false,
  hasPower = false,
  onSelect,
  seatNo,
  status
}: {
  filteredOut?: boolean;
  hasPower?: boolean;
  onSelect?: () => void;
  seatNo: string;
  status: StudentSeatStatus;
}) {
  const disabled = status === 'taken' || status === 'disabled' || filteredOut;
  const statusLabel = filteredOut ? '不符合筛选' : STUDENT_SEAT_STATUS_LABELS[status];

  return (
    <button
      aria-label={`${seatNo} ${statusLabel}`}
      className="student-seat-cell"
      data-status={status}
      data-filtered={filteredOut ? 'true' : undefined}
      disabled={disabled}
      onClick={disabled ? undefined : onSelect}
      type="button"
    >
      <span>{seatNo}</span>
      {hasPower ? <small>插</small> : null}
    </button>
  );
}
