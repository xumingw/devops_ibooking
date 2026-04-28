# Iteration I3 — 预约闭环 + 签到/违约 + 首次部署

## 0. 元信息

- **时长**：2 周
- **入口前置**：I2 全部 P0 story Done；BookingService.create / cancel 与 findAvailableSeats 完整可用；fixed-time race 测试 green。
- **出口准则**：见 §8（核心：学生从"找座→预约→签到→完成"端到端 Web 流程跑通；15min 自动取消 + 违约记录生效；通过 GitHub Actions 自动部署到测试环境）。
- **必读共享文档**：`_shared/tech-stack.md` / `_shared/conventions.md` / `_shared/done-definition.md` / `_shared/design-map.md`
- **设计稿入口**：`自习室预约/Fudan Study System.html`（s04 / s05 / s06 / s07 / s09 / s10 主导；新建教室大屏画板）
- **数据契约位置**：`packages/shared-types/`
- **本迭代 source-of-truth**：Bucket A E2.4.2/E2.5.1（2）+ E3.1.2/E3.2.3（2）+ E4.2.3-4.5.1（7）+ E5 主线（9）+ E8.3.1/E8.4.3/E8.5.1（3）

## 1. 迭代目标

**本迭代结束时学生从"找座→预约→签到→完成"端到端 Web 流程跑通；BullMQ 处理 +15min/+10min/+15min 三个延时任务；15min 未签到自动取消并生成违约 + 通知；测试环境通过 GitHub Actions 自动部署。**

## 2. Story 范围

| Story ID | P | 标题 | 关联设计稿 |
|---|---|---|---|
| US3.1.2 | P1 | 特殊日期与临时关闭 | a02 |
| US3.2.3 | P1 | 签到宽限和提醒参数 | 无 |
| US2.4.2 | P1 | 自习室临时不可用状态 | a02 |
| US2.5.1 | P1 | 批量导入座位 | a03 |
| US4.2.3 | P0 | 查看座位状态图 | s04 |
| US4.3.1 | P0 | 选择座位并查看详情 | s04 |
| US4.3.2 | P0 | 提交预约 | s05 |
| US4.3.3 | P0 | 预约成功反馈 | s05 |
| US4.4.1 | P0 | 查看当前预约 | s06 |
| US4.4.2 | P0 | 取消预约 | s06 |
| US4.5.1 | P0 | Web 学生端适配 | s01-s10 |
| US5.1.1 | P0 | 生成教室动态编码 | 教室大屏（新建画板）|
| US5.2.1 | P0 | Web 输入编码签到 | s07 |
| US5.2.3 | P0 | 签到时间窗校验 | s07 |
| US5.3.1 | P0 | 预约前 15 分钟提醒 | s09 |
| US5.3.2 | P0 | 开始后 10 分钟未签到提醒 | s09 |
| US5.4.1 | P0 | 15 分钟未签到自动取消 | 无（后端） |
| US5.4.2 | P0 | 记录违约 | 无（结果在 s10/a04） |
| US5.4.3 | P0 | 自动取消通知学生 | s09 |
| US8.3.1 | P0 | 预约主链路接口测试 | 无 |
| US8.4.3 | P0 | 自动化部署任务 | 无 |
| US8.5.1 | P0 | 准备种子数据 | 无 |

**故事数：22（17 P0 / 5 P1 / 0 P2）**

## 3. 关联设计稿

| Artboard | 用于 |
|---|---|
| s04 | US4.2.3 / US4.3.1 |
| s05 | US4.3.2 / US4.3.3 |
| s06 | US4.4.1 / US4.4.2 |
| s07 | US5.2.1 / US5.2.3 |
| s09 | US5.3.1 / US5.3.2 / US5.4.3 |
| s10 | US5.4.2 结果（占位） |
| a02 | US3.1.2 / US2.4.2 |
| a03 | US2.5.1 |
| **新建** 教室大屏画板 | US5.1.1 |

**新建画板说明（design-map.md §6.3 第 3 条）：** 在 `自习室预约/` 目录新增 `room-display.jsx`，对应 1080×1920 全屏页面：上方教室名称 + 下方大字号 6 位编码 + 二维码（拉伸用）。挂到 `Fudan Study System.html` 的 `DCArtboard id="d01" label="01 教室大屏"`。

