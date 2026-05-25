// Mobile UI Screens: Home, Filter, SeatMap, SeatDrawer, MyBookings, CheckIn, AIAssistant, Profile

// ── Mobile shell wrapper ──────────────────────────────
const MobileShell = ({ children, bg, statusLight, statusTime }) =>
<div style={{
  width: 390, height: 844, background: bg || F.bg,
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
  fontFamily: "'Noto Sans SC', 'Inter', sans-serif",
  position: 'relative'
}}>
    <MobileStatusBar time={statusTime || '9:41'} light={statusLight} />
    {children}
  </div>;


// ── M00 Mobile Login ─────────────────────────────────
const mobileLoginStyles = `
@keyframes mblob1 {
  0%,100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(30px,-20px) scale(1.12); }
}
@keyframes mblob2 {
  0%,100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(-20px,30px) scale(1.08); }
}
@keyframes mfadeUp {
  from { opacity:0; transform: translateY(16px); }
  to   { opacity:1; transform: translateY(0); }
}
`;

const MobileLogin = () => {
  const [tab, setTab] = React.useState('id');
  const [studentId, setStudentId] = React.useState('stu_cse_01');
  const [password, setPassword] = React.useState('Pass123!');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  const auth = useAuth();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const session = await auth.login({
        kind: 'student',
        account: studentId.trim(),
        password,
        remember: true,
      });
      setMessage({ type: 'success', text: `欢迎回来，${session.user.name}` });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || '登录失败，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileShell statusLight>
      <style>{mobileLoginStyles}</style>
      {/* Full-screen gradient bg */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(170deg, ${F.navyDeep} 0%, #1F4840 55%, #243D38 100%)`, zIndex: 0 }} />
      {/* Animated blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${F.navy}55 0%, transparent 65%)`, top: -80, right: -80, animation: 'mblob1 10s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle, ${F.gold}22 0%, transparent 65%)`, bottom: 120, left: -60, animation: 'mblob2 13s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, #5BB5A840 0%, transparent 65%)`, top: '38%', right: '10%', animation: 'mblob1 8s ease-in-out infinite 2s' }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', padding: '12px 24px 0', overflow: 'hidden' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, animation: 'mfadeUp 0.5s ease both' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: `linear-gradient(135deg, ${F.gold}, #E8C060)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 900, color: F.navyDeep
          }}>旦</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>复旦大学</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>自习室预约系统</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ marginBottom: 28, animation: 'mfadeUp 0.5s ease 0.1s both' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
            欢迎回来
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>使用校园账号登录</div>
        </div>

        {/* Frosted glass card */}
        <div style={{
          background: 'rgba(255,255,255,0.10)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 20, padding: 20, marginBottom: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          animation: 'mfadeUp 0.5s ease 0.2s both'
        }}>
          {/* Tab toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 3, marginBottom: 18 }}>
            {[['id', '学号登录'], ['sso', '统一认证']].map(([k, l]) =>
            <div key={k} onClick={() => setTab(k)} style={{
              flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 8,
              background: tab === k ? 'rgba(255,255,255,0.18)' : 'transparent',
              color: tab === k ? '#fff' : 'rgba(255,255,255,0.45)',
              fontSize: 13, fontWeight: tab === k ? 700 : 400, cursor: 'pointer',
              transition: 'all 0.2s'
            }}>{l}</div>
            )}
          </div>

          {tab === 'id' ?
          <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>学号</div>
                  <div style={{
                padding: '12px 14px', borderRadius: 11,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                    <Icon name="user" size={15} color="rgba(255,255,255,0.35)" />
                    <input
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="请输入学号"
                      style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#fff', font: 'inherit', fontSize: 13 }}
                    />
                  </div>
                </div>
              <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>密码</div>
                  <div style={{
                padding: '12px 14px', borderRadius: 11,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                    <Icon name="eye" size={15} color="rgba(255,255,255,0.35)" />
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请输入密码"
                      type="password"
                      style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#fff', font: 'inherit', fontSize: 13 }}
                    />
                  </div>
                </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: F.gold, cursor: 'pointer', fontWeight: 600 }}>忘记密码？</span>
              </div>
              {message &&
              <div style={{
                marginBottom: 12, padding: '8px 10px', borderRadius: 10,
                color: message.type === 'success' ? '#BBF7D0' : '#FECACA',
                background: message.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${message.type === 'success' ? 'rgba(187,247,208,0.22)' : 'rgba(254,202,202,0.22)'}`,
                fontSize: 12, fontWeight: 700
              }}>{message.text}</div>}
              <button style={{
              width: '100%', padding: '14px', borderRadius: 12,
              background: `linear-gradient(135deg, ${F.navy}, ${F.navyMid})`,
              color: '#fff', fontSize: 15, fontWeight: 800, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.72 : 1,
              boxShadow: `0 4px 20px ${F.navy}60`, letterSpacing: 2
            }}>{loading ? '登录中…' : '登 录'}</button>
            </form> :

          <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
              width: 100, height: 100, borderRadius: 14, margin: '0 auto 12px',
              background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Icon name="qr" size={48} color="rgba(255,255,255,0.6)" />
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>使用复旦 App 扫码登录</div>
              <button style={{
              width: '100%', padding: '13px', borderRadius: 12,
              background: `linear-gradient(135deg, ${F.navy}, ${F.navyMid})`,
              color: '#fff', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer', letterSpacing: 2
            }}>前往授权登录</button>
            </div>
          }
        </div>

        {/* Rules summary — glass pill */}
        <div style={{
          background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14, padding: '12px 16px',
          animation: 'mfadeUp 0.5s ease 0.35s both'
        }}>
          <div style={{ fontSize: 10, color: F.gold, fontWeight: 700, marginBottom: 7, letterSpacing: 0.5 }}>使用须知</div>
          {['每人每天最多预约 3 场', '需在 15 分钟内完成签到', '连续 3 次违约将被限制'].map((r, i) =>
          <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 4, fontSize: 11, color: 'rgba(255,255,255,0.42)', alignItems: 'center' }}>
              <span style={{ color: F.gold, fontSize: 8, flexShrink: 0 }}>◆</span>{r}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, marginBottom: 8, fontSize: 10, color: 'rgba(255,255,255,0.22)', animation: 'mfadeUp 0.5s ease 0.45s both' }}>
          登录即代表同意《自习室使用规则》
        </div>
      </div>
    </MobileShell>);

};

