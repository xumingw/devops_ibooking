# Iteration I2 — 规则引擎 + 预约核心

## 0. 元信息

- **时长**：2 周
- **入口前置**：I1 全部 P0 story Done；4 角色 + 4 测试账号 seed；GitHub Actions CI lint+unit green。
- **出口准则**：见 §8（核心：4 小时规则、整点粒度、院系过滤、并发冲突、状态机全部通过单元 + 接口测试；学生可在 Web 上提交一个有效预约）。
- **必读共享文档**：`_shared/tech-stack.md` / `_shared/conventions.md` / `_shared/done-definition.md` / `_shared/design-map.md`
- **设计稿入口**：`自习室预约/Fudan Study System.html`（s02 / s03 / s04 主导）
- **数据契约位置**：`packages/shared-types/`
- **本迭代 source-of-truth**：Bucket A E1.5（1 story）+ E2.2-2.4（4 story）+ E3 全部（14 story）+ E4.1-4.2（4 story）+ E8.2.1（1 story）

## 1. 迭代目标

**本迭代结束时整点 4 小时规则、院系过滤、并发冲突控制全部通过单元 + 接口测试；学生能从 Web 端选定时间 → 选座 → 提交一个有效预约（确认页与提交后视觉可后续迭代再丰富）。**

## 2. Story 范围

按依赖拓扑排序：

| Story ID | P | 标题 | 关联设计稿 |
|---|---|---|---|
| US3.1.1 | P0 | 默认开放时间 | 无（参数页）|
| US3.2.1 | P0 | 最大预约时长参数 | 无 |
| US3.2.2 | P0 | 预约粒度为整点小时 | s03 |
| US2.3.1 | P0 | 标记插座座位 | a03 |
| US2.3.2 | P1 | 标记靠窗/安静区等属性 | a03 |
| US2.4.1 | P0 | 座位维护中状态 | a03 |
| US2.2.3 | P1 | 座位编号与容量一致性检查 | a02 |
| US3.3.1 | P0 | 按日期和时段查询空座 | s03 / s04 |
| US3.3.2 | P0 | 院系限制过滤 | s03 |
| US3.3.3 | P0 | 座位属性筛选 | s03 / s04 |
| US3.4.1 | P0 | 学生预约冲突校验 | s05 |
| US3.4.2 | P0 | 座位时段唯一约束 | 无（后端）|
| US3.4.3 | P0 | 提交前二次校验 | s05 |
| US3.5.1 | P0 | 定义预约状态流转 | 无 |
| US3.5.2 | P0 | 预约取消规则 | s06 |
| US4.1.1 | P0 | 查看可用自习室列表 | s02 / s03 |
| US4.1.2 | P0 | 查看我的下一场预约 | s02 |
| US4.2.1 | P0 | 选择日期和整点时段 | s03 / s04 |
| US4.2.2 | P0 | 按条件搜索座位 | s03 |
| US1.5.1 | P1 | 记录高风险操作日志 | 无 |
| US8.2.1 | P0 | 后端核心单元测试 | 无 |

**故事数：21（17 P0 / 3 P1 / 1 P2 — US2.3.2 是 P1，其他 P1 为 US2.2.3 / US1.5.1）**

## 3. 关联设计稿

| Artboard | 用于 |
|---|---|
| s02 首页概览 | US4.1.1 / US4.1.2 |
| s03 自习室列表 | US4.1.1 / US4.2.1 / US4.2.2 / US3.3.x |
| s04 选座预约 | US3.3.1 / US4.2.3（部分；详细 UI 在 I3）|
| s05 预约确认 | US3.4.3 错误回显占位（详细 UI 在 I3） |
| s06 我的预约 | US3.5.2 取消按钮占位（详细 UI 在 I3） |
| a03 平面图编辑器 | US2.3.1 / US2.3.2 / US2.4.1 |
| a02 自习室管理 | US2.2.3 容量一致性 banner |

## 4. Tasks（执行顺序）

### Block A — 系统参数与开放时间（前置）