## 4. Tasks（执行顺序）

### Block A — 学生预约 UI 闭环

- [ ] US4.2.3-T01 SeatVisualState enum + 颜色映射（design-tokens 中）
- [ ] US4.2.3-T02 apps/web-student/src/components/SeatGrid.tsx (SVG 座位图，可缩放/平移)
- [ ] US4.2.3-T03 5 种状态颜色：可约绿/已约灰/维护中蓝/院系受限黄/已选金边
- [ ] US4.2.3-T04 Playwright + 视觉对比测试
- [ ] US4.3.1-T01 复用 availability 接口 seat 字段（不另开接口）
- [ ] US4.3.1-T02 s04 右侧抽屉：编号/教室/属性 chips/可用时段
- [ ] US4.3.1-T03 不可用座位点击禁用 + 显示原因
- [ ] US4.3.2-T01 提交预约接口（其实在 I2 已实现，本迭代是 UI 串联）
- [ ] US4.3.2-T02 apps/web-student/src/pages/BookingConfirm.tsx 套 s05
- [ ] US4.3.2-T03 系统参数动态文案（MAX_BOOK_HOURS / AUTO_CANCEL_AFTER_MINUTES）
- [ ] US4.3.2-T04 接口测试 + Playwright e2e
- [ ] US4.3.3-T01 s05 成功视图（✓ + 详情 + 双按钮）
- [ ] US4.3.3-T02 签到时间窗倒计时（实时）
- [ ] US4.3.3-T03 跳转测试
- [ ] US4.4.1-T01 GET /api/v1/bookings/me（I2 已部分实现，本迭代完善 status 筛选）
- [ ] US4.4.1-T02 apps/web-student/src/pages/MyBookings.tsx 套 s06
- [ ] US4.4.1-T03 不同状态卡片样式与按钮可用性测试
- [ ] US4.4.2-T01 取消按钮 + Modal.confirm + 原因 textarea
- [ ] US4.4.2-T02 mutation onSuccess invalidate
- [ ] US4.4.2-T03 取消后可用性恢复测试
- [ ] US4.5.1-T01 React Router + ProtectedRoute（I1 已有，本迭代补全 nav）
- [ ] US4.5.1-T02 响应式 breakpoint：≥1024 桌面 / <768 移动单列
- [ ] US4.5.1-T03 Playwright 学生主流程 e2e

### Block B — 教室动态编码 + 签到

- [ ] US5.1.1-T01 CheckInCode 表 + Redis cache + UNIQUE (roomId, code)
- [ ] US5.1.1-T02 @nestjs/schedule cron `*/1 * * * *` 每分钟生成新编码 + 写库 + 更新 Redis
- [ ] US5.1.1-T03 GET /api/v1/rooms/:id/check-in-code（屏幕端用，无需登录但限 IP）
- [ ] US5.1.1-T04 编码唯一性 + 过期 + 跨房间隔离测试
- [ ] US5.2.1-T01 POST /api/v1/bookings/:id/check-in body { code }；事务校验 owner / 时间窗 / code 匹配 / 未过期 → status PENDING_CHECKIN→CHECKED_IN
- [ ] US5.2.1-T02 apps/web-student/src/pages/CheckIn.tsx 套 s07
- [ ] US5.2.1-T03 成功跳 s06 + Toast；卡片状态变 "使用中"
- [ ] US5.2.1-T04 正确/错误编码测试
- [ ] US5.2.3-T01 时间窗 [startAt - REMINDER_BEFORE_MINUTES, startAt + AUTO_CANCEL_AFTER_MINUTES]
- [ ] US5.2.3-T02 CheckInService.assertCanCheckIn 顺序校验（owner / 时间窗 / code 匹配 / 编码有效）
- [ ] US5.2.3-T03 s07 按错误 code 切换文案
- [ ] US5.2.3-T04 非法签到测试

### Block C — 提醒任务 + 自动取消（最难，BullMQ）

