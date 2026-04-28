// Student Web Screens B: BookingConfirm, MyBookings, CheckIn, AIAssistant, NotifyCenter, Violations, Settings

// ── 05 Booking Confirm ────────────────────────────────
const BookingConfirm = () => (
  <PageLayout
    sidebar={<StudentSidebar active="select" />}
    topbar={<TopBar title="确认预约" sub="请仔细核对信息后提交" />}
  >
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        {['选择时间', '选择座位', '确认信息', '完成'].map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: i < 3 ? F.navy : F.borderLight,
                border: `2px solid ${i < 3 ? F.navy : F.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                color: i < 3 ? '#fff' : F.t4,
              }}>
                {i < 2 ? <Icon name="check" size={13} color="#fff" sw={3} /> : i + 1}
              </div>
              <span style={{ fontSize: 11, color: i === 2 ? F.navy : F.t3, fontWeight: i === 2 ? 700 : 400, whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < 3 && <div style={{ flex: 1, height: 2, background: i < 2 ? F.navy : F.border, margin: '0 6px', marginBottom: 24 }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Info card */}
      <Card style={{ marginBottom: 16 }} p={24}>
        <div style={{ fontSize: 13, fontWeight: 700, color: F.t1, marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Icon name="calendar" size={16} color={F.navy} />
          预约详情
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
          {[
            ['自习室', '经管自习室 301'],
            ['楼栋位置', '光华楼 A座 3楼'],
            ['座位编号', 'C3（插座 · 安静区）'],
            ['预约日期', '2026年4月24日（周四）'],
            ['开始时间', '14:00'],
            ['结束时间', '17:00（共3小时）'],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: '10px 0', borderBottom: `1px solid ${F.borderLight}` }}>
              <div style={{ fontSize: 11, color: F.t3, marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: F.t1 }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Rules card */}
      <Card style={{ marginBottom: 16 }} p={20}>
        <div style={{ fontSize: 13, fontWeight: 700, color: F.t1, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Icon name="shield" size={15} color={F.navy} />
          使用规则与违约须知
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['签到规则', '开始时间后 15 分钟内扫码/输码签到，逾期自动取消并记录违约 1 次'],
            ['提前离开', '可通过系统提前结束，不记违约；无故离席超 30 分钟视同违约'],
            ['取消规则', '开始前 1 小时以上取消不记违约；1 小时内取消记违约 0.5 次'],
            ['违约累计', '本学期累计 3 次违约将被限制预约 7 天；5 次限制 30 天'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 8, background: F.bg }}>
              <div style={{ width: 4, borderRadius: 2, background: F.navy, flexShrink: 0, alignSelf: 'stretch' }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: F.t1, marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 11, color: F.t2, lineHeight: 1.7 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Reminder settings */}
      <Card style={{ marginBottom: 24 }} p={18}>
        <div style={{ fontSize: 12, fontWeight: 700, color: F.t1, marginBottom: 12 }}>提醒方式</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['微信服务通知', '邮件提醒', '不提醒'].map((r, i) => (
            <div key={r} style={{
              flex: 1, padding: '10px', borderRadius: 8, textAlign: 'center', cursor: 'pointer',
              border: `1.5px solid ${i === 0 ? F.navy : F.border}`,
              background: i === 0 ? F.navyLight : F.white,
              fontSize: 12, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? F.navy : F.t3,
            }}>{r}</div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <Btn variant="secondary" size="lg" style={{ flex: 1, justifyContent: 'center' }}>返回修改</Btn>
        <button style={{
          flex: 2, padding: '13px', borderRadius: 10,
          background: `linear-gradient(135deg, ${F.navy}, ${F.navyMid})`,
          color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
          boxShadow: `0 4px 20px ${F.navy}40`, letterSpacing: 2,
        }}>确认提交预约</button>
      </div>
    </div>
  </PageLayout>
);

// ── 06 My Bookings ────────────────────────────────────
const MyBookings = () => {
  const bookings = [
    { seat: 'C3', room: '经管自习室 301', loc: '光华楼 A座', time: '今日 14:00–17:00', status: 'upcoming', tags: ['插座'] },
    { seat: 'F12', room: '理工自习室 201', loc: '逸夫楼 2楼', time: '4月22日 09:00–12:00', status: 'completed', tags: ['24小时'] },
    { seat: 'A5', room: '文史馆阅览室', loc: '文史馆 1楼', time: '4月20日 14:00–16:00', status: 'completed', tags: ['靠窗'] },
    { seat: 'D8', room: '经管自习室 301', loc: '光华楼 A座', time: '4月18日 10:00–12:00', status: 'violation', tags: [] },
    { seat: 'B3', room: '理工自习室 201', loc: '逸夫楼 2楼', time: '4月15日 19:00–22:00', status: 'cancelled', tags: [] },
  ];
  const statusMap = {
    upcoming: { label: '待签到', variant: 'blue' },
    completed: { label: '已完成', variant: 'green' },
    violation: { label: '违约', variant: 'red' },
    cancelled: { label: '已取消', variant: 'gray' },
  };
  return (
    <PageLayout
      sidebar={<StudentSidebar active="bookings" />}
      topbar={<TopBar title="我的预约" sub="本学期共 18 次预约 · 16 次完成" actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" size="sm" icon="filter">筛选状态</Btn>
          <Btn variant="secondary" size="sm" icon="download">导出记录</Btn>
        </div>
      } />}
    >
      {/* Tab filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {['全部', '待签到', '使用中', '已完成', '已取消', '违约'].map((t, i) => (
          <div key={t} style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: i === 0 ? F.navy : F.white,
            color: i === 0 ? '#fff' : F.t2,
            border: `1px solid ${i === 0 ? F.navy : F.border}`,
          }}>{t}</div>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute', left: 19, top: 20, bottom: 20,
          width: 2, background: `linear-gradient(to bottom, ${F.navy}, ${F.border})`,
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {bookings.map((b, i) => {
            const sm = statusMap[b.status];
            return (
              <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {/* Timeline dot */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                  background: b.status === 'upcoming' ? F.navy : b.status === 'completed' ? F.greenBg : b.status === 'violation' ? F.redBg : F.borderLight,
                  border: `2px solid ${b.status === 'upcoming' ? F.navy : b.status === 'completed' ? F.green : b.status === 'violation' ? F.red : F.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={b.status === 'upcoming' ? 'clock' : b.status === 'completed' ? 'check-circle' : b.status === 'violation' ? 'alert' : 'x'} size={16}
                    color={b.status === 'upcoming' ? F.navy : b.status === 'completed' ? F.green : b.status === 'violation' ? F.red : F.t3} />
                </div>

                <Card style={{ flex: 1 }} p={16}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: F.t1, fontFamily: "'Inter'" }}>{b.seat}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: F.t1 }}>{b.room}</span>
                        <Badge variant={sm.variant}>{sm.label}</Badge>
                      </div>
                      <div style={{ fontSize: 11, color: F.t3, display: 'flex', gap: 10 }}>
                        <span><Icon name="pin" size={10} color={F.t3} /> {b.loc}</span>
                        <span><Icon name="clock" size={10} color={F.t3} /> {b.time}</span>
                      </div>
                      {b.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                          {b.tags.map(t => <Badge key={t} variant="gray">{t}</Badge>)}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {b.status === 'upcoming' && (
                        <>
                          <Btn variant="primary" size="sm">立即签到</Btn>
                          <Btn variant="secondary" size="sm">取消</Btn>
                        </>
                      )}
                      {b.status === 'completed' && <Btn variant="outline" size="sm">再次预约</Btn>}
                      {b.status === 'violation' && <Btn variant="secondary" size="sm" icon="info">查看原因</Btn>}
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
};

