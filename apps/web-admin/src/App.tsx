import type { CSSProperties, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { F } from '@ibooking/design-tokens';

type EntryKind = 'student' | 'admin';

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

const AUTH_REMEMBER_KEY = 'ibooking.auth.remember';
const ADMIN_ACCESS_TOKEN_KEY = 'ibooking.admin.accessToken';
const STUDENT_ACCESS_TOKEN_KEY = 'ibooking.student.accessToken';
const PASSWORD_ICON_PATH = 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z';

const ENTRY_PRESETS: Record<EntryKind, { account: string; password: string }> = {
  student: { account: 'stu_cse_01', password: 'Pass123!' },
  admin: { account: 'admin_full', password: 'Admin123!' }
};

const getApiBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

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
      const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/${entry}-login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          entry === 'admin'
            ? { username: account.trim(), password }
            : { studentId: account.trim(), password }
        )
      });
      const payload = (await response.json().catch(() => null)) as LoginPayload | null;
      if (!response.ok || payload?.code !== 'SUCCESS' || !payload.data) {
        throw new Error(payload?.message || '登录失败，请稍后重试');
      }

      localStorage.setItem(AUTH_REMEMBER_KEY, remember ? '1' : '0');
      localStorage.setItem(
        entry === 'admin' ? ADMIN_ACCESS_TOKEN_KEY : STUDENT_ACCESS_TOKEN_KEY,
        payload.data.accessToken
      );
      setSession({ kind: entry, name: payload.data.user.name });
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
  onLogout?: () => void;
};

export function AdminDashboard({ adminName, onLogout }: DashboardProps) {
  return (
    <main className="admin-dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="brand-seal">旦</div>
          <div>
            <strong>复旦大学</strong>
            <span>自习室预约管理</span>
          </div>
        </div>
        <nav className="dashboard-nav" aria-label="管理菜单">
          <button className="is-active" type="button">
            管理仪表盘
          </button>
          <button type="button">自习室管理</button>
          <button type="button">预约记录</button>
          <button type="button">角色与权限</button>
        </nav>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h1>管理仪表盘</h1>
            <p>今日自习室开放状态与预约运行概览</p>
          </div>
          <div className="dashboard-user">
            <span>{adminName}</span>
            <button type="button" onClick={onLogout}>
              退出登录
            </button>
          </div>
        </header>

        <section className="metric-grid" aria-label="自习室运行概览">
          <article>
            <span>开放自习室</span>
            <strong>42</strong>
            <small>6 间维护中</small>
          </article>
          <article>
            <span>当前预约</span>
            <strong>1,247</strong>
            <small>较昨日 +8%</small>
          </article>
          <article>
            <span>签到完成率</span>
            <strong>92%</strong>
            <small>15 分钟内完成</small>
          </article>
        </section>

        <section className="dashboard-panel">
          <div>
            <h2>自习室运行概览</h2>
            <p>光华楼、二教、江湾图书馆等主要空间运行正常。</p>
          </div>
          <button type="button">查看自习室</button>
        </section>
      </section>
    </main>
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