- [ ] US3.2.3-T01 system_param 加 REMINDER_BEFORE_MINUTES=15 / LATE_REMINDER_AFTER_MINUTES=10 / AUTO_CANCEL_AFTER_MINUTES=15
- [ ] US3.2.3-T02 参数变更含跨字段校验（autoCancel ≥ lateReminder ≥ 0）
- [ ] US3.2.3-T03 参数读取/默认值/合法范围测试
- [ ] US5.3.1-T01 booking 创建时入队 BullMQ delayed job at (startAt - 15min)
- [ ] US5.3.1-T02 ReminderLog 表 + UNIQUE (bookingId, type) 防重复
- [ ] US5.3.1-T03 nodemailer + handlebars；模板 booking-reminder-before.hbs
- [ ] US5.3.1-T04 提醒任务测试（fake timer）
- [ ] US5.3.2-T01 booking 创建时入队第二个 delayed job at (startAt + 10min)
- [ ] US5.3.2-T02 模板 booking-reminder-late.hbs
- [ ] US5.3.2-T03 已签到/已取消不发提醒测试
- [ ] US5.4.1-T01 booking 创建时入队第三个 delayed job at (startAt + 15min)
- [ ] US5.4.1-T02 任务执行：事务内 SELECT FOR UPDATE → if status==PENDING_CHECKIN then update CANCELLED_AUTO_NO_CHECKIN + 删除 booking_slot 行 + 写 violation
- [ ] US5.4.1-T03 BullMQ jobId = `auto-cancel-${bookingId}` 防重复 + violation UNIQUE(bookingId)
- [ ] US5.4.1-T04 自动取消任务测试（fake timer）
- [ ] US5.4.2-T01 Violation 表 + UNIQUE(bookingId)
- [ ] US5.4.2-T02 GET /api/v1/violations/me（学生）
- [ ] US5.4.2-T03 违约记录生成测试
- [ ] US5.4.3-T01 模板 booking-auto-cancelled.hbs
- [ ] US5.4.3-T02 s09 通知中心红色徽章卡片
- [ ] US5.4.3-T03 自动取消通知测试

### Block D — 资源管理增强（I1 遗留 + I3 新加）

- [ ] US3.1.2-T01 RoomSchedule 表（特殊日期规则）
- [ ] US3.1.2-T02 a02 自习室详情"特殊日历" tab + AntD Calendar
- [ ] US3.1.2-T03 findAvailableSeats 合并默认规则与特殊规则（特殊优先）
- [ ] US3.1.2-T04 特殊日期优先级测试
- [ ] US2.4.2-T01 临时关闭表 (roomId, fromAt, toAt, reason) + 不可重叠
- [ ] US2.4.2-T02 关闭原因（考试/维修/其他）+ 时段重叠校验
- [ ] US2.4.2-T03 学生端 s03 红色徽章 + 关闭原因 tooltip
- [ ] US2.4.2-T04 整室不可用测试
- [ ] US2.5.1-T01 导入模板字段定义
- [ ] US2.5.1-T02 sheetjs 解析 + 预校验返回 errorRows
- [ ] US2.5.1-T03 a03 工具栏导入按钮 + Drawer
- [ ] US2.5.1-T04 测试样例 xlsx（合法 / 重复 / 缺失）

### Block E — 测试 + 部署

- [ ] US8.3.1-T01 e2e/auth.e2e-spec.ts
- [ ] US8.3.1-T02 e2e/availability.e2e-spec.ts
- [ ] US8.3.1-T03 e2e/booking.e2e-spec.ts（含并发、4h 边界、取消释放）
- [ ] US8.3.1-T04 CI 中 `pnpm --filter api test:e2e` 任一失败阻断 deploy
- [ ] US8.4.3-T01 准备测试服务器；安装 docker；配置 GitHub Actions SSH key
- [ ] US8.4.3-T02 infra/github/deploy.sh 脚本（pull GHCR 镜像 + docker-compose up + 健康检查）
- [ ] US8.4.3-T03 GitHub Actions deploy job 任务串接 build → ssh exec
- [ ] US8.4.3-T04 docs/runbooks/rollback.md
- [ ] US8.5.1-T01 院系 / 用户 / 角色 / 权限 seed
- [ ] US8.5.1-T02 自习室 / 座位 / 插座 / 开放时间 seed
- [ ] US8.5.1-T03 预约 / 签到 / 违约示例数据 seed
- [ ] US8.5.1-T04 README 数据初始化段

