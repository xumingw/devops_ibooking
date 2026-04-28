// Admin Web Screens: Dashboard, RoomMgmt, SeatMgmt, FloorEditor, BookingRecords, RoleManagement, DataReports

// ── Admin 01 Dashboard ────────────────────────────────
const AdminDashboard = () => {
  const heatData = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 16 }, (_, h) => {
      const base = [0.2,0.15,0.1,0.08,0.12,0.35,0.62,0.88,0.91,0.75,0.55,0.48,0.72,0.93,0.85,0.6];
      return base[h] * (0.7 + Math.random() * 0.3) * (day === 5 || day === 6 ? 0.5 : 1);
    })
  );
  const days = ['周一','周二','周三','周四','周五','周六','周日'];
  const hours = Array.from({ length: 16 }, (_, i) => `${i + 6}时`);
  const recentBookings = [
    { id: 'BK20240424-1893', user: '林晓明', room: '经管301', seat: 'C3', time: '14:00–17:00', status: 'active' },
    { id: 'BK20240424-1892', user: '张子涵', room: '理工201', seat: 'F8', time: '13:00–16:00', status: 'pending' },
    { id: 'BK20240424-1891', user: '王芳', room: '图书馆区', seat: 'B22', time: '10:00–12:00', status: 'done' },
    { id: 'BK20240424-1890', user: '陈浩然', room: '文史馆A', seat: 'D5', time: '09:00–11:00', status: 'violation' },
  ];
  return (
    <PageLayout
      sidebar={<AdminSidebar active="dashboard" />}
      topbar={<TopBar title="管理仪表盘" sub="2026年4月24日 · 实时数据" admin actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" size="sm" icon="refresh">刷新</Btn>
          <Btn variant="secondary" size="sm" icon="download">导出报告</Btn>
        </div>
      } />}
    >
      {/* KPI row */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
        {[
          { label: '今日预约总数', value: '1,247', icon: 'calendar', color: F.navy, trend: '+8.2%' },
          { label: '当前在座人数', value: '892', icon: 'users', color: F.blue, trend: '高峰期' },
          { label: '签到率', value: '87.3%', icon: 'check-circle', color: F.green, trend: '↑ 2.1%' },
          { label: '违约率', value: '2.1%', icon: 'alert', color: F.amber, trend: '↓ 0.3%' },
          { label: '开放自习室', value: '43 / 48', icon: 'building', color: F.purple, trend: '5间维护中' },
        ].map(k => (
          <Card key={k.label} style={{ flex: 1 }} p={16}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `${k.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={k.icon} size={16} color={k.color} />
              </div>
              <span style={{ fontSize: 10, color: k.color, fontWeight: 700, background: `${k.color}10`, padding: '2px 6px', borderRadius: 6 }}>{k.trend}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: F.t1, fontFamily: "'Inter'", letterSpacing: -0.5, marginBottom: 3 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: F.t3 }}>{k.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {/* Heatmap */}
        <Card style={{ flex: 2 }} p={18}>
          <div style={{ fontSize: 13, fontWeight: 700, color: F.t1, marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
            本周座位利用率热力图
            <span style={{ fontSize: 11, color: F.t3, fontWeight: 400 }}>颜色深度 = 占用率</span>
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginRight: 8, paddingTop: 18 }}>
              {days.map(d => <div key={d} style={{ height: 22, fontSize: 9.5, color: F.t3, display: 'flex', alignItems: 'center' }}>{d}</div>)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                {hours.map(h => <div key={h} style={{ flex: 1, fontSize: 8, color: F.t3, textAlign: 'center' }}>{h}</div>)}
              </div>
              {heatData.map((row, di) => (
                <div key={di} style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                  {row.map((v, hi) => (
                    <div key={hi} style={{
                      flex: 1, height: 22, borderRadius: 3,
                      background: `rgba(0,48,135,${Math.max(0.05, v * 0.9)})`,
                    }} title={`${days[di]} ${hours[hi]}: ${Math.round(v*100)}%`} />
                  ))}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 9.5, color: F.t3 }}>低</span>
                {[0.05,0.2,0.4,0.6,0.8,1].map(v => (
                  <div key={v} style={{ width: 16, height: 12, borderRadius: 2, background: `rgba(0,48,135,${v * 0.9 + 0.05})` }} />
                ))}
                <span style={{ fontSize: 9.5, color: F.t3 }}>高</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Room status */}
        <Card style={{ flex: 1 }} p={18}>
          <div style={{ fontSize: 13, fontWeight: 700, color: F.t1, marginBottom: 14 }}>自习室实时状态</div>
          {[
            { name: '经管自习室 301', pct: 75, status: 'high' },
            { name: '理工自习室 201', pct: 48, status: 'mid' },
            { name: '图书馆自习区', pct: 63, status: 'mid' },
            { name: '文史馆阅览室 A', pct: 94, status: 'full' },
            { name: '理工自习室 403', pct: 31, status: 'low' },
            { name: '逸夫综合区', pct: 0, status: 'closed' },
          ].map(r => {
            const barColor = r.status === 'full' ? F.red : r.status === 'high' ? F.amber : r.status === 'closed' ? F.t4 : F.green;
            return (
              <div key={r.name} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: F.t2, fontWeight: 500 }}>{r.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: barColor, fontFamily: "'Inter'" }}>
                    {r.status === 'closed' ? '已关闭' : `${r.pct}%`}
                  </span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: F.borderLight }}>
                  <div style={{ height: '100%', width: `${r.pct}%`, background: barColor, borderRadius: 3, transition: 'width 0.4s' }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Recent bookings table */}
      <Card p={18}>
        <div style={{ fontSize: 13, fontWeight: 700, color: F.t1, marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
          最近预约记录
          <Btn variant="ghost" size="sm" iconRight="arrow-right">查看全部</Btn>
        </div>
        <div style={{ fontSize: 11 }}>
          <div style={{ display: 'flex', padding: '0 12px 8px', color: F.t3, fontWeight: 600, borderBottom: `1px solid ${F.border}` }}>
            {['预约编号','用户','自习室','座位','时间段','状态'].map((h, i) => (
              <div key={h} style={{ flex: i === 0 ? 2 : 1 }}>{h}</div>
            ))}
          </div>
          {recentBookings.map(b => {
            const sm = { active: ['使用中','green'], pending: ['待签到','blue'], done: ['已完成','gray'], violation: ['违约','red'] };
            const [l, v] = sm[b.status];
            return (
              <div key={b.id} style={{ display: 'flex', padding: '10px 12px', borderBottom: `1px solid ${F.borderLight}`, alignItems: 'center' }}>
                <div style={{ flex: 2, fontSize: 11, color: F.navy, fontFamily: "'Inter'", fontWeight: 600 }}>{b.id}</div>
                <div style={{ flex: 1, fontSize: 12, color: F.t1 }}>{b.user}</div>
                <div style={{ flex: 1, fontSize: 12, color: F.t2 }}>{b.room}</div>
                <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: F.t1, fontFamily: "'Inter'" }}>{b.seat}</div>
                <div style={{ flex: 1, fontSize: 11, color: F.t2 }}>{b.time}</div>
                <div style={{ flex: 1 }}><Badge variant={v}>{l}</Badge></div>
              </div>
            );
          })}
        </div>
      </Card>
    </PageLayout>
  );
};

// ── Admin 02 Room Management ──────────────────────────
const RoomManagement = () => {
  const rooms = [
    { id: 'R001', name: '经管自习室 301', building: '光华楼 A座', floor: 3, cap: 48, dept: '全校', status: 'open', hours: '08:00–22:00' },
    { id: 'R002', name: '理工自习室 201', building: '逸夫楼', floor: 2, cap: 64, dept: '全校', status: 'open', hours: '全天' },
    { id: 'R003', name: '文史馆阅览室 A', building: '文史馆', floor: 1, cap: 80, dept: '文理兼容', status: 'open', hours: '08:00–21:00' },
    { id: 'R004', name: '新闻学院研讨室', building: '新闻学院楼', floor: 4, cap: 20, dept: '新闻学院', status: 'maintenance', hours: '09:00–20:00' },
    { id: 'R005', name: '理工自习室 403', building: '逸夫楼', floor: 4, cap: 56, dept: '全校', status: 'open', hours: '08:00–23:00' },
    { id: 'R006', name: '逸夫综合自习区', building: '逸夫楼', floor: 1, cap: 100, dept: '全校', status: 'closed', hours: '08:00–22:00' },
  ];
  return (
    <PageLayout
      sidebar={<AdminSidebar active="rooms" />}
      topbar={<TopBar title="自习室管理" sub={`共 ${rooms.length} 个自习室`} admin actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" size="sm" icon="download">导出</Btn>
          <Btn variant="primary" size="sm" icon="plus">新增自习室</Btn>
        </div>
      } />}
    >
      {/* Search / filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, flex: 1, background: F.white, borderRadius: 9, border: `1.5px solid ${F.border}`, padding: '8px 14px', alignItems: 'center' }}>
          <Icon name="search" size={14} color={F.t3} />
          <span style={{ fontSize: 13, color: F.t3 }}>搜索自习室名称、楼栋…</span>
        </div>
        {['全部状态', '全部楼栋', '全校开放'].map((f, i) => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: F.white, border: `1px solid ${F.border}`, fontSize: 12, color: F.t2, cursor: 'pointer' }}>
            {f}<Icon name="chevron-down" size={12} color={F.t3} />
          </div>
        ))}
      </div>

      {/* Table */}
      <Card p={0} style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '12px 20px', background: F.bg, borderBottom: `1px solid ${F.border}`, fontSize: 11, color: F.t3, fontWeight: 600 }}>
          {['编号','自习室名称','楼栋','楼层','容量','开放对象','状态','开放时间','操作'].map((h, i) => (
            <div key={h} style={{ flex: [0.6,1.8,1.2,0.5,0.5,0.8,0.7,0.9,1][i] || 1 }}>{h}</div>
          ))}
        </div>
        {rooms.map((r, i) => {
          const sv = r.status === 'open' ? 'green' : r.status === 'maintenance' ? 'amber' : 'gray';
          const sl = r.status === 'open' ? '开放中' : r.status === 'maintenance' ? '维护中' : '已关闭';
          return (
            <div key={r.id} style={{
              display: 'flex', padding: '13px 20px', borderBottom: `1px solid ${F.borderLight}`,
              alignItems: 'center', background: i % 2 === 0 ? F.white : '#FAFBFD',
            }}>
              <div style={{ flex: 0.6, fontSize: 11, color: F.t3, fontFamily: "'Inter'" }}>{r.id}</div>
              <div style={{ flex: 1.8, fontSize: 13, fontWeight: 600, color: F.t1 }}>{r.name}</div>
              <div style={{ flex: 1.2, fontSize: 12, color: F.t2 }}>{r.building}</div>
              <div style={{ flex: 0.5, fontSize: 12, color: F.t2 }}>{r.floor}楼</div>
              <div style={{ flex: 0.5, fontSize: 12, fontWeight: 700, color: F.t1 }}>{r.cap}</div>
              <div style={{ flex: 0.8 }}><Badge variant={r.dept === '全校' ? 'navy' : 'purple'}>{r.dept}</Badge></div>
              <div style={{ flex: 0.7 }}><Badge variant={sv} dot>{sl}</Badge></div>
              <div style={{ flex: 0.9, fontSize: 11, color: F.t2, fontFamily: "'Inter'" }}>{r.hours}</div>
              <div style={{ flex: 1, display: 'flex', gap: 6 }}>
                <Btn variant="secondary" size="xs" icon="edit">编辑</Btn>
                <Btn variant="secondary" size="xs" icon="move">平面图</Btn>
                <Btn variant="ghost" size="xs" icon="more-v" />
              </div>
            </div>
          );
        })}
      </Card>
    </PageLayout>
  );
};

// ── Admin 03 Floor Plan Editor ────────────────────────
const FloorPlanEditor = () => {
  const toolbar = [['move','选择'],['plus','添加座位'],['trash','删除'],['edit','标注属性'],['grid','吸附网格'],['refresh','撤销']];
  const statuses2 = ['available','window','window','window','window','window','window','available',
    'available','taken','available','taken','available','taken','available','available',
    'available','available','taken','selected','available','taken','available','taken',
    'taken','available','available','available','taken','available','available','taken',
    'available','taken','available','taken','available','available','taken','available',
    'taken','available','available','available','taken','available','available','taken'];
  return (
    <PageLayout
      sidebar={<AdminSidebar active="editor" />}
      topbar={<TopBar title="座位平面图编辑器" sub="经管自习室 301 · 光华楼 A座 3楼" admin actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" size="sm" icon="eye">预览</Btn>
          <Btn variant="primary" size="sm" icon="check">保存布局</Btn>
        </div>
      } />}
      noPad
    >
      <div style={{ display: 'flex', height: '100%' }}>
        {/* Left toolbar */}
        <div style={{ width: 56, background: F.white, borderRight: `1px solid ${F.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 4 }}>
          {toolbar.map(([icon, label], i) => (
            <div key={icon} title={label} style={{
              width: 40, height: 40, borderRadius: 8,
              background: i === 0 ? F.navy : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s',
              border: i === 0 ? 'none' : `1px solid transparent`,
            }}>
              <Icon name={icon} size={16} color={i === 0 ? '#fff' : F.t2} />
            </div>
          ))}
          <div style={{ flex: 1 }} />
          {[['info','说明'],['download','导出']].map(([icon, label]) => (
            <div key={icon} title={label} style={{ width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name={icon} size={15} color={F.t3} />
            </div>
          ))}
        </div>

        {/* Canvas area */}
        <div style={{ flex: 1, background: '#F7F8FB', overflow: 'auto', padding: 32, position: 'relative' }}>
          {/* Grid dots */}
          <svg style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} width="100%" height="100%">
            <defs>
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="0.8" fill={F.t4} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          <div style={{ position: 'relative', background: F.white, borderRadius: 12, padding: 28, display: 'inline-block', boxShadow: F.shadowMd, border: `1px solid ${F.border}` }}>
            {/* Entry */}
            <div style={{ textAlign: 'center', marginBottom: 10 }}>
              <div style={{ display: 'inline-block', padding: '3px 20px', borderRadius: 4, background: F.bg, border: `1px dashed ${F.t4}`, fontSize: 10, color: F.t3 }}>入 口</div>
            </div>
            {[0,1,2,3,4,5].map(row => (
              <React.Fragment key={row}>
                {row === 3 && <div style={{ height: 18 }} />}
                <div style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
                  <span style={{ width: 14, fontSize: 9, color: F.t3, textAlign: 'right', fontFamily: "'Inter'" }}>{String.fromCharCode(65+row)}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0,1,2,3].map(c => (
                      <SeatCell key={c} status={statuses2[row*8+c] || 'available'} num={`${String.fromCharCode(65+row)}${c+1}`} />
                    ))}
                  </div>
                  <div style={{ width: 20 }} />
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[4,5,6,7].map(c => (
                      <SeatCell key={c} status={statuses2[row*8+c] || 'available'} num={`${String.fromCharCode(65+row)}${c+1}`} />
                    ))}
                  </div>
                </div>
              </React.Fragment>
            ))}
            {/* Selected seat indicator */}
            <div style={{
              position: 'absolute', top: 152, left: 178,
              width: 34, height: 32, borderRadius: 5,
              border: `2px dashed ${F.gold}`, pointerEvents: 'none',
            }} />
          </div>
        </div>

        {/* Right: properties panel */}
        <div style={{ width: 240, background: F.white, borderLeft: `1px solid ${F.border}`, padding: 16, overflowY: 'auto' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: F.t1, marginBottom: 14 }}>属性面板</div>
          <div style={{ padding: 12, borderRadius: 8, background: F.navyLight, border: `1px solid ${F.navy}20`, marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: F.t3, marginBottom: 4 }}>已选座位</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: F.navy, fontFamily: "'Inter'" }}>C4</div>
          </div>
          {[['行', 'C（第3行）'],['列','4（第4列）'],['朝向','背窗'],['状态','正常']].map(([k,v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${F.borderLight}`, fontSize: 12 }}>
              <span style={{ color: F.t3 }}>{k}</span>
              <span style={{ color: F.t1, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: F.t2, marginBottom: 8 }}>标签</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {['插座','安静区','靠窗','白板附近'].map((t, i) => (
                <div key={t} style={{
                  padding: '3px 9px', borderRadius: 16, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                  background: i < 2 ? F.navy : F.white,
                  color: i < 2 ? '#fff' : F.t3,
                  border: `1px solid ${i < 2 ? F.navy : F.border}`,
                }}>{t}</div>
              ))}
            </div>
          </div>
          <Divider style={{ margin: '14px 0' }} />
          <Btn variant="primary" size="sm" style={{ width: '100%', justifyContent: 'center' }}>应用更改</Btn>
          <Btn variant="danger" size="sm" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} icon="trash">删除座位</Btn>
        </div>
      </div>
    </PageLayout>
  );
};

// ── Admin 04 Booking Records ──────────────────────────
const BookingRecords = () => {
  const records = [
    { id: 'BK-1893', user: '林晓明', uid: '21307001', room: '经管301', seat: 'C3', date: '04-24', time: '14:00–17:00', checkin: '14:02', status: 'active' },
    { id: 'BK-1892', user: '张子涵', uid: '21309022', room: '理工201', seat: 'F8', date: '04-24', time: '13:00–16:00', checkin: '13:08', status: 'active' },
    { id: 'BK-1891', user: '王芳', uid: '20301055', room: '图书馆', seat: 'B22', date: '04-24', time: '10:00–12:00', checkin: '10:05', status: 'done' },
    { id: 'BK-1890', user: '陈浩然', uid: '22310044', room: '文史馆A', seat: 'D5', date: '04-24', time: '09:00–11:00', checkin: '—', status: 'violation' },
    { id: 'BK-1889', user: '赵雪', uid: '21306078', room: '理工403', seat: 'A11', date: '04-23', time: '19:00–22:00', checkin: '19:04', status: 'done' },
    { id: 'BK-1888', user: '刘明达', uid: '20312091', room: '经管301', seat: 'G2', date: '04-23', time: '14:00–17:00', checkin: '14:18', status: 'done' },
  ];
  const sm = { active: ['使用中','green'], done: ['已完成','gray'], violation: ['违约','red'], pending: ['待签到','blue'] };
  return (
    <PageLayout
      sidebar={<AdminSidebar active="bookings" />}
      topbar={<TopBar title="预约记录" sub="共 1,247 条记录（今日）" admin actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" size="sm" icon="plus">代预约</Btn>
          <Btn variant="secondary" size="sm" icon="download">导出 Excel</Btn>
        </div>
      } />}
    >
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, background: F.white, borderRadius: 9, border: `1.5px solid ${F.border}`, padding: '7px 14px', alignItems: 'center', flex: 1, maxWidth: 280 }}>
          <Icon name="search" size={13} color={F.t3} />
          <span style={{ fontSize: 12, color: F.t3 }}>学号、姓名、座位编号…</span>
        </div>
        {['今日','本周','全部状态'].map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, background: F.white, border: `1px solid ${F.border}`, fontSize: 12, color: F.t2, cursor: 'pointer' }}>
            {f}<Icon name="chevron-down" size={11} color={F.t3} />
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 12, color: F.t3 }}>已选 0 条</div>
        <Btn variant="ghost" size="sm" icon="trash" style={{ color: F.red }}>批量取消</Btn>
      </div>

      <Card p={0} style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '11px 16px', background: F.bg, borderBottom: `1px solid ${F.border}`, fontSize: 11, color: F.t3, fontWeight: 600, alignItems: 'center' }}>
          <div style={{ width: 24 }} />
          {['预约ID','学号','姓名','自习室','座位','日期','时间段','签到时间','状态','操作'].map((h, i) => (
            <div key={h} style={{ flex: [1.5,0.9,0.8,0.9,0.5,0.7,0.9,0.8,0.7,1][i] }}>{h}</div>
          ))}
        </div>
        {records.map((r, i) => {
          const [l, v] = sm[r.status] || ['—','gray'];
          return (
            <div key={r.id} style={{
              display: 'flex', padding: '11px 16px', borderBottom: `1px solid ${F.borderLight}`,
              alignItems: 'center', background: i % 2 === 0 ? F.white : '#FAFBFD', fontSize: 12,
            }}>
              <div style={{ width: 24 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${F.border}` }} />
              </div>
              <div style={{ flex: 1.5, color: F.navy, fontWeight: 600, fontFamily: "'Inter'", fontSize: 11 }}>{r.id}</div>
              <div style={{ flex: 0.9, color: F.t2, fontFamily: "'Inter'" }}>{r.uid}</div>
              <div style={{ flex: 0.8, color: F.t1, fontWeight: 600 }}>{r.user}</div>
              <div style={{ flex: 0.9, color: F.t2 }}>{r.room}</div>
              <div style={{ flex: 0.5, color: F.t1, fontWeight: 700, fontFamily: "'Inter'" }}>{r.seat}</div>
              <div style={{ flex: 0.7, color: F.t2 }}>{r.date}</div>
              <div style={{ flex: 0.9, color: F.t2, fontFamily: "'Inter'" }}>{r.time}</div>
              <div style={{ flex: 0.8, color: r.checkin === '—' ? F.red : F.t2, fontFamily: "'Inter'" }}>{r.checkin}</div>
              <div style={{ flex: 0.7 }}><Badge variant={v}>{l}</Badge></div>
              <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                <Btn variant="ghost" size="xs" icon="eye">详情</Btn>
                {r.status !== 'violation' && <Btn variant="ghost" size="xs" icon="x" style={{ color: F.red }}>取消</Btn>}
              </div>
            </div>
          );
        })}
      </Card>
    </PageLayout>
  );
};

