import type { CSSProperties, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { F } from '@ibooking/design-tokens';

export type EntryKind = 'student' | 'admin';

type Feedback = {
  type: 'success' | 'error';
  text: string;
};

type SessionView = {
  kind: EntryKind;
  name: string;
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
    roles?: Array<{ name: string; code: string }>;
  };
};

type ApiRuntimeEnv = {
  VITE_API_BASE_URL?: string;
  PROD?: boolean;
};

type LoginRequestInput = {
  entry: EntryKind;
  account: string;
  password: string;
};

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
  const response = await fetcher(`${apiBaseUrl}/api/v1/auth/${input.entry}-login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      input.entry === 'admin'
        ? { username: input.account.trim(), password: input.password }
        : { studentId: input.account.trim(), password: input.password }
    )
  });
  const payload = (await response.json().catch(() => null)) as LoginPayload | null;
  if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
    throw new Error(payload?.message || '登录失败，请稍后重试');
  }

  return payload.data;
};

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
  users:
    'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 7a4 4 0 100 8 4 4 0 000-8z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  settings:
    'M12 15a3 3 0 100-6 3 3 0 000 6z M12 2v2 M12 20v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M2 12h2 M20 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z',
  download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  refresh: 'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15',
  'check-circle': 'M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3',
  'arrow-right': 'M5 12h14 M12 5l7 7-7 7'
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
  const [entry, setEntry] = useState<EntryKind>('admin');
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
    setAccount(ENTRY_PRESETS[entry].account);
    setPassword(ENTRY_PRESETS[entry].password);
    setFeedback(null);
  }, [entry]);

  const handleEntryChange = (nextEntry: EntryKind) => {
    setEntry(nextEntry);
    setLoginMode('password');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const loginSession = await requestLogin({ entry, account, password });

      localStorage.setItem(AUTH_REMEMBER_KEY, remember ? '1' : '0');
      localStorage.setItem(
        entry === 'admin' ? ADMIN_ACCESS_TOKEN_KEY : STUDENT_ACCESS_TOKEN_KEY,
        loginSession.accessToken
      );
      setSession({ kind: entry, name: loginSession.user.name });
      pushAppPath(entry === 'admin' ? '/dashboard' : '/student');
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
    return <AdminDashboard adminName={session.name} onLogout={handleLogout} />;
  }

  if (session?.kind === 'student') {
    return <StudentHomePreview studentName={session.name} onLogout={handleLogout} />;
  }

  const accountLabel = entry === 'admin' ? '管理员账号' : '学号';
  const accountPlaceholder = entry === 'admin' ? '请输入管理员账号' : '请输入学号';
  const loginHint =
    entry === 'admin' ? '请使用复旦校园管理账号登录' : '请使用复旦校园账号登录';

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

      <section className="admin-form-panel" aria-label="管理端登录">
        <span className="form-blob form-blob-primary" />
        <span className="form-blob form-blob-gold" />
        <div className="login-card">
          <div className="login-title">
            <h2>欢迎登录</h2>
            <p>{loginHint}</p>
          </div>

          <div className="entry-switch" aria-label="入口切换">
            <button
              className={entry === 'student' ? 'entry-option is-active' : 'entry-option'}
              type="button"
              onClick={() => handleEntryChange('student')}
            >
              学生入口
            </button>
            <button
              className={entry === 'admin' ? 'entry-option is-active' : 'entry-option'}
              type="button"
              onClick={() => handleEntryChange('admin')}
            >
              管理入口
            </button>
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
                <span>{accountLabel}</span>
                <div className="input-shell">
                  <FieldIcon type="account" />
                  <input
                    autoComplete="username"
                    value={account}
                    onChange={(event) => setAccount(event.target.value)}
                    placeholder={accountPlaceholder}
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
              <p>前往 passport.fudan.edu.cn 完成{entry === 'admin' ? '管理端' : '学生端'}统一身份认证</p>
            </div>
          )}

          <div className="agreement">登录即代表同意《自习室使用规则》与《数据隐私声明》</div>
        </div>
      </section>
    </main>
  );
}

type DashboardProps = {
  adminName: string;
  initialActive?: AdminMenuId;
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

type AdminMenuAction = {
  label: string;
  icon: DashboardIconName;
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
      { label: '新增自习室', icon: 'building' },
      { label: '资源状态同步', icon: 'refresh' }
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
      { label: '新增座位', icon: 'grid' },
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
    title: '平面图编辑器',
    sub: '3 个楼层草稿待发布',
    description: '调整座位坐标、通道、门窗和插座图层，发布后同步到学生端选座图。',
    actions: [
      { label: '保存草稿', icon: 'download' },
      { label: '发布平面图', icon: 'move' }
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
    title: '开放时间',
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
    title: '预约记录',
    sub: '共 1,247 条记录（今日）',
    description: '查询预约、签到、取消与超时记录，支持按学生、自习室和时段筛选。',
    actions: [
      { label: '筛选记录', icon: 'settings' },
      { label: '导出记录', icon: 'download' }
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
    title: '违约记录',
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
    title: '角色权限',
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
    title: '系统参数',
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
    title: '审计日志',
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
      { label: '生成报表', icon: 'chart' },
      { label: '下载月报', icon: 'download' }
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

const resolveInitialAdminMenu = (): AdminMenuId => {
  if (typeof window === 'undefined') {
    return 'dashboard';
  }

  const [, section] = window.location.pathname.match(/^\/dashboard\/([^/]+)/) ?? [];
  return isAdminMenuId(section) ? section : 'dashboard';
};

export function AdminDashboard({ adminName, initialActive, onLogout }: DashboardProps) {
  const [activeMenu, setActiveMenu] = useState<AdminMenuId>(
    () => initialActive ?? resolveInitialAdminMenu()
  );
  const activeMeta = ADMIN_MENU_META[activeMenu];

  const handleMenuChange = (nextMenu: AdminMenuId) => {
    setActiveMenu(nextMenu);
    pushAppPath(nextMenu === 'dashboard' ? '/dashboard' : `/dashboard/${nextMenu}`);
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
              <button className="dashboard-secondary-button" key={action.label} type="button">
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

        {activeMenu === 'dashboard' ? <DashboardOverview /> : <AdminModulePanel meta={activeMeta} />}
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

function StudentHomePreview({
  studentName,
  onLogout
}: {
  studentName: string;
  onLogout?: () => void;
}) {
  return (
    <main className="student-preview-page">
      <section className="student-preview-card">
        <div className="brand-seal">旦</div>
        <h1>学生首页</h1>
        <p>{studentName}，欢迎使用复旦大学自习室预约系统。</p>
        <div className="student-actions">
          <button type="button">查看自习室</button>
          <button type="button">我的预约</button>
          <button type="button" onClick={onLogout}>
            退出登录
          </button>
        </div>
      </section>
    </main>
  );
}