## 5. 实现要点（5 个最易翻车 story）

### 5.1 US5.1.1 教室动态编码（cron + Redis cache）

**关键决策：**
- 6 位数字编码：`Math.floor(100000 + Math.random() * 900000).toString()`。
- TTL 1 分钟：`validAt = now`，`expiresAt = now + 60s`。
- 每分钟 cron 任务对每个 ACTIVE Room 创建新 code → 写 DB + 刷 Redis cache `room:<id>:check_in_code`（TTL 60s）。
- 旧 code 不删，存档以便事后审计；签到时验证 `code.expiresAt > now`。
- 屏幕端 GET /api/v1/rooms/:id/display SSE 订阅或 30s 轮询；不需要登录（public 端口，但 IP 白名单防滥用）。

**性能注意：** cron 任务对 100 个房间执行一次约 100ms；不阻塞主线程；用 `@nestjs/schedule` 的 `@Cron('*/1 * * * *')`。

### 5.2 US5.4.1 自动取消任务（HARDEST — 数据一致性 + 幂等）

**核心决策：BullMQ delayed job。**

```typescript
// 在 booking.service.ts create() 末尾入队三个 job
await bullQueue.add('auto-cancel', { bookingId: booking.id }, {
  delay: differenceInMs(booking.startAt + AUTO_CANCEL_AFTER_MINUTES * 60_000, now()),
  jobId: `auto-cancel-${booking.id}`, // 防重复入队
});
```

**任务执行（处理器）伪代码：**
```typescript
@Process('auto-cancel')
async handleAutoCancel(job: Job<{ bookingId: string }>) {
  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: job.data.bookingId },
      lock: 'FOR UPDATE',  // 防止并发签到 race
    });
    if (!booking || booking.status !== 'PENDING_CHECKIN') return;  // idempotent
    await tx.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED_AUTO_NO_CHECKIN' },
    });
    await tx.bookingSlot.deleteMany({ where: { bookingId: booking.id } });  // 释放
    await tx.violation.create({
      data: { bookingId: booking.id, userId: booking.userId, roomId: booking.roomId, seatId: booking.seatId, reason: 'NO_CHECK_IN', occurredAt: new Date() },
    });
  });
  // 事务外：发邮件 + 站内信（不影响 DB 一致性）
  await this.notificationService.sendAutoCancelled(booking);
}
```

**关键点：**
1. **幂等**：检查 status 已变就直接 return；jobId 防同一 booking 重复入队；violation UNIQUE(bookingId) DB 兜底。
2. **SELECT FOR UPDATE**：防止 "学生在 +14:59 签到、auto-cancel 任务在 +15:00 触发" 的 race；FOR UPDATE 锁让其中一个先看到状态变化。
3. **删除 booking_slot 释放座位**：事务内删，保证一致性。
4. **邮件发送在事务外**：失败不影响数据库；reminder_log 表记录发送状态以便重试。

### 5.3 US5.2.x 签到链路

**校验顺序：**
```typescript
async checkIn(user: User, bookingId: string, code: string) {
  const booking = await prisma.booking.findUnique(...);
  if (booking.userId !== user.id) throw 403 NOT_OWNER;
  if (booking.status !== 'PENDING_CHECKIN') throw 409 BOOKING_INVALID_TRANSITION;
  const now = new Date();
  if (now < booking.startAt - 15min) throw 409 CHECK_IN_OUT_OF_WINDOW;
  if (now > booking.startAt + 15min) throw 409 CHECK_IN_OUT_OF_WINDOW;
  const codeRecord = await prisma.checkInCode.findFirst({
    where: { roomId: booking.roomId, code, expiresAt: { gt: now } },
  });
  if (!codeRecord) throw 401 INVALID_CODE;
  // 状态机校验
  assertCanTransition(booking.status, 'CHECKED_IN');
  await prisma.booking.update({ where: { id }, data: { status: 'CHECKED_IN', checkedInAt: now } });
}
```

**注意：** 时间窗用 dayjs；mock 用 `vi.setSystemTime()` 测试边界。

### 5.4 US5.3.1/2 BullMQ 提醒任务

