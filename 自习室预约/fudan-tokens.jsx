// Fudan University Study Room System — Design Tokens & Shared Primitives
// All components exported to window for cross-script sharing

const F = {
  // ── Teal-Green / 青色 Palette ──────────────────────
  navy: '#2D7A6E',          // primary: teal/cyan-green
  navyDeep: '#1A3830',      // deep teal dark (sidebar bg)
  navyMid: '#3D8C7E',       // mid teal
  navyLight: '#EBF6F4',     // tinted light bg
  gold: '#D4A843',          // warm gold accent
  goldLight: '#FDF6E0',
  goldDark: '#8B6520',
  bg: '#F2F7F6',            // cool off-white canvas
  white: '#FAFEFE',         // slightly cool white
  t1: '#1A2E2A',            // deep teal-tinted dark text
  t2: '#4A6B64',            // medium muted teal text
  t3: '#8AAAA4',            // muted teal-gray
  t4: '#C8D8D5',            // very light teal border
  green: '#2D9A5C',
  greenBg: '#F0FAF4',
  greenMid: '#7DC4A0',
  red: '#C84040',
  redBg: '#FEF2F2',
  amber: '#C8820A',
  amberBg: '#FFF8E8',
  blue: '#3A6FA8',
  blueBg: '#EEF3FB',
  purple: '#7A52A8',
  purpleBg: '#F6F2FC',
  border: '#D8E8E5',
  borderLight: '#ECF4F2',
  shadow: '0 1px 4px rgba(26,56,48,0.07), 0 4px 16px rgba(26,56,48,0.05)',
  shadowMd: '0 4px 24px rgba(26,56,48,0.10)',
  shadowLg: '0 8px 40px rgba(26,56,48,0.14)',
  glass: 'rgba(250,254,254,0.72)',
  glassBorder: 'rgba(250,254,254,0.35)',
  glassDark: 'rgba(26,56,48,0.55)',
};

// ── Icon ─────────────────────────────────────────────
const PATHS = {
  home: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  building: 'M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18 M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2 M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  calendar: 'M8 2v3 M16 2v3 M3 9h18 M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z M8 13h.01 M12 13h.01 M16 13h.01 M8 17h.01',
  bell: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6z M12 2v2 M12 20v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M2 12h2 M20 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42',
  chart: 'M18 20V10 M12 20V4 M6 20v-6',
  'bar-chart': 'M12 2v20 M2 12h20',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 7a4 4 0 100 8 4 4 0 000-8z',
  'check-circle': 'M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3',
  check: 'M20 6L9 17l-5-5',
  x: 'M18 6L6 18 M6 6l12 12',
  plus: 'M12 5v14 M5 12h14',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  trash: 'M3 6h18 M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6 M10 11v6 M14 11v6 M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2',
  alert: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
  pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 7a3 3 0 100 6 3 3 0 000-6z',
  clock: 'M12 2a10 10 0 100 20A10 10 0 0012 2z M12 6v6l4 2',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  message: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  qr: 'M3 3h6v6H3z M15 3h6v6h-6z M3 15h6v6H3z M15 15h.01 M19 15h.01 M15 19h.01 M19 19h.01 M17 15v4',
  zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  log: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z',
  refresh: 'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15',
  'arrow-right': 'M5 12h14 M12 5l7 7-7 7',
  'chevron-down': 'M6 9l6 6 6-6',
  'chevron-right': 'M9 18l6-6-6-6',
  'chevron-left': 'M15 18l-6-6 6-6',
  wifi: 'M5 12.55a11 11 0 0114.08 0 M1.42 9a16 16 0 0121.16 0 M8.53 16.11a6 6 0 016.95 0 M12 20h.01',
  send: 'M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z',
  mic: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z M19 10v2a7 7 0 01-14 0v-2 M12 19v4 M8 23h8',
  scan: 'M3 7V5a2 2 0 012-2h2 M17 3h2a2 2 0 012 2v2 M21 17v2a2 2 0 01-2 2h-2 M7 21H5a2 2 0 01-2-2v-2 M7 8h10 M7 12h10 M7 16h5',
  list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
  'more-v': 'M12 5h.01 M12 12h.01 M12 19h.01',
  table: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
  info: 'M12 2a10 10 0 100 20A10 10 0 0012 2z M12 16v-4 M12 8h.01',
  move: 'M5 9l-3 3 3 3 M9 5l3-3 3 3 M15 19l-3 3-3-3 M19 9l3 3-3 3 M2 12h20 M12 2v20',
  grid2: 'M3 3h8v8H3z M13 3h8v8h-8z M3 13h8v8H3z M13 13h8v8h-8z',
  power: 'M18.36 6.64a9 9 0 11-12.73 0 M12 2v10',
  trend: 'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6',
};

