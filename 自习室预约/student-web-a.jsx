// Student Web Screens A: Login, Home, RoomList, SeatSelector

// ── Login animations ──────────────────────────────────
const loginStyles = `
@keyframes blob1 {
  0%,100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(60px,-40px) scale(1.15); }
  66% { transform: translate(-30px,50px) scale(0.9); }
}
@keyframes blob2 {
  0%,100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(-50px,60px) scale(1.1); }
  66% { transform: translate(40px,-30px) scale(0.95); }
}
@keyframes blob3 {
  0%,100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(30px,40px) scale(1.2); }
}
@keyframes floatIn {
  from { opacity:0; transform: translateY(18px); }
  to   { opacity:1; transform: translateY(0); }
}
@keyframes slideRight {
  from { opacity:0; transform: translateX(-24px); }
  to   { opacity:1; transform: translateX(0); }
}
`;

// ── 01 Login ─────────────────────────────────────────
const StudentLogin = () => {
  const [tab, setTab] = React.useState('id');
  return (
    <div style={{
      display: 'flex', width: '100%', height: '100%',
      fontFamily: "'Noto Sans SC', 'Inter', sans-serif", overflow: 'hidden',
    }}>
      <style>{loginStyles}</style>

      {/* Left: Animated background branding */}
      <div style={{
        width: '46%',
        background: `linear-gradient(160deg, ${F.navyDeep} 0%, #1F4840 55%, #1A3830 100%)`,
        display: 'flex', flexDirection: 'column',
        padding: '48px 52px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Animated blobs */}
        <div style={{
          position: 'absolute', width: 420, height: 420, borderRadius: '50%',
          background: `radial-gradient(circle, ${F.navy}55 0%, transparent 65%)`,
          top: -120, right: -80, animation: 'blob1 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 340, height: 340, borderRadius: '50%',
          background: `radial-gradient(circle, ${F.gold}28 0%, transparent 65%)`,
          bottom: -60, left: -60, animation: 'blob2 15s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 260, height: 260, borderRadius: '50%',
          background: `radial-gradient(circle, #5BB5A855 0%, transparent 65%)`,
          top: '40%', left: '30%', animation: 'blob3 9s ease-in-out infinite',
        }} />
        {/* Frosted glass overlay on blobs */}
        <div style={{
          position: 'absolute', inset: 0,
          backdropFilter: 'blur(0px)',
          background: 'rgba(26,56,48,0.18)',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 11,
              background: `linear-gradient(135deg, ${F.gold}, #e8c060)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 900, color: F.navyDeep,
            }}>旦</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>复旦大学</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.8 }}>FUDAN UNIVERSITY</div>
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 12 }}>
              自习室<br />预约系统
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
              智慧空间管理 · 高效学习体验
            </div>
          </div>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 24, marginTop: 40 }}>
            {[['48', '自习室'], ['2,840', '座位'], ['92%', '今日出勤']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 26, fontWeight: 800, color: F.gold, fontFamily: "'Inter', sans-serif" }}>{v}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
          {/* Rules summary — frosted glass */}
          <div style={{
            marginTop: 48, padding: '16px 20px', borderRadius: 14,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            animation: 'slideRight 0.7s ease 0.5s both',
          }}>
            <div style={{ fontSize: 11, color: F.gold, fontWeight: 600, marginBottom: 8, letterSpacing: 0.5 }}>使用须知</div>
            {['每人每天最多预约 3 场', '需在 15 分钟内完成签到', '连续 3 次违约将被限制预约'].map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, fontSize: 12, color: 'rgba(255,255,255,0.5)', alignItems: 'center' }}>
                <span style={{ color: F.gold, fontSize: 9 }}>◆</span>{r}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div style={{
        flex: 1,
        background: `linear-gradient(145deg, #E8F4F2 0%, ${F.bg} 50%, #EEF6F4 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle bg blobs on right side */}
        <div style={{ position: 'absolute', right: -80, top: -80, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${F.navy}0A 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: -60, bottom: -60, width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, ${F.gold}0A 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1,
          background: 'rgba(250,254,254,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 20, padding: 32, border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 8px 40px rgba(26,56,48,0.10), 0 1px 0 rgba(255,255,255,0.8) inset',
          animation: 'floatIn 0.6s ease 0.2s both',
        }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: F.t1, marginBottom: 6 }}>欢迎登录</div>
            <div style={{ fontSize: 13, color: F.t3 }}>请使用复旦校园账号登录</div>
          </div>
          {/* Tab */}
          <div style={{
            display: 'flex', background: F.white, borderRadius: 10, padding: 4,
            border: `1px solid ${F.border}`, marginBottom: 24,
          }}>
            {[['id', '学号登录'], ['sso', '统一身份认证']].map(([k, l]) => (
              <div key={k} onClick={() => setTab(k)} style={{
                flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 7,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: tab === k ? F.navy : 'transparent',
                color: tab === k ? '#fff' : F.t3,
                transition: 'all 0.2s',
              }}>{l}</div>
            ))}
          </div>

          {tab === 'id' ? (
            <div>
              {[['学号', '请输入学号'], ['密码', '请输入密码']].map(([label, ph]) => (
                <div key={label} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: F.t2, marginBottom: 6 }}>{label}</div>
                  <div style={{
                    padding: '11px 14px', borderRadius: 9, border: `1.5px solid ${F.border}`,
                    background: F.white, fontSize: 13, color: F.t3, display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <Icon name={label === '学号' ? 'user' : 'eye'} size={14} color={F.t4} />
                    <span>{ph}</span>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: F.t3, cursor: 'pointer' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${F.border}`, background: F.navy }} />
                  记住登录状态
                </label>
                <span style={{ fontSize: 12, color: F.navy, cursor: 'pointer', fontWeight: 600 }}>忘记密码？</span>
              </div>
              <button style={{
                width: '100%', padding: '13px', borderRadius: 10,
                background: `linear-gradient(135deg, ${F.navy}, ${F.navyMid})`,
                color: '#fff', fontSize: 14, fontWeight: 700, border: 'none',
                cursor: 'pointer', letterSpacing: 2,
                boxShadow: `0 4px 20px ${F.navy}40`,
              }}>登 录</button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{
                width: 120, height: 120, borderRadius: 16,
                border: `2px solid ${F.border}`, margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: F.white,
              }}>
                <Icon name="qr" size={56} color={F.navy} />
              </div>
              <div style={{ fontSize: 13, color: F.t3, marginBottom: 16 }}>使用复旦校园 App 扫码登录</div>
              <div style={{ fontSize: 12, color: F.t4 }}>或前往 <span style={{ color: F.blue }}>passport.fudan.edu.cn</span> 授权</div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 28, fontSize: 11, color: F.t4 }}>
            登录即代表同意《自习室使用规则》与《数据隐私声明》
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 02 Student Home ───────────────────────────────────
const StudentHome = () => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 星期四`;
  return (
    <PageLayout
      sidebar={<StudentSidebar active="home" />}
      topbar={<TopBar title="首页概览" sub={dateStr} />}
    >
      {/* Next booking banner — frosted glass */}
      <div style={{
        borderRadius: 14, padding: '20px 24px', marginBottom: 20,
        background: `linear-gradient(120deg, ${F.navyDeep} 0%, #1F4840 100%)`,
        display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 160, height: 160, borderRadius: '50%', background: `rgba(45,122,110,0.18)` }} />
        <div style={{ position: 'absolute', right: 60, bottom: -30, width: 100, height: 100, borderRadius: '50%', background: `rgba(212,168,67,0.10)` }} />
        <div style={{
          width: 52, height: 52, borderRadius: 13,
          background: 'rgba(201,168,64,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="calendar" size={24} color={F.gold} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4, letterSpacing: 0.5 }}>下一场预约</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 3 }}>光华楼 A座 3楼 · 经管自习室 301 · A15 号座位</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>今日 14:00 – 17:00 · 距开始还有 <span style={{ color: F.gold, fontWeight: 700 }}>2小时18分</span></div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Btn variant="gold" size="sm">立即签到</Btn>
          <Btn variant="ghost" size="sm" style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}>取消预约</Btn>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
        {[
          { label: '今日全校空座', value: '284', sub: '共 2840 个座位', icon: 'grid', color: F.navy, trend: 12 },
          { label: '今日我的预约', value: '1', sub: '还有 2 次可用', icon: 'calendar', color: F.blue, trend: null },
          { label: '常用自习室', value: '3', sub: '光华楼 · 文史馆 · 图书馆', icon: 'star', color: F.gold, trend: null },
          { label: '本周学习时长', value: '12h', sub: '较上周 +2.5h', icon: 'clock', color: F.green, trend: 26 },
        ].map(s => (
          <Card key={s.label} style={{ flex: 1 }} p={16}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, color: F.t3, marginBottom: 6, fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: 27, fontWeight: 800, color: F.t1, fontFamily: "'Inter', sans-serif", letterSpacing: -0.5 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: F.t3, marginTop: 4 }}>{s.sub}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={s.icon} size={17} color={s.color} />
              </div>
            </div>
            {s.trend && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${F.borderLight}`, fontSize: 11, color: F.green }}>
                ↑ {s.trend}% 较昨日
              </div>
            )}
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Recommended rooms */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: F.t1, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
            推荐自习室
            <span style={{ fontSize: 12, color: F.navy, fontWeight: 600, cursor: 'pointer' }}>全部 →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { name: '经管自习室 301', loc: '光华楼 A座 3楼', seats: 48, avail: 12, tags: ['插座', '靠窗', '安静区'], color: F.navy },
              { name: '理工自习室 201', loc: '逸夫楼 2楼', seats: 64, avail: 31, tags: ['24小时', '插座'], color: F.blue },
              { name: '文史馆阅览室', loc: '文史馆 1楼', seats: 80, avail: 5, tags: ['靠窗', '无插座'], color: F.amber },
            ].map(r => (
              <Card key={r.name} p={14} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: `${r.color}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon name="building" size={18} color={r.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: F.t1, marginBottom: 3 }}>{r.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="pin" size={11} color={F.t3} />
                    <span style={{ fontSize: 11, color: F.t3 }}>{r.loc}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 140 }}>
                  {r.tags.map(t => <Badge key={t} variant="gray">{t}</Badge>)}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: r.avail < 10 ? F.amber : F.green, fontFamily: "'Inter'" }}>{r.avail}</div>
                  <div style={{ fontSize: 10, color: F.t3 }}>空余/{r.seats}</div>
                </div>
                <Btn variant="primary" size="sm">去预约</Btn>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick actions + week history */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: F.t1, marginBottom: 12 }}>快捷操作</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            {[
              { label: '立即找座', icon: 'search', color: F.navy },
              { label: '扫码签到', icon: 'scan', color: F.green },
              { label: '我的收藏', icon: 'star', color: F.gold },
              { label: '智能推荐', icon: 'zap', color: F.purple },
            ].map(a => (
              <div key={a.label} style={{
                padding: '14px 12px', borderRadius: 10, background: F.white,
                border: `1px solid ${F.border}`, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8, cursor: 'pointer',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${a.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={a.icon} size={17} color={a.color} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: F.t1 }}>{a.label}</span>
              </div>
            ))}
          </div>
          <Card p={16}>
            <div style={{ fontSize: 12, fontWeight: 700, color: F.t1, marginBottom: 12 }}>本周学习记录</div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 52 }}>
              {[2, 3.5, 1.5, 4, 2.5, 0, 1].map((h, i) => {
                const days = ['一', '二', '三', '四', '五', '六', '日'];
                const isToday = i === 3;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{
                      width: '100%', borderRadius: '3px 3px 0 0',
                      background: isToday ? F.navy : (h > 0 ? F.navyLight : F.borderLight),
                      height: `${(h / 4) * 100}%`, minHeight: h > 0 ? 4 : 0, transition: 'height 0.3s',
                    }} />
                    <span style={{ fontSize: 9, color: isToday ? F.navy : F.t3, fontWeight: isToday ? 700 : 400 }}>{days[i]}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

// ── 03 Room List ──────────────────────────────────────
const RoomList = () => {
  const rooms = [
    { name: '经管自习室 301', building: '光华楼 A座', floor: '3楼', cap: 48, avail: 12, hours: '08:00–22:00', dept: '全校开放', tags: ['插座', '靠窗', '安静区'], status: 'open' },
    { name: '理工自习室 201', building: '逸夫楼', floor: '2楼', cap: 64, avail: 31, hours: '00:00–24:00', dept: '全校开放', tags: ['24小时', '插座', '白板'], status: 'open' },
    { name: '文史馆阅览室 A', building: '文史馆', floor: '1楼', cap: 80, avail: 5, hours: '08:00–21:00', dept: '文理兼容', tags: ['靠窗', '无插座'], status: 'busy' },
    { name: '新闻学院研讨室', building: '新闻学院楼', floor: '4楼', cap: 20, avail: 0, hours: '09:00–20:00', dept: '仅新闻学院', tags: ['白板', '投影'], status: 'full' },
    { name: '理工自习室 403', building: '逸夫楼', floor: '4楼', cap: 56, avail: 28, hours: '08:00–23:00', dept: '全校开放', tags: ['插座', '安静区'], status: 'open' },
    { name: '图书馆自习区', building: '李兆基图书馆', floor: '2楼', cap: 120, avail: 44, hours: '08:00–22:00', dept: '全校开放', tags: ['插座', '靠窗', '安静区'], status: 'open' },
  ];
  return (
    <PageLayout
      sidebar={<StudentSidebar active="rooms" />}
      topbar={<TopBar title="自习室列表" sub={`共 ${rooms.length} 个自习室`} actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" size="sm" icon="filter">筛选</Btn>
          <Btn variant="secondary" size="sm" icon="list">列表视图</Btn>
        </div>
      } />}
    >
      {/* Filter bar */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {['全部楼栋', '全校开放', '有空位', '有插座', '靠窗'].map((f, i) => (
          <div key={f} style={{
            padding: '5px 14px', borderRadius: 20,
            background: i === 0 ? F.navy : F.white,
            color: i === 0 ? '#fff' : F.t2,
            border: `1px solid ${i === 0 ? F.navy : F.border}`,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>{f}</div>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 12, color: F.t3 }}>
          今日 08:00 – 22:00 · 明日可预约
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {rooms.map(r => {
          const pct = Math.round((r.avail / r.cap) * 100);
          const statusColor = r.status === 'open' ? F.green : r.status === 'busy' ? F.amber : F.red;
          const statusLabel = r.status === 'open' ? '开放中' : r.status === 'busy' ? '较繁忙' : '已满座';
          return (
            <Card key={r.name} p={18} style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 11,
                  background: `${F.navy}0f`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="building" size={20} color={F.navy} />
                </div>
                <Badge variant={r.status === 'open' ? 'green' : r.status === 'busy' ? 'amber' : 'red'} dot>{statusLabel}</Badge>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: F.t1, marginBottom: 4 }}>{r.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
                <Icon name="pin" size={11} color={F.t3} />
                <span style={{ fontSize: 11, color: F.t3 }}>{r.building} · {r.floor}</span>
              </div>
              {/* Seat progress */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: F.t3 }}>座位占用</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, fontFamily: "'Inter'" }}>{r.avail} 空余 / {r.cap}</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: F.borderLight, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    background: statusColor,
                    width: `${100 - pct}%`,
                    transition: 'width 0.4s',
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                {r.tags.map(t => <Badge key={t} variant="gray">{t}</Badge>)}
              </div>
              <Divider style={{ marginBottom: 12 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: F.t3 }}>
                  <Icon name="clock" size={11} color={F.t3} style={{ marginRight: 4 }} />
                  {r.hours}
                </div>
                <Btn variant={r.status === 'full' ? 'secondary' : 'primary'} size="sm">{r.status === 'full' ? '加入候补' : '立即预约'}</Btn>
              </div>
            </Card>
          );
        })}
      </div>
    </PageLayout>
  );
};

// ── 04 Seat Selector ──────────────────────────────────
const SeatSelector = () => {
  // Build seat grid data: 7 rows × 8 cols
  const statuses = ['available','available','taken','available','taken','available','available','available',
    'window','window','window','window','window','window','window','window',
    'taken','available','available','taken','available','taken','available','taken',
    'available','taken','selected','available','available','taken','available','available',
    'available','available','taken','taken','available','available','taken','available',
    'taken','available','available','available','taken','available','available','taken',
    'disabled','disabled','available','taken','available','available','taken','disabled'];
  const nums = (r, c) => `${String.fromCharCode(65+r)}${c+1}`;
  return (
    <PageLayout
      sidebar={<StudentSidebar active="select" />}
      topbar={<TopBar title="选座预约" sub="光华楼 A座 · 3楼 · 经管自习室 301" />}
      noPad
    >
      <div style={{ display: 'flex', height: '100%', gap: 0, overflow: 'hidden' }}>
        {/* Left: Filters */}
        <div style={{
          width: 254, flexShrink: 0, borderRight: `1px solid ${F.border}`,
          background: F.white, overflowY: 'auto', padding: 18,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: F.t1, marginBottom: 16 }}>筛选条件</div>

          {/* Date */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: F.t2, marginBottom: 8, letterSpacing: 0.3 }}>日期</div>
            <div style={{
              display: 'flex', borderRadius: 8, background: F.bg,
              border: `1px solid ${F.border}`, overflow: 'hidden',
            }}>
              {['今天', '明天', '后天'].map((d, i) => (
                <div key={d} style={{
                  flex: 1, padding: '7px 0', textAlign: 'center', fontSize: 12,
                  background: i === 0 ? F.navy : 'transparent',
                  color: i === 0 ? '#fff' : F.t3, cursor: 'pointer', fontWeight: i === 0 ? 600 : 400,
                }}>{d}</div>
              ))}
            </div>
          </div>

          {/* Time */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: F.t2, marginBottom: 8, letterSpacing: 0.3 }}>时间段</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['开始', '结束'].map((l, i) => (
                <div key={l} style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: F.t3, marginBottom: 4 }}>{l}</div>
                  <div style={{
                    padding: '8px 10px', borderRadius: 7, border: `1.5px solid ${i === 0 ? F.navy : F.border}`,
                    fontSize: 13, fontWeight: 700, color: F.t1, display: 'flex', justifyContent: 'space-between',
                    background: i === 0 ? F.navyLight : F.white,
                  }}>
                    {i === 0 ? '14:00' : '17:00'}
                    <Icon name="chevron-down" size={13} color={F.t3} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Building */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: F.t2, marginBottom: 8, letterSpacing: 0.3 }}>楼栋</div>
            {['光华楼 A座', '逸夫楼', '文史馆', '李兆基图书馆'].map((b, i) => (
              <div key={b} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                borderRadius: 7, marginBottom: 4,
                background: i === 0 ? F.navyLight : 'transparent',
                cursor: 'pointer', border: i === 0 ? `1px solid ${F.navy}30` : '1px solid transparent',
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                  background: i === 0 ? F.navy : F.white,
                  border: `2px solid ${i === 0 ? F.navy : F.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {i === 0 && <Icon name="check" size={9} color="#fff" sw={3} />}
                </div>
                <span style={{ fontSize: 12, color: i === 0 ? F.navy : F.t2, fontWeight: i === 0 ? 600 : 400 }}>{b}</span>
              </div>
            ))}
          </div>

          {/* Seat features */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: F.t2, marginBottom: 8, letterSpacing: 0.3 }}>座位属性</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['插座', '靠窗', '安静区', '白板附近', '无障碍'].map((t, i) => (
                <div key={t} style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  background: i < 2 ? F.navy : F.white,
                  color: i < 2 ? '#fff' : F.t3,
                  border: `1px solid ${i < 2 ? F.navy : F.border}`,
                  cursor: 'pointer',
                }}>{t}</div>
              ))}
            </div>
          </div>

          <Divider style={{ marginBottom: 16 }} />
          <Btn variant="primary" size="md" style={{ width: '100%', justifyContent: 'center' }}>应用筛选</Btn>
          <Btn variant="ghost" size="sm" style={{ width: '100%', justifyContent: 'center', marginTop: 6, color: F.t3 }}>重置条件</Btn>
        </div>

        {/* Center: Floor plan */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 22, background: F.bg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: F.t1 }}>经管自习室 301</div>
              <Badge variant="green" dot>开放中</Badge>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 11, color: F.t3 }}>
              {[['#F0FDF4','#86EFAC','空闲'],['#F3F4F6','#D1D5DB','已占'],['#003087','#003087','已选'],['#FAF0CC','#C9A840','我的']].map(([bg,bd,l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: bg, border: `1.5px solid ${bd}` }} />
                  {l}
                </div>
              ))}
            </div>
          </div>

          {/* Room layout */}
          <Card p={20}>
            {/* Entry indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{
                padding: '3px 24px', borderRadius: 4, background: F.borderLight,
                border: `1px dashed ${F.t4}`, fontSize: 10, color: F.t3, letterSpacing: 1,
              }}>入 口</div>
            </div>
            {/* Window row indicator */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6, paddingRight: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#0369A1' }}>
                <div style={{ width: 20, height: 2, background: '#7DD3FC', borderRadius: 1 }} />
                靠窗排
              </div>
            </div>
            <div style={{ display: 'flex', gap: 3, flexDirection: 'column', alignItems: 'center' }}>
              {/* Aisle label */}
              {[0,1,2,3,4,5,6].map(row => (
                <React.Fragment key={row}>
                  {row === 3 && (
                    <div style={{ width: '100%', height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ flex: 1, height: 1, background: F.borderLight }} />
                      <span style={{ fontSize: 9.5, color: F.t4, padding: '0 8px', letterSpacing: 1 }}>— 过道 —</span>
                      <div style={{ flex: 1, height: 1, background: F.borderLight }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <span style={{ width: 16, fontSize: 9, color: F.t3, textAlign: 'right', fontFamily: "'Inter'" }}>{String.fromCharCode(65+row)}</span>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[0,1,2,3].map(col => (
                        <SeatCell key={col} status={statuses[row*8+col]} num={nums(row,col)} />
                      ))}
                    </div>
                    <div style={{ width: 16 }} />
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[4,5,6,7].map(col => (
                        <SeatCell key={col} status={statuses[row*8+col]} num={nums(row,col)} />
                      ))}
                    </div>
                  </div>
                </React.Fragment>
              ))}
              <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
                <span style={{ width: 16 }} />
                {[1,2,3,4,'',5,6,7,8].map((n, i) => (
                  <span key={i} style={{ width: n === '' ? 34 : 34, textAlign: 'center', fontSize: 9, color: F.t4, fontFamily: "'Inter'" }}>{n}</span>
                ))}
              </div>
            </div>
          </Card>

          {/* Power outlet row */}
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ padding: '4px 10px', borderRadius: 6, background: F.white, border: `1px solid ${F.border}`, fontSize: 11, color: F.t3, display: 'flex', gap: 5, alignItems: 'center' }}>
              <span style={{ fontSize: 13 }}>⚡</span> A排、C排、E排设有插座
            </div>
            <div style={{ padding: '4px 10px', borderRadius: 6, background: F.white, border: `1px solid ${F.border}`, fontSize: 11, color: F.t3 }}>
              共 56 个座位 · 12 空余 · 今日已预约 38 场次
            </div>
          </div>
        </div>

        {/* Right: Booking panel */}
        <div style={{
          width: 276, flexShrink: 0, borderLeft: `1px solid ${F.border}`,
          background: F.white, overflowY: 'auto', padding: 18,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: F.t1, marginBottom: 16 }}>预约信息</div>

          {/* Selected seat card */}
          <div style={{
            padding: 14, borderRadius: 10, marginBottom: 16,
            background: F.navyDeep, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: -12, bottom: -12, width: 80, height: 80, borderRadius: '50%', background: 'rgba(201,168,64,0.1)' }} />
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>已选座位</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: F.gold, fontFamily: "'Inter'", marginBottom: 4 }}>C3</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>经管自习室 301 · C排3号</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
              {['插座', '安静区'].map(t => (
                <span key={t} style={{ padding: '2px 7px', borderRadius: 10, background: 'rgba(201,168,64,0.15)', color: F.gold, fontSize: 10, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Time summary */}
          <div style={{ marginBottom: 16 }}>
            {[
              ['日期', '2026年4月24日（周四）'],
              ['时间', '14:00 – 17:00（3小时）'],
              ['楼栋', '光华楼 A座 3楼'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${F.borderLight}` }}>
                <span style={{ fontSize: 11, color: F.t3 }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: F.t1 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Sign-in notice */}
          <div style={{ padding: 12, borderRadius: 9, background: F.amberBg, border: `1px solid #FDE68A`, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <Icon name="alert" size={13} color={F.amber} />
              <div style={{ fontSize: 11, color: F.amber, lineHeight: 1.6, fontWeight: 500 }}>
                请在开始时间后 <strong>15 分钟内</strong>完成签到，否则预约将自动取消并记录违约。
              </div>
            </div>
          </div>

          <Btn variant="primary" size="lg" style={{ width: '100%', justifyContent: 'center', borderRadius: 10 }}>确认预约</Btn>
          <Btn variant="ghost" size="sm" style={{ width: '100%', justifyContent: 'center', marginTop: 8, color: F.t3 }}>收藏该座位</Btn>

          <Divider style={{ margin: '16px 0' }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: F.t2, marginBottom: 10 }}>可用时段</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[['08:00–12:00','空闲','available'],['12:00–14:00','已占用','taken'],['14:00–17:00','已选','selected'],['17:00–22:00','空闲','available']].map(([t,l,s]) => (
              <div key={t} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 10px', borderRadius: 7,
                background: s === 'selected' ? F.navyLight : s === 'taken' ? F.borderLight : F.greenBg,
                border: `1px solid ${s === 'selected' ? F.navy+'30' : s === 'taken' ? F.border : '#BBF7D0'}`,
              }}>
                <span style={{ fontSize: 11, color: F.t2, fontFamily: "'Inter'", fontWeight: 600 }}>{t}</span>
                <Badge variant={s === 'selected' ? 'navy' : s === 'taken' ? 'gray' : 'green'}>{l}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

Object.assign(window, { StudentLogin, StudentHome, RoomList, SeatSelector });