- [ ] US3.2.1-T01 SystemParam 表 + ConfigService（启动加载 + EventEmitter reload）
- [ ] US3.2.1-T02 MAX_BOOK_HOURS 校验（注入 BookingService.create 流程）
- [ ] US3.2.1-T03 占位参数管理接口 PATCH（管理 UI 在 I4）
- [ ] US3.2.1-T04 时长边界单元测试
- [ ] US3.2.2-T01 整点校验工具 assertWholeHour
- [ ] US3.2.2-T02 前端 HourSlotPicker 组件（仅整点 chip）
- [ ] US3.2.2-T03 非整点拒测试
- [ ] US3.1.1-T01 Room.openHour/closeHour CRUD（沿用 I1 已有字段）
- [ ] US3.1.1-T02 a02 自习室详情添加"开放时间"抽屉
- [ ] US3.1.1-T03 可用性查询过滤开放时间
- [ ] US3.1.1-T04 开放时间边界测试

### Block B — 座位属性与状态

- [ ] US2.3.1-T01 seat.attributes JSON 含 powerType: NONE|FIXED|RAIL
- [ ] US2.3.1-T02 a03 详情 Drawer powerType Radio
- [ ] US2.3.1-T03 availability 接口返回 powerType
- [ ] US2.3.1-T04 插座筛选测试数据
- [ ] US2.3.2-T01 seat.attributes.tags + seat-tags.ts enum (WINDOW, QUIET, FAR_FROM_DOOR, GROUP_FRIENDLY)
- [ ] US2.3.2-T02 a03 标签 Select multiple + 批量编辑
- [ ] US2.3.2-T03 学生查询返回 tags
- [ ] US2.3.2-T04 标签筛选测试
- [ ] US2.4.1-T01 Seat.status enum (ACTIVE/MAINTENANCE/CANCELLED) + 切换接口
- [ ] US2.4.1-T02 a03 MAINTENANCE 灰色 + 扳手图标
- [ ] US2.4.1-T03 可用性查询排除 MAINTENANCE
- [ ] US2.4.1-T04 状态切换测试
- [ ] US2.2.3-T01 容量统计接口
- [ ] US2.2.3-T02 a02 一致性 banner
- [ ] US2.2.3-T03 容量差异测试

### Block C — 可用性查询引擎

- [ ] US3.3.1-T01 BookingService.findAvailableSeats 接口
- [ ] US3.3.1-T02 SQL 合并 (room.status / seat.status / open hour / 已有预约)
- [ ] US3.3.1-T03 多时段测试数据（含 BOOKED / MAINTENANCE / 院系限制）
- [ ] US3.3.1-T04 状态返回测试
- [ ] US3.3.2-T01 院系过滤 SQL where 子句
- [ ] US3.3.2-T02 前端 s03 院系徽章
- [ ] US3.3.2-T03 跨院系不可预约测试
- [ ] US3.3.3-T01 ?powerType=&tags= 查询参数
- [ ] US3.3.3-T02 前端 s03 筛选栏 + URL 同步
- [ ] US3.3.3-T03 组合筛选测试

### Block D — 冲突控制 + 状态机（HARDEST）

- [ ] US3.5.1-T01 BookingStatus enum + TRANSITIONS 表 (apps/api/src/booking/booking-state.ts)
- [ ] US3.5.1-T02 assertCanTransition + booking.service 调用
- [ ] US3.5.1-T03 docs/architecture/booking-state-machine.md mermaid 图
- [ ] US3.5.1-T04 非法跳转测试
- [ ] US3.4.2-T01 BookingSlot 表 + UNIQUE INDEX (seat_id, slot_start)；migration
- [ ] US3.4.2-T02 booking 创建事务 prisma.$transaction + create + createMany(slots) 捕获 P2002 → 409
- [ ] US3.4.2-T03 Promise.all 并发预约测试
- [ ] US3.4.1-T01 学生时间冲突校验（query existing bookings 时段重叠）
- [ ] US3.4.1-T02 s05 冲突错误提示（含已有冲突信息）
- [ ] US3.4.1-T03 完全/部分/相邻不冲突测试
- [ ] US3.4.3-T01 BookingService.assertCanBook 顺序：开放时间→座位状态→院系→学生冲突→粒度/时长
- [ ] US3.4.3-T02 s05 二次校验失败按 code 切换文案
- [ ] US3.4.3-T03 hold 期间状态变化测试
- [ ] US3.5.2-T01 学生取消预约接口（仅 PENDING_CHECKIN/CHECKED_IN 可取消）
- [ ] US3.5.2-T02 取消原因字段
- [ ] US3.5.2-T03 取消后座位释放测试