const Icon = ({ name, size = 16, color = 'currentColor', sw = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, display: 'block' }}>
    {(PATHS[name] || '').split(' M ').map((seg, i) => (
      <path key={i} d={i === 0 ? seg : 'M ' + seg} />
    ))}
  </svg>
);

// ── Primitives ────────────────────────────────────────
const Badge = ({ children, variant = 'blue', dot }) => {
  const vs = {
    blue: { bg: F.blueBg, color: F.blue, border: '#BFDBFE' },
    green: { bg: F.greenBg, color: F.green, border: '#BBF7D0' },
    red: { bg: F.redBg, color: F.red, border: '#FECACA' },
    amber: { bg: F.amberBg, color: F.amber, border: '#FDE68A' },
    gray: { bg: F.borderLight, color: F.t2, border: F.border },
    navy: { bg: F.navyLight, color: F.navy, border: '#C7D7F0' },
    gold: { bg: F.goldLight, color: F.goldDark, border: '#F0DC9C' },
    purple: { bg: F.purpleBg, color: F.purple, border: '#DDD6FE' },
  };
  const v = vs[variant] || vs.blue;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: 0.2,
      background: v.bg, color: v.color, border: `1px solid ${v.border}`,
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: v.color, flexShrink: 0 }} />}
      {children}
    </span>
  );
};

const Btn = ({ children, variant = 'primary', size = 'md', icon, iconRight, style: sx }) => {
  const vs = {
    primary: { bg: F.navy, color: '#fff', border: F.navy },
    secondary: { bg: F.white, color: F.navy, border: F.border },
    gold: { bg: F.gold, color: '#fff', border: F.gold },
    ghost: { bg: 'transparent', color: F.t2, border: 'transparent' },
    danger: { bg: F.red, color: '#fff', border: F.red },
    outline: { bg: 'transparent', color: F.navy, border: F.navy },
  };
  const ss = {
    xs: { padding: '4px 10px', fontSize: 11 },
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '9px 18px', fontSize: 13 },
    lg: { padding: '12px 24px', fontSize: 14 },
  };
  const v = vs[variant] || vs.primary;
  const s = ss[size] || ss.md;
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: s.padding, fontSize: s.fontSize, fontWeight: 600,
      borderRadius: 8, background: v.bg, color: v.color,
      border: `1.5px solid ${v.border}`, cursor: 'pointer',
      fontFamily: 'inherit', letterSpacing: 0.1, whiteSpace: 'nowrap',
      transition: 'all 0.15s', ...sx,
    }}>
      {icon && <Icon name={icon} size={13} color={v.color} />}
      {children}
      {iconRight && <Icon name={iconRight} size={13} color={v.color} />}
    </button>
  );
};

const Card = ({ children, style: sx, p = 20 }) => (
  <div style={{
    background: F.white, borderRadius: 14,
    border: `1px solid ${F.border}`, boxShadow: F.shadow,
    padding: p, ...sx,
  }}>
    {children}
  </div>
);

const Divider = ({ style: sx }) => (
  <div style={{ height: 1, background: F.border, ...sx }} />
);

const Avatar = ({ name, size = 32, bg }) => {
  const char = name ? name.charAt(0) : '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg || F.navyMid,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#fff', flexShrink: 0,
    }}>{char}</div>
  );
};