**3 个 delayed job 入队时机（booking.service.create 末尾）：**

| Job | 延迟 | 任务 |
|---|---|---|
| `reminder-before` | startAt - 15min - now | 发提醒邮件 |
| `reminder-late` | startAt + 10min - now | if status=PENDING_CHECKIN 发二次提醒 |
| `auto-cancel` | startAt + 15min - now | if status=PENDING_CHECKIN 取消 + 违约 |

**取消预约时（cancel 接口）**：删除三个 jobId 对应的 BullMQ job，避免无意义触发。

**测试时间推进：** 用 Jest fake timers + BullMQ 的 `processJobs()` 同步触发。

### 5.5 US8.4.3 GitHub Actions 自动部署

**deploy.sh 脚本：**
```bash
#!/bin/bash
set -e
SHA=$1
SSH_USER=${SSH_USER:-ubuntu}
SSH_HOST=${SSH_HOST}
ssh ${SSH_USER}@${SSH_HOST} <<EOF
  cd /opt/ibooking
  echo "${IMAGE_TAG}" > .image-tag
  docker pull ghcr.io/${GITHUB_REPOSITORY}/api:${SHA}
  docker pull ghcr.io/${GITHUB_REPOSITORY}/web-student:${SHA}
  docker pull ghcr.io/${GITHUB_REPOSITORY}/web-admin:${SHA}
  docker-compose -f docker-compose.prod.yml up -d
  sleep 30
  curl -fs http://localhost:3000/api/v1/health || (docker-compose logs --tail=200; exit 1)
EOF
```

**SSH key 注入：** 在 GitHub Actions secrets 中配置 `SSH_PRIVATE_KEY` / `SSH_HOST` / `SSH_USER`，workflow 中 `echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa`。

**回滚：** docs/runbooks/rollback.md 记录人工 ssh 后 `docker tag` 切回上一版本 + restart。

## 6. 数据/接口契约变更

**Prisma migrations：**
- `0010_check_in_code`: CheckInCode + UNIQUE(roomId, code)
- `0011_violation`: Violation + UNIQUE(bookingId)
- `0012_reminder_log`: ReminderLog + UNIQUE(bookingId, type)
- `0013_room_schedule`: RoomSchedule + UNIQUE(roomId, date)
- `0014_room_temp_close`: RoomTempClose 表

**新增 REST endpoints（v0.3）：**

| Method | Path | 权限 | 说明 |
|---|---|---|---|
| POST | /api/v1/bookings/:id/check-in | auth (owner) | 编码签到 |
| GET | /api/v1/rooms/:id/check-in-code | room.display (无登录但限 IP) | 屏幕端 |
| GET | /api/v1/rooms/:id/display | room.display | 屏幕端展示 |
| GET | /api/v1/violations/me | auth | 我的违约 |
| POST/PATCH/DELETE | /api/v1/rooms/:id/schedules | room.update | 特殊日期 |
| POST/DELETE | /api/v1/rooms/:id/temp-close | room.update | 临时关闭 |
| POST | /api/v1/seats/bulk-import | seat.write | 批量导入 |

**shared-types 新增：** CheckInRequestDto, CheckInResponseDto, CheckInCodeDto, ViolationDto, RoomScheduleDto, BulkImportResultDto。

## 7. 测试要求（每条 TC 七字段；P0 关键 TC 完整描述）

### TC-US5.4.1-01：验证 15 分钟未签到自动取消（HARDEST）

- **测试目的**：验证超时未签到的预约在 +15min 自动取消、违约入库、座位释放、通知发送、任务幂等——这是课程要求"提升座位利用率"的核心机制。
- **测试类型**：接口自动化 / 时序 / 幂等 / 流程
- **前置条件**：US5.4.1 实现完成；BullMQ 启动；Jest fake timers 可用。
- **测试数据**：stu_cse_01 创建预约 A001 19-21（startAt = "now + 1h"）；AUTO_CANCEL_AFTER_MINUTES=15。
- **操作步骤**：
  1. POST 预约 A001 19-21（status=PENDING_CHECKIN）
  2. fake timer 推进时间到 startAt + 14min；触发 BullMQ processJobs；查 booking 状态
  3. fake timer 推进到 startAt + 15min；触发 BullMQ processJobs
  4. 查询 db.booking + db.violation + db.booking_slot
  5. 再次手动调用 auto-cancel 任务（模拟重复触发）
  6. 查询 mailhog 是否收到自动取消邮件