### Block E — 学生端 UI（找座 + 我的预约）

- [ ] US4.1.1-T01 GET /api/v1/rooms/availability-summary
- [ ] US4.1.1-T02 apps/web-student/src/pages/Rooms.tsx 套 s03
- [ ] US4.1.1-T03 剩余座位徽章（绿/黄/灰）+ 关闭红色
- [ ] US4.1.1-T04 列表接口测试
- [ ] US4.1.2-T01 GET /api/v1/bookings/next
- [ ] US4.1.2-T02 s02 首页 "下一场预约" 卡片 + 倒计时
- [ ] US4.1.2-T03 有/无预约场景测试
- [ ] US4.2.1-T01 DatePicker + HourSlotPicker 组合 + URL params
- [ ] US4.2.1-T02 picker 变化 → TanStack Query refetch
- [ ] US4.2.1-T03 时间选择边界 Playwright 测试
- [ ] US4.2.2-T01 FilterBar 组件 (建筑/楼层/插座/标签/院系)
- [ ] US4.2.2-T02 Filter state → query params；Zustand searchStore
- [ ] US4.2.2-T03 空结果引导文案
- [ ] US4.2.2-T04 筛选组合测试

### Block F — 审计与测试基建

- [ ] US1.5.1-T01 AuditLog 表 + 索引
- [ ] US1.5.1-T02 @Audit() Interceptor + 装饰器
- [ ] US1.5.1-T03 GET /api/v1/audit-logs（管理员）
- [ ] US1.5.1-T04 高风险操作记录测试
- [ ] US8.2.1-T01 时长 + 整点规则单测
- [ ] US8.2.1-T02 可用性查询单测
- [ ] US8.2.1-T03 冲突 + 状态机单测
- [ ] US8.2.1-T04 (本迭代不含定时任务，US5.4.1 在 I3 实现，本任务先创建测试骨架)

## 5. 实现要点（这是 I2 最关键的一节，针对 5 个最易翻车 story 详细展开）

### 5.1 US3.4.2 座位时段唯一约束（HARDEST — 数据正确性的最关键保证）

**核心决策：booking 按 slot 展开存储。**

```
booking 主表（一次预约一行）:
  id, user_id, seat_id, room_id, start_at, end_at, status, created_at

booking_slot 子表（一次预约 N 行，每行 1 整点 = 1 slot）:
  id, booking_id, seat_id, slot_start  -- UNIQUE INDEX (seat_id, slot_start)
```

**为什么要这样：** 直接在 booking 表加 UNIQUE(seat_id, [start_at, end_at]) 不能表达"19-21 与 20-22 重叠"。展开成 slot 后冲突变成行级唯一约束，DB 层捕获 P2002 即可。

**预约创建事务伪代码：**
```typescript
async create(dto: CreateBookingDto) {
  const slots = enumerateSlots(dto.startAt, dto.endAt); // [19:00, 20:00] for 19-21
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({ data: { ...dto, status: 'PENDING_CHECKIN' } });
    try {
      await tx.bookingSlot.createMany({
        data: slots.map(slot => ({ bookingId: booking.id, seatId: dto.seatId, slotStart: slot })),
      });
    } catch (e) {
      if (e.code === 'P2002') throw new ConflictException({ code: 'BOOKING_SLOT_TAKEN' });
      throw e;
    }
    return booking;
  });
}
```

**严禁：** 使用乐观锁版本字段 `version int` —— 粒度太粗，slot 级冲突难表达。
**严禁：** 使用 SELECT FOR UPDATE 锁整个 seat 行 —— 锁竞争严重，性能差。

### 5.2 US3.5.1 状态机（业务正确性的关键）

**状态枚举：**
```typescript
enum BookingStatus {
  PENDING_CHECKIN = 'PENDING_CHECKIN',
  CHECKED_IN = 'CHECKED_IN',
  COMPLETED = 'COMPLETED',
  CANCELLED_BY_USER = 'CANCELLED_BY_USER',
  CANCELLED_AUTO_NO_CHECKIN = 'CANCELLED_AUTO_NO_CHECKIN',
  CANCELLED_BY_ADMIN = 'CANCELLED_BY_ADMIN',
}
```