// ── Sidebar: Student ──────────────────────────────────
const StudentSidebar = ({ active = 'home' }) => {
  const items = [
    { id: 'home', label: '首页概览', icon: 'home' },
    { id: 'rooms', label: '自习室列表', icon: 'building' },
    { id: 'select', label: '选座预约', icon: 'grid' },
    { id: 'bookings', label: '我的预约', icon: 'calendar' },
    { id: 'checkin', label: '签到', icon: 'check-circle' },
    { id: 'assistant', label: '智能助手', icon: 'zap' },
    { id: 'notify', label: '通知中心', icon: 'bell', badge: 3 },
    { id: 'violation', label: '违约记录', icon: 'alert' },
    { id: 'settings', label: '偏好设置', icon: 'settings' },
  ];
  return (
    <div style={{
      width: 216, background: F.navyDeep, height: '100%',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: `linear-gradient(135deg, ${F.gold} 0%, #e8c060 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, fontWeight: 900, color: F.navyDeep,
          }}>旦</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>复旦大学</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.8, marginTop: 1 }}>自习预约系统</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
        {items.map(item => {
          const active_ = item.id === active;
          return (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 8, marginBottom: 1,
              background: active_ ? 'rgba(201,168,64,0.13)' : 'transparent',
              borderLeft: active_ ? `3px solid ${F.gold}` : '3px solid transparent',
              cursor: 'pointer',
            }}>
              <Icon name={item.icon} size={14} color={active_ ? F.gold : 'rgba(255,255,255,0.42)'} />
              <span style={{ fontSize: 12.5, color: active_ ? F.gold : 'rgba(255,255,255,0.6)', fontWeight: active_ ? 600 : 400, flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  background: F.red, color: '#fff', borderRadius: 10,
                  padding: '1px 5px', fontSize: 9.5, fontWeight: 700,
                }}>{item.badge}</span>
              )}
            </div>
          );
        })}
      </nav>
      <div style={{
        padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 9,
      }}>
        <Avatar name="林" size={30} bg={F.navyMid} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>林晓明</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>21307001 · 计算机学院</div>
        </div>
      </div>
    </div>
  );
};

// ── Sidebar: Admin ────────────────────────────────────
const AdminSidebar = ({ active = 'dashboard' }) => {
  const groups = [
    { label: '概览', items: [{ id: 'dashboard', label: '管理仪表盘', icon: 'chart' }] },
    { label: '空间管理', items: [
      { id: 'rooms', label: '自习室管理', icon: 'building' },
      { id: 'seats', label: '座位管理', icon: 'grid' },
      { id: 'editor', label: '平面图编辑器', icon: 'move' },
      { id: 'schedule', label: '开放时间', icon: 'calendar' },
    ]},
    { label: '运营管理', items: [
      { id: 'bookings', label: '预约记录', icon: 'log' },
      { id: 'violations', label: '违约记录', icon: 'alert' },
      { id: 'qrcode', label: '动态码管理', icon: 'qr' },
    ]},
    { label: '系统与权限', items: [
      { id: 'users', label: '用户管理', icon: 'users' },
      { id: 'roles', label: '角色权限', icon: 'shield' },
      { id: 'params', label: '系统参数', icon: 'settings' },
      { id: 'audit', label: '审计日志', icon: 'eye' },
      { id: 'reports', label: '数据报表', icon: 'download' },
    ]},
  ];
  return (
    <div style={{ width: 224, background: '#142E28', height: '100%', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '18px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 7,
            background: `linear-gradient(135deg, ${F.gold}, #e8c060)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 900, color: '#080E1D',
          }}>旦</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>复旦自习系统</div>
            <span style={{
              display: 'inline-block', marginTop: 3,
              background: 'rgba(201,168,64,0.18)', color: F.gold,
              borderRadius: 4, padding: '1px 6px', fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
            }}>管理后台</span>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '6px 8px', overflowY: 'auto' }}>
        {groups.map(g => (
          <div key={g.label} style={{ marginBottom: 2 }}>
            <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.22)', fontWeight: 700, letterSpacing: 1.2, padding: '8px 6px 3px', textTransform: 'uppercase' }}>{g.label}</div>
            {g.items.map(item => {
              const active_ = item.id === active;
              return (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '6px 8px', borderRadius: 6, marginBottom: 1,
                  background: active_ ? 'rgba(0,48,135,0.5)' : 'transparent',
                  cursor: 'pointer',
                }}>
                  <Icon name={item.icon} size={13} color={active_ ? F.gold : 'rgba(255,255,255,0.38)'} />
                  <span style={{ fontSize: 12, color: active_ ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: active_ ? 600 : 400 }}>{item.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </nav>
      <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar name="王" size={28} bg={F.navy} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>王建华</div>
          <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.32)', marginTop: 1 }}>超级管理员</div>
        </div>
      </div>
    </div>
  );
};

// ── TopBar ────────────────────────────────────────────
const TopBar = ({ title, sub, actions, admin }) => (
  <div style={{
    height: 58, background: F.white,
    borderBottom: `1px solid ${F.border}`,
    display: 'flex', alignItems: 'center',
    padding: '0 26px', flexShrink: 0, gap: 12,
  }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 15.5, fontWeight: 700, color: F.t1 }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: F.t3, marginTop: 1 }}>{sub}</div>}
    </div>
    {!admin && (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 12px', borderRadius: 8, background: F.borderLight,
        fontSize: 12, color: F.t3,
      }}>
        <Icon name="search" size={13} color={F.t3} />
        搜索座位、自习室…
      </div>
    )}
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {actions}
      <div style={{
        width: 34, height: 34, borderRadius: 8, background: F.borderLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', cursor: 'pointer',
      }}>
        <Icon name="bell" size={16} color={F.t2} />
        <span style={{
          position: 'absolute', top: 6, right: 6, width: 7, height: 7,
          background: F.red, borderRadius: '50%', border: '1.5px solid #fff',
        }} />
      </div>
      <Avatar name="林" size={34} bg={admin ? F.navy : F.navyMid} />
    </div>
  </div>
);