// ── Admin 05 Role Management ──────────────────────────
const RoleManagement = () => {
  const roles = ['超级管理员','自习室管理员','院系管理员','数据分析员','只读观察员'];
  const perms = ['查看预约','管理预约','查看违约','管理违约','管理自习室','编辑平面图','管理用户','分配角色','查看报表','导出数据','管理系统参数','查看日志'];
  const matrix = [
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,0,1,1,0,1],
    [1,1,1,0,1,0,0,0,1,0,0,0],
    [1,0,1,0,0,0,0,0,1,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,0,1],
  ];
  return (
    <PageLayout
      sidebar={<AdminSidebar active="roles" />}
      topbar={<TopBar title="角色与权限管理" sub="RBAC 权限矩阵" admin actions={
        <Btn variant="primary" size="sm" icon="plus">新建角色</Btn>
      } />}
    >
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Matrix */}
        <Card style={{ flex: 1, overflowX: 'auto' }} p={18}>
          <div style={{ fontSize: 13, fontWeight: 700, color: F.t1, marginBottom: 14 }}>权限矩阵</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: F.t3, fontWeight: 600, borderBottom: `1px solid ${F.border}`, minWidth: 120 }}>角色 / 权限</th>
                {perms.map(p => (
                  <th key={p} style={{ padding: '8px 8px', textAlign: 'center', color: F.t3, fontWeight: 600, borderBottom: `1px solid ${F.border}`, fontSize: 10, whiteSpace: 'nowrap' }}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role, ri) => (
                <tr key={role} style={{ background: ri % 2 === 0 ? F.white : '#FAFBFD' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: F.t1, borderBottom: `1px solid ${F.borderLight}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: [F.red,F.navy,F.blue,F.green,F.t3][ri] }} />
                      {role}
                    </div>
                  </td>
                  {perms.map((p, pi) => (
                    <td key={p} style={{ padding: '10px 0', textAlign: 'center', borderBottom: `1px solid ${F.borderLight}` }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 5, margin: '0 auto',
                        background: matrix[ri][pi] ? F.greenBg : F.borderLight,
                        border: `1.5px solid ${matrix[ri][pi] ? F.green : F.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {matrix[ri][pi] ? <Icon name="check" size={11} color={F.green} sw={2.5} /> : null}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Role detail */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <Card p={16}>
            <div style={{ fontSize: 12, fontWeight: 700, color: F.t1, marginBottom: 12 }}>角色列表</div>
            {roles.map((r, i) => (
              <div key={r} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 10px', borderRadius: 8, marginBottom: 4,
                background: i === 0 ? F.navyLight : 'transparent',
                border: `1px solid ${i === 0 ? F.navy+'20' : 'transparent'}`,
                cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: [F.red,F.navy,F.blue,F.green,F.t3][i] }} />
                  <span style={{ fontSize: 12, color: F.t1, fontWeight: i === 0 ? 700 : 400 }}>{r}</span>
                </div>
                <Btn variant="ghost" size="xs" icon="edit" />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

// ── Admin 06 Data Reports ─────────────────────────────
const DataReports = () => {
  const weekData = [842,1103,987,1247,0,0,0];
  const days = ['周一','周二','周三','周四','周五','周六','周日'];
  const maxV = Math.max(...weekData);
  return (
    <PageLayout
      sidebar={<AdminSidebar active="reports" />}
      topbar={<TopBar title="数据报表" sub="2026年4月 · 月度分析" admin actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, background: F.white, border: `1px solid ${F.border}`, fontSize: 12, color: F.t2 }}>
            2026年4月<Icon name="chevron-down" size={11} color={F.t3} />
          </div>
          <Btn variant="secondary" size="sm" icon="download">导出 CSV</Btn>
          <Btn variant="secondary" size="sm" icon="download">导出 Excel</Btn>
        </div>
      } />}
    >
      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
        {[
          { label: '本月预约总量', value: '24,831', icon: 'calendar', color: F.navy },
          { label: '平均签到率', value: '86.4%', icon: 'check-circle', color: F.green },
          { label: '平均座位利用率', value: '73.2%', icon: 'chart', color: F.blue },
          { label: '本月违约总次数', value: '312', icon: 'alert', color: F.amber },
        ].map(k => (
          <Card key={k.label} style={{ flex: 1 }} p={16}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${k.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={k.icon} size={15} color={k.color} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: F.t1, fontFamily: "'Inter'", letterSpacing: -0.5 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: F.t3, marginTop: 3 }}>{k.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Bar chart */}
        <Card style={{ flex: 2 }} p={20}>
          <div style={{ fontSize: 13, fontWeight: 700, color: F.t1, marginBottom: 18 }}>本周每日预约量</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 160 }}>
            {weekData.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: i === 3 ? F.navy : F.t3, fontFamily: "'Inter'" }}>{v || '—'}</div>
                <div style={{
                  width: '100%', borderRadius: '4px 4px 0 0',
                  background: i === 3 ? F.navy : i > 3 ? F.borderLight : `${F.navy}60`,
                  height: v ? `${(v / maxV) * 130}px` : 4,
                  transition: 'height 0.4s',
                }} />
                <span style={{ fontSize: 11, color: i === 3 ? F.navy : F.t3, fontWeight: i === 3 ? 700 : 400 }}>{days[i]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top rooms table */}
        <Card style={{ flex: 1 }} p={18}>
          <div style={{ fontSize: 13, fontWeight: 700, color: F.t1, marginBottom: 14 }}>热门自习室 Top 5</div>
          {[
            { name: '理工自习室 201', pct: 94, cnt: 1832 },
            { name: '经管自习室 301', pct: 87, cnt: 1644 },
            { name: '图书馆自习区', pct: 81, cnt: 1520 },
            { name: '理工自习室 403', pct: 76, cnt: 1398 },
            { name: '文史馆阅览室 A', pct: 68, cnt: 1201 },
          ].map((r, i) => (
            <div key={r.name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ width: 18, height: 18, borderRadius: 5, background: F.navy, color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i+1}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: F.t1 }}>{r.name}</span>
                </div>
                <span style={{ fontSize: 11, color: F.t3, fontFamily: "'Inter'" }}>{r.cnt.toLocaleString()}</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: F.borderLight }}>
                <div style={{ height: '100%', width: `${r.pct}%`, background: F.navy, borderRadius: 3, opacity: 0.6 + i * 0.08 }} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </PageLayout>
  );
};

Object.assign(window, { AdminDashboard, RoomManagement, FloorPlanEditor, BookingRecords, RoleManagement, DataReports });