**TRANSITIONS 映射（apps/api/src/booking/booking-state.ts）：**
```typescript
export const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING_CHECKIN: ['CHECKED_IN', 'CANCELLED_BY_USER', 'CANCELLED_AUTO_NO_CHECKIN', 'CANCELLED_BY_ADMIN'],
  CHECKED_IN: ['COMPLETED', 'CANCELLED_BY_USER', 'CANCELLED_BY_ADMIN'],  // 学生提前结束 → COMPLETED
  COMPLETED: [],  // 终态
  CANCELLED_BY_USER: [],
  CANCELLED_AUTO_NO_CHECKIN: [],
  CANCELLED_BY_ADMIN: [],
};

export function assertCanTransition(from: BookingStatus, to: BookingStatus): void {
  if (!TRANSITIONS[from].includes(to)) {
    throw new UnprocessableEntityException({
      code: 'BOOKING_INVALID_TRANSITION',
      message: `Cannot transition from ${from} to ${to}`,
    });
  }
}
```

**任何状态变更前必调** `assertCanTransition`。CI 任务校验 booking-state.ts 与 mermaid 图 docs/architecture/booking-state-machine.md 一致。

### 5.3 US3.4.3 提交前二次校验（顺序很重要）

**校验顺序（apps/api/src/booking/booking.service.ts assertCanBook）：**

```typescript
async assertCanBook(user: User, seat: Seat, room: Room, startAt: Date, endAt: Date) {
  // 1. 整点校验 (US3.2.2)
  this.assertWholeHour(startAt);
  this.assertWholeHour(endAt);
  if (endAt <= startAt) throw 422 BOOKING_END_BEFORE_START;
  // 2. 时长校验 (US3.2.1)
  const hours = (endAt - startAt) / 3600000;
  if (hours > MAX_BOOK_HOURS) throw 422 BOOKING_DURATION_EXCEEDED;
  // 3. 资源状态 (US2.4.1, US2.1.2)
  if (seat.status !== 'ACTIVE') throw 409 SEAT_UNAVAILABLE;
  if (room.status !== 'ACTIVE') throw 409 ROOM_UNAVAILABLE;
  // 4. 开放时间 (US3.1.1)
  if (startAt.hour < room.openHour || endAt.hour > room.closeHour) throw 422 OUT_OF_OPEN_HOURS;
  // 5. 院系限制 (US3.3.2)
  if (room.scopeType === 'DEPARTMENT' && room.departmentId !== user.departmentId) throw 403 DEPARTMENT_LIMIT;
  // 6. 学生时间冲突 (US3.4.1)
  const conflicts = await this.findUserOverlapping(user.id, startAt, endAt);
  if (conflicts.length > 0) throw 409 USER_TIME_CONFLICT;
}
```

**所有校验都 throw 后，才进入 §5.1 的 transaction 创建 booking + slot。** 每一步独立 + 顺序确定 + 错误码精准 — 这是前端按 code 切换文案的基础。

### 5.4 US3.3.1 可用性查询引擎（性能关注点）

**SQL 思路（用 Prisma `$queryRaw` 处理复杂查询）：**

```typescript
SELECT s.*, GROUP_CONCAT(bs.slot_start) AS booked_slots
FROM seat s
LEFT JOIN booking_slot bs ON bs.seat_id = s.id
  AND bs.slot_start >= :startAt
  AND bs.slot_start < :endAt
JOIN room r ON r.id = s.room_id
WHERE s.status = 'ACTIVE'
  AND r.status = 'ACTIVE'
  AND r.open_hour <= HOUR(:startAt)
  AND r.close_hour >= HOUR(:endAt)
  AND (r.scope_type = 'SCHOOL' OR r.department_id = :userDepartmentId)
  -- 属性筛选
  AND (:powerType IS NULL OR JSON_EXTRACT(s.attributes, '$.powerType') = :powerType)
GROUP BY s.id
```

**性能：** 100 座位查 2h 时段 < 500ms（dev MySQL）。**不缓存**（高变更）；前端 TanStack Query stale-time 5s。

**返回结构（hop 数据到前端）：**
```typescript
{ seat: SeatDto, slots: [{ hour: 19, status: 'AVAILABLE'|'BOOKED'|'MAINTENANCE'|'UNAVAILABLE_DEPT' }] }[]
```