// ── PageLayout ────────────────────────────────────────
const PageLayout = ({ sidebar, topbar, children, noPad }) => (
  <div style={{
    display: 'flex', width: '100%', height: '100%',
    background: F.bg, overflow: 'hidden',
    fontFamily: "'Noto Sans SC', 'Inter', sans-serif",
  }}>
    {sidebar}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
      {topbar}
      <div style={{ flex: 1, overflow: 'auto', padding: noPad ? 0 : 22 }}>
        {children}
      </div>
    </div>
  </div>
);

// ── Mobile shared ─────────────────────────────────────
const MobileStatusBar = ({ time = '9:41', light }) => (
  <div style={{
    height: 44, display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '0 22px',
    flexShrink: 0,
  }}>
    <div style={{ fontSize: 14, fontWeight: 700, color: light ? '#fff' : F.t1 }}>{time}</div>
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      <Icon name="wifi" size={13} color={light ? '#fff' : F.t1} />
      <div style={{
        width: 23, height: 11, borderRadius: 3,
        border: `1.5px solid ${light ? 'rgba(255,255,255,0.8)' : F.t1}`,
        display: 'flex', alignItems: 'center', padding: '0 2px', position: 'relative',
      }}>
        <div style={{ width: '75%', height: 5, borderRadius: 1.5, background: light ? '#fff' : F.green }} />
        <div style={{
          position: 'absolute', right: -4, width: 3, height: 5, borderRadius: '0 2px 2px 0',
          background: light ? 'rgba(255,255,255,0.7)' : F.t1,
        }} />
      </div>
    </div>
  </div>
);

const MobileTabBar = ({ active = 'home' }) => {
  const tabs = [
    { id: 'home', label: '首页', icon: 'home' },
    { id: 'select', label: '选座', icon: 'grid' },
    { id: 'bookings', label: '预约', icon: 'calendar' },
    { id: 'assistant', label: '助手', icon: 'zap' },
    { id: 'me', label: '我的', icon: 'user' },
  ];
  return (
    <div style={{
      height: 80, background: F.white, borderTop: `1px solid ${F.border}`,
      display: 'flex', alignItems: 'flex-start', padding: '8px 0 0', flexShrink: 0,
    }}>
      {tabs.map(tab => {
        const active_ = tab.id === active;
        return (
          <div key={tab.id} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3, cursor: 'pointer', position: 'relative',
          }}>
            {active_ && (
              <div style={{
                position: 'absolute', top: -8, width: 24, height: 2.5,
                background: F.navy, borderRadius: 2,
              }} />
            )}
            <Icon name={tab.icon} size={22} color={active_ ? F.navy : F.t3} />
            <span style={{ fontSize: 10, color: active_ ? F.navy : F.t3, fontWeight: active_ ? 600 : 400 }}>{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── Seat cell components ──────────────────────────────
const SeatCell = ({ status = 'available', num }) => {
  const cs = {
    available: { bg: '#F0FDF4', border: '#86EFAC', color: F.green },
    taken: { bg: F.borderLight, border: F.t4, color: F.t4 },
    selected: { bg: F.navy, border: F.navy, color: '#fff' },
    mine: { bg: F.goldLight, border: F.gold, color: F.goldDark },
    disabled: { bg: '#F9FAFB', border: '#E5E7EB', color: '#D1D5DB' },
    window: { bg: '#F0F9FF', border: '#7DD3FC', color: '#0369A1' },
  };
  const c = cs[status] || cs.available;
  return (
    <div style={{
      width: 34, height: 32, borderRadius: 5,
      background: c.bg, border: `1.5px solid ${c.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 9, fontWeight: 600, color: c.color,
      cursor: 'pointer', flexShrink: 0, transition: 'all 0.12s',
    }}>{num}</div>
  );
};

const SmallSeat = ({ status = 'available' }) => {
  const cs = {
    available: { bg: '#F0FDF4', border: '#86EFAC' },
    taken: { bg: '#F3F4F6', border: '#D1D5DB' },
    selected: { bg: F.navy, border: F.navy },
    mine: { bg: F.goldLight, border: F.gold },
  };
  const c = cs[status] || cs.available;
  return (
    <div style={{
      width: 18, height: 16, borderRadius: 3,
      background: c.bg, border: `1px solid ${c.border}`, flexShrink: 0,
    }} />
  );
};

// ── Mini chart helpers ────────────────────────────────
const SparkBar = ({ data, color, height = 40 }) => {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, background: color || F.navy,
          opacity: 0.15 + (v / max) * 0.85,
          height: `${(v / max) * 100}%`, borderRadius: '2px 2px 0 0',
          minHeight: 3,
        }} />
      ))}
    </div>
  );
};

Object.assign(window, {
  F, PATHS, Icon, Badge, Btn, Card, Divider, Avatar,
  StudentSidebar, AdminSidebar, TopBar, PageLayout,
  MobileStatusBar, MobileTabBar,
  SeatCell, SmallSeat, SparkBar,
});