- **Assert 断言**：
  - Step 2: `assert booking.status == 'PENDING_CHECKIN'`（还未到取消时间）
  - Step 4: `assert booking.status == 'CANCELLED_AUTO_NO_CHECKIN'`
  - Step 4: `assert violation 表新增一行 reason='NO_CHECK_IN'`
  - Step 4: `assert booking_slot 中 (A001, 19:00) (A001, 20:00) 已删除`
  - Step 5: `assert booking 状态不变；violation 表条数不变（幂等）`
  - Step 6: `assert mailhog 收到一封含 "已自动取消" 文案邮件`
- **后置处理**：删除测试 booking + violation + reminder_log；清空 BullMQ job。

### TC-US5.4.2-01：验证违约记录生成

- **测试目的**：验证违约记录与预约一一对应（UNIQUE bookingId）、含完整字段、不被重复触发——为后续违约管理与申诉提供数据。
- **测试类型**：接口 / 数据库 / 幂等
- **前置条件**：US5.4.1 / US5.4.2 实现；测试场景同上。
- **测试数据**：stu_cse_01 + A001 + 19-21 未签到。
- **操作步骤**：
  1. 创建预约后 fast-forward +15min 触发自动取消
  2. SELECT * FROM violation WHERE bookingId = ?
  3. 重复触发任务
  4. 再次 SELECT
- **Assert 断言**：
  - Step 2: `assert violation 表 1 行；含 userId, bookingId, roomId, seatId, reason='NO_CHECK_IN', occurredAt`
  - Step 4: `assert violation 表仍 1 行`（UNIQUE 约束生效）
- **后置处理**：删除 violation。

### TC-US5.2.1-01：验证 Web 输入编码签到（多重防护）

- **测试目的**：验证 Web 编码签到的多重防护（编码 + 时间窗 + 本人 + 房间）全部生效，避免代签到 / 跨房 / 过早过晚——签到合法性是违约判定的前提。
- **测试类型**：接口 / 负向 / 时序
- **前置条件**：US5.2.1 + US5.2.3 实现；当前编码 CODE_VALID_R101=123456，过期 CODE_EXPIRED=999999；stu_cse_01 在 R101 A001 19-21 有预约。
- **测试数据**：见前置；额外 stu_mgmt_01；R201 当前编码 CODE_R201。
- **操作步骤**：
  1. 当前时间 = startAt - 16min（窗口外早）；stu_cse_01 POST check-in body={ code:"123456" }
  2. 当前时间 = startAt - 15min；POST 同上
  3. 当前时间 = startAt + 5min；POST body={ code:"999999" }（过期）
  4. POST body={ code: CODE_R201 }（跨房间）
  5. stu_mgmt_01 POST `/api/v1/bookings/{stu_cse_01.bookingId}/check-in` body={ code:"123456" }
  6. 当前时间 = startAt + 16min；POST body={ code:"123456" }
- **Assert 断言**：
  - Step 1: `assert 409; code=CHECK_IN_OUT_OF_WINDOW`
  - Step 2: `assert 200; booking.status == CHECKED_IN`
  - Step 3: `assert 401; code=INVALID_CODE`
  - Step 4: `assert 400; code=ROOM_MISMATCH`
  - Step 5: `assert 403; code=NOT_OWNER`
  - Step 6: `assert 409; code=CHECK_IN_OUT_OF_WINDOW`
- **后置处理**：reset booking 状态 + 时间回拨。

### TC-US4.3.2-01：验证提交预约（端到端 + 边界）

- **测试目的**：验证预约提交在合法路径下生成准确记录、各类失败有清晰错误码——这是 E2E 学生预约闭环的核心节点。
- **测试类型**：UI + 接口 / 正向 + 负向 + 边界
- **前置条件**：US4.3.2 + I2 全部依赖。
- **测试数据**：stu_cse_01；A001 19-21 可约；超 4h 18-23；非整点 19:30-20:30。
- **操作步骤**：
  1. UI s05 选 A001 19-21 → 提交
  2. UI s05 选 A001 18-23 → 提交
  3. 后端 POST 19:30-20:30
  4. 重复 step 1（已被订）