### 5.5 US4.2.x 学生端 picker + 筛选

**关键决策：**
- URL search params 是单一事实来源：`?date=2026-05-01&start=19&end=21&powerType=FIXED&tags=WINDOW,QUIET&building=主楼`。
- React Router useSearchParams + Zustand searchStore 双向同步：用户改 picker → 写 URL → useEffect 同步 store + 触发 TanStack Query refetch。
- **HourSlotPicker** 仅展示整点 chip（07-22）；学生只能拖选连续整点 → endHour - startHour 必为整数。
- **空结果**显示插画 + "去掉一些条件试试" 按钮（自动移除最严苛筛选）。

## 6. 数据/接口契约变更

**Prisma migrations：**
- `0006_system_param`: SystemParam 表 + 6 默认参数（MAX_BOOK_HOURS=4 等）
- `0007_seat_attributes`: seat.attributes JSON 字段
- `0008_booking_with_slots`: Booking + BookingSlot（含 UNIQUE INDEX (seat_id, slot_start)）
- `0009_audit_log`: AuditLog 表 + 索引

**新增 REST endpoints（v0.2）：**

| Method | Path | 权限 | 说明 |
|---|---|---|---|
| GET | /api/v1/rooms/availability-summary | auth | 自习室+剩余摘要 |
| GET | /api/v1/seats/availability | auth | 座位可用性查询 |
| GET | /api/v1/bookings/me | auth | 我的预约 |
| GET | /api/v1/bookings/next | auth | 下一场预约 |
| POST | /api/v1/bookings | auth | 创建预约 |
| POST | /api/v1/bookings/:id/cancel | auth (owner) | 取消预约 |
| PATCH | /api/v1/seats/:id/status | seat.update_status | 切换座位状态 |
| GET | /api/v1/system-params | system_param.read | 参数列表 |
| PATCH | /api/v1/system-params | system_param.update | 改参数（管理 UI 在 I4） |
| GET | /api/v1/audit-logs | audit.read | 审计日志查询 |

**shared-types 新增：** BookingStatus enum, BookingDto, CreateBookingDto, BookingSlotDto, AvailabilityQueryDto, SeatAvailabilityDto, SystemParamDto。

## 7. 测试要求（本节列 P0 关键 TC 完整七字段；其余 TC 在 Bucket A 中）

### TC-US3.4.2-01：验证同一座位同一整点不能被两个学生同时预约

- **测试目的**：验证 (seat_id, slot_start) 唯一约束在并发提交下生效，防止超卖。这是数据正确性的最关键保证。
- **测试类型**：接口自动化 / 并发 / 负向
- **前置条件**：US3.4.2-T02 实现完成；座位 A001 在 2026-05-01 19:00 时段无预约；学生 stu_cse_01 / stu_mgmt_01 均处可用状态。
- **测试数据**：座位 A001（房间 R101，全校开放，07-22）；时段 2026-05-01 19:00-20:00；并发 stu_cse_01 + stu_mgmt_01。
- **操作步骤**：
  1. 用 stu_cse_01 token 准备 POST `/api/v1/bookings` body={ seatId:"A001", startAt:"2026-05-01T19:00:00+08:00", endAt:"2026-05-01T20:00:00+08:00" }
  2. 用 stu_mgmt_01 token 准备相同 body 但不同 token
  3. `Promise.all` 并发执行两请求
  4. 等待两响应
  5. 查询 `db.booking_slot.count(seat="A001", slot_start="2026-05-01T19:00")`
- **Assert 断言**：
  - Step 4: `assert (response_1, response_2) 中恰好一个 status 201、一个 409`
  - Step 4: `assert 409 响应的 body.code == "BOOKING_SLOT_TAKEN"`
  - Step 5: `assert count == 1`
- **后置处理**：删除测试创建的 booking 与 booking_slot；释放座位。

### TC-US3.4.1-01：验证学生预约冲突校验