// ── M01 Mobile Home ───────────────────────────────────
const MobileHome = () =>
<MobileShell bg={F.navyDeep} statusLight>
    {/* Animated bg blobs */}
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle, ${F.navy}50 0%, transparent 70%)`, top: -60, right: -60 }} />
      <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${F.gold}20 0%, transparent 70%)`, bottom: 160, left: -40 }} />
    </div>
    {/* Hero header */}
    <div style={{ padding: '4px 22px 24px', position: 'relative', overflow: 'hidden', flexShrink: 0,
    background: `linear-gradient(160deg, ${F.navyDeep} 0%, #1F4840 100%)`
  }}>
      <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${F.navy}40 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', left: -30, bottom: 0, width: 150, height: 150, borderRadius: '50%', background: `radial-gradient(circle, ${F.gold}15 0%, transparent 70%)` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>早上好，林晓明</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>今日还有 <span style={{ color: F.gold }}>284</span> 个空座</div>
        </div>
        <div style={{ position: 'relative' }}>
          <Avatar name="林" size={40} bg={F.navyMid} />
          <span style={{ position: 'absolute', top: 0, right: 0, width: 10, height: 10, background: F.red, borderRadius: '50%', border: '2px solid #fff' }} />
        </div>
      </div>

      {/* Next booking card — frosted glass */}
      <div style={{
      padding: '14px 16px', borderRadius: 14,
      background: 'rgba(255,255,255,0.10)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.18)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.12)'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 4, letterSpacing: 0.5 }}>下一场预约</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>经管自习室 301 · C3</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>今日 14:00–17:00 · <span style={{ color: F.gold }}>2h18m 后</span></div>
          </div>
          <div style={{
          padding: '7px 14px', borderRadius: 22,
          background: F.gold, color: F.navyDeep,
          fontSize: 12, fontWeight: 800
        }}>签 到</div>
        </div>
      </div>
    </div>

    {/* White content area */}
    <div style={{ flex: 1, background: F.bg, borderRadius: '20px 20px 0 0', overflow: 'auto', padding: '20px 18px' }}>
      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 22 }}>
        {[
      { icon: 'search', label: '找座位', color: F.navy },
      { icon: 'scan', label: '扫码签到', color: F.green },
      { icon: 'calendar', label: '我的预约', color: F.blue },
      { icon: 'zap', label: '智能推荐', color: F.gold }].
      map((a) =>
      <div key={a.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <div style={{
          width: 52, height: 52, borderRadius: 15,
          background: F.white, border: `1px solid ${F.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: F.shadow
        }}>
              <Icon name={a.icon} size={22} color={a.color} />
            </div>
            <span style={{ fontSize: 11, color: F.t2, fontWeight: 500 }}>{a.label}</span>
          </div>
      )}
      </div>

      {/* Nearby rooms */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: F.t1 }}>附近自习室</div>
        <span style={{ fontSize: 12, color: F.navy, fontWeight: 600 }}>全部</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {[
      { name: '经管自习室 301', avail: 12, total: 48, dist: '光华楼', status: 'open', tags: ['插座', '安静'] },
      { name: '理工自习室 201', avail: 31, total: 64, dist: '逸夫楼', status: 'open', tags: ['24h'] },
      { name: '文史馆阅览室', avail: 5, total: 80, dist: '文史馆', status: 'busy', tags: ['靠窗'] }].
      map((r) =>
      <div key={r.name} style={{
        padding: '13px 14px', borderRadius: 13, background: F.white,
        border: `1px solid ${F.border}`, display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: F.shadow
      }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: F.navyLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="building" size={18} color={F.navy} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: F.t1, marginBottom: 3 }}>{r.name}</div>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: F.t3 }}>{r.dist}</span>
                {r.tags.map((t) => <Badge key={t} variant="gray">{t}</Badge>)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: r.avail < 8 ? F.amber : F.green, fontFamily: "'Inter'" }}>{r.avail}</div>
              <div style={{ fontSize: 9, color: F.t3 }}>空余</div>
            </div>
          </div>
      )}
      </div>
    </div>
    <MobileTabBar active="home" />
  </MobileShell>;


// ── M02 Mobile Seat Map ───────────────────────────────
const MobileSeatMap = () => {
  const rows = [
  ['available', 'window', 'window', 'window', 'window', 'window', 'window', 'available'],
  ['taken', 'available', 'available', 'taken', 'available', 'taken', 'available', 'taken'],
  ['available', 'available', 'taken', 'selected', 'available', 'taken', 'available', 'available'],
  ['available', 'taken', 'available', 'available', 'taken', 'available', 'available', 'taken']];

  return (
    <MobileShell>
      {/* Top nav */}
      <div style={{ padding: '4px 18px 14px', background: F.white, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Icon name="chevron-left" size={20} color={F.t1} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: F.t1 }}>经管自习室 301</div>
            <div style={{ fontSize: 11, color: F.t3 }}>光华楼 A座 3楼 · 今日 14:00–17:00</div>
          </div>
          <Badge variant="green" dot>12空余</Badge>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[['#F0FDF4', '#86EFAC', '空闲'], ['#F3F4F6', '#D1D5DB', '占用'], ['#003087', '#003087', '已选']].map(([bg, bd, l]) =>
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: F.t3 }}>
              <div style={{ width: 11, height: 11, borderRadius: 2, background: bg, border: `1.5px solid ${bd}` }} />
              {l}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: F.white, borderRadius: 14, padding: 18, boxShadow: F.shadow, border: `1px solid ${F.border}` }}>
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <div style={{ display: 'inline-block', padding: '2px 16px', borderRadius: 3, background: F.bg, border: `1px dashed ${F.t4}`, fontSize: 9, color: F.t3 }}>入 口</div>
          </div>
          {rows.map((row, ri) =>
          <React.Fragment key={ri}>
              {ri === 2 && <div style={{ height: 14 }} />}
              <div style={{ display: 'flex', gap: 5, marginBottom: 5, justifyContent: 'center' }}>
                <span style={{ width: 12, fontSize: 9, color: F.t3, display: 'flex', alignItems: 'center', fontFamily: "'Inter'" }}>{String.fromCharCode(65 + ri)}</span>
                {row.map((s, ci) =>
              <React.Fragment key={ci}>
                    {ci === 4 && <div style={{ width: 12 }} />}
                    <SmallSeat status={s} />
                  </React.Fragment>
              )}
              </div>
            </React.Fragment>
          )}
        </div>
      </div>

      {/* Bottom seat detail drawer (peek) */}
      <div style={{
        background: F.white, borderRadius: '20px 20px 0 0',
        padding: '12px 18px 0', flexShrink: 0,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ width: 32, height: 3, borderRadius: 2, background: F.t4, margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: F.navyDeep, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: F.gold, fontFamily: "'Inter'" }}>C4</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: F.t1, marginBottom: 3 }}>C4 号座位</div>
            <div style={{ display: 'flex', gap: 4 }}><Badge variant="gray">插座</Badge><Badge variant="gray">安静区</Badge></div>
          </div>
          <Badge variant="green" dot>可预约</Badge>
        </div>
        <button style={{
          width: '100%', padding: '14px', borderRadius: 13,
          background: `linear-gradient(135deg, ${F.navy}, ${F.navyMid})`,
          color: '#fff', fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer',
          marginBottom: 16, letterSpacing: 1
        }}>立即预约此座位</button>
      </div>
      <MobileTabBar active="select" />
    </MobileShell>);

};

// ── M03 Mobile Filter Sheet ───────────────────────────
const MobileFilter = () =>
<MobileShell>
    {/* Dimmed background */}
    <div style={{ flex: 1, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', background: F.white, borderRadius: '20px 20px 0 0', padding: '0 0 20px' }}>
        {/* Handle */}
        <div style={{ padding: '12px 0 4px', textAlign: 'center' }}>
          <div style={{ width: 32, height: 3, borderRadius: 2, background: F.t4, display: 'inline-block' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 18px 16px' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: F.t1 }}>筛选条件</div>
          <span style={{ fontSize: 13, color: F.t3, cursor: 'pointer' }}>重置</span>
        </div>

        {/* Date */}
        <div style={{ padding: '0 18px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: F.t2, marginBottom: 10 }}>日期</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['今天', '明天', '后天'].map((d, i) =>
          <div key={d} style={{
            flex: 1, padding: '10px 0', textAlign: 'center', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: i === 0 ? F.navy : F.bg,
            color: i === 0 ? '#fff' : F.t2,
            border: `1.5px solid ${i === 0 ? F.navy : 'transparent'}`
          }}>{d}</div>
          )}
          </div>
        </div>

        {/* Time */}
        <div style={{ padding: '0 18px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: F.t2, marginBottom: 10 }}>时间段</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['开始时间', '14:00'], ['结束时间', '17:00']].map(([l, v]) =>
          <div key={l} style={{ flex: 1, background: F.bg, borderRadius: 10, padding: '11px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: F.t3 }}>{l}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: F.t1, fontFamily: "'Inter'" }}>{v}</span>
              </div>
          )}
          </div>
        </div>

        {/* Building */}
        <div style={{ padding: '0 18px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: F.t2, marginBottom: 10 }}>楼栋</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['全部', '光华楼', '逸夫楼', '文史馆', '图书馆'].map((b, i) =>
          <div key={b} style={{
            padding: '7px 14px', borderRadius: 22, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: i === 0 ? F.navy : F.bg,
            color: i === 0 ? '#fff' : F.t2,
            border: `1px solid ${i === 0 ? F.navy : 'transparent'}`
          }}>{b}</div>
          )}
          </div>
        </div>

        {/* Seat features */}
        <div style={{ padding: '0 18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: F.t2, marginBottom: 10 }}>座位属性</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[['插座', true], ['靠窗', true], ['安静区', false], ['白板附近', false], ['无障碍', false]].map(([t, sel]) =>
          <div key={t} style={{
            padding: '7px 14px', borderRadius: 22, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: sel ? F.navyLight : F.bg,
            color: sel ? F.navy : F.t2,
            border: `1.5px solid ${sel ? F.navy : 'transparent'}`
          }}>{t}</div>
          )}
          </div>
        </div>

        <div style={{ padding: '0 18px' }}>
          <button style={{
          width: '100%', padding: '14px', borderRadius: 13,
          background: `linear-gradient(135deg, ${F.navy}, ${F.navyMid})`,
          color: '#fff', fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer'
        }}>查看 12 个结果</button>
        </div>
      </div>
    </div>
  </MobileShell>;


// ── M04 My Bookings (mobile) ──────────────────────────
const MobileMyBookings = () => {
  const bookings = [
  { seat: 'C3', room: '经管自习室 301', time: '今日 14:00–17:00', status: 'upcoming', statusLabel: '待签到', statusColor: F.blue },
  { seat: 'F8', room: '理工自习室 201', time: '4月22日 09:00–12:00', status: 'done', statusLabel: '已完成', statusColor: F.green },
  { seat: 'A5', room: '文史馆阅览室', time: '4月20日 14:00–16:00', status: 'done', statusLabel: '已完成', statusColor: F.green },
  { seat: 'D8', room: '经管自习室 301', time: '4月18日 10:00–12:00', status: 'violation', statusLabel: '违约', statusColor: F.red }];

  return (
    <MobileShell>
      <div style={{ padding: '4px 18px 14px', background: F.white, flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: F.t1, marginBottom: 14 }}>我的预约</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['全部', '待签到', '已完成', '违约'].map((t, i) =>
          <div key={t} style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: i === 0 ? F.navy : F.bg,
            color: i === 0 ? '#fff' : F.t2,
            border: `1px solid ${i === 0 ? F.navy : 'transparent'}`
          }}>{t}</div>
          )}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {bookings.map((b, i) =>
          <div key={i} style={{ padding: '14px', borderRadius: 14, background: F.white, border: `1px solid ${F.border}`, boxShadow: F.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: b.status === 'upcoming' ? F.navyLight : b.status === 'done' ? F.greenBg : F.redBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: b.statusColor, fontFamily: "'Inter'" }}>{b.seat}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: F.t1 }}>{b.room}</div>
                    <div style={{ fontSize: 11, color: F.t3, marginTop: 1 }}>{b.time}</div>
                  </div>
                </div>
                <Badge variant={b.status === 'upcoming' ? 'blue' : b.status === 'done' ? 'green' : 'red'}>{b.statusLabel}</Badge>
              </div>
              {b.status === 'upcoming' &&
            <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ flex: 1, padding: '10px', borderRadius: 10, background: F.navy, color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>签到</button>
                  <button style={{ flex: 1, padding: '10px', borderRadius: 10, background: F.bg, color: F.t2, fontSize: 13, fontWeight: 600, border: `1px solid ${F.border}`, cursor: 'pointer' }}>取消</button>
                </div>
            }
              {b.status === 'done' &&
            <button style={{ width: '100%', padding: '9px', borderRadius: 10, background: F.bg, color: F.navy, fontSize: 13, fontWeight: 700, border: `1.5px solid ${F.navy}30`, cursor: 'pointer' }}>再次预约</button>
            }
            </div>
          )}
        </div>
      </div>
      <MobileTabBar active="bookings" />
    </MobileShell>);

};

// ── M05 Check-in (mobile QR) ──────────────────────────
const MobileCheckIn = () =>
<MobileShell bg={F.navyDeep} statusLight>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 24px 20px' }}>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <Icon name="chevron-left" size={22} color="#fff" />
        <div style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>扫码签到</div>
        <div style={{ width: 22 }} />
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 24, textAlign: 'center' }}>
        将镜头对准教室屏幕上的二维码
      </div>

      {/* Scanner frame */}
      <div style={{ position: 'relative', width: 240, height: 240, marginBottom: 28 }}>
        {/* Corner decorations */}
        {[['top:0,left:0', 'border-top,border-left'], ['top:0,right:0', 'border-top,border-right'], ['bottom:0,left:0', 'border-bottom,border-left'], ['bottom:0,right:0', 'border-bottom,border-right']].map((_, ci) => {
        const positions = [{ top: 0, left: 0 }, { top: 0, right: 0 }, { bottom: 0, left: 0 }, { bottom: 0, right: 0 }];
        const pos = positions[ci];
        return (
          <div key={ci} style={{
            position: 'absolute', ...pos,
            width: 28, height: 28,
            borderTop: ci < 2 ? `3px solid ${F.gold}` : 'none',
            borderBottom: ci >= 2 ? `3px solid ${F.gold}` : 'none',
            borderLeft: ci % 2 === 0 ? `3px solid ${F.gold}` : 'none',
            borderRight: ci % 2 === 1 ? `3px solid ${F.gold}` : 'none'
          }} />);

      })}
        {/* Scan line */}
        <div style={{
        position: 'absolute', left: 10, right: 10, top: '45%',
        height: 2, background: `linear-gradient(90deg, transparent, ${F.gold}, transparent)`
      }} />
        {/* Camera placeholder */}
        <div style={{
        position: 'absolute', inset: 12, borderRadius: 8,
        background: 'rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
          <Icon name="scan" size={40} color="rgba(255,255,255,0.12)" />
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 28, textAlign: 'center' }}>
        签到时间剩余 <span style={{ color: F.gold, fontWeight: 700, fontFamily: "'Inter'" }}>9:22</span>
      </div>

      {/* Manual input */}
      <div style={{ width: '100%', padding: '16px', borderRadius: 14, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10, textAlign: 'center' }}>扫码失败？手动输入 6 位动态码</div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
          {['2', '7', '4', '', '', ''].map((d, i) =>
        <React.Fragment key={i}>
              {i === 3 && <div style={{ width: 10, alignSelf: 'center', height: 1.5, background: 'rgba(255,255,255,0.2)' }} />}
              <div style={{
            width: 38, height: 42, borderRadius: 8, fontSize: 20, fontWeight: 800,
            background: d ? 'rgba(201,168,64,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1.5px solid ${d ? F.gold : 'rgba(255,255,255,0.15)'}`,
            color: F.gold, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter'"
          }}>{d}</div>
            </React.Fragment>
        )}
        </div>
        <button style={{
        width: '100%', padding: '12px', borderRadius: 10,
        background: F.gold, color: F.navyDeep, fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer'
      }}>确认签到</button>
      </div>
    </div>
    <MobileTabBar active="bookings" />
  </MobileShell>;


// ── M06 Mobile AI Assistant ───────────────────────────
const MobileAIAssistant = () => {
  const msgs = [
  { role: 'user', text: '今晚有没有安静的带插座座位' },
  { role: 'ai', text: '找到 3 个符合条件的座位！', cards: [
    { name: '经管301 · C3', tags: ['插座', '安静'], time: '18:00–22:00' },
    { name: '理工201 · F8', tags: ['插座', '24h'], time: '全天' }]
  }];

  const shortcuts = ['附近空位', '我的预约', '明天上午', '图书馆几点关'];
  return (
    <MobileShell>
      <div style={{ padding: '4px 18px 14px', background: F.white, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${F.navy}, ${F.navyMid})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="zap" size={16} color={F.gold} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: F.t1 }}>智能助手</div>
            <div style={{ fontSize: 10, color: F.green, display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: F.green, display: 'inline-block' }} />在线
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {msgs.map((msg, i) =>
        <div key={i} style={{ display: 'flex', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
            {msg.role === 'ai' &&
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: F.navyDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="zap" size={12} color={F.gold} />
              </div>
          }
            <div style={{ maxWidth: '78%' }}>
              <div style={{
              padding: '10px 13px',
              borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
              background: msg.role === 'user' ? F.navy : F.white,
              color: msg.role === 'user' ? '#fff' : F.t1,
              fontSize: 13, lineHeight: 1.6,
              border: msg.role === 'ai' ? `1px solid ${F.border}` : 'none'
            }}>{msg.text}</div>
              {msg.cards &&
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {msg.cards.map((c, j) =>
              <div key={j} style={{ padding: '11px 13px', borderRadius: 12, background: F.white, border: `1px solid ${F.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: F.t1, marginBottom: 4 }}>{c.name}</div>
                        <div style={{ display: 'flex', gap: 4 }}>{c.tags.map((t) => <Badge key={t} variant="gray">{t}</Badge>)}</div>
                        <div style={{ fontSize: 10, color: F.t3, marginTop: 3 }}>{c.time}</div>
                      </div>
                      <button style={{ padding: '7px 12px', borderRadius: 8, background: F.navy, color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>预约</button>
                    </div>
              )}
                </div>
            }
            </div>
          </div>
        )}
      </div>

      {/* Shortcuts */}
      <div style={{ padding: '8px 16px', background: F.white, borderTop: `1px solid ${F.borderLight}`, display: 'flex', gap: 6, overflowX: 'auto' }}>
        {shortcuts.map((s) =>
        <div key={s} style={{ padding: '5px 10px', borderRadius: 16, fontSize: 11, fontWeight: 600, background: F.navyLight, color: F.navy, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0 }}>{s}</div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', background: F.white, borderTop: `1px solid ${F.border}`, display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ flex: 1, padding: '10px 14px', borderRadius: 22, background: F.bg, border: `1.5px solid ${F.border}`, fontSize: 13, color: F.t3 }}>输入问题…</div>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: F.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="send" size={16} color="#fff" />
        </div>
      </div>
      <MobileTabBar active="assistant" />
    </MobileShell>);

};

// ── M07 Mobile Profile ────────────────────────────────
const MobileProfile = () =>
<MobileShell>
    {/* Header */}
    <div style={{ padding: '24px 18px 28px', background: F.navyDeep, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 60, height: 60, borderRadius: 18, background: F.navyMid, border: `2px solid ${F.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 900, color: '#fff' }}>林</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 3 }}>林晓明</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>21307001 · 计算机学院</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <Badge variant="navy">本科生</Badge>
            <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: 'rgba(201,168,64,0.2)', color: F.gold, border: `1px solid ${F.gold}40` }}>信用良好</span>
          </div>
        </div>
      </div>
    </div>

    <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px' }}>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {[['18', '本学期预约'], ['16', '已完成'], ['2.0', '违约次数']].map(([v, l]) => <div key={l} style={{ flex: 1, padding: '12px', borderRadius: 12, background: F.white, border: `1px solid ${F.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: F.navy, fontFamily: "'Inter'" }}>{v}</div>
            <div style={{ fontSize: 10, color: F.t3, marginTop: 3 }}>{l}</div>
          </div>
      )}
      </div>

      {/* Menu groups */}
      {[
    { title: '常用功能', items: [['star', '收藏的座位', '3个'], ['clock', '历史预约', '18条'], ['alert', '违约记录', '2次']] },
    { title: '偏好设置', items: [['settings', '座位偏好', '插座 · 安静区'], ['bell', '提醒方式', '微信通知'], ['zap', '智能推荐', '已开启']] },
    { title: '其他', items: [['info', '使用帮助', ''], ['shield', '隐私设置', ''], ['log', '关于系统', 'v2.1.0']] }].
    map((g) =>
    <div key={g.title} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: F.t3, marginBottom: 6, letterSpacing: 0.5 }}>{g.title}</div>
          <div style={{ background: F.white, borderRadius: 14, border: `1px solid ${F.border}`, overflow: 'hidden' }}>
            {g.items.map(([icon, label, sub], i) =>
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < g.items.length - 1 ? `1px solid ${F.borderLight}` : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: F.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={icon} size={15} color={F.navy} />
                </div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: F.t1 }}>{label}</div>
                {sub && <span style={{ fontSize: 11, color: F.t3 }}>{sub}</span>}
                <Icon name="chevron-right" size={14} color={F.t4} />
              </div>
        )}
          </div>
        </div>
    )}
    </div>
    <MobileTabBar active="me" />
  </MobileShell>;


Object.assign(window, { MobileLogin, MobileHome, MobileSeatMap, MobileFilter, MobileMyBookings, MobileCheckIn, MobileAIAssistant, MobileProfile });