- **Assert 断言**：
  - Step 1: `201; reservationId 返回; 跳转到成功页`
  - Step 2: `422; code=BOOKING_DURATION_EXCEEDED; 错误提示"最多 4 小时"`
  - Step 3: `422; code=BOOKING_NOT_WHOLE_HOUR`
  - Step 4: `409; code=BOOKING_SLOT_TAKEN`
- **后置处理**：删除 booking。

### TC-US5.3.1-01：验证预约前 15 分钟提醒

- **测试目的**：验证预约前 15min 邮件提醒按时发送 + 幂等性（重复触发不重发）——避免学生忘记预约时间触发自动取消。
- **测试类型**：接口 / 时序 / 幂等
- **前置条件**：US5.3.1 实现；MailHog 启动；BullMQ 启动。
- **测试数据**：stu_cse_01 创建 A001 19-21 预约（startAt = now + 1h）；REMINDER_BEFORE_MINUTES=15。
- **操作步骤**：
  1. POST 创建预约
  2. fake timer 推进到 startAt - 15min；触发 BullMQ
  3. 查 mailhog；查 reminder_log
  4. 重复触发任务
  5. 再查 reminder_log
- **Assert 断言**：
  - Step 3: `mailhog 收到一封 "预约前提醒" 邮件 to stu_cse_01.email；含房间/座位/时段`
  - Step 3: `reminder_log 表 1 行 type=BEFORE_15 status=SENT`
  - Step 5: `reminder_log 表仍 1 行`（UNIQUE 防重）
- **后置处理**：删除 reminder_log + booking + 清空 mailhog。

### TC-US8.3.1-01：验证预约主链路接口测试（CI green）

- **测试目的**：验证学生从登录→查座→预约→取消的端到端接口链路自动化覆盖、构建中执行、失败阻断。
- **测试类型**：流程验收 / CI / 文档检查
- **前置条件**：US8.3.1 + US8.4.2（构建任务）实现。
- **测试数据**：CI 触发（push dev branch）；e2e 套件含上述链路。
- **操作步骤**：
  1. push dev 分支触发 CI
  2. 等待 build + test 阶段完成
  3. 查看 e2e 报告
  4. 故意改代码使一个 e2e 失败 → push
  5. 查看部署阶段
- **Assert 断言**：
  - Step 3: `所有 e2e 用例 green；测试时间 < 5 min`
  - Step 5: `因 e2e 失败，部署阶段未执行（构建失败）`
- **后置处理**：还原代码。

### TC-US8.4.3-01：验证自动化部署任务

- **测试目的**：验证测试环境部署自动化、可重复、可回滚——这是 DevOps 评分点。
- **测试类型**：流程验收 / 部署 / 文档检查
- **前置条件**：US8.4.3 实现；test ECS 已就绪。
- **测试数据**：build green 的 main 分支提交；test 服务器 SSH。
- **操作步骤**：
  1. push 通过 build 的代码到 main
  2. 等待 deploy 阶段
  3. 浏览器访问 `https://test.<your-domain>/`
  4. curl 健康检查
  5. 查看部署日志（deploy.sh 输出）
  6. 重复部署同一镜像
- **Assert 断言**：
  - Step 2: `deploy 成功，时间 < 3min`
  - Step 3: `web-student / web-admin 可访问`
  - Step 4: `health 200，db UP，redis UP`
  - Step 5: `日志含 docker pull / docker-compose up / 健康检查命中`
  - Step 6: `重复部署不破坏数据；幂等`
- **后置处理**：无（保留测试环境数据）。

**额外 TC（Bucket A 中含七字段）**：US3.1.2-01, US3.2.3-01, US2.4.2-01, US2.5.1-01, US4.2.3-01, US4.3.1-01, US4.3.3-01, US4.4.1-01, US4.4.2-01, US4.5.1-01, US5.1.1-01, US5.2.3-01, US5.3.2-01, US5.4.3-01, US8.5.1-01。

**行覆盖率门槛 ≥70%** 模块：`booking`, `check-in`, `notification`, `auto-cancel`。