- **测试目的**：验证学生不能在重叠时段预约多个座位（含部分重叠 + 跨房间），但相邻整点应通过——避免学生囤座降低周转率。
- **测试类型**：接口自动化 / 负向 / 边界
- **前置条件**：US3.4.1 实现完成；stu_cse_01 已有 19-21 预约 in A001；A002 与 B001（不同房）可约。
- **测试数据**：stu_cse_01；A001 19-21 已订；尝试 A002 20-22 / A002 18-20 / A002 21-22 / B001 19-21。
- **操作步骤**：
  1. POST 预约 A002 20-22（部分重叠）
  2. POST 预约 A002 18-20（部分重叠）
  3. POST 预约 A002 21-22（衔接，不重叠）
  4. POST 预约 B001 19-21（跨房间但完全重叠）
  5. 查询 `db.booking` for stu_cse_01
- **Assert 断言**：
  - Step 1: `assert 409; code=USER_TIME_CONFLICT`
  - Step 2: `assert 409; code=USER_TIME_CONFLICT`
  - Step 3: `assert 201`
  - Step 4: `assert 409; code=USER_TIME_CONFLICT`
  - Step 5: `assert booking 数 == 2`（原 19-21 + 21-22）
- **后置处理**：删除测试创建的 booking。

### TC-US3.4.3-01：验证提交前二次校验

- **测试目的**：验证学生在确认页停留期间状态变化（座位被订走 / 维护中 / 自习室关闭）会被服务端二次校验捕获——避免基于过期信息生成无效预约。
- **测试类型**：接口自动化 / 负向 / 时序
- **前置条件**：US3.4.3 实现完成；A001 19-21 当前可约。
- **测试数据**：stu_cse_01；stu_mgmt_01；A001。
- **操作步骤**：
  1. stu_cse_01 GET /availability 看到 A001 19-21 AVAILABLE（前端 hold 5s 模拟）
  2. stu_mgmt_01 抢先 POST 预约 A001 19-21（成功）
  3. stu_cse_01 现在 POST 同样的预约
  4. 检查 db.booking
- **Assert 断言**：
  - Step 2: `assert 201`
  - Step 3: `assert 409; code=BOOKING_SLOT_TAKEN`
  - Step 4: `assert booking 表只有 stu_mgmt_01 的一条`
- **后置处理**：删除 booking。

### TC-US3.5.1-01：验证非法状态流转拒绝

- **测试目的**：验证状态机非法跳转（如 COMPLETED → PENDING_CHECKIN）被 422 拒绝——状态混乱会导致违约统计、自动取消、签到判定全部失真。
- **测试类型**：单元 / 负向
- **前置条件**：US3.5.1-T02 实现。
- **测试数据**：状态对：PENDING_CHECKIN→CHECKED_IN（合法）；CHECKED_IN→COMPLETED（合法）；COMPLETED→PENDING_CHECKIN（非法）；CANCELLED_*→任何（非法）。
- **操作步骤**：
  1. 单元测试调 `assertCanTransition('PENDING_CHECKIN', 'CHECKED_IN')`
  2. 调 `assertCanTransition('CHECKED_IN', 'COMPLETED')`
  3. 调 `assertCanTransition('COMPLETED', 'PENDING_CHECKIN')`
  4. 调 `assertCanTransition('CANCELLED_BY_USER', 'CHECKED_IN')`
- **Assert 断言**：
  - Step 1: `不抛`
  - Step 2: `不抛`
  - Step 3: `抛 UnprocessableEntityException; code=BOOKING_INVALID_TRANSITION`
  - Step 4: `抛 UnprocessableEntityException`
- **后置处理**：无（纯单元测试）。

### TC-US3.2.1-01：验证最大预约时长参数（边界）

- **测试目的**：验证最大预约时长参数（默认 4h）由 system_param 表统一控制、可热更新、超限请求被精确拒绝。
- **测试类型**：接口 / 边界 / 正向 + 负向
- **前置条件**：US3.2.1 实现；system_param MAX_BOOK_HOURS=4。
- **测试数据**：stu_cse_01；A001；3h（合法）/ 4h（合法）/ 5h（拒）。
- **操作步骤**：
  1. POST 预约 A001 19-22（3h）
  2. POST 预约 A002 19-23（4h）
  3. POST 预约 A003 18-23（5h）
  4. PATCH `/api/v1/system-params` body={ MAX_BOOK_HOURS: 6 }（admin_full）
  5. POST 预约 A004 18-23（5h，参数已变 6）
- **Assert 断言**：
  - Step 1: `201`
  - Step 2: `201`
  - Step 3: `422; code=BOOKING_DURATION_EXCEEDED`
  - Step 4: `200`
  - Step 5: `201`（参数热更新生效）