// ── 07 Check-in ───────────────────────────────────────
const CheckIn = () => {
  const [digits, setDigits] = React.useState(['2','7','4','','','']);
  return (
    <PageLayout
      sidebar={<StudentSidebar active="checkin" />}
      topbar={<TopBar title="签到" sub="输入动态码或扫码完成签到" />}
    >
      <div style={{ maxWidth: 520, margin: '20px auto', textAlign: 'center' }}>
        {/* Countdown ring */}
        <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 32px' }}>
          <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r="62" fill="none" stroke={F.borderLight} strokeWidth="6" />
            <circle cx="70" cy="70" r="62" fill="none" stroke={F.navy} strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 62}`}
              strokeDashoffset={`${2 * Math.PI * 62 * 0.38}`}
              strokeLinecap="round" />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: F.navy, fontFamily: "'Inter'", lineHeight: 1 }}>9:22</div>
            <div style={{ fontSize: 10, color: F.t3, marginTop: 3, letterSpacing: 0.5 }}>剩余签到时间</div>
          </div>
        </div>

        <div style={{ fontSize: 13, color: F.t2, marginBottom: 8 }}>经管自习室 301 · C3 座 · 今日 14:00–17:00</div>
        <div style={{ fontSize: 12, color: F.t3, marginBottom: 32 }}>请查看教室屏幕上的 6 位动态码</div>

        {/* Code input */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
          {digits.map((d, i) => (
            <React.Fragment key={i}>
              {i === 3 && <div style={{ width: 16, alignSelf: 'center', height: 2, background: F.t4 }} />}
              <div style={{
                width: 52, height: 58, borderRadius: 10, fontSize: 26, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: d ? F.navyLight : F.white,
                border: `2px solid ${d ? F.navy : i === digits.findIndex(x => !x) ? F.navy : F.border}`,
                color: F.navy, fontFamily: "'Inter'",
                boxShadow: i === digits.findIndex(x => !x) ? `0 0 0 3px ${F.navy}20` : 'none',
              }}>{d}</div>
            </React.Fragment>
          ))}
        </div>

        {/* Mock numpad */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10, maxWidth: 260, margin: '0 auto 24px',
        }}>
          {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
            <div key={i} style={{
              padding: '14px 0', borderRadius: 10, textAlign: 'center',
              background: k === '' ? 'transparent' : F.white,
              border: k === '' ? 'none' : `1.5px solid ${F.border}`,
              fontSize: 20, fontWeight: 600, color: F.t1,
              cursor: k !== '' ? 'pointer' : 'default',
              fontFamily: "'Inter'",
            }}>{k}</div>
          ))}
        </div>

        <button style={{
          width: '100%', maxWidth: 260, margin: '0 auto', display: 'block',
          padding: '13px', borderRadius: 10,
          background: `linear-gradient(135deg, ${F.navy}, ${F.navyMid})`,
          color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
          letterSpacing: 2, boxShadow: `0 4px 20px ${F.navy}40`,
        }}>确 认 签 到</button>

        <div style={{ marginTop: 20, fontSize: 12, color: F.t3 }}>
          无法输入？<span style={{ color: F.blue, cursor: 'pointer' }}>扫描教室二维码</span> 或 <span style={{ color: F.blue, cursor: 'pointer' }}>联系管理员</span>
        </div>
      </div>
    </PageLayout>
  );
};

// ── 08 AI Assistant ───────────────────────────────────
const AIAssistant = () => {
  const msgs = [
    { role: 'user', text: '今天下午有空位吗？我想要有插座的座位' },
    { role: 'ai', text: '根据您的偏好，今天下午（14:00 后）共找到 3 个合适选项：', cards: [
      { name: '经管自习室 301 · C3', tags: ['插座', '安静区'], avail: '14:00–22:00', dist: '光华楼' },
      { name: '理工自习室 201 · F8', tags: ['插座', '24小时'], avail: '全天可用', dist: '逸夫楼' },
      { name: '图书馆自习区 · B22', tags: ['插座', '靠窗'], avail: '14:00–20:00', dist: '图书馆' },
    ]},
    { role: 'user', text: '帮我预约第一个，时间 14:00 到 17:00' },
    { role: 'ai', text: '已为您找到 经管自习室 301 · C3 号座位，时间 2026年4月24日 14:00–17:00。请确认是否预约？', confirm: true },
  ];
  const shortcuts = ['附近有什么空位', '明天上午安静的', '预约记录', '我的违约情况', '图书馆什么时候关'];
  return (
    <PageLayout
      sidebar={<StudentSidebar active="assistant" />}
      topbar={<TopBar title="智能助手" sub="自然语言找座 · 预约管理 · 规则问答" />}
    >
      <div style={{ display: 'flex', height: '100%', gap: 18 }}>
        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: F.white, borderRadius: 14, border: `1px solid ${F.border}`, boxShadow: F.shadow, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {msgs.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                {msg.role === 'ai' && (
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${F.navy}, ${F.navyMid})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="zap" size={15} color={F.gold} />
                  </div>
                )}
                <div style={{ maxWidth: '70%' }}>
                  <div style={{
                    padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                    background: msg.role === 'user' ? F.navy : F.bg,
                    color: msg.role === 'user' ? '#fff' : F.t1,
                    fontSize: 13, lineHeight: 1.6,
                  }}>{msg.text}</div>
                  {msg.cards && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {msg.cards.map((c, j) => (
                        <div key={j} style={{
                          padding: '12px 14px', borderRadius: 10, background: F.white,
                          border: `1px solid ${F.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          boxShadow: F.shadow,
                        }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: F.t1, marginBottom: 4 }}>{c.name}</div>
                            <div style={{ display: 'flex', gap: 4 }}>{c.tags.map(t => <Badge key={t} variant="gray">{t}</Badge>)}</div>
                            <div style={{ fontSize: 10, color: F.t3, marginTop: 4 }}>{c.dist} · {c.avail}</div>
                          </div>
                          <Btn variant="primary" size="xs">立即预约</Btn>
                        </div>
                      ))}
                      <Btn variant="secondary" size="sm" icon="refresh" style={{ alignSelf: 'flex-start' }}>换一批</Btn>
                    </div>
                  )}
                  {msg.confirm && (
                    <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                      <Btn variant="primary" size="sm">确认预约</Btn>
                      <Btn variant="secondary" size="sm">取消</Btn>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Shortcuts */}
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${F.borderLight}`, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {shortcuts.map(s => (
              <div key={s} style={{
                padding: '4px 10px', borderRadius: 16, fontSize: 11, fontWeight: 600,
                background: F.navyLight, color: F.navy, border: `1px solid ${F.navy}20`, cursor: 'pointer',
              }}>{s}</div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${F.border}`, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              border: `1.5px solid ${F.border}`, background: F.bg,
              fontSize: 13, color: F.t3, minHeight: 42, display: 'flex', alignItems: 'center',
            }}>输入问题，例如"明天上午有没有靠窗且安静的座位"…</div>
            <Btn variant="ghost" size="md" icon="mic" style={{ color: F.t3, border: `1px solid ${F.border}` }} />
            <button style={{
              width: 42, height: 42, borderRadius: 10, background: F.navy,
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <Icon name="send" size={16} color="#fff" />
            </button>
          </div>
        </div>

        {/* Side: history & tips */}
        <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card p={16}>
            <div style={{ fontSize: 12, fontWeight: 700, color: F.t1, marginBottom: 10 }}>最近对话</div>
            {['推荐安静的自习室', '下午有没有插座', '我的违约次数', '图书馆几点关门'].map(h => (
              <div key={h} style={{ padding: '7px 0', borderBottom: `1px solid ${F.borderLight}`, fontSize: 12, color: F.t2, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                {h}<Icon name="chevron-right" size={12} color={F.t4} />
              </div>
            ))}
          </Card>
          <Card p={16}>
            <div style={{ fontSize: 12, fontWeight: 700, color: F.t1, marginBottom: 10 }}>能力示例</div>
            {[['找座推荐', '描述你的需求，AI 智能匹配'], ['一键预约', '对话中直接完成预约操作'], ['规则问答', '签到规则、违约政策等']].map(([t, d]) => (
              <div key={t} style={{ padding: '8px 0', borderBottom: `1px solid ${F.borderLight}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: F.navy, marginBottom: 2 }}>{t}</div>
                <div style={{ fontSize: 10, color: F.t3 }}>{d}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

// ── 09 Notification Center ────────────────────────────
const NotifyCenter = () => {
  const groups = [
    { date: '今天', items: [
      { icon: 'check-circle', color: F.green, title: '签到成功', desc: '经管自习室 301 · C3 · 14:02 签到成功，使用至 17:00', time: '14:02', read: false },
      { icon: 'bell', color: F.navy, title: '预约提醒', desc: '您今日 14:00 在经管自习室 301 的预约将在 30 分钟后开始', time: '13:30', read: false },
      { icon: 'calendar', color: F.blue, title: '预约成功', desc: '座位 C3 已成功预约，2026年4月24日 14:00–17:00', time: '09:15', read: false },
    ]},
    { date: '昨天', items: [
      { icon: 'alert', color: F.amber, title: '临近签到时间', desc: '您在理工自习室 201 的预约（F8）将于 5 分钟后截止签到', time: '08:55', read: true },
      { icon: 'check-circle', color: F.green, title: '使用结束', desc: '理工自习室 201 · F8 · 使用已结束，感谢使用', time: '12:02', read: true },
    ]},
    { date: '系统公告', items: [
      { icon: 'info', color: F.purple, title: '五一假期安排', desc: '5月1日–3日，全校自习室照常开放，预约系统正常运行', time: '4月21日', read: true },
    ]},
  ];
  return (
    <PageLayout
      sidebar={<StudentSidebar active="notify" />}
      topbar={<TopBar title="通知中心" sub="3 条未读" actions={<Btn variant="ghost" size="sm">全部已读</Btn>} />}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {groups.map(g => (
          <div key={g.date} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: F.t3, letterSpacing: 1, marginBottom: 10, padding: '0 4px' }}>{g.date}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {g.items.map((n, i) => (
                <Card key={i} p={16} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', opacity: n.read ? 0.65 : 1 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: `${n.color}12`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={n.icon} size={17} color={n.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: F.t1 }}>{n.title}</span>
                      {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: F.red }} />}
                    </div>
                    <div style={{ fontSize: 12, color: F.t2, lineHeight: 1.6 }}>{n.desc}</div>
                  </div>
                  <span style={{ fontSize: 11, color: F.t3, flexShrink: 0 }}>{n.time}</span>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

// ── 10 Violation Record ───────────────────────────────
const ViolationRecord = () => {
  const records = [
    { date: '4月18日', room: '经管自习室 301 · D8', reason: '未签到（签到超时自动取消）', count: 1, status: 'confirmed' },
    { date: '3月12日', room: '文史馆阅览室 · B14', reason: '提前离座超 30 分钟', count: 0.5, status: 'confirmed' },
    { date: '2月28日', room: '理工自习室 201 · A3', reason: '1小时内取消预约', count: 0.5, status: 'appealed' },
  ];
  return (
    <PageLayout
      sidebar={<StudentSidebar active="violation" />}
      topbar={<TopBar title="违约记录" sub="本学期违约 2 次（累计 2.0 次）" />}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Warning summary */}
        <div style={{
          padding: '18px 22px', borderRadius: 12, marginBottom: 22,
          background: 'linear-gradient(120deg, #FFFBEB, #FEF3C7)',
          border: `1px solid #FDE68A`, display: 'flex', gap: 16, alignItems: 'center',
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF3C7', border: `2px solid #FDE68A`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="alert" size={22} color={F.amber} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>本学期已违约 2.0 次</div>
            <div style={{ fontSize: 12, color: '#B45309', lineHeight: 1.6 }}>累计达 3 次将被限制预约 7 天。请合理安排预约，按时签到。</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: F.amber, fontFamily: "'Inter'" }}>2.0</div>
            <div style={{ fontSize: 10, color: '#B45309' }}>/ 3.0 限制</div>
          </div>
        </div>

        {/* Progress bar */}
        <Card style={{ marginBottom: 20 }} p={16}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11 }}>
            <span style={{ color: F.t2, fontWeight: 600 }}>违约进度</span>
            <span style={{ color: F.amber, fontWeight: 700 }}>2.0 / 5.0（30天限制）</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: F.borderLight, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', width: '40%', background: `linear-gradient(90deg, ${F.amber}, #F59E0B)`, borderRadius: 4 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: F.t3 }}>
            <span>0</span><span style={{ color: F.amber }}>⚠ 3次 限7天</span><span style={{ color: F.red }}>⛔ 5次 限30天</span>
          </div>
        </Card>

        {/* Records */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {records.map((r, i) => (
            <Card key={i} p={18}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: r.status === 'appealed' ? F.purpleBg : F.redBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name="alert" size={16} color={r.status === 'appealed' ? F.purple : F.red} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: F.t1, marginBottom: 3 }}>{r.room}</div>
                    <div style={{ fontSize: 12, color: F.t2, marginBottom: 6 }}>{r.reason}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <Icon name="clock" size={11} color={F.t3} />
                      <span style={{ fontSize: 11, color: F.t3 }}>{r.date}</span>
                      <Badge variant={r.status === 'appealed' ? 'purple' : 'red'}>{r.status === 'appealed' ? '申诉中' : '已确认'}</Badge>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: r.status === 'appealed' ? F.purple : F.red, fontFamily: "'Inter'" }}>+{r.count}</div>
                  <div style={{ fontSize: 10, color: F.t3 }}>违约次数</div>
                  {r.status === 'confirmed' && <Btn variant="ghost" size="xs" style={{ marginTop: 6, color: F.blue, fontSize: 11 }}>申请申诉</Btn>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

Object.assign(window, { BookingConfirm, MyBookings, CheckIn, AIAssistant, NotifyCenter, ViolationRecord });