## 8. 迭代级 DoD

- [ ] 全部 17 P0 story Done
- [ ] CI lint + unit + e2e + build + deploy 五关 main 自动 green
- [ ] 行覆盖率 ≥70%（前述模块）
- [ ] §9 演示脚本在测试环境完整跑通
- [ ] DB schema I4 不需要破坏性变更
- [ ] 测试环境 URL 可访问；OpenAPI v0.3 commit
- [ ] BullMQ 三个 job 全部经 fake timer 测试 green

## 9. 演示脚本（15 分钟，第一阶段 Review 主线）

1. **学生预约 → 签到 → 完成（5min）**：
   - stu_cse_01 登录 web-student → s03 选 2026-05-01 19-21 → 选 A001 → s05 提交 → 看到成功 + 倒计时
   - 切到 s06 看到 "待签到" 卡片
   - 屏幕调到 18:45 → mailhog 看到提醒邮件
   - 屏幕调到 19:00 → 切到 s07 输入 6 位编码（从教室大屏读）→ 状态变 "使用中"
   - 屏幕调到 19:30 → 学生点击 "提前结束" → 状态变 "已完成"

2. **未签到自动取消（4min）**：
   - 用 stu_mgmt_01 创建 A002 20-22 预约
   - 屏幕调到 20:10 → mailhog 看到 "+10min" 二次提醒
   - 屏幕调到 20:15 → mailhog 看到 "已自动取消" 邮件
   - 切到 s06 查看：状态 = "已自动取消（违约）"
   - 切到 s10 看到违约记录
   - 切到 stu_cse_01 在 s03 看到 A002 20-21 已重新可约

3. **管理资源临时关闭（2min）**：admin_full 在 a02 把 R301 设临时关闭 18:00-22:00 → 学生端 s03 即时显示红色徽章 + 关闭原因。

4. **批量导入座位（1min）**：admin_full 在 a03 上传 xlsx → 预校验显示 1 行重复编号 → 确认导入 → 看到新座位。

5. **GitHub Actions workflow（3min）**：展示 main push 触发完整流水线 lint → unit → e2e → build → deploy；测试环境 URL 浏览器打开。

## 10. 拉伸 / 可选

无（本迭代主线饱和；US3.1.2 / US3.2.3 / US2.4.2 / US2.5.1 是 P1 但已纳入主线确保完整性）。

## 11. 守卫

- 不修改 `自习室预约/` 目录（**例外**：US5.1.1 允许新建 `room-display.jsx` 教室大屏画板）
- 不在 `packages/shared-types` 之外定义 DTO
- 不绕过 BullMQ 直接 setTimeout 调度任务（任务必须可恢复 + 可幂等）
- 不在 booking_slot 行上加任何额外字段（保持仅 (id, bookingId, seatId, slotStart) 4 列）
- 不引入 cron 表达式之外的调度方式
- 邮件发送失败不允许阻塞数据库事务
- 不在签到接口绕过任何校验（owner / 时间窗 / code / 状态机 4 层全部生效）

## 12. 与下一迭代的交接

**必须遗留：**
- migrations 0010-0014 commit
- shared-types 含 CheckInRequestDto, ViolationDto, RoomScheduleDto, BulkImportResultDto
- BullMQ 三个 job + 处理器 + 幂等保证 + fake timer 测试
- 教室大屏画板 room-display.jsx 已新建
- s04/s05/s06/s07/s09/s10 完整 UI；m00-m07 等手机画板仍仅供拉伸参考
- GitHub Actions 部署任务自动跑；测试环境 URL 公开
- e2e 套件 ≥30 用例覆盖学生主链路 + 签到 + 自动取消
- seed 脚本初始化完整测试数据集

**已知未做项 → I4 入口前置：**
- 管理仪表盘 KPI（US6.1.x）尚未实现 — I4 实现
- 代预约 / 代取消（US6.2.x）尚未实现 — I4
- 系统参数管理 UI（US6.5.x）— I4
- GitHub Actions workflow 尚未含审批门禁（仅自动 deploy 到 test，prod 还没接）— I4 接入审批
- 接口测试覆盖签到自动取消（US8.3.2）— I4