- **后置处理**：MAX_BOOK_HOURS 改回 4；删除测试 booking。

### TC-US3.3.1-01：验证按日期和时段查询空座（接口结构 + 状态全集）

- **测试目的**：验证可用性查询作为预约系统的"信息引擎"，能在单次响应中精确返回座位状态全集（可约/已约/维护中/注销/院系限制）。
- **测试类型**：接口 / 流程
- **前置条件**：US3.3.1 实现；R101 含 A001 (ACTIVE)、A003 (MAINTENANCE)、A004 (已被订 19-21)、A999 (CANCELLED)。
- **测试数据**：日期 2026-05-01；时段 19-21；用户 stu_cse_01。
- **操作步骤**：
  1. GET `/api/v1/seats/availability?date=2026-05-01&start=19&end=21&roomId=R101`
- **Assert 断言**：
  - `response.status == 200`
  - `response.body.data 含 A001 状态 AVAILABLE`
  - `response.body.data 含 A003 状态 MAINTENANCE`
  - `response.body.data 含 A004 slot[19] / slot[20] 状态 BOOKED`
  - `response.body.data 不含 A999`（注销座位不返回）
  - `响应时间 < 500ms`
- **后置处理**：无。

### TC-US3.3.2-01：验证院系限制过滤

- **测试目的**：验证院系自习室访问控制双层防护（查询过滤 + 提交校验）；跨院系学生绕过前端直调接口仍 403。
- **测试类型**：接口 / 负向
- **前置条件**：US3.3.2 实现；R201 计算机学院专属。
- **测试数据**：stu_cse_01（计算机）/ stu_mgmt_01（经管）；R201。
- **操作步骤**：
  1. stu_cse_01 GET availability?roomId=R201
  2. stu_mgmt_01 GET availability?roomId=R201
  3. stu_mgmt_01 POST 预约 R201 任意座位
- **Assert 断言**：
  - Step 1: `200; data 包含 R201 座位`
  - Step 2: `200; data 为空数组（房间被过滤）`
  - Step 3: `403; code=DEPARTMENT_LIMIT`
- **后置处理**：无。

### TC-US3.5.2-01：验证预约取消后座位释放

- **测试目的**：验证学生取消预约后座位 slot 立即释放、其他学生可立即预约——这是周转率的关键机制。
- **测试类型**：接口 / 流程
- **前置条件**：US3.5.2 实现；stu_cse_01 已订 A001 19-21。
- **测试数据**：stu_cse_01；stu_mgmt_01；A001。
- **操作步骤**：
  1. stu_cse_01 POST `/api/v1/bookings/{id}/cancel` body={ reason:"改主意了" }
  2. stu_mgmt_01 GET availability A001 19-21
  3. stu_mgmt_01 POST 预约 A001 19-21
  4. 查询 db.booking_slot for A001 19:00
- **Assert 断言**：
  - Step 1: `200; db.booking.status == CANCELLED_BY_USER`
  - Step 2: `200; A001 状态 AVAILABLE`
  - Step 3: `201`
  - Step 4: `count == 1（stu_mgmt_01 的）`
- **后置处理**：删除 booking。

### TC-US3.2.2-01：验证整点小时粒度

- **测试目的**：验证整点小时粒度约束在前端 UI 与后端两层都生效；非整点 / 结束 ≤ 开始被拒。
- **测试类型**：UI + 接口 / 负向 + 边界
- **前置条件**：US3.2.2 实现。
- **测试数据**：19-21（整点）/ 19:30-20:30（半点）/ 21-19（结束早于开始）。
- **操作步骤**：
  1. UI 打开 s04，picker 尝试选 19:30
  2. 后端 POST 预约 19:30-20:30（绕过前端）
  3. 后端 POST 预约 21:00-19:00
  4. 后端 POST 预约 19:00-21:00
- **Assert 断言**：
  - Step 1: `picker 不展示 19:30 chip; 不可选`
  - Step 2: `422; code=BOOKING_NOT_WHOLE_HOUR`
  - Step 3: `422; code=BOOKING_END_BEFORE_START`
  - Step 4: `201`
- **后置处理**：删除 booking。

