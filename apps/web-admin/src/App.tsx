import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { F } from '@ibooking/design-tokens';

export type EntryKind = 'student' | 'admin';

type RoleView = {
  name: string;
  code: string;
};

type Feedback = {
  type: 'success' | 'error';
  text: string;
};

type SessionView = {
  kind: EntryKind;
  name: string;
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
  roomName: string;
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

const AUTH_REMEMBER_KEY = 'ibooking.auth.remember';
const ADMIN_ACCESS_TOKEN_KEY = 'ibooking.admin.accessToken';
const STUDENT_ACCESS_TOKEN_KEY = 'ibooking.student.accessToken';
const PASSWORD_ICON_PATH = 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z';

const ENTRY_PRESETS: Record<EntryKind, { account: string; password: string }> = {
  student: { account: 'stu_cse_01', password: 'Pass123!' },
  admin: { account: 'admin_full', password: 'Admin123!' }
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
) => {
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

export const requestRooms = async (
  accessToken: string,
  fetcher: typeof fetch = fetch,
  apiBaseUrl = resolveApiBaseUrl()
): Promise<AdminRoom[]> => {
  const response = await fetcher(`${apiBaseUrl}/api/v1/rooms`, {
    method: 'GET',
    credentials: 'include',
    headers: { Authorization: `Bearer ${accessToken}` }
  });
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
  apiBaseUrl = resolveApiBaseUrl()
): Promise<AdminRoom> => {
  const isEdit = Boolean(options.roomId);
  const response = await fetcher(
    isEdit ? `${apiBaseUrl}/api/v1/rooms/${options.roomId}` : `${apiBaseUrl}/api/v1/rooms`,
    {
      method: isEdit ? 'PATCH' : 'POST',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${options.accessToken}`,
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
    }
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

const ADMIN_ROLE_CODES = new Set([
  'ROLE_FULL_ADMIN',
  'ROLE_ROOM_ADMIN',
  'ROLE_AUDIT',
  'ROLE_DEPARTMENT_ADMIN'
]);

export const resolveSessionKind = (roles: RoleView[] = []): EntryKind =>
  roles.some((role) => ADMIN_ROLE_CODES.has(role.code)) ? 'admin' : 'student';

const pushAppPath = (path: string) => {
  if (typeof window !== 'undefined') {
    window.history.pushState(null, '', path);
  }
};

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const loginSession = await requestLogin({ account, password });
      const sessionKind = resolveSessionKind(loginSession.roles);

      localStorage.setItem(AUTH_REMEMBER_KEY, remember ? '1' : '0');
      localStorage.setItem(
        sessionKind === 'admin' ? ADMIN_ACCESS_TOKEN_KEY : STUDENT_ACCESS_TOKEN_KEY,
        loginSession.accessToken
      );
      setSession({
        kind: sessionKind,
        name: loginSession.user.name,
        accessToken: loginSession.accessToken
      });
      pushAppPath(sessionKind === 'admin' ? '/dashboard' : '/student');
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : '登录失败，请稍后重试'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
    localStorage.removeItem(STUDENT_ACCESS_TOKEN_KEY);
    setSession(null);
    pushAppPath('/');
  };

  if (session?.kind === 'admin') {
    return (
      <AdminDashboard
        accessToken={session.accessToken}
        adminName={session.name}
        onLogout={handleLogout}
      />
    );
  }

  if (session?.kind === 'student') {
    return <StudentHomePreview studentName={session.name} onLogout={handleLogout} />;
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
  initialActive?: AdminMenuId;
  onLogout?: () => void;
};

type StudentDashboardProps = {
  studentName: string;
  initialActive?: StudentPageId;
  onLogout?: () => void;
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
  'select',
  'bookings',
  'checkin',
  'assistant',
  'notify',
  'violation'
] as const;

type StudentMenuId = (typeof STUDENT_MENU_IDS)[number];
type StudentPageId = StudentMenuId | 'confirm';

type AdminMenuAction = {
  id?: 'create-room' | 'refresh-rooms' | 'create-seat';
  label: string;
  icon: DashboardIconName;
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

const ADMIN_ROOM_FALLBACKS: AdminRoom[] = [
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

const ADMIN_SEAT_FALLBACKS: AdminSeat[] = [
  {
    id: 'seat-gm-301-a012',
    roomName: '经管自习室 301',
    code: 'A-012',
    x: 118,
    y: 84,
    hasPower: true,
    nearWindow: true,
    quietZone: false,
    status: 'ACTIVE',
    updatedAt: '10:24'
  },
  {
    id: 'seat-science-201-c018',
    roomName: '理工自习室 201',
    code: 'C-018',
    x: 214,
    y: 132,
    hasPower: false,
    nearWindow: false,
    quietZone: true,
    status: 'INACTIVE',
    updatedAt: '09:58'
  },
  {
    id: 'seat-humanities-a-f006',
    roomName: '文史馆阅览室 A',
    code: 'F-006',
    x: 326,
    y: 210,
    hasPower: false,
    nearWindow: true,
    quietZone: true,
    status: 'ACTIVE',
    updatedAt: '09:40'
  },
  {
    id: 'seat-library-b022',
    roomName: '图书馆自习区',
    code: 'B-022',
    x: 168,
    y: 156,
    hasPower: true,
    nearWindow: false,
    quietZone: false,
    status: 'ACTIVE',
    updatedAt: '09:12'
  },
  {
    id: 'seat-gm-301-g002',
    roomName: '经管自习室 301',
    code: 'G-002',
    x: 402,
    y: 268,
    hasPower: true,
    nearWindow: false,
    quietZone: true,
    status: 'INACTIVE',
    updatedAt: '昨天'
  }
];

const newSeatForm = (): AdminSeatFormState => ({
  roomName: '经管自习室 301',
  code: '',
  x: 100,
  y: 100,
  hasPower: false,
  nearWindow: false,
  quietZone: false,
  status: 'ACTIVE'
});

const seatToForm = (seat: AdminSeat): AdminSeatFormState => ({
  roomName: seat.roomName,
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

type FloorSeatStatus = 'available' | 'window' | 'taken' | 'selected' | 'disabled';

const FLOOR_EDITOR_TOOLS: Array<{
  icon: DashboardIconName;
  label: string;
  active?: boolean;
}> = [
  { icon: 'move', label: '选择', active: true },
  { icon: 'plus', label: '添加座位' },
  { icon: 'trash', label: '删除' },
  { icon: 'edit', label: '标注属性' },
  { icon: 'grid', label: '吸附网格' },
  { icon: 'refresh', label: '撤销' }
];

const FLOOR_EDITOR_SUPPORT_TOOLS: Array<{ icon: DashboardIconName; label: string }> = [
  { icon: 'info', label: '说明' },
  { icon: 'download', label: '导出' }
];

const FLOOR_EDITOR_ROWS: FloorSeatStatus[][] = [
  ['available', 'window', 'window', 'window', 'window', 'window', 'window', 'available'],
  ['available', 'taken', 'available', 'taken', 'available', 'taken', 'available', 'available'],
  ['available', 'available', 'taken', 'selected', 'available', 'taken', 'available', 'taken'],
  ['taken', 'available', 'available', 'available', 'taken', 'available', 'available', 'taken'],
  ['available', 'taken', 'available', 'taken', 'available', 'available', 'taken', 'available'],
  ['taken', 'available', 'available', 'available', 'taken', 'available', 'available', 'taken']
];

const FLOOR_STATUS_LABELS: Record<FloorSeatStatus, string> = {
  available: '可预约',
  window: '靠窗',
  taken: '已预约',
  selected: '已选择',
  disabled: '停用'
};

const SCHEDULE_SUMMARY = [
  {
    label: '全校默认时段',
    value: '07:00–22:00',
    note: '未配置时回退默认',
    icon: 'calendar',
    tone: F.navy
  },
  {
    label: '整点时段',
    value: '1 小时粒度',
    note: '选座与预约统一按整点计算',
    icon: 'grid',
    tone: '#3A6FA8'
  },
  {
    label: '跨天开放',
    value: '4 间',
    note: '支持 22:00–次日 07:00',
    icon: 'refresh',
    tone: F.gold
  },
  {
    label: '特殊日期优先',
    value: '2 条',
    note: '节假日、考试周、维修日覆盖默认',
    icon: 'alert',
    tone: '#C84040'
  }
] satisfies Array<{
  label: string;
  value: string;
  note: string;
  icon: DashboardIconName;
  tone: string;
}>;

const SCHEDULE_RULES = [
  {
    room: '经管自习室 301',
    scope: '工作日',
    time: '08:00–22:00',
    type: '常规开放',
    status: '生效中',
    note: '全校开放'
  },
  {
    room: '计算机学院自习室 B',
    scope: '每日',
    time: '22:00–次日 07:00',
    type: '跨天开放',
    status: '生效中',
    note: '院系夜间'
  },
  {
    room: '逸夫综合区',
    scope: '5月25日',
    time: '暂停开放',
    type: '闭馆维护',
    status: '待生效',
    note: '特殊日期优先'
  },
  {
    room: '图书馆自习区',
    scope: '考试周',
    time: '07:00–23:00',
    type: '考试周延长',
    status: '待发布',
    note: '延长开放'
  }
] as const;

const SCHEDULE_SPECIAL_RULES = [
  {
    date: '5月25日',
    title: '闭馆维护',
    target: '逸夫综合区',
    time: '暂停开放',
    desc: '维修日规则覆盖默认开放时间'
  },
  {
    date: '6月10日–6月23日',
    title: '考试周延长',
    target: '图书馆自习区',
    time: '07:00–23:00',
    desc: '考试周特殊规则优先于全校默认'
  }
] as const;

const ADMIN_BOOKING_RECORDS = [
  {
    id: 'BK-1893',
    uid: '21307001',
    user: '林晓明',
    room: '经管301',
    seat: 'C3',
    date: '04-24',
    time: '14:00–17:00',
    checkin: '14:02',
    status: 'active'
  },
  {
    id: 'BK-1892',
    uid: '21309022',
    user: '张子涵',
    room: '理工201',
    seat: 'F8',
    date: '04-24',
    time: '13:00–16:00',
    checkin: '13:08',
    status: 'active'
  },
  {
    id: 'BK-1891',
    uid: '20301055',
    user: '王芳',
    room: '图书馆',
    seat: 'B22',
    date: '04-24',
    time: '10:00–12:00',
    checkin: '10:05',
    status: 'done'
  },
  {
    id: 'BK-1890',
    uid: '22310044',
    user: '陈浩然',
    room: '文史馆A',
    seat: 'D5',
    date: '04-24',
    time: '09:00–11:00',
    checkin: '—',
    status: 'violation'
  },
  {
    id: 'BK-1889',
    uid: '21306078',
    user: '赵雪',
    room: '理工403',
    seat: 'A11',
    date: '04-23',
    time: '19:00–22:00',
    checkin: '19:04',
    status: 'done'
  },
  {
    id: 'BK-1888',
    uid: '20312091',
    user: '刘明达',
    room: '经管301',
    seat: 'G2',
    date: '04-23',
    time: '14:00–17:00',
    checkin: '14:18',
    status: 'pending'
  }
] as const;

const ADMIN_BOOKING_STATUS_META = {
  active: { label: '使用中', variant: 'green' },
  done: { label: '已完成', variant: 'gray' },
  violation: { label: '违约', variant: 'red' },
  pending: { label: '待签到', variant: 'blue' }
} as const;

const ADMIN_BOOKING_FILTERS = ['今日', '本周', '全部状态'] as const;

const ADMIN_VIOLATION_SUMMARY = [
  {
    label: '未签到',
    value: '14',
    note: '开始后 15 分钟自动取消',
    icon: 'alert',
    tone: '#C84040'
  },
  {
    label: '超时取消',
    value: '4',
    note: '座位已释放并生成记录',
    icon: 'refresh',
    tone: '#C8820A'
  },
  {
    label: '限制中',
    value: '27',
    note: '连续 3 次违约限制预约',
    icon: 'shield',
    tone: '#3A6FA8'
  },
  {
    label: '申诉中',
    value: '3',
    note: '等待管理员复核',
    icon: 'log',
    tone: F.gold
  }
] satisfies Array<{
  label: string;
  value: string;
  note: string;
  icon: DashboardIconName;
  tone: string;
}>;

const ADMIN_VIOLATION_RECORDS = [
  {
    id: 'V-1027',
    bookingId: 'BK-1890',
    student: '陈浩然',
    uid: '22310044',
    room: '文史馆A',
    seat: 'D5',
    reason: '开始后 15 分钟未签到',
    action: '自动取消',
    occurred: '04-24 09:15',
    status: 'recorded'
  },
  {
    id: 'V-1026',
    bookingId: 'BK-1884',
    student: '刘同学',
    uid: '21307019',
    room: '经管301',
    seat: 'C3',
    reason: '开始后 15 分钟未签到',
    action: '自动取消',
    occurred: '04-24 10:15',
    status: 'recorded'
  },
  {
    id: 'V-1025',
    bookingId: 'BK-1876',
    student: '赵同学',
    uid: '21309081',
    room: '理工201',
    seat: 'F8',
    reason: '重复取消',
    action: '人工复核',
    occurred: '04-24 09:42',
    status: 'review'
  },
  {
    id: 'V-1024',
    bookingId: 'BK-1862',
    student: '钱同学',
    uid: '20301036',
    room: '文史馆A',
    seat: 'D5',
    reason: '签到码异常',
    action: '申诉处理',
    occurred: '昨天',
    status: 'appeal'
  },
  {
    id: 'V-1023',
    bookingId: 'BK-1859',
    student: '孙同学',
    uid: '20312078',
    room: '图书馆区',
    seat: 'B22',
    reason: '连续未签到',
    action: '限制预约',
    occurred: '昨天',
    status: 'restricted'
  }
] as const;

const ADMIN_VIOLATION_STATUS_META = {
  recorded: { label: '已记录', variant: 'red' },
  review: { label: '待复核', variant: 'gold' },
  appeal: { label: '申诉中', variant: 'blue' },
  restricted: { label: '限制中', variant: 'gray' }
} as const;

const ADMIN_VIOLATION_FILTERS = ['今日', '全部原因', '全部状态'] as const;

const ADMIN_DYNAMIC_CODE_SUMMARY = [
  {
    label: '今日已生成',
    value: '48',
    note: '覆盖全部开放自习室',
    icon: 'qr',
    tone: F.success
  },
  {
    label: '异常上报',
    value: '2',
    note: '疑似截图复用拦截',
    icon: 'alert',
    tone: '#C84040'
  },
  {
    label: '平均刷新',
    value: '60s',
    note: '网页动态码滚动刷新',
    icon: 'refresh',
    tone: '#3A6FA8'
  },
  {
    label: '待打印',
    value: '3',
    note: '小程序二维码需线下张贴',
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

const ADMIN_DYNAMIC_CODE_RECORDS = [
  {
    room: '经管自习室 301',
    building: '光华楼 A座',
    webCode: 'FD-301-7K2',
    qrStatus: '已生成',
    refresh: '60 秒刷新',
    updatedAt: '10:24',
    status: 'active'
  },
  {
    room: '理工自习室 201',
    building: '理科楼',
    webCode: 'FD-201-QP9',
    qrStatus: '已生成',
    refresh: '60 秒刷新',
    updatedAt: '10:20',
    status: 'active'
  },
  {
    room: '文史馆阅览室 A',
    building: '文史馆',
    webCode: 'FD-HIS-22A',
    qrStatus: '待打印',
    refresh: '90 秒刷新',
    updatedAt: '09:58',
    status: 'pending'
  },
  {
    room: '逸夫综合区',
    building: '逸夫楼',
    webCode: '暂停',
    qrStatus: '暂停',
    refresh: '关闭',
    updatedAt: '昨天',
    status: 'closed'
  }
] as const;

const ADMIN_DYNAMIC_CODE_STATUS_META = {
  active: { label: '正常', variant: 'green' },
  pending: { label: '待处理', variant: 'gold' },
  closed: { label: '维护中', variant: 'gray' }
} as const;

const ADMIN_DYNAMIC_CODE_FILTERS = ['全部楼栋', '全部状态', '刷新策略'] as const;

const ADMIN_USER_SUMMARY = [
  {
    label: '学生账号',
    value: '18,420',
    note: '学工号统一认证同步',
    icon: 'users',
    tone: '#3A6FA8'
  },
  {
    label: '管理员',
    value: '36',
    note: '按角色授权后台菜单',
    icon: 'shield',
    tone: F.success
  },
  {
    label: '停用账号',
    value: '12',
    note: '阻止登录与预约操作',
    icon: 'alert',
    tone: '#C84040'
  },
  {
    label: '本周新增',
    value: '128',
    note: '来自院系名单导入',
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

const ADMIN_USER_RECORDS = [
  {
    name: '林晓明',
    account: '22302010001',
    department: '经济学院',
    role: '学生',
    source: '统一认证',
    lastLogin: '今天 09:42',
    status: 'active'
  },
  {
    name: '王老师',
    account: 'admin_full',
    department: '教务处',
    role: '超级管理员',
    source: '后台创建',
    lastLogin: '今天 08:50',
    status: 'active'
  },
  {
    name: '张老师',
    account: 'room_admin_01',
    department: '后勤保障',
    role: '自习室管理员',
    source: '后台创建',
    lastLogin: '昨天 19:21',
    status: 'active'
  },
  {
    name: '陈同学',
    account: '22307110012',
    department: '计算机学院',
    role: '学生',
    source: '统一认证',
    lastLogin: '7天前',
    status: 'disabled'
  }
] as const;

const ADMIN_USER_STATUS_META = {
  active: { label: '正常', variant: 'green' },
  disabled: { label: '停用', variant: 'red' }
} as const;

const ADMIN_USER_FILTERS = ['全部院系', '全部角色', '账号状态'] as const;

const ADMIN_ROLE_SUMMARY = [
  {
    label: '角色数',
    value: '5',
    note: '覆盖管理员与观察员',
    icon: 'shield',
    tone: F.success
  },
  {
    label: '权限点',
    value: '42',
    note: '按模块与操作拆分',
    icon: 'settings',
    tone: '#3A6FA8'
  },
  {
    label: '待审变更',
    value: '3',
    note: '审批后生效',
    icon: 'alert',
    tone: '#C8820A'
  },
  {
    label: '菜单级权限',
    value: '13',
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

const ADMIN_ROLE_RECORDS = [
  {
    name: '超级管理员',
    users: '3',
    scope: '全部院系',
    spaceAccess: '全部',
    operationAccess: '全部',
    menuAccess: '13/13',
    updatedAt: '今天 08:50',
    status: 'active'
  },
  {
    name: '自习室管理员',
    users: '14',
    scope: '全校空间',
    spaceAccess: '可编辑',
    operationAccess: '可处理',
    menuAccess: '8/13',
    updatedAt: '昨天 19:21',
    status: 'active'
  },
  {
    name: '院系管理员',
    users: '9',
    scope: '院系范围',
    spaceAccess: '院系编辑',
    operationAccess: '只读',
    menuAccess: '6/13',
    updatedAt: '昨天',
    status: 'active'
  },
  {
    name: '只读观察员',
    users: '10',
    scope: '全校只读',
    spaceAccess: '只读',
    operationAccess: '只读',
    menuAccess: '5/13',
    updatedAt: '04-23',
    status: 'active'
  },
  {
    name: '临时审计员',
    users: '0',
    scope: '审计范围',
    spaceAccess: '无',
    operationAccess: '只读',
    menuAccess: '2/13',
    updatedAt: '待审批',
    status: 'pending'
  }
] as const;

const ADMIN_ROLE_STATUS_META = {
  active: { label: '启用', variant: 'green' },
  pending: { label: '待审批', variant: 'gold' },
  disabled: { label: '禁用', variant: 'gray' }
} as const;

const ADMIN_ROLE_PERMISSION_GROUPS = [
  { group: '空间管理', permissions: ['自习室管理', '座位管理', '平面图编辑器', '开放时间'] },
  { group: '运营管理', permissions: ['预约记录', '违约记录', '动态码管理'] },
  { group: '系统与权限', permissions: ['用户管理', '角色权限', '系统参数', '审计日志', '数据报表'] }
] as const;

const ADMIN_ROLE_PERMISSION_MATRIX = [
  {
    title: '空间管理 / 座位管理 / 平面图编辑器',
    scope: '可编辑',
    checked: '全选'
  },
  {
    title: '运营管理 / 签到动态码 / 违约记录',
    scope: '可处理',
    checked: '部分'
  },
  {
    title: '系统与权限 / 用户管理 / 角色权限',
    scope: '审批后生效',
    checked: '复核'
  }
] as const;

const ADMIN_ROLE_FILTERS = ['全部角色', '权限范围', '审批状态'] as const;

const ADMIN_PARAM_SUMMARY = [
  {
    label: '单次最长',
    value: '4 小时',
    note: '单笔预约不可超过上限',
    icon: 'calendar',
    tone: F.success
  },
  {
    label: '签到宽限',
    value: '15 分钟',
    note: '超时自动取消并记录违约',
    icon: 'check-circle',
    tone: '#3A6FA8'
  },
  {
    label: '提醒规则',
    value: '3 条',
    note: '开始前、开始后、取消前',
    icon: 'alert',
    tone: '#C8820A'
  },
  {
    label: '待发布变更',
    value: '2',
    note: '参数变更需审批发布',
    icon: 'settings',
    tone: F.gold
  }
] satisfies Array<{
  label: string;
  value: string;
  note: string;
  icon: DashboardIconName;
  tone: string;
}>;

const ADMIN_PARAM_RECORDS = [
  {
    name: '最大预约时长',
    value: '4 小时',
    defaultValue: '4 小时',
    scope: '全校',
    type: '预约规则',
    status: 'active',
    note: '单次预约按整点开始结束，不允许超过 4 小时'
  },
  {
    name: '默认开放时间',
    value: '07:00-22:00',
    defaultValue: '07:00-22:00',
    scope: '普通自习室',
    type: '开放时间',
    status: 'active',
    note: '夜间开放自习室可单独覆盖默认时段'
  },
  {
    name: '开始前 15 分钟提醒',
    value: '15 分钟',
    defaultValue: '15 分钟',
    scope: '全校',
    type: '提醒策略',
    status: 'active',
    note: '预约开始前通过站内通知和小程序提醒'
  },
  {
    name: '开始后 10 分钟未签到提醒',
    value: '10 分钟',
    defaultValue: '10 分钟',
    scope: '全校',
    type: '提醒策略',
    status: 'active',
    note: '学生仍未签到时追加未签到提醒'
  },
  {
    name: '开始后 15 分钟自动取消',
    value: '15 分钟',
    defaultValue: '15 分钟',
    scope: '全校',
    type: '违约策略',
    status: 'review',
    note: '释放座位并生成违约记录'
  }
] as const;

const ADMIN_PARAM_STATUS_META = {
  active: { label: '已生效', variant: 'green' },
  review: { label: '待发布', variant: 'gold' }
} as const;

const ADMIN_PARAM_TIMELINE = [
  ['T-15', '开始前 15 分钟提醒', '提醒学生准备前往自习室'],
  ['T+10', '开始后 10 分钟未签到提醒', '提示尽快完成动态码或二维码签到'],
  ['T+15', '开始后 15 分钟自动取消', '释放座位并生成违约记录']
] as const;

const ADMIN_PARAM_SCOPES = [
  ['全校', '统一预约时长、签到宽限和违约策略'],
  ['院系自习室', '可继承全校规则并叠加院系限制'],
  ['夜间开放', '覆盖默认 07:00-22:00 开放时间']
] as const;

const ADMIN_PARAM_FILTERS = ['全部参数', '生效范围', '发布状态'] as const;

const ADMIN_AUDIT_SUMMARY = [
  {
    label: '资源变更',
    value: '74',
    note: '自习室、座位、开放时间',
    icon: 'building',
    tone: '#3A6FA8'
  },
  {
    label: '权限变更',
    value: '9',
    note: '角色权限调整需复核',
    icon: 'shield',
    tone: '#C8820A'
  },
  {
    label: '失败登录',
    value: '4',
    note: '异常账号与 IP 已标记',
    icon: 'alert',
    tone: '#C84040'
  },
  {
    label: '风险事件',
    value: '6',
    note: '待安全管理员确认',
    icon: 'eye',
    tone: F.gold
  }
] satisfies Array<{
  label: string;
  value: string;
  note: string;
  icon: DashboardIconName;
  tone: string;
}>;

const ADMIN_AUDIT_RECORDS = [
  {
    time: '10:31:22',
    operator: '王老师',
    module: '自习室管理',
    action: '更新开放时间',
    target: '经管自习室 301',
    ip: '10.28.4.12',
    result: 'success',
    detail: '07:00-22:00 调整为 07:00-23:00'
  },
  {
    time: '10:08:41',
    operator: '张老师',
    module: '座位管理',
    action: '停用座位 C-018',
    target: '理工自习室 201',
    ip: '10.28.4.33',
    result: 'success',
    detail: '电源插座检修，停用至 2026-05-27'
  },
  {
    time: '09:42:09',
    operator: '李老师',
    module: '角色权限',
    action: '新增权限点',
    target: 'ROLE_ROOM_ADMIN',
    ip: '10.28.4.16',
    result: 'review',
    detail: '权限调整需二次复核'
  },
  {
    time: '09:16:00',
    operator: '系统任务',
    module: '签到任务',
    action: '自动取消预约',
    target: 'BK-20260526-0916',
    ip: 'system',
    result: 'success',
    detail: '开始后 15 分钟未签到，释放座位并记录违约'
  },
  {
    time: '08:52:18',
    operator: 'admin_full',
    module: '统一登录',
    action: '登录失败 4 次',
    target: '后台登录',
    ip: '10.28.4.16',
    result: 'risk',
    detail: '同一 IP 短时间连续失败，已加入风险事件'
  }
] as const;

const ADMIN_AUDIT_STATUS_META = {
  success: { label: '成功', variant: 'green' },
  review: { label: '待审批', variant: 'gold' },
  risk: { label: '异常', variant: 'red' }
} as const;

const ADMIN_AUDIT_RISKS = [
  ['登录失败 4 次', 'IP 10.28.4.16', '需要确认是否为管理员本人操作'],
  ['权限调整需二次复核', 'ROLE_ROOM_ADMIN 新增权限点', '等待超级管理员审批'],
  ['高频导出日志', '30 分钟内导出 3 次', '建议核对数据使用目的']
] as const;

const ADMIN_AUDIT_RULES = [
  ['操作留痕不可删除', '管理员、系统任务和规则引擎动作都保留完整流水'],
  ['审计数据保留 180 天', '满足课程要求中的操作追踪和问题复盘'],
  ['导出需要记录用途', '导出审计日志会同步生成二次审计记录']
] as const;

const ADMIN_AUDIT_FILTERS = ['全部模块', '全部结果', '最近 24 小时'] as const;

const ADMIN_REPORT_SUMMARY = [
  {
    label: '本月预约总量',
    value: '24,831',
    note: '较上月增长 9.4%',
    icon: 'calendar',
    tone: F.navy
  },
  {
    label: '平均签到率',
    value: '86.4%',
    note: '未签到违约持续下降',
    icon: 'check-circle',
    tone: F.success
  },
  {
    label: '平均座位利用率',
    value: '73.2%',
    note: '晚间时段达到峰值',
    icon: 'chart',
    tone: '#3A6FA8'
  },
  {
    label: '本月违约总次数',
    value: '312',
    note: '含未签到与超时取消',
    icon: 'alert',
    tone: '#C8820A'
  }
] satisfies Array<{
  label: string;
  value: string;
  note: string;
  icon: DashboardIconName;
  tone: string;
}>;

const ADMIN_REPORT_WEEKLY_BOOKINGS = [
  ['周一', 842],
  ['周二', 1103],
  ['周三', 987],
  ['周四', 1247],
  ['周五', 0],
  ['周六', 0],
  ['周日', 0]
] as const;

const ADMIN_REPORT_TOP_ROOMS = [
  { name: '理工自习室 201', count: 1832, pct: 94 },
  { name: '经管自习室 301', count: 1644, pct: 87 },
  { name: '图书馆自习区', count: 1520, pct: 81 },
  { name: '理工自习室 403', count: 1398, pct: 76 },
  { name: '文史馆阅览室 A', count: 1201, pct: 68 }
] as const;

const ADMIN_REPORT_TOP_SEATS = [
  ['A-018', '理工自习室 201', '126 次', '靠窗 · 插座'],
  ['C-003', '经管自习室 301', '112 次', '四人桌'],
  ['B-022', '图书馆自习区', '108 次', '静音区']
] as const;

const ADMIN_REPORT_LOW_PERIODS = [
  ['07:00-09:00', '41.2%', '低利用率时段'],
  ['12:00-13:00', '38.6%', '午间空档'],
  ['21:00-22:00', '44.8%', '闭馆前回落']
] as const;

const ADMIN_REPORT_RULES = [
  ['统计口径', '预约总量按有效预约计数，取消与违约分别进入趋势统计'],
  ['热门座位', '按使用次数和实际使用时长综合排序'],
  ['空状态', '周末暂无数据时以空柱和短横展示']
] as const;

const ADMIN_REPORT_FILTERS = ['2026年4月', '全校范围', '按月统计'] as const;

const STUDENT_MENU_GROUPS: Array<{ label: string; items: StudentMenuItem[] }> = [
  {
    label: '学习空间',
    items: [
      { id: 'home', label: '首页概览', icon: 'home' },
      { id: 'rooms', label: '自习室列表', icon: 'building' },
      { id: 'select', label: '选座预约', icon: 'grid' }
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

const STUDENT_ROOM_LIST = [
  {
    name: '经管自习室 301',
    building: '光华楼 A座',
    floor: '3楼',
    capacity: 48,
    available: 12,
    hours: '08:00–22:00',
    scope: '全校开放',
    tags: ['插座', '靠窗', '安静区'],
    status: 'open'
  },
  {
    name: '理工自习室 201',
    building: '逸夫楼',
    floor: '2楼',
    capacity: 64,
    available: 31,
    hours: '00:00–24:00',
    scope: '全校开放',
    tags: ['24小时', '插座', '白板'],
    status: 'open'
  },
  {
    name: '文史馆阅览室 A',
    building: '文史馆',
    floor: '1楼',
    capacity: 80,
    available: 5,
    hours: '08:00–21:00',
    scope: '文理兼容',
    tags: ['靠窗', '低噪音'],
    status: 'busy'
  },
  {
    name: '新闻学院研讨室',
    building: '新闻学院楼',
    floor: '4楼',
    capacity: 20,
    available: 0,
    hours: '09:00–20:00',
    scope: '仅新闻学院',
    tags: ['白板', '投影'],
    status: 'full'
  },
  {
    name: '理工自习室 403',
    building: '逸夫楼',
    floor: '4楼',
    capacity: 56,
    available: 28,
    hours: '08:00–23:00',
    scope: '全校开放',
    tags: ['插座', '安静区'],
    status: 'open'
  },
  {
    name: '图书馆自习区',
    building: '李兆基图书馆',
    floor: '2楼',
    capacity: 120,
    available: 44,
    hours: '08:00–22:00',
    scope: '全校开放',
    tags: ['插座', '靠窗', '安静区'],
    status: 'open'
  }
] satisfies Array<{
  name: string;
  building: string;
  floor: string;
  capacity: number;
  available: number;
  hours: string;
  scope: string;
  tags: string[];
  status: 'open' | 'busy' | 'full';
}>;

const STUDENT_ROOM_STATUS_META = {
  open: { label: '开放中', variant: 'green' },
  busy: { label: '较繁忙', variant: 'gold' },
  full: { label: '已满座', variant: 'red' }
} as const;

const STUDENT_ROOM_FILTERS = ['全部楼栋', '全校开放', '有空位', '有插座', '靠窗'] as const;

type StudentSeatStatus = 'available' | 'window' | 'taken' | 'selected' | 'disabled';

const STUDENT_SEAT_DATES = ['今天', '明天', '后天'] as const;
const STUDENT_SEAT_BUILDINGS = ['光华楼 A座', '逸夫楼', '文史馆', '李兆基图书馆'] as const;
const STUDENT_SEAT_FEATURES = ['插座', '靠窗', '安静区', '白板附近', '无障碍'] as const;

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
  { status: 'window', label: '靠窗' }
];

const STUDENT_SEAT_TIME_SLOTS = [
  { time: '08:00–12:00', label: '空闲', status: 'available' },
  { time: '12:00–14:00', label: '已占用', status: 'taken' },
  { time: '14:00–17:00', label: '已选', status: 'selected' },
  { time: '17:00–22:00', label: '空闲', status: 'available' }
] as const;

const STUDENT_BOOKING_CONFIRM_STEPS = ['选择时间', '选择座位', '确认信息', '完成'] as const;

const STUDENT_BOOKING_CONFIRM_DETAILS = [
  ['自习室', '经管自习室 301'],
  ['楼栋位置', '光华楼 A座 3楼'],
  ['座位编号', 'C3（插座 · 安静区）'],
  ['预约日期', '2026年4月24日（周四）'],
  ['开始时间', '14:00'],
  ['结束时间', '17:00（共3小时）']
] as const;

const STUDENT_BOOKING_RULES = [
  ['签到规则', '开始时间后 15 分钟内扫码/输码签到，逾期自动取消并记录违约 1 次'],
  ['提前离开', '可通过系统提前结束，不记违约；无故离席超 30 分钟视同违约'],
  ['取消规则', '开始前 1 小时以上取消不记违约；1 小时内取消记违约 0.5 次'],
  ['违约累计', '本学期累计 3 次违约将被限制预约 7 天；5 次限制 30 天']
] as const;

const STUDENT_REMINDER_OPTIONS = ['微信服务通知', '邮件提醒', '不提醒'] as const;

type StudentBookingStatus = 'upcoming' | 'completed' | 'violation' | 'cancelled';

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
  completed: { label: '已完成', variant: 'green', icon: 'check-circle' },
  violation: { label: '违约', variant: 'red', icon: 'alert' },
  cancelled: { label: '已取消', variant: 'gray', icon: 'x' }
};

const getStudentSeatNumber = (rowIndex: number, colIndex: number) =>
  `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`;

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
    sub: '2026年4月24日 · 实时数据',
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
    sub: '共 48 个自习室',
    description: '维护自习室基础信息、开放范围、院系限制与当前运营状态。',
    actions: [
      { id: 'create-room', label: '新增自习室', icon: 'plus' },
      { id: 'refresh-rooms', label: '资源状态同步', icon: 'refresh' }
    ],
    metrics: [
      { label: '开放中', value: '43 间', tone: F.success },
      { label: '维护中', value: '5 间', tone: '#C8820A' },
      { label: '院系限定', value: '7 间', tone: '#3A6FA8' }
    ],
    tableTitle: '自习室列表',
    tableNote: '按实时开放状态排序',
    tableHead: ['自习室', '楼栋', '容量', '开放对象', '状态'],
    rows: [
      ['经管自习室 301', '光华楼 A座', '48 座', '全校', '开放中'],
      ['理工自习室 201', '理科楼', '36 座', '全校', '开放中'],
      ['计算机学院自习室 B', '计算机楼', '24 座', '计算机学院', '夜间开放'],
      ['逸夫综合区', '逸夫楼', '96 座', '全校', '维护中']
    ]
  },
  seats: {
    title: '座位管理',
    sub: '共 2,840 个座位',
    description: '维护座位编号、插座标记、禁用状态与可预约区域。',
    actions: [
      { id: 'create-seat', label: '新增座位', icon: 'plus' },
      { label: '批量导入', icon: 'download' }
    ],
    metrics: [
      { label: '可预约', value: '2,612', tone: F.success },
      { label: '带插座', value: '684', tone: F.gold },
      { label: '临时停用', value: '86', tone: '#C84040' }
    ],
    tableTitle: '重点座位状态',
    tableNote: '展示需要管理员关注的座位',
    tableHead: ['座位', '自习室', '属性', '状态', '最近更新'],
    rows: [
      ['A-012', '经管自习室 301', '靠窗 · 插座', '可预约', '10:24'],
      ['C-018', '理工自习室 201', '普通座', '维修中', '09:58'],
      ['F-006', '文史馆阅览室 A', '静音区', '占用中', '09:40'],
      ['B-022', '图书馆自习区', '插座', '可预约', '09:12']
    ]
  },
  editor: {
    title: '座位平面图编辑器',
    sub: '经管自习室 301 · 光华楼 A座 3楼',
    description: '调整座位坐标、通道、门窗和插座图层，发布后同步到学生端选座图。',
    actions: [
      { label: '预览', icon: 'eye' },
      { label: '保存布局', icon: 'check' }
    ],
    metrics: [
      { label: '已发布图层', value: '42', tone: F.success },
      { label: '待发布草稿', value: '3', tone: '#C8820A' },
      { label: '坐标校验通过', value: '98.7%', tone: '#3A6FA8' }
    ],
    tableTitle: '编辑任务',
    tableNote: '最近修改的平面图',
    tableHead: ['楼层', '修改人', '变更内容', '状态', '时间'],
    rows: [
      ['光华楼 A座 3F', '王老师', '新增 6 个插座座位', '待发布', '10:18'],
      ['理科楼 2F', '李老师', '调整通道宽度', '草稿', '09:46'],
      ['文史馆 1F', '系统', '同步房间容量', '已发布', '昨天'],
      ['计算机楼 4F', '张老师', '夜间区域标记', '待审核', '昨天']
    ]
  },
  schedule: {
    title: '开放时间管理',
    sub: '默认开放 07:00–22:00',
    description: '配置普通开放、夜间开放、节假日调整和临时闭馆规则。',
    actions: [
      { label: '新增开放规则', icon: 'calendar' },
      { label: '同步节假日', icon: 'refresh' }
    ],
    metrics: [
      { label: '常规规则', value: '48', tone: F.success },
      { label: '夜间开放', value: '4', tone: '#3A6FA8' },
      { label: '临时闭馆', value: '2', tone: '#C84040' }
    ],
    tableTitle: '开放规则',
    tableNote: '按生效时间展示',
    tableHead: ['自习室', '时段', '适用日期', '状态', '说明'],
    rows: [
      ['经管自习室 301', '08:00–22:00', '工作日', '生效中', '常规开放'],
      ['计算机学院自习室 B', '22:00–次日 07:00', '每日', '生效中', '院系夜间'],
      ['逸夫综合区', '暂停开放', '5月25日', '待生效', '设备维护'],
      ['图书馆自习区', '07:00–23:00', '考试周', '待发布', '延长开放']
    ]
  },
  bookings: {
    title: '预约记录管理',
    sub: '共 1,247 条记录（今日）',
    description: '查询预约、签到、取消与超时记录，支持按学生、自习室和时段筛选。',
    actions: [
      { label: '代预约', icon: 'plus' },
      { label: '导出 Excel', icon: 'download' }
    ],
    metrics: [
      { label: '使用中', value: '892', tone: F.success },
      { label: '待签到', value: '138', tone: '#3A6FA8' },
      { label: '已取消', value: '64', tone: '#8AAAA4' }
    ],
    tableTitle: '最近预约记录',
    tableNote: '今日实时同步',
    tableHead: ['预约编号', '用户', '自习室', '座位', '状态'],
    rows: [
      ['BK20240424-1893', '林晓明', '经管301', 'C3', '使用中'],
      ['BK20240424-1892', '张子涵', '理工201', 'F8', '待签到'],
      ['BK20240424-1891', '王芳', '图书馆区', 'B22', '已完成'],
      ['BK20240424-1890', '陈浩然', '文史馆A', 'D5', '违约']
    ]
  },
  violations: {
    title: '违约记录管理',
    sub: '今日新增 18 条',
    description: '跟踪未签到、超时取消和限制预约记录，支持人工复核与申诉处理。',
    actions: [
      { label: '处理申诉', icon: 'alert' },
      { label: '导出违约', icon: 'download' }
    ],
    metrics: [
      { label: '未签到', value: '14', tone: '#C84040' },
      { label: '超时取消', value: '4', tone: '#C8820A' },
      { label: '限制中', value: '27', tone: '#3A6FA8' }
    ],
    tableTitle: '违约明细',
    tableNote: '按发生时间倒序',
    tableHead: ['学生', '原因', '自习室', '处理状态', '发生时间'],
    rows: [
      ['刘同学', '开始后 15 分钟未签到', '经管301', '已记录', '10:15'],
      ['赵同学', '重复取消', '理工201', '待复核', '09:42'],
      ['钱同学', '签到码异常', '文史馆A', '申诉中', '昨天'],
      ['孙同学', '超时未到', '图书馆区', '已限制', '昨天']
    ]
  },
  qrcode: {
    title: '动态码管理',
    sub: '每间自习室每日更新',
    description: '管理网页动态签到码和小程序二维码，防止截图复用。',
    actions: [
      { label: '生成动态码', icon: 'qr' },
      { label: '打印签到码', icon: 'download' }
    ],
    metrics: [
      { label: '今日已生成', value: '48', tone: F.success },
      { label: '异常上报', value: '2', tone: '#C84040' },
      { label: '平均刷新', value: '60s', tone: '#3A6FA8' }
    ],
    tableTitle: '动态码状态',
    tableNote: '按自习室展示',
    tableHead: ['自习室', '网页码', '小程序码', '刷新策略', '状态'],
    rows: [
      ['经管自习室 301', 'FD-301-7K2', '已生成', '60 秒', '正常'],
      ['理工自习室 201', 'FD-201-QP9', '已生成', '60 秒', '正常'],
      ['文史馆阅览室 A', 'FD-HIS-22A', '待打印', '90 秒', '待处理'],
      ['逸夫综合区', '暂停', '暂停', '关闭', '维护中']
    ]
  },
  users: {
    title: '用户管理',
    sub: '学生与管理员账号统一维护',
    description: '查看用户账号、院系归属、启用状态和最近登录信息。',
    actions: [
      { label: '新增用户', icon: 'users' },
      { label: '导入名单', icon: 'download' }
    ],
    metrics: [
      { label: '学生账号', value: '18,420', tone: '#3A6FA8' },
      { label: '管理员', value: '36', tone: F.success },
      { label: '停用账号', value: '12', tone: '#C84040' }
    ],
    tableTitle: '用户列表',
    tableNote: '展示最近登录用户',
    tableHead: ['姓名', '账号', '院系', '角色', '状态'],
    rows: [
      ['林晓明', '22302010001', '经济学院', '学生', '正常'],
      ['王老师', 'admin_full', '教务处', '超级管理员', '正常'],
      ['张老师', 'room_admin_01', '后勤保障', '自习室管理员', '正常'],
      ['陈同学', '22307110012', '计算机学院', '学生', '停用']
    ]
  },
  roles: {
    title: '角色权限管理',
    sub: '5 个角色 · 菜单级权限',
    description: '配置管理员角色、权限边界和菜单可见范围，符合 RBAC 要求。',
    actions: [
      { label: '新建角色', icon: 'shield' },
      { label: '分配权限', icon: 'settings' }
    ],
    metrics: [
      { label: '角色数', value: '5', tone: F.success },
      { label: '权限点', value: '42', tone: '#3A6FA8' },
      { label: '待审变更', value: '3', tone: '#C8820A' }
    ],
    tableTitle: '角色配置',
    tableNote: '按权限范围展示',
    tableHead: ['角色', '用户数', '空间管理', '运营管理', '状态'],
    rows: [
      ['超级管理员', '3', '全部', '全部', '启用'],
      ['自习室管理员', '14', '可编辑', '可处理', '启用'],
      ['院系管理员', '9', '院系范围', '只读', '启用'],
      ['只读观察员', '10', '只读', '只读', '启用']
    ]
  },
  params: {
    title: '系统参数管理',
    sub: '预约规则与提醒策略',
    description: '维护最大预约时长、签到窗口、提醒节奏和违约限制参数。',
    actions: [
      { label: '保存参数', icon: 'settings' },
      { label: '恢复默认', icon: 'refresh' }
    ],
    metrics: [
      { label: '单次最长', value: '4 小时', tone: F.success },
      { label: '签到宽限', value: '15 分钟', tone: '#3A6FA8' },
      { label: '提醒规则', value: '3 条', tone: '#C8820A' }
    ],
    tableTitle: '关键参数',
    tableNote: '与需求文档保持一致',
    tableHead: ['参数', '当前值', '默认值', '生效范围', '状态'],
    rows: [
      ['最大预约时长', '4 小时', '4 小时', '全校', '已生效'],
      ['开始前提醒', '15 分钟', '15 分钟', '全校', '已生效'],
      ['未签到提醒', '10 分钟', '10 分钟', '全校', '已生效'],
      ['自动取消', '15 分钟', '15 分钟', '全校', '已生效']
    ]
  },
  audit: {
    title: '审计日志管理',
    sub: '最近 24 小时 386 条',
    description: '记录登录、资源变更、权限调整和关键运营操作，便于追踪。',
    actions: [
      { label: '筛选模块', icon: 'eye' },
      { label: '导出日志', icon: 'download' }
    ],
    metrics: [
      { label: '资源变更', value: '74', tone: '#3A6FA8' },
      { label: '权限变更', value: '9', tone: '#C8820A' },
      { label: '失败登录', value: '4', tone: '#C84040' }
    ],
    tableTitle: '审计流水',
    tableNote: '保留管理员操作痕迹',
    tableHead: ['时间', '操作者', '模块', '动作', '结果'],
    rows: [
      ['10:31', '王老师', '自习室管理', '更新开放时间', '成功'],
      ['10:08', '张老师', '座位管理', '停用座位 C-018', '成功'],
      ['09:42', '李老师', '角色权限', '新增权限点', '待审批'],
      ['09:16', '系统', '签到任务', '自动取消预约', '成功']
    ]
  },
  reports: {
    title: '数据报表',
    sub: '2026年4月 · 月度分析',
    description: '查看座位利用率、违约趋势、热门时段和院系统计。',
    actions: [
      { label: '导出 CSV', icon: 'download' },
      { label: '导出 Excel', icon: 'download' }
    ],
    metrics: [
      { label: '平均利用率', value: '72.4%', tone: F.success },
      { label: '峰值时段', value: '19:00', tone: '#3A6FA8' },
      { label: '环比提升', value: '+6.8%', tone: F.gold }
    ],
    tableTitle: '报表摘要',
    tableNote: '近 30 天分析',
    tableHead: ['指标', '本月', '上月', '变化', '结论'],
    rows: [
      ['预约总量', '32,481', '29,702', '+9.4%', '增长'],
      ['签到率', '87.3%', '85.2%', '+2.1%', '改善'],
      ['违约率', '2.1%', '2.4%', '-0.3%', '下降'],
      ['夜间使用率', '46.8%', '38.9%', '+7.9%', '增长']
    ]
  }
};

const DASHBOARD_KPIS: Array<{
  label: string;
  value: string;
  icon: DashboardIconName;
  color: string;
  trend: string;
}> = [
  { label: '今日预约总数', value: '1,247', icon: 'calendar', color: F.navy, trend: '+8.2%' },
  { label: '当前在座人数', value: '892', icon: 'users', color: '#3A6FA8', trend: '高峰期' },
  { label: '签到率', value: '87.3%', icon: 'check-circle', color: F.success, trend: '↑ 2.1%' },
  { label: '违约率', value: '2.1%', icon: 'alert', color: '#C8820A', trend: '↓ 0.3%' },
  { label: '开放自习室', value: '43 / 48', icon: 'building', color: '#7A52A8', trend: '5间维护中' }
];

const HEATMAP_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const HEATMAP_HOURS = Array.from({ length: 16 }, (_, index) => `${index + 6}时`);
const HEATMAP_DATA = [
  [0.18, 0.14, 0.11, 0.1, 0.15, 0.34, 0.61, 0.84, 0.89, 0.73, 0.52, 0.47, 0.7, 0.91, 0.82, 0.58],
  [0.2, 0.16, 0.12, 0.1, 0.14, 0.37, 0.66, 0.88, 0.93, 0.76, 0.55, 0.5, 0.74, 0.94, 0.86, 0.62],
  [0.17, 0.13, 0.1, 0.09, 0.13, 0.35, 0.63, 0.86, 0.9, 0.74, 0.54, 0.49, 0.72, 0.92, 0.83, 0.6],
  [0.19, 0.15, 0.11, 0.1, 0.16, 0.39, 0.68, 0.9, 0.95, 0.79, 0.58, 0.51, 0.77, 0.96, 0.88, 0.64],
  [0.16, 0.12, 0.1, 0.08, 0.12, 0.31, 0.57, 0.8, 0.84, 0.69, 0.5, 0.45, 0.66, 0.86, 0.79, 0.56],
  [0.09, 0.08, 0.06, 0.05, 0.08, 0.18, 0.32, 0.45, 0.48, 0.4, 0.31, 0.28, 0.38, 0.49, 0.44, 0.33],
  [0.08, 0.07, 0.05, 0.05, 0.07, 0.16, 0.29, 0.42, 0.45, 0.37, 0.27, 0.25, 0.35, 0.46, 0.41, 0.31]
];

const ROOM_STATUS = [
  { name: '经管自习室 301', pct: 75, status: 'high' },
  { name: '理工自习室 201', pct: 48, status: 'mid' },
  { name: '图书馆自习区', pct: 63, status: 'mid' },
  { name: '文史馆阅览室 A', pct: 94, status: 'full' },
  { name: '理工自习室 403', pct: 31, status: 'low' },
  { name: '逸夫综合区', pct: 0, status: 'closed' }
] as const;

const RECENT_BOOKINGS = [
  { id: 'BK20240424-1893', user: '林晓明', room: '经管301', seat: 'C3', time: '14:00–17:00', status: 'active' },
  { id: 'BK20240424-1892', user: '张子涵', room: '理工201', seat: 'F8', time: '13:00–16:00', status: 'pending' },
  { id: 'BK20240424-1891', user: '王芳', room: '图书馆区', seat: 'B22', time: '10:00–12:00', status: 'done' },
  { id: 'BK20240424-1890', user: '陈浩然', room: '文史馆A', seat: 'D5', time: '09:00–11:00', status: 'violation' }
] as const;

const BOOKING_STATUS_META = {
  active: { label: '使用中', variant: 'green' },
  pending: { label: '待签到', variant: 'blue' },
  done: { label: '已完成', variant: 'gray' },
  violation: { label: '违约', variant: 'red' }
} as const;

const isAdminMenuId = (value: string | undefined): value is AdminMenuId =>
  ADMIN_MENU_IDS.includes(value as AdminMenuId);

const isStudentMenuId = (value: string | undefined): value is StudentMenuId =>
  STUDENT_MENU_IDS.includes(value as StudentMenuId);

const isStudentPageId = (value: string | undefined): value is StudentPageId =>
  value === 'confirm' || isStudentMenuId(value);

const resolveInitialAdminMenu = (): AdminMenuId => {
  if (typeof window === 'undefined') {
    return 'dashboard';
  }

  const [, section] = window.location.pathname.match(/^\/dashboard\/([^/]+)/) ?? [];
  return isAdminMenuId(section) ? section : 'dashboard';
};

const resolveInitialStudentMenu = (): StudentPageId => {
  if (typeof window === 'undefined') {
    return 'home';
  }

  const [, section] = window.location.pathname.match(/^\/student\/([^/]+)/) ?? [];
  return isStudentPageId(section) ? section : 'home';
};

export function AdminDashboard({ accessToken, adminName, initialActive, onLogout }: DashboardProps) {
  const [activeMenu, setActiveMenu] = useState<AdminMenuId>(
    () => initialActive ?? resolveInitialAdminMenu()
  );
  const [roomCreateSignal, setRoomCreateSignal] = useState(0);
  const [roomRefreshSignal, setRoomRefreshSignal] = useState(0);
  const [seatCreateSignal, setSeatCreateSignal] = useState(0);
  const activeMeta = ADMIN_MENU_META[activeMenu];

  const handleMenuChange = (nextMenu: AdminMenuId) => {
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
          {DASHBOARD_NAV_GROUPS.map((group) => (
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
          <div className="dashboard-avatar">王</div>
          <div>
            <strong>{adminName}</strong>
            <span>超级管理员</span>
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
            <div className="dashboard-avatar">王</div>
            <button type="button" onClick={onLogout}>
              退出登录
            </button>
          </div>
        </header>

        {activeMenu === 'dashboard' ? (
          <DashboardOverview />
        ) : activeMenu === 'rooms' ? (
          <RoomManagementPanel
            accessToken={accessToken}
            createSignal={roomCreateSignal}
            refreshSignal={roomRefreshSignal}
          />
        ) : activeMenu === 'seats' ? (
          <SeatManagementPanel createSignal={seatCreateSignal} />
        ) : activeMenu === 'editor' ? (
          <FloorEditorPanel />
        ) : activeMenu === 'schedule' ? (
          <ScheduleManagementPanel />
        ) : activeMenu === 'bookings' ? (
          <BookingRecordsPanel />
        ) : activeMenu === 'violations' ? (
          <ViolationRecordsPanel />
        ) : activeMenu === 'qrcode' ? (
          <DynamicCodePanel />
        ) : activeMenu === 'users' ? (
          <UserManagementPanel />
        ) : activeMenu === 'roles' ? (
          <RoleManagementPanel />
        ) : activeMenu === 'params' ? (
          <SystemParameterPanel />
        ) : activeMenu === 'audit' ? (
          <AuditLogPanel />
        ) : activeMenu === 'reports' ? (
          <DataReportsPanel />
        ) : (
          <AdminModulePanel meta={activeMeta} />
        )}
      </section>
    </main>
  );
}

function DashboardOverview() {
  return (
    <>
        <section className="dashboard-kpi-row" aria-label="自习室运行概览">
          {DASHBOARD_KPIS.map((kpi) => (
            <article className="dashboard-card dashboard-kpi-card" key={kpi.label}>
              <div className="dashboard-kpi-head">
                <span className="dashboard-kpi-icon" style={{ color: kpi.color }}>
                  <DashboardIcon name={kpi.icon} size={16} />
                </span>
                <small style={{ color: kpi.color }}>{kpi.trend}</small>
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
                {HEATMAP_DAYS.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="heatmap-main">
                <div className="heatmap-hours">
                  {HEATMAP_HOURS.map((hour) => (
                    <span key={hour}>{hour}</span>
                  ))}
                </div>
                {HEATMAP_DATA.map((row, dayIndex) => (
                  <div className="heatmap-row" key={HEATMAP_DAYS[dayIndex]}>
                    {row.map((value, hourIndex) => (
                      <span
                        key={`${HEATMAP_DAYS[dayIndex]}-${HEATMAP_HOURS[hourIndex]}`}
                        style={{ opacity: Math.max(0.08, value * 0.9 + 0.06) }}
                        title={`${HEATMAP_DAYS[dayIndex]} ${HEATMAP_HOURS[hourIndex]}: ${Math.round(value * 100)}%`}
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
            {ROOM_STATUS.map((room) => (
              <div className="room-status-row" data-status={room.status} key={room.name}>
                <div>
                  <span>{room.name}</span>
                  <strong>{room.status === 'closed' ? '已关闭' : `${room.pct}%`}</strong>
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
            <button type="button">
              查看全部
              <DashboardIcon name="arrow-right" size={13} />
            </button>
          </header>
          <div className="booking-table">
            <div className="booking-table-head">
              {['预约编号', '用户', '自习室', '座位', '时间段', '状态'].map((head) => (
                <span key={head}>{head}</span>
              ))}
            </div>
            {RECENT_BOOKINGS.map((booking) => {
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
            <button key={action.label} type="button">
              <DashboardIcon name={action.icon} size={13} />
              {action.label}
            </button>
          ))}
        </div>
      </section>

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
  createSignal,
  refreshSignal
}: {
  accessToken?: string;
  createSignal: number;
  refreshSignal: number;
}) {
  const [rooms, setRooms] = useState<AdminRoomRow[]>(() =>
    ADMIN_ROOM_FALLBACKS.map(toAdminRoomRow)
  );
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [editor, setEditor] = useState<AdminRoomEditor | null>(null);
  const [form, setForm] = useState<AdminRoomFormState>(() => newRoomForm());
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!accessToken) {
      setRooms(ADMIN_ROOM_FALLBACKS.map(toAdminRoomRow));
      setLoadError('');
      setLoading(false);
      return () => {
        alive = false;
      };
    }

    setLoading(true);
    requestRooms(accessToken)
      .then((nextRooms) => {
        if (!alive) return;
        setRooms(nextRooms.map(toAdminRoomRow));
        setLoadError('');
      })
      .catch((error) => {
        if (!alive) return;
        setRooms(ADMIN_ROOM_FALLBACKS.map(toAdminRoomRow));
        setLoadError(error instanceof Error ? error.message : '自习室列表加载失败');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [accessToken, refreshSignal]);

  useEffect(() => {
    if (createSignal === 0) return;
    setEditor({ mode: 'create', room: null });
    setForm(newRoomForm());
    setFormError('');
  }, [createSignal]);

  const filteredRooms = rooms.filter((room) => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return true;
    return [room.name, room.building, room.departmentLabel].some((field) =>
      field.toLowerCase().includes(keyword)
    );
  });

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
      });
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
        <button className="room-filter-button" type="button">
          全部状态
          <DashboardIcon name="chevron-down" size={12} />
        </button>
        <button className="room-filter-button" type="button">
          全部楼栋
          <DashboardIcon name="chevron-down" size={12} />
        </button>
        <button className="room-secondary-button" type="button">
          <DashboardIcon name="download" size={13} />
          导出
        </button>
        <button className="room-primary-button" type="button" onClick={openCreate}>
          <DashboardIcon name="plus" size={13} />
          新增自习室
        </button>
      </div>

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
              <button type="button">
                <DashboardIcon name="move" size={12} />
                平面图
              </button>
              <button aria-label={`${room.name} 更多操作`} type="button">
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

function SeatManagementPanel({ createSignal }: { createSignal: number }) {
  const [seats, setSeats] = useState<AdminSeat[]>(ADMIN_SEAT_FALLBACKS);
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<AdminSeatEditor | null>(null);
  const [form, setForm] = useState<AdminSeatFormState>(() => newSeatForm());

  useEffect(() => {
    if (createSignal === 0) return;
    setEditor({ mode: 'create', seat: null });
    setForm(newSeatForm());
  }, [createSignal]);

  const filteredSeats = seats.filter((seat) => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return true;
    return [seat.code, seat.roomName, ...getSeatTags(seat)].some((field) =>
      field.toLowerCase().includes(keyword)
    );
  });

  const openCreate = () => {
    setEditor({ mode: 'create', seat: null });
    setForm(newSeatForm());
  };

  const openEdit = (seat: AdminSeat) => {
    setEditor({ mode: 'edit', seat });
    setForm(seatToForm(seat));
  };

  const updateForm = <Key extends keyof AdminSeatFormState>(
    key: Key,
    value: AdminSeatFormState[Key]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSaveSeat = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isEdit = editor?.mode === 'edit';
    const savedSeat: AdminSeat = {
      id: isEdit ? editor.seat.id : `seat-local-${Date.now()}`,
      roomName: form.roomName,
      code: form.code.trim() || 'NEW-001',
      x: Number(form.x),
      y: Number(form.y),
      hasPower: form.hasPower,
      nearWindow: form.nearWindow,
      quietZone: form.quietZone,
      status: form.status,
      updatedAt: '刚刚'
    };

    setSeats((currentSeats) =>
      isEdit
        ? currentSeats.map((seat) => (seat.id === savedSeat.id ? savedSeat : seat))
        : [...currentSeats, savedSeat]
    );
    setEditor(null);
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
        <button type="button">
          全部自习室
          <DashboardIcon name="chevron-down" size={12} />
        </button>
        <button type="button">
          全部标签
          <DashboardIcon name="chevron-down" size={12} />
        </button>
        <button type="button">
          全部状态
          <DashboardIcon name="chevron-down" size={12} />
        </button>
        <button className="seat-primary-action" type="button" onClick={openCreate}>
          <DashboardIcon name="plus" size={13} />
          新增座位
        </button>
        <button type="button">
          <DashboardIcon name="settings" size={13} />
          批量维护
        </button>
      </div>

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
              <button type="button">
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
                value={form.roomName}
                onChange={(event) => updateForm('roomName', event.target.value)}
              >
                {Array.from(new Set(ADMIN_SEAT_FALLBACKS.map((seat) => seat.roomName))).map(
                  (roomName) => (
                    <option key={roomName} value={roomName}>
                      {roomName}
                    </option>
                  )
                )}
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

            <div className="seat-editor-actions">
              <button type="button" onClick={() => setEditor(null)}>
                取消
              </button>
              <button className="seat-primary-action" type="submit">
                <DashboardIcon name="check" size={13} />
                保存
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function FloorEditorPanel() {
  return (
    <section className="floor-editor-panel" aria-label="座位平面图编辑器">
      <div className="floor-editor-head">
        <div>
          <span>光华楼空间草稿</span>
          <h2>座位平面图编辑器</h2>
          <p>经管自习室 301 · 光华楼 A座 3楼</p>
        </div>
        <div className="floor-editor-head-actions">
          <button type="button">
            <DashboardIcon name="eye" size={13} />
            预览
          </button>
          <button className="floor-primary-action" type="button">
            <DashboardIcon name="check" size={13} />
            保存布局
          </button>
        </div>
      </div>

      <div className="floor-editor-workbench">
        <aside className="floor-toolbar" aria-label="编辑工具">
          {FLOOR_EDITOR_TOOLS.map((tool) => (
            <button
              aria-label={tool.label}
              className={tool.active ? 'is-active' : ''}
              key={tool.label}
              title={tool.label}
              type="button"
            >
              <DashboardIcon name={tool.icon} size={16} />
            </button>
          ))}
          <div className="floor-toolbar-spacer" />
          {FLOOR_EDITOR_SUPPORT_TOOLS.map((tool) => (
            <button aria-label={tool.label} key={tool.label} title={tool.label} type="button">
              <DashboardIcon name={tool.icon} size={15} />
            </button>
          ))}
        </aside>

        <div className="floor-canvas" aria-label="座位平面图画布">
          <div className="floor-canvas-card">
            <div className="floor-entry-label">入 口</div>
            <div className="floor-seat-map">
              {FLOOR_EDITOR_ROWS.map((row, rowIndex) => {
                const rowLabel = String.fromCharCode(65 + rowIndex);
                return (
                  <div className="floor-row-wrap" key={rowLabel}>
                    {rowIndex === 3 && <span className="floor-aisle" aria-label="主通道" />}
                    <div className="floor-row">
                      <span className="floor-row-label">{rowLabel}</span>
                      <div className="floor-seat-group">
                        {row.slice(0, 4).map((status, columnIndex) => (
                          <FloorSeatCell
                            code={`${rowLabel}${columnIndex + 1}`}
                            key={`${rowLabel}-${columnIndex + 1}`}
                            status={status}
                          />
                        ))}
                      </div>
                      <span className="floor-seat-gap" />
                      <div className="floor-seat-group">
                        {row.slice(4).map((status, columnOffset) => (
                          <FloorSeatCell
                            code={`${rowLabel}${columnOffset + 5}`}
                            key={`${rowLabel}-${columnOffset + 5}`}
                            status={status}
                          />
                        ))}
                      </div>
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
          <div className="floor-selected-card">
            <span>已选座位</span>
            <strong>C4</strong>
          </div>
          {[
            ['行', 'C（第3行）'],
            ['列', '4（第4列）'],
            ['朝向', '背窗'],
            ['状态', '正常']
          ].map(([label, value]) => (
            <div className="floor-prop-row" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
          <div className="floor-tag-section">
            <span>标签</span>
            <div className="floor-tag-list">
              {['插座', '安静区', '靠窗', '白板附近'].map((tag, index) => (
                <button className={index < 2 ? 'is-active' : ''} key={tag} type="button">
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="floor-property-actions">
            <button className="floor-primary-action" type="button">
              应用更改
            </button>
            <button className="floor-danger-action" type="button">
              <DashboardIcon name="trash" size={13} />
              删除座位
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function FloorSeatCell({ code, status }: { code: string; status: FloorSeatStatus }) {
  return (
    <button
      aria-label={`${code} ${FLOOR_STATUS_LABELS[status]}`}
      className="floor-seat-cell"
      data-status={status}
      type="button"
    >
      {code}
    </button>
  );
}

function ScheduleManagementPanel() {
  return (
    <section className="schedule-management-panel" aria-label="开放时间管理">
      <div className="schedule-summary-grid" aria-label="开放时间关键指标">
        {SCHEDULE_SUMMARY.map((item) => (
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
            <button className="schedule-primary-action" type="button">
              <DashboardIcon name="check" size={13} />
              保存开放时间
            </button>
          </header>

          <div className="schedule-form-grid">
            <RoomFormField label="自习室">
              <select defaultValue="经管自习室 301">
                <option>经管自习室 301</option>
                <option>计算机学院自习室 B</option>
                <option>图书馆自习区</option>
                <option>逸夫综合区</option>
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
            {[
              ['整点时段', '只允许选择 07:00、08:00 这类整点小时'],
              ['跨天开放', '结束时间早于开始时间时按次日计算'],
              ['未配置时回退默认', '房间没有独立规则时使用全校默认 07:00–22:00']
            ].map(([label, desc], index) => (
              <label className="schedule-option" key={label}>
                <input defaultChecked={index !== 1} type="checkbox" />
                <span>
                  <strong>{label}</strong>
                  <small>{desc}</small>
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
            {[
              ['1', '节假日特殊规则', '闭馆维护、考试周延长等特殊日期优先匹配'],
              ['2', '自习室独立规则', '单个房间的开放时段覆盖全校默认'],
              ['3', '全校默认时段', '未配置时回退默认 07:00–22:00']
            ].map(([order, title, desc]) => (
              <div className="schedule-priority-item" key={title}>
                <span>{order}</span>
                <div>
                  <strong>{title}</strong>
                  <small>{desc}</small>
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
            <button type="button">
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
            {SCHEDULE_RULES.map((rule) => (
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
            <button type="button">
              <DashboardIcon name="refresh" size={13} />
              同步节假日
            </button>
          </header>
          {SCHEDULE_SPECIAL_RULES.map((rule) => (
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

function BookingRecordsPanel() {
  return (
    <section className="booking-records-panel" aria-label="预约记录管理">
      <div className="booking-records-toolbar">
        <label className="booking-records-search">
          <DashboardIcon name="search" size={14} />
          <input aria-label="搜索预约记录" placeholder="学号、姓名、座位编号" />
        </label>
        {ADMIN_BOOKING_FILTERS.map((filter) => (
          <button key={filter} type="button">
            {filter}
            <DashboardIcon name="chevron-down" size={12} />
          </button>
        ))}
        <span className="booking-records-selected">已选 0 条</span>
        <button className="booking-records-danger" type="button">
          <DashboardIcon name="trash" size={13} />
          批量取消
        </button>
      </div>

      <div className="booking-records-layout">
        <section className="dashboard-card booking-records-table-card">
          <header className="booking-records-head">
            <div>
              <span>今日实时同步</span>
              <h2>预约记录管理</h2>
            </div>
            <div className="booking-records-head-actions">
              <button type="button">
                <DashboardIcon name="plus" size={13} />
                代预约
              </button>
              <button type="button">
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
            {ADMIN_BOOKING_RECORDS.map((record) => {
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
                    <button type="button">
                      <DashboardIcon name="eye" size={12} />
                      详情
                    </button>
                    {record.status !== 'violation' && (
                      <button className="is-danger" type="button">
                        <DashboardIcon name="x" size={12} />
                        取消
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="dashboard-card booking-operation-card">
          <header className="booking-records-head">
            <div>
              <span>代操作规则</span>
              <h2>代预约审计</h2>
            </div>
          </header>
          {[
            ['完整校验', '代预约仍遵守开放时间、冲突、时长、权限规则'],
            ['审计留痕', '记录操作者、目标学生、座位与提交结果'],
            ['代取消', '取消预约必须填写原因并写入操作日志']
          ].map(([title, desc], index) => (
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

function ViolationRecordsPanel() {
  return (
    <section className="violation-records-panel" aria-label="违约记录管理">
      <div className="violation-summary-grid" aria-label="违约关键指标">
        {ADMIN_VIOLATION_SUMMARY.map((item) => (
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
          <input aria-label="搜索违约记录" placeholder="学生、学号、预约编号" />
        </label>
        {ADMIN_VIOLATION_FILTERS.map((filter) => (
          <button key={filter} type="button">
            {filter}
            <DashboardIcon name="chevron-down" size={12} />
          </button>
        ))}
        <button className="violation-records-primary" type="button">
          <DashboardIcon name="alert" size={13} />
          处理申诉
        </button>
        <button type="button">
          <DashboardIcon name="download" size={13} />
          导出违约
        </button>
      </div>

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
            {ADMIN_VIOLATION_RECORDS.map((record) => {
              const status = ADMIN_VIOLATION_STATUS_META[record.status];
              return (
                <div className="violation-records-table-row" key={record.id}>
                  <strong>{record.id}</strong>
                  <span>{record.bookingId}</span>
                  <span>{record.student}</span>
                  <span>{record.uid}</span>
                  <span>{record.room}</span>
                  <span>{record.seat}</span>
                  <span>{record.reason}</span>
                  <span>{record.action}</span>
                  <span>{record.occurred}</span>
                  <span>
                    <mark data-variant={status.variant}>{status.label}</mark>
                  </span>
                  <span className="violation-records-actions">
                    <button type="button">
                      <DashboardIcon name="eye" size={12} />
                      详情
                    </button>
                    <button type="button">
                      <DashboardIcon name="edit" size={12} />
                      追加备注
                    </button>
                    {record.status === 'restricted' && (
                      <button className="is-release" type="button">
                        <DashboardIcon name="check-circle" size={12} />
                        解除限制
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="dashboard-card violation-rule-card">
          <header className="violation-records-head">
            <div>
              <span>处理规则</span>
              <h2>签到与违约</h2>
            </div>
          </header>
          {[
            ['开始前 15 分钟提醒', '提醒学生按预约时段到场并准备动态码签到'],
            ['开始后 10 分钟未签到提醒', '仍未签到时再次推送，管理员可在记录中查看'],
            ['开始后 15 分钟自动取消', '释放座位，生成违约记录并进入复核队列'],
            ['连续 3 次违约限制预约', '限制期内仅管理员可人工解除限制']
          ].map(([title, desc], index) => (
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

function DynamicCodePanel() {
  return (
    <section className="dynamic-code-panel" aria-label="动态码管理">
      <div className="dynamic-code-summary-grid" aria-label="动态码关键指标">
        {ADMIN_DYNAMIC_CODE_SUMMARY.map((item) => (
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
          <input aria-label="搜索动态码" placeholder="自习室、签到码、楼栋" />
        </label>
        {ADMIN_DYNAMIC_CODE_FILTERS.map((filter) => (
          <button key={filter} type="button">
            {filter}
            <DashboardIcon name="chevron-down" size={12} />
          </button>
        ))}
        <button className="dynamic-code-primary" type="button">
          <DashboardIcon name="qr" size={13} />
          生成动态码
        </button>
        <button type="button">
          <DashboardIcon name="download" size={13} />
          打印签到码
        </button>
      </div>

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
            {ADMIN_DYNAMIC_CODE_RECORDS.map((record) => {
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
                    <button type="button">
                      <DashboardIcon name="refresh" size={12} />
                      重新生成
                    </button>
                    <button type="button">
                      <DashboardIcon name="download" size={12} />
                      打印
                    </button>
                    <button type="button">
                      <DashboardIcon name="eye" size={12} />
                      查看日志
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="dashboard-card dynamic-code-side-card">
          <header className="dynamic-code-head">
            <div>
              <span>签到码预览</span>
              <h2>经管自习室 301</h2>
            </div>
          </header>
          <div className="dynamic-code-preview">
            <div className="dynamic-code-qr" aria-hidden="true">
              {Array.from({ length: 25 }).map((_, index) => (
                <i key={index} data-on={index % 3 !== 1 || index === 12 ? 'true' : 'false'} />
              ))}
            </div>
            <strong>FD-301-7K2</strong>
            <span>网页动态码 · 小程序二维码</span>
          </div>
          {[
            ['每日 00:00 自动更新', '每间自习室生成当日签到凭证'],
            ['60 秒刷新', '网页动态码按刷新窗口滚动失效'],
            ['截图复用拦截', '同一图片重复提交会进入异常上报'],
            ['操作留痕', '重新生成、打印、查看日志均写入审计']
          ].map(([title, desc]) => (
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

function UserManagementPanel() {
  return (
    <section className="user-management-panel" aria-label="用户管理">
      <div className="user-management-summary-grid" aria-label="用户关键指标">
        {ADMIN_USER_SUMMARY.map((item) => (
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
          <input aria-label="搜索用户" placeholder="姓名、学号、院系" />
        </label>
        {ADMIN_USER_FILTERS.map((filter) => (
          <button key={filter} type="button">
            {filter}
            <DashboardIcon name="chevron-down" size={12} />
          </button>
        ))}
        <button className="user-management-primary" type="button">
          <DashboardIcon name="users" size={13} />
          新增用户
        </button>
        <button type="button">
          <DashboardIcon name="download" size={13} />
          导入名单
        </button>
      </div>

      <div className="user-management-layout">
        <section className="dashboard-card user-management-table-card">
          <header className="user-management-head">
            <div>
              <span>展示最近登录用户</span>
              <h2>账号列表</h2>
            </div>
            <small>学生账号、管理员账号与院系归属统一维护</small>
          </header>

          <div className="user-management-table">
            <div className="user-management-table-head">
              {['姓名', '账号', '院系', '角色', '账号来源', '最近登录', '状态', '操作'].map((head) => (
                <span key={head}>{head}</span>
              ))}
            </div>
            {ADMIN_USER_RECORDS.map((user) => {
              const status = ADMIN_USER_STATUS_META[user.status];
              return (
                <div className="user-management-table-row" key={user.account}>
                  <strong>{user.name}</strong>
                  <code>{user.account}</code>
                  <span>{user.department}</span>
                  <span>{user.role}</span>
                  <span>{user.source}</span>
                  <span>{user.lastLogin}</span>
                  <span>
                    <mark data-variant={status.variant}>{status.label}</mark>
                  </span>
                  <span className="user-management-actions">
                    <button type="button">
                      <DashboardIcon name="shield" size={12} />
                      分配角色
                    </button>
                    <button type="button">
                      <DashboardIcon name="settings" size={12} />
                      重置密码
                    </button>
                    <button className={user.status === 'disabled' ? 'is-enable' : 'is-disable'} type="button">
                      <DashboardIcon name={user.status === 'disabled' ? 'check-circle' : 'x'} size={12} />
                      {user.status === 'disabled' ? '启用' : '停用'}
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="dashboard-card user-management-side-card">
          <header className="user-management-head">
            <div>
              <span>账号规则</span>
              <h2>来源与权限</h2>
            </div>
          </header>
          {[
            ['学工号统一认证同步', '学生账号以统一身份认证信息为准，院系变更自动同步'],
            ['管理员账号需绑定角色', '后台访问范围由角色和菜单权限共同决定'],
            ['菜单级权限由角色权限模块控制', '用户管理只维护账号与角色关系'],
            ['停用账号会阻止登录与预约', '停用后保留历史预约、签到和审计记录']
          ].map(([title, desc], index) => (
            <div className="user-management-rule" key={title}>
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

function RoleManagementPanel() {
  return (
    <section className="role-management-panel" aria-label="角色权限管理">
      <div className="role-management-summary-grid" aria-label="角色权限关键指标">
        {ADMIN_ROLE_SUMMARY.map((item) => (
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
          <input aria-label="搜索角色权限" placeholder="角色名称、权限点、菜单" />
        </label>
        {ADMIN_ROLE_FILTERS.map((filter) => (
          <button key={filter} type="button">
            {filter}
            <DashboardIcon name="chevron-down" size={12} />
          </button>
        ))}
        <button className="role-management-primary" type="button">
          <DashboardIcon name="shield" size={13} />
          新建角色
        </button>
        <button type="button">
          <DashboardIcon name="settings" size={13} />
          分配权限
        </button>
      </div>

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
            {ADMIN_ROLE_RECORDS.map((role) => {
              const status = ADMIN_ROLE_STATUS_META[role.status];
              return (
                <div className="role-management-table-row" key={role.name}>
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
                    <button type="button">
                      <DashboardIcon name="edit" size={12} />
                      编辑权限
                    </button>
                    <button type="button">
                      <DashboardIcon name="plus" size={12} />
                      复制角色
                    </button>
                    <button className="is-disable" type="button">
                      <DashboardIcon name="x" size={12} />
                      禁用
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="dashboard-card role-management-side-card">
          <header className="role-management-head">
            <div>
              <span>菜单级过滤</span>
              <h2>权限分组</h2>
            </div>
          </header>
          {ADMIN_ROLE_PERMISSION_GROUPS.map((group) => (
            <div className="role-permission-group" key={group.group}>
              <strong>{group.group}</strong>
              <div>
                {group.permissions.map((permission) => (
                  <span key={permission}>{permission}</span>
                ))}
              </div>
            </div>
          ))}
          <section className="role-permission-matrix" aria-label="菜单权限矩阵">
            <strong>菜单权限矩阵</strong>
            {ADMIN_ROLE_PERMISSION_MATRIX.map((item) => (
              <div className="role-permission-matrix-row" key={item.title}>
                <span>{item.title}</span>
                <mark>{item.scope}</mark>
                <button type="button">{item.checked}</button>
              </div>
            ))}
          </section>
          {[
            ['RBAC 角色权限模型', '用户只绑定角色，权限点由角色集中维护'],
            ['菜单级过滤', '侧边栏与接口权限同时按角色过滤'],
            ['最小权限原则', '新增角色默认无权限，需逐项勾选'],
            ['审批后生效', '高风险权限调整需复核后发布'],
            ['权限变更需审计留痕', '每次授权、复制、禁用都进入审计日志'],
            ['高风险角色变更需要二次复核', '超级管理员与角色权限调整必须双人确认']
          ].map(([title, desc], index) => (
            <div className="role-management-rule" key={title}>
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

function SystemParameterPanel() {
  return (
    <section className="system-parameter-panel" aria-label="系统参数管理">
      <div className="system-parameter-summary-grid" aria-label="系统参数关键指标">
        {ADMIN_PARAM_SUMMARY.map((item) => (
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
          <input aria-label="搜索系统参数" placeholder="参数名称、取值、适用范围" />
        </label>
        {ADMIN_PARAM_FILTERS.map((filter) => (
          <button key={filter} type="button">
            {filter}
            <DashboardIcon name="chevron-down" size={12} />
          </button>
        ))}
        <button className="system-parameter-primary" type="button">
          <DashboardIcon name="settings" size={13} />
          保存参数
        </button>
        <button type="button">
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
            {ADMIN_PARAM_RECORDS.map((param) => {
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
            {ADMIN_PARAM_TIMELINE.map(([time, title, desc]) => (
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
            {ADMIN_PARAM_SCOPES.map(([scope, desc]) => (
              <div className="system-parameter-scope-item" key={scope}>
                <span>{scope}</span>
                <small>{desc}</small>
              </div>
            ))}
          </section>

          {[
            ['参数变更需审批发布', '待发布变更不会立即影响预约规则'],
            ['配置变更需审计留痕', '保存、恢复默认和发布都会进入审计日志'],
            ['违约策略联动签到记录', '自动取消后同步释放座位并生成违约记录']
          ].map(([title, desc], index) => (
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

function AuditLogPanel() {
  return (
    <section className="audit-log-panel" aria-label="审计日志管理">
      <div className="audit-log-summary-grid" aria-label="审计日志关键指标">
        {ADMIN_AUDIT_SUMMARY.map((item) => (
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
          <input aria-label="搜索审计日志" placeholder="操作者、模块、预约编号" />
        </label>
        {ADMIN_AUDIT_FILTERS.map((filter) => (
          <button key={filter} type="button">
            {filter}
            <DashboardIcon name="chevron-down" size={12} />
          </button>
        ))}
        <button className="audit-log-primary" type="button">
          <DashboardIcon name="eye" size={13} />
          筛选模块
        </button>
        <button type="button">
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
            {ADMIN_AUDIT_RECORDS.map((record) => {
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
            {ADMIN_AUDIT_RISKS.map(([title, meta, desc]) => (
              <div className="audit-risk-item" key={title}>
                <strong>{title}</strong>
                <span>{meta}</span>
                <small>{desc}</small>
              </div>
            ))}
          </div>

          {ADMIN_AUDIT_RULES.map(([title, desc], index) => (
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

function DataReportsPanel() {
  const maxWeeklyBookings = Math.max(...ADMIN_REPORT_WEEKLY_BOOKINGS.map(([, value]) => value), 1);

  return (
    <section className="data-reports-panel" aria-label="数据报表">
      <div className="data-reports-summary-grid" aria-label="数据报表关键指标">
        {ADMIN_REPORT_SUMMARY.map((item) => (
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
        {ADMIN_REPORT_FILTERS.map((filter) => (
          <button key={filter} type="button">
            {filter}
            <DashboardIcon name="chevron-down" size={12} />
          </button>
        ))}
        <button className="data-reports-primary" type="button">
          <DashboardIcon name="download" size={13} />
          导出 CSV
        </button>
        <button type="button">
          <DashboardIcon name="download" size={13} />
          导出 Excel
        </button>
      </div>

      <div className="data-reports-layout">
        <section className="dashboard-card data-reports-chart-card">
          <header className="data-reports-head">
            <div>
              <span>近一周趋势</span>
              <h2>本周每日预约量</h2>
            </div>
            <small>按有效预约统计，暂无数据的日期显示为空柱。</small>
          </header>

          <div className="data-reports-bar-chart" aria-label="本周每日预约量柱状图">
            {ADMIN_REPORT_WEEKLY_BOOKINGS.map(([day, value]) => {
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
          </header>
          <div className="data-reports-room-list">
            {ADMIN_REPORT_TOP_ROOMS.map((room, index) => (
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
            <small>按使用次数和实际使用时长综合排序。</small>
          </header>
          <div className="data-reports-table">
            <div className="data-reports-table-head">
              {['座位', '自习室', '使用次数', '特征'].map((head) => (
                <span key={head}>{head}</span>
              ))}
            </div>
            {ADMIN_REPORT_TOP_SEATS.map(([seat, room, count, feature]) => (
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
            {ADMIN_REPORT_LOW_PERIODS.map(([period, pct, label]) => (
              <div className="data-reports-low-item" key={period}>
                <strong>{period}</strong>
                <span>{pct}</span>
                <small>{label}</small>
              </div>
            ))}
          </div>
          {ADMIN_REPORT_RULES.map(([title, desc], index) => (
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
  studentName,
  initialActive,
  onLogout
}: StudentDashboardProps) {
  const [activeMenu, setActiveMenu] = useState<StudentPageId>(
    () => initialActive ?? resolveInitialStudentMenu()
  );
  const activeNavMenu: StudentMenuId = activeMenu === 'confirm' ? 'select' : activeMenu;

  const handleStudentMenuChange = (nextMenu: StudentMenuId) => {
    setActiveMenu(nextMenu);
    pushAppPath(nextMenu === 'home' ? '/student' : `/student/${nextMenu}`);
  };

  const handleStudentPageChange = (nextPage: StudentPageId) => {
    setActiveMenu(nextPage);
    pushAppPath(nextPage === 'home' ? '/student' : `/student/${nextPage}`);
  };

  const pageTitle =
    activeMenu === 'rooms'
      ? '自习室列表'
      : activeMenu === 'select'
        ? '选座预约'
        : activeMenu === 'confirm'
          ? '确认预约'
          : activeMenu === 'bookings'
            ? '我的预约'
          : '首页概览';
  const pageSubtitle =
    activeMenu === 'rooms'
      ? `共 ${STUDENT_ROOM_LIST.length} 个自习室`
      : activeMenu === 'select'
        ? '光华楼 A座 · 3楼 · 经管自习室 301'
        : activeMenu === 'confirm'
          ? '请仔细核对信息后提交'
          : activeMenu === 'bookings'
            ? '本学期共 18 次预约 · 16 次完成'
          : '2026年5月26日 · 学习空间实时状态';

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
              {group.items.map((item) => (
                <button
                  aria-current={item.id === activeNavMenu ? 'page' : undefined}
                  className={item.id === activeNavMenu ? 'is-active' : ''}
                  key={item.id}
                  onClick={() => handleStudentMenuChange(item.id)}
                  type="button"
                >
                  <DashboardIcon name={item.icon} size={13} />
                  <span>{item.label}</span>
                  {item.badge ? <mark>{item.badge}</mark> : null}
                </button>
              ))}
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
            {activeMenu === 'bookings' ? (
              <>
                <button type="button">
                  <DashboardIcon name="search" size={13} />
                  筛选状态
                </button>
                <button type="button">
                  <DashboardIcon name="download" size={13} />
                  导出记录
                </button>
              </>
            ) : activeMenu === 'confirm' ? (
              <>
                <button type="button" onClick={() => handleStudentPageChange('select')}>
                  <DashboardIcon name="arrow-right" size={13} />
                  返回选座
                </button>
                <button type="button">
                  <DashboardIcon name="refresh" size={13} />
                  重新校验
                </button>
              </>
            ) : activeMenu === 'select' ? (
              <>
                <button type="button">
                  <DashboardIcon name="building" size={13} />
                  切换自习室
                </button>
                <button type="button">
                  <DashboardIcon name="refresh" size={13} />
                  刷新座位
                </button>
              </>
            ) : activeMenu === 'rooms' ? (
              <>
                <button type="button">
                  <DashboardIcon name="search" size={13} />
                  筛选
                </button>
                <button type="button">
                  <DashboardIcon name="grid" size={13} />
                  列表视图
                </button>
              </>
            ) : (
              <>
                <button type="button">
                  <DashboardIcon name="search" size={13} />
                  搜索自习室
                </button>
                <button type="button">
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

        {activeMenu === 'rooms' ? (
          <StudentRoomsPanel />
        ) : activeMenu === 'select' ? (
          <StudentSeatSelectorPanel onConfirm={() => handleStudentPageChange('confirm')} />
        ) : activeMenu === 'confirm' ? (
          <StudentBookingConfirmPanel onBack={() => handleStudentPageChange('select')} />
        ) : activeMenu === 'bookings' ? (
          <StudentBookingsPanel />
        ) : (
          <>
        <section className="student-home-booking-banner" aria-label="下一场预约">
          <span className="student-home-banner-icon">
            <DashboardIcon name="calendar" size={24} />
          </span>
          <div>
            <small>下一场预约</small>
            <h2>光华楼 A座 3楼 · 经管自习室 301 · A15 号座位</h2>
            <p>
              今日 14:00 – 17:00 · 距开始还有 <strong>2小时18分</strong>
            </p>
          </div>
          <div className="student-home-booking-actions">
            <button type="button">立即签到</button>
            <button type="button">取消预约</button>
          </div>
        </section>

        <section className="student-home-stat-grid" aria-label="学习空间关键指标">
          {STUDENT_HOME_STATS.map((stat) => (
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
              <button type="button">
                全部
                <DashboardIcon name="arrow-right" size={12} />
              </button>
            </header>
            <div className="student-home-room-list">
              {STUDENT_RECOMMENDED_ROOMS.map((room) => (
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
                  <button type="button">去预约</button>
                </article>
              ))}
            </div>
          </section>

          <aside className="student-home-side">
            <section>
              <h2>快捷操作</h2>
              <div className="student-home-quick-grid">
                {STUDENT_QUICK_ACTIONS.map((action) => (
                  <button key={action.label} type="button">
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
                {STUDENT_WEEK_RECORDS.map(([day, hours]) => (
                  <div className="student-home-week-item" key={day}>
                    <span style={{ height: `${Math.max(4, (hours / 4) * 52)}px` }} />
                    <small>{day}</small>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
          </>
        )}
      </section>
    </main>
  );
}

function StudentRoomsPanel() {
  return (
    <section className="student-rooms-panel" aria-label="学生自习室列表">
      <div className="student-rooms-filterbar">
        <div className="student-rooms-filterchips">
          {STUDENT_ROOM_FILTERS.map((filter, index) => (
            <button className={index === 0 ? 'is-active' : ''} key={filter} type="button">
              {filter}
            </button>
          ))}
        </div>
        <span>今日 08:00 – 22:00 · 明日可预约</span>
      </div>

      <div className="student-rooms-grid">
        {STUDENT_ROOM_LIST.map((room) => {
          const status = STUDENT_ROOM_STATUS_META[room.status];
          const occupiedPercent = Math.round(((room.capacity - room.available) / room.capacity) * 100);

          return (
            <article className="dashboard-card student-room-card" key={room.name}>
              <header>
                <span className="student-room-icon">
                  <DashboardIcon name="building" size={20} />
                </span>
                <mark data-variant={status.variant}>{status.label}</mark>
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
                <button className={room.status === 'full' ? 'is-waitlist' : ''} type="button">
                  {room.status === 'full' ? '加入候补' : '立即预约'}
                </button>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function StudentSeatSelectorPanel({ onConfirm }: { onConfirm?: () => void }) {
  return (
    <section className="student-seat-selector-panel" aria-label="学生选座预约">
      <aside className="student-seat-filter-panel">
        <h2>筛选条件</h2>

        <div className="student-seat-filter-section">
          <h3>日期</h3>
          <div className="student-seat-segment" aria-label="日期">
            {STUDENT_SEAT_DATES.map((date, index) => (
              <button className={index === 0 ? 'is-active' : ''} key={date} type="button">
                {date}
              </button>
            ))}
          </div>
        </div>

        <div className="student-seat-filter-section">
          <h3>时间段</h3>
          <div className="student-seat-time-grid">
            {[
              ['开始', '14:00'],
              ['结束', '17:00']
            ].map(([label, value], index) => (
              <div key={label}>
                <span>{label}</span>
                <button className={index === 0 ? 'is-active' : ''} type="button">
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
            {STUDENT_SEAT_BUILDINGS.map((building, index) => (
              <button className={index === 0 ? 'is-active' : ''} key={building} type="button">
                <i>{index === 0 ? <DashboardIcon name="check" size={9} /> : null}</i>
                <span>{building}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="student-seat-filter-section">
          <h3>座位属性</h3>
          <div className="student-seat-feature-list">
            {STUDENT_SEAT_FEATURES.map((feature, index) => (
              <button className={index < 2 ? 'is-active' : ''} key={feature} type="button">
                {feature}
              </button>
            ))}
          </div>
        </div>

        <div className="student-seat-filter-actions">
          <button type="button">应用筛选</button>
          <button type="button">重置条件</button>
        </div>
      </aside>

      <div className="student-seat-floor-panel">
        <header className="student-seat-floor-head">
          <div>
            <strong>经管自习室 301</strong>
            <mark>开放中</mark>
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

          <div className="student-seat-grid" aria-label="经管自习室 301 座位图">
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
                    {row.slice(0, 4).map((status, colIndex) => (
                      <StudentSeatCell
                        key={getStudentSeatNumber(rowIndex, colIndex)}
                        seatNo={getStudentSeatNumber(rowIndex, colIndex)}
                        status={status}
                      />
                    ))}
                  </div>
                  <span className="student-seat-row-gap" />
                  <div className="student-seat-row-side">
                    {row.slice(4).map((status, colIndex) => {
                      const actualColIndex = colIndex + 4;

                      return (
                        <StudentSeatCell
                          key={getStudentSeatNumber(rowIndex, actualColIndex)}
                          seatNo={getStudentSeatNumber(rowIndex, actualColIndex)}
                          status={status}
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
          <span>共 56 个座位 · 12 空余 · 今日已预约 38 场次</span>
        </div>
      </div>

      <aside className="student-seat-booking-panel">
        <h2>预约信息</h2>

        <div className="student-seat-selected-card">
          <small>已选座位</small>
          <strong>C3</strong>
          <span>经管自习室 301 · C排3号</span>
          <div>
            <mark>插座</mark>
            <mark>安静区</mark>
          </div>
        </div>

        <dl className="student-seat-booking-summary">
          {[
            ['日期', '2026年4月24日（周四）'],
            ['时间', '14:00 – 17:00（3小时）'],
            ['楼栋', '光华楼 A座 3楼']
          ].map(([label, value]) => (
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

        <button className="student-seat-primary-action" type="button" onClick={onConfirm}>
          确认预约
        </button>
        <button className="student-seat-secondary-action" type="button">
          收藏该座位
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

function StudentBookingConfirmPanel({ onBack }: { onBack?: () => void }) {
  return (
    <section className="student-booking-confirm-panel" aria-label="学生确认预约">
      <div className="student-booking-confirm-inner">
        <ol className="student-booking-stepper" aria-label="预约步骤">
          {STUDENT_BOOKING_CONFIRM_STEPS.map((step, index) => (
            <li className={index < 3 ? 'is-done' : ''} key={step}>
              <span>{index < 2 ? <DashboardIcon name="check" size={13} /> : index + 1}</span>
              <strong>{step}</strong>
            </li>
          ))}
        </ol>

        <article className="dashboard-card student-booking-confirm-card">
          <header>
            <DashboardIcon name="calendar" size={16} />
            <h2>预约详情</h2>
          </header>
          <dl className="student-booking-detail-grid">
            {STUDENT_BOOKING_CONFIRM_DETAILS.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
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
            {STUDENT_REMINDER_OPTIONS.map((option, index) => (
              <button className={index === 0 ? 'is-active' : ''} key={option} type="button">
                {option}
              </button>
            ))}
          </div>
        </article>

        <div className="student-booking-confirm-actions">
          <button type="button" onClick={onBack}>
            返回修改
          </button>
          <button type="button">确认提交预约</button>
        </div>
      </div>
    </section>
  );
}

function StudentBookingsPanel() {
  return (
    <section className="student-bookings-panel" aria-label="学生我的预约">
      <div className="student-booking-filter-tabs">
        {STUDENT_BOOKING_FILTERS.map((filter, index) => (
          <button className={index === 0 ? 'is-active' : ''} key={filter} type="button">
            {filter}
          </button>
        ))}
      </div>

      <div className="student-booking-timeline">
        {STUDENT_BOOKING_LIST.map((booking) => {
          const status = STUDENT_BOOKING_STATUS_META[booking.status];

          return (
            <article className="student-booking-timeline-item" key={`${booking.seat}-${booking.time}`}>
              <span className="student-booking-dot" data-status={booking.status}>
                <DashboardIcon name={status.icon} size={16} />
              </span>

              <div className="dashboard-card student-booking-card">
                <div className="student-booking-card-main">
                  <div>
                    <header>
                      <strong>{booking.seat}</strong>
                      <h2>{booking.room}</h2>
                      <mark data-variant={status.variant}>{status.label}</mark>
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
                        <button className="is-primary" type="button">
                          立即签到
                        </button>
                        <button type="button">取消</button>
                      </>
                    ) : null}
                    {booking.status === 'completed' ? (
                      <button type="button">再次预约</button>
                    ) : null}
                    {booking.status === 'violation' ? (
                      <button type="button">
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
    </section>
  );
}

function StudentSeatCell({
  seatNo,
  status
}: {
  seatNo: string;
  status: StudentSeatStatus;
}) {
  const disabled = status === 'taken' || status === 'disabled';

  return (
    <button
      aria-label={`${seatNo} ${STUDENT_SEAT_STATUS_LABELS[status]}`}
      className="student-seat-cell"
      data-status={status}
      disabled={disabled}
      type="button"
    >
      <span>{seatNo}</span>
      {status === 'available' || status === 'selected' ? <small>插</small> : null}
    </button>
  );
}