**额外 TC（Bucket A 中含七字段）**：US3.1.1-01, US3.2.3-01（提醒/取消阈值，I3 才生效，本迭代仅参数表）, US2.3.1-01, US2.3.2-01, US2.4.1-01, US2.2.3-01, US3.3.3-01, US4.1.1-01, US4.1.2-01, US4.2.1-01, US4.2.2-01, US1.5.1-01, US8.2.1-01。

**行覆盖率门槛 ≥70%** 模块：`booking`、`rules`（含 assertWholeHour / assertCanBook / TRANSITIONS）、`seat`、`room`、`audit`。

## 8. 迭代级 DoD

- [ ] 全部 17 P0 story Done
- [ ] CI lint + unit + integration + build + image-push 五关 green（integration = supertest e2e 部分覆盖）
- [ ] 行覆盖率 ≥70%（booking/rules/seat/room/audit）
- [ ] §9 演示脚本能完整跑过
- [ ] DB schema I3 不需要破坏性变更
- [ ] OpenAPI snapshot v0.2 commit 到 docs/api/
- [ ] 真实并发测试用例（fixed-time race）已加入 e2e 套件

## 9. 演示脚本（10 分钟，第一阶段 Review 主线）

1. **学生找座（3min）**：stu_cse_01 登录 → 首页看 "下一场预约" 卡片（无 → 引导找座）→ 跳 s03 自习室列表 → 选 2026-05-01 19-21 → 看到 R101/R201/R301（R301 关闭灰色）→ 切到 stu_mgmt_01 看 R201 不可见。
2. **筛选 + 选座（2min）**：stu_cse_01 在 s03 选"有插座 + 靠窗"→ 结果列表收敛到 A001、A002 等 → 进入 s04 看到座位图，A003 MAINTENANCE 灰色 → 选 A001 → 进入 s05 占位确认页（详细 UI 在 I3）。
3. **提交预约（1min）**：点确认提交 → API 返回 201 + reservation id → 跳 s06 我的预约（占位列表）→ 看到新预约。
4. **冲突演示（2min）**：开两个浏览器窗口分别用 stu_cse_01 / stu_mgmt_01 同时点击 A002 19-21 提交 → 一个 201 一个 409；用学生 1 试 20-22 预约（与 19-21 重叠）→ 拒；试 21-22 → 通过。
5. **管理资源 + 审计（2min）**：admin_full 在 a02 把 R301 设临时关闭 → 学生端立即不可见；在 a03 把 A005 设 MAINTENANCE → 学生端 A005 灰色；查 audit_log 看到两条记录。

## 10. 拉伸 / 可选

无（本迭代主线饱和）。

## 11. 守卫（Do-not-touch）

- 不修改 `自习室预约/` 目录
- 不绕过 `assertCanBook` 在其他 service 直接 create booking
- 不在 booking 表加 version 字段（不允许乐观锁）
- 不引入 SELECT FOR UPDATE 锁 booking_slot 行（DB UNIQUE INDEX 已经够用）
- 不改 BookingStatus enum 名称（前后端 + Bucket A 全部依赖）
- 不实现签到 / 提醒 / 自动取消（I3 范围）
- 不实现管理仪表盘 / 代预约（I4 范围）

## 12. 与下一迭代的交接

**必须遗留：**
- migrations 0006-0009 commit
- packages/shared-types 含 BookingStatus / BookingDto / AvailabilityQueryDto / SystemParamDto
- 6 个默认 system_param 已在 DB
- BookingService.create / cancel / assertCanBook 完整实现
- BookingService.findAvailableSeats 完整实现
- s02/s03/s04 完整 UI；s05/s06 占位 UI
- Audit 装饰器已应用到 admin 接口
- e2e/booking.e2e-spec.ts 含 fixed-time race 测试

**已知未做项 → I3 入口前置：**
- 签到接口（US5.2.1）尚未实现
- 自动取消任务（US5.4.1）尚未实现 — 关键：BullMQ + Redis 还没在 booking 创建时入队 delayed job
- 提醒邮件（US5.3.x）尚未发送 — MailHog 已就绪但还没 hook
- s05 / s06 详细 UI（我的预约、取消、签到入口）— I3 完成
- GitHub Actions 部署任务尚未接入（CI 仅 build + push 镜像，没 deploy）— I3 接入
