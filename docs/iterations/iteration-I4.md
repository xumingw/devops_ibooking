# Iteration I4 — 管理端运营 + 流水线集成

## 0. 元信息

- **时长**：2 周
- **入口前置**：I3 全部 P0 story Done；测试环境部署成功；e2e 含主链路；BullMQ 三个 job 稳定运行；CI 含 build + e2e + deploy-test。
- **出口准则**：见 §8（核心：管理仪表盘、代预约/代取消、违约管理、参数管理上线；DevCloud 流水线含构建+测试+部署+审批门禁；接口自动化覆盖签到与自动取消主链路）。
- **必读共享文档**：`_shared/tech-stack.md` / `_shared/conventions.md` / `_shared/done-definition.md` / `_shared/design-map.md`
- **设计稿入口**：`自习室预约/Fudan Study System.html`（a01-a06 全员上场）
- **数据契约位置**：`packages/shared-types/`
- **本迭代 source-of-truth**：Bucket A E1.2.2（1）+ E4.4.3-4.4.4（2）+ E5 完善（6）+ E6 主体（9）+ E8.2.2/E8.3.2/E8.4.4（3）

## 1. 迭代目标

**本迭代结束时管理仪表盘、代预约/代取消、违约管理、参数管理全部上线；DevCloud 流水线串接 lint→unit→e2e→build→deploy-test→人工审批→deploy-prod；接口自动化覆盖签到与自动取消主链路。**

## 2. Story 范围

| Story ID | P | 标题 | 关联设计稿 |
|---|---|---|---|
| US1.2.2 | P2 | 用户状态管理 | a05（用户列表 tab） |
| US4.4.3 | P1 | 查看历史预约 | s06（历史 tab） |
| US4.4.4 | P1 | 再次预订历史座位 | s06 |
| US5.1.2 | P1 | 生成二维码 | 教室大屏 |
| US5.1.3 | P1 | 教室屏幕展示接口 | 教室大屏 |
| US5.3.3 | P1 | 通知模板和发送结果 | a04（通知 tab）|
| US5.5.1 | P1 | 使用中状态展示 | s06 |
| US5.5.2 | P1 | 提前结束使用 | s07/s06 |
| US5.5.3 | P1 | 预约到点自动完成 | 无 |
| US6.1.1 | P1 | 查看今日运营概览 | a01 |
| US6.1.2 | P1 | 查看座位利用率趋势 | a01 |
| US6.2.1 | P0 | 查看预约记录 | a04 |
| US6.2.2 | P0 | 管理员代预约 | a04 |
| US6.2.3 | P0 | 管理员代取消 | a04 |
| US6.3.1 | P0 | 查看违约记录 | a04 |
| US6.3.2 | P1 | 学生查看个人违约 | s10 |
| US6.5.1 | P0 | 参数管理页面 | 无（兜底） |
| US6.5.2 | P0 | 参数变更安全限制 | 无 |
| US8.2.2 | P1 | 前端组件测试 | 无 |
| US8.3.2 | P0 | 签到和自动取消接口测试 | 无 |
| US8.4.4 | P0 | 流水线集成 | 无 |

**故事数：21（10 P0 / 10 P1 / 1 P2）**

## 3. 关联设计稿

| Artboard | 用于 |
|---|---|
| a01 管理仪表盘 | US6.1.1 / US6.1.2 |
| a04 预约记录 | US6.2.1 / US6.2.2 / US6.2.3 / US6.3.1 / US5.3.3 |
| a05 角色权限管理 | US1.2.2 用户列表 tab |
| s06 我的预约 | US4.4.3 / US4.4.4 / US5.5.1 |
| s07 签到页 | US5.5.2 提前结束按钮 |
| s10 违约记录 | US6.3.2 |
| 教室大屏（I3 新建） | US5.1.2 / US5.1.3 |

## 4. Tasks（执行顺序）

### Block A — 二维码 + 屏幕端

- [ ] US5.1.2-T01 二维码 payload + HMAC 签名（apps/api/src/check-in/qrcode.service.ts）
- [ ] US5.1.2-T02 GET /api/v1/rooms/:id/qrcode 返回 png 或 json
- [ ] US5.1.2-T03 二维码过期与篡改测试
- [ ] US5.1.3-T01 GET /api/v1/rooms/:id/display（屏幕端）
- [ ] US5.1.3-T02 教室大屏页 /display/:roomId（30s 轮询）
- [ ] US5.1.3-T03 屏幕显示更新测试

### Block B — 通知与使用状态

- [ ] US5.3.3-T01 ReminderLog 扩展字段 (templateName, renderedSubject, renderedBody, errorMessage)
- [ ] US5.3.3-T02 NotificationService try/catch + 失败记录
- [ ] US5.3.3-T03 a04 详情 "通知历史" 折叠面板
- [ ] US5.3.3-T04 失败记录测试
- [ ] US5.5.1-T01 GET /bookings/me 返回 remainingMinutes
- [ ] US5.5.1-T02 s06 卡片倒计时 + 临近 10min 警示色
- [ ] US5.5.1-T03 状态展示测试
- [ ] US5.5.2-T01 POST /api/v1/bookings/:id/early-finish
- [ ] US5.5.2-T02 s06 / s07 "提前结束" 按钮 + Modal
- [ ] US5.5.2-T03 提前释放后可约测试
- [ ] US5.5.3-T01 第四个 BullMQ job at endAt 自动完成
- [ ] US5.5.3-T02 状态切换 CHECKED_IN→COMPLETED
- [ ] US5.5.3-T03 自动完成测试

### Block C — 历史预约

- [ ] US4.4.3-T01 复用 /bookings/me 加 status=COMPLETED|CANCELLED_*
- [ ] US4.4.3-T02 s06 "历史" Tab + 状态筛选
- [ ] US4.4.3-T03 历史分页测试
- [ ] US4.4.4-T01 历史卡片"再次预订"按钮跳 s04
- [ ] US4.4.4-T02 复用 assertCanBook + create
- [ ] US4.4.4-T03 复订成功/失败测试

### Block D — 用户状态管理

- [ ] US1.2.2-T01 PATCH /api/v1/users/:id/status enum (ACTIVE|DISABLED|ARCHIVED)
- [ ] US1.2.2-T02 a05 用户列表 tab + AntD Switch + Modal.confirm
- [ ] US1.2.2-T03 禁用时事务取消所有 PENDING_CHECKIN 预约 + 通知
- [ ] US1.2.2-T04 禁用学生不能预约测试

### Block E — 管理仪表盘

- [ ] US6.1.1-T01 GET /api/v1/dashboard/today（聚合 booking + violation；Redis cache 5min）
- [ ] US6.1.1-T02 a01 KPI 卡片（5 个：今日预约/在座人数/签到率/违约率/开放自习室）
- [ ] US6.1.1-T03 KPI 计算单元测试
- [ ] US6.1.2-T01 GET /api/v1/dashboard/utilization?range=&from=&to=
- [ ] US6.1.2-T02 a01 AntD Charts Heatmap (天 × 小时)
- [ ] US6.1.2-T03 docs/architecture/utilization-metrics.md

### Block F — 预约与违约管理

- [ ] US6.2.1-T01 GET /api/v1/admin/bookings（含筛选、权限点 booking.read_all）
- [ ] US6.2.1-T02 a04 列表 + ProTable
- [ ] US6.2.1-T03 菜单 + 路由 + Guard 三层权限
- [ ] US6.2.1-T04 筛选与权限测试
- [ ] US6.2.2-T01 POST /api/v1/admin/bookings 含 targetUserId（权限 booking.create_for_others）
- [ ] US6.2.2-T02 a04 工具栏 "代预约" Drawer + 学生 AutoComplete
- [ ] US6.2.2-T03 audit_log 记录
- [ ] US6.2.2-T04 代预约规则测试
- [ ] US6.2.3-T01 POST /api/v1/admin/bookings/:id/cancel body={ reason }
- [ ] US6.2.3-T02 a04 行操作 "代取消" Modal + 必填原因
- [ ] US6.2.3-T03 audit_log 记录
- [ ] US6.2.3-T04 代取消后释放测试
- [ ] US6.3.1-T01 GET /api/v1/admin/violations（权限 violation.read）
- [ ] US6.3.1-T02 a04 顶部 Tab "预约 / 违约" + 列表
- [ ] US6.3.1-T03 violation.read 权限三层
- [ ] US6.3.1-T04 跨权限测试
- [ ] US6.3.2-T01 GET /api/v1/violations/me（I3 已实现，本迭代完善 UI）
- [ ] US6.3.2-T02 apps/web-student/src/pages/Violations.tsx 套 s10
- [ ] US6.3.2-T03 越权查询测试

### Block G — 参数管理 + 安全

- [ ] US6.5.1-T01 GET/PATCH /api/v1/admin/system-params + ConfigService.reload event
- [ ] US6.5.1-T02 SystemParams 管理页 (a04 风格列表 + Drawer 表单)
- [ ] US6.5.1-T03 system_param.update 权限三层（默认仅 ROLE_FULL_ADMIN）
- [ ] US6.5.1-T04 参数变更生效测试
- [ ] US6.5.2-T01 system-param-rules.ts (min/max + 跨参数关系)
- [ ] US6.5.2-T02 后端 PATCH 入口校验 422 PARAM_OUT_OF_RANGE / PARAM_INVALID_RELATION
- [ ] US6.5.2-T03 前端 InputNumber min/max + 跨字段提示
- [ ] US6.5.2-T04 无效参数测试

### Block H — 测试 + 流水线集成

- [ ] US8.2.2-T01 Vitest + RTL HourSlotPicker 测试
- [ ] US8.2.2-T02 SeatGrid 组件测试
- [ ] US8.2.2-T03 BookingConfirmPage 交互测试
- [ ] US8.3.2-T01 e2e/check-in.e2e-spec.ts
- [ ] US8.3.2-T02 BullMQ test util fast-forward 自动取消测试
- [ ] US8.3.2-T03 违约记录生成测试
- [ ] US8.3.2-T04 接入流水线（CI 必须 green 才能 deploy）
- [ ] US8.4.4-T01 CodeArts Pipeline yaml: 拉代码→lint→unit→build→e2e→deploy-test→审批→deploy-prod
- [ ] US8.4.4-T02 失败中断 + DingTalk/邮件通知；prod 门禁（覆盖率 ≥70% + e2e green + 审批）
- [ ] US8.4.4-T03 流水线截图归档 docs/devops/screenshots/

## 5. 实现要点（5 个最易翻车 story）

### 5.1 US6.1.x 仪表盘 KPI 聚合（性能 + 准确性）

**关键决策：**
- 5 个 KPI 用单条 SQL 聚合 + Redis cache 5 min（key=`dashboard:today:<date>`）。
- `signInRate = COUNT(status IN [CHECKED_IN, COMPLETED]) / COUNT(today bookings)`
- `violationRate = COUNT(violation today) / COUNT(today bookings)`
- `currentInUse = COUNT(status = CHECKED_IN AND now BETWEEN startAt AND endAt)`
- 大数据量时考虑 materialized view 或预聚合 `daily_stats` 表（I5 优化空间）。

**热力图 (US6.1.2)：** 按 `(date, hour)` 分组；utilization = `sum(used_slot_minutes) / sum(available_slot_minutes)`，前端 AntD Charts Heatmap 颜色梯度 0-100%。

### 5.2 US6.2.2 代预约（权限 + 审计 + 不绕规则）

**关键决策：**
- 复用 `BookingService.assertCanBook` + create — **绝对不允许**为 admin 写一套绕规则的快速通道。
- POST body 显式含 `targetUserId`；后端用 `targetUserId` 替代 `currentUser.id` 进入 assertCanBook（学生时间冲突仍按 target 计算）。
- audit_log 记录 `actor=admin_full, target=studentId, action=booking.create_for_others, payload={ booking 详情 }`。
- 学生收到代预约通知（同 US5.3.x 模板，加一句 "由管理员 X 代您预约"）。
- 权限点 `booking.create_for_others` 默认仅 ROLE_FULL_ADMIN 拥有，其他角色（room admin / audit）无此权限。

### 5.3 US6.5.1 参数管理（热更新机制）

**关键决策：**
- ConfigService 启动时 `loadFromDb()`；EventEmitter `param.changed` 触发 `loadFromDb()`。
- PATCH 接口写库后 `eventEmitter.emit('param.changed', { keys })`；ConfigService 监听并 `loadFromDb()` + 通知 BullMQ 重新计算待入队 job 的 delay（**不修改已入队 job**，新 job 用新参数）。
- 参数变更 audit_log 必写，含 `beforeValue` 与 `afterValue`。
- 前端管理页改值时 Modal.confirm 显示 "影响范围：MAX_BOOK_HOURS 4→6 将允许新预约最长 6 小时；旧预约不受影响"。

### 5.4 US8.4.4 流水线集成 + 审批门禁

**Pipeline yaml 结构：**

```yaml
stages:
  - lint:
      script: pnpm lint
  - unit-test:
      script: pnpm test --coverage
      coverage:
        threshold: 70
  - build:
      script:
        - pnpm build
        - docker build -t $IMAGE_API:$SHA apps/api
        - docker build -t $IMAGE_WEB_STUDENT:$SHA apps/web-student
        - docker build -t $IMAGE_WEB_ADMIN:$SHA apps/web-admin
        - docker push ...
  - e2e-test:
      script: pnpm --filter api test:e2e
      depends_on: build
  - deploy-test:
      script: bash infra/devcloud/deploy.sh test $SHA
      depends_on: e2e-test
  - manual-approval:
      type: manual
      approvers: [admin_full, project_lead]
      depends_on: deploy-test
  - deploy-prod:
      script: bash infra/devcloud/deploy.sh prod $SHA
      depends_on: manual-approval
```

**门禁规则：**
- coverage < 70% → unit-test stage fail → 不进 build。
- 任意 e2e 失败 → deploy-test fail → 不进 manual-approval。
- manual-approval 默认拒绝；任一 approver 通过即放行。
- 失败时 DingTalk webhook 发消息到团队群。

### 5.5 US5.5.3 自动完成任务（第四个 BullMQ job）

**关键决策：**
- booking 创建时 enqueue 第四个 job at `endAt` jobId=`auto-complete-${id}`。
- 任务执行时 `if status==CHECKED_IN then COMPLETED；其他状态不动`。
- 学生 `early-finish` 时取消该 job（`bullQueue.remove('auto-complete-' + id)`）+ 立即设状态。
- 用户取消（`CANCELLED_BY_USER`）时也取消该 job + reminder/auto-cancel 三个 job 全部 remove。

**注意：** 与 auto-cancel job 时间相邻（auto-cancel = startAt+15min, auto-complete = endAt = startAt+1~4h）— 没有竞争；状态机的 idempotent 检查保证安全。

## 6. 数据/接口契约变更

**Prisma migrations：**
- `0015_user_status`: User.status enum (ACTIVE|DISABLED|ARCHIVED) 字段
- `0016_reminder_log_extended`: ReminderLog 加 templateName, renderedSubject, renderedBody, errorMessage
- `0017_violation_notes`: Violation.notes JSON[] 追加式（为 I5 US6.3.3 留位）

**新增 REST endpoints（v0.4）：**

| Method | Path | 权限 | 说明 |
|---|---|---|---|
| PATCH | /api/v1/users/:id/status | user.update_status | 启用/禁用 |
| GET | /api/v1/dashboard/today | dashboard.read | 今日 KPI |
| GET | /api/v1/dashboard/utilization | dashboard.read | 利用率热力 |
| GET | /api/v1/admin/bookings | booking.read_all | 预约记录 |
| POST | /api/v1/admin/bookings | booking.create_for_others | 代预约 |
| POST | /api/v1/admin/bookings/:id/cancel | booking.cancel_others | 代取消 |
| GET | /api/v1/admin/violations | violation.read | 违约记录 |
| POST | /api/v1/bookings/:id/early-finish | auth (owner) | 提前结束 |
| GET/PATCH | /api/v1/admin/system-params | system_param.update | 参数管理 |
| GET | /api/v1/rooms/:id/qrcode | room.display | 二维码 |

## 7. 测试要求

### TC-US6.2.2-01：验证管理员代预约（权限 + 规则不绕过 + 审计）

- **测试目的**：验证管理员代预约仍走完整 assertCanBook 校验、操作有完整审计、低权限角色无法代预约——避免管理员"特权通道"绕过规则同时保留可追溯性。
- **测试类型**：接口 / 权限 / 审计 / 负向
- **前置条件**：US6.2.2 实现；admin_full / roomAdmin01 / stu_cse_01 存在；A001 19-21 可约。
- **测试数据**：admin_full（有 booking.create_for_others）；roomAdmin01（无该权限）；目标 stu_cse_01；A001。
- **操作步骤**：
  1. admin_full POST `/api/v1/admin/bookings` body={ targetUserId:stu_cse_01.id, seatId:A001, startAt:"...19:00", endAt:"...21:00" }
  2. 查 db.booking + db.audit_log
  3. admin_full 再 POST 同样的请求（冲突）
  4. admin_full 再 POST 5h 时段
  5. roomAdmin01 POST 步骤 1 同样的请求
- **Assert 断言**：
  - Step 2: `booking.userId == stu_cse_01.id; booking.status == PENDING_CHECKIN; audit_log 含 actor=admin_full, target=stu_cse_01, action=booking.create_for_others`
  - Step 3: `409; code=BOOKING_SLOT_TAKEN`
  - Step 4: `422; code=BOOKING_DURATION_EXCEEDED`
  - Step 5: `403; code=RBAC_FORBIDDEN`
- **后置处理**：删除 booking + audit_log 测试数据。

### TC-US6.5.1-01：验证参数管理热更新

- **测试目的**：验证 system_param 集中管理 + 热更新 + 审计 + 权限受限——这是课程要求"调整系统参数"的核心实现。
- **测试类型**：接口 / 时序 / 权限
- **前置条件**：US6.5.1 实现；初始 MAX_BOOK_HOURS=4；admin_full / audit01 存在。
- **测试数据**：MAX_BOOK_HOURS。
- **操作步骤**：
  1. admin_full PATCH `/api/v1/admin/system-params` body={ key:"MAX_BOOK_HOURS", value:"6" }
  2. stu_cse_01 立即 POST 5h 预约（不重启服务）
  3. admin_full PATCH 改回 4
  4. stu_cse_01 POST 5h 预约
  5. audit01 PATCH 任意参数
- **Assert 断言**：
  - Step 1: `200; db.system_param.MAX_BOOK_HOURS == "6"; audit_log 含 before=4 after=6`
  - Step 2: `201`（参数热更新生效）
  - Step 4: `422; code=BOOKING_DURATION_EXCEEDED`
  - Step 5: `403; code=RBAC_FORBIDDEN`
- **后置处理**：MAX_BOOK_HOURS 改回 4；删除测试 booking + audit_log。

### TC-US6.5.2-01：验证参数变更安全限制

- **测试目的**：验证参数取值范围 + 跨参数约束在前后端两层防御；非法值不能保存。
- **测试类型**：接口 / 边界 / 负向
- **前置条件**：US6.5.2 实现。
- **测试数据**：MAX_BOOK_HOURS=0 / 25 / 4（合法）；AUTO_CANCEL_AFTER_MINUTES=5 vs LATE_REMINDER_AFTER_MINUTES=10（关系冲突）。
- **操作步骤**：
  1. PATCH MAX_BOOK_HOURS=0
  2. PATCH MAX_BOOK_HOURS=25
  3. PATCH AUTO_CANCEL=5（保持 LATE_REMINDER=10）
  4. PATCH MAX_BOOK_HOURS=4
- **Assert 断言**：
  - Step 1/2: `422; code=PARAM_OUT_OF_RANGE`
  - Step 3: `422; code=PARAM_INVALID_RELATION; message 含 "AUTO_CANCEL 必须 ≥ LATE_REMINDER"`
  - Step 4: `200`
- **后置处理**：参数还原。

### TC-US6.1.1-01：验证今日运营概览准确性

- **测试目的**：验证仪表盘 5 个 KPI 与底层数据一致、空数据不出错——这是运营决策的入口。
- **测试类型**：接口 / 数据库 / UI
- **前置条件**：US6.1.1 实现；seed 数据：今日 5 个预约（3 个 CHECKED_IN，1 个待签到，1 个 CANCELLED_AUTO_NO_CHECKIN）；1 个违约。
- **测试数据**：上述 seed。
- **操作步骤**：
  1. admin_full GET `/api/v1/dashboard/today`
  2. 比对底层 SQL 结果
  3. 改一个 booking 状态为 CHECKED_IN → 立即调（cache 5min 内不变）
  4. 等 6 分钟（或手动清 Redis cache）→ 再调
  5. 调用空数据日期范围
- **Assert 断言**：
  - Step 2: `todayBookingCount == 5; signInRate == 60% (3/5); violationRate == 20% (1/5); currentInUse == 实时计算正确`
  - Step 3: `KPI 不变（cache 命中）`
  - Step 4: `KPI 更新`
  - Step 5: `空数据返回 0/0/0%/0%；不出现 NaN`
- **后置处理**：清 Redis cache。

### TC-US8.4.4-01：验证流水线门禁

- **测试目的**：验证完整流水线（lint→unit→build→e2e→deploy-test→审批→deploy-prod）端到端可跑、失败阻断、审批门禁有效——这是课程"DevOps 完整流程"评分点最高峰。
- **测试类型**：流程验收 / 部署
- **前置条件**：US8.4.4-T01 实现。
- **测试数据**：build green main 提交；admin_full / project_lead 审批角色。
- **操作步骤**：
  1. push main 触发完整 pipeline
  2. 等到 manual-approval 阶段
  3. 任一审批者拒绝 → 流水线终止
  4. 重新触发；审批者通过
  5. 故意制造 e2e 失败的 commit；push
  6. 故意制造覆盖率 < 70% 的 commit；push
- **Assert 断言**：
  - Step 2: `lint/unit/build/e2e/deploy-test 全部 green，停在 manual-approval`
  - Step 3: `pipeline status == FAILED；deploy-prod 不执行`
  - Step 4: `deploy-prod 执行成功；prod URL 健康`
  - Step 5: `e2e fail 后 deploy-test 阻断；流水线 fail；DingTalk 通知`
  - Step 6: `unit-test fail（coverage 检查）；不进 build`
- **后置处理**：还原代码；保留 prod 健康。

### TC-US6.2.3-01：验证管理员代取消

- **测试目的**：验证代取消功能记录原因、通知学生、释放座位且操作有完整审计。
- **测试类型**：接口 / 流程 / 审计
- **前置条件**：US6.2.3 实现；stu_cse_01 已有预约 reservation_future。
- **测试数据**：admin_full；reservation_future。
- **操作步骤**：
  1. admin_full POST `/api/v1/admin/bookings/{reservation_future.id}/cancel` body={ reason:"考试占用" }
  2. 查 db.booking + db.audit_log + mailhog
  3. 查 availability for that slot
- **Assert 断言**：
  - Step 2: `booking.status == CANCELLED_BY_ADMIN; audit_log 含 reason=考试占用; mailhog 收到代取消邮件给 stu_cse_01`
  - Step 3: `slot 回到 AVAILABLE`
- **后置处理**：删除 booking + audit_log。

**额外 TC（Bucket A 中含七字段）**：US1.2.2-01, US4.4.3-01, US4.4.4-01, US5.1.2-01, US5.1.3-01, US5.3.3-01, US5.5.1-01, US5.5.2-01, US5.5.3-01, US6.1.2-01, US6.2.1-01, US6.3.1-01, US6.3.2-01, US8.2.2-01, US8.3.2-01。

**行覆盖率门槛 ≥70%** 全仓库（含前端组件覆盖率，由 US8.2.2 贡献）。

## 8. 迭代级 DoD

- [ ] 全部 10 P0 + 全部 10 P1 story Done
- [ ] CI 完整流水线 8 阶段 main 自动 green
- [ ] 仓库级行覆盖率 ≥70%（前端 + 后端汇总）
- [ ] §9 演示脚本在 prod 环境跑通
- [ ] OpenAPI snapshot v0.4 commit
- [ ] 流水线截图归档 docs/devops/screenshots/

## 9. 演示脚本（10 分钟，第二阶段 Review 主线）

1. **管理仪表盘（2min）**：admin_full 登录 web-admin → a01 看 5 个 KPI + 利用率热力图；切到无数据日期看到空状态。

2. **代预约 + 代取消（2min）**：在 a04 点 "代预约" → 选 stu_cse_01 + A002 19-21 → 提交；学生收到邮件 → 切到 stu_cse_01 看到这条预约带 "管理员代订" 标签；admin_full 在 a04 找到这条 → 代取消填原因 → 学生收到取消邮件。

3. **违约管理（2min）**：a04 切到违约 tab → 看到 stu_mgmt_01 昨天的违约记录；切到 stu_mgmt_01 进 s10 看到自己的违约记录。

4. **参数管理（1min）**：admin_full 进入系统参数页 → 把 MAX_BOOK_HOURS 从 4 改 6；切到 stu_cse_01 立即试 5 小时预约（成功）；改回 4；试 5 小时（拒）。

5. **完整流水线 + 审批门禁（3min）**：在 DevCloud Pipelines 中展示一次完整流水线执行：lint → unit → build → e2e → deploy-test → 等审批 → admin_full 拒绝 → 流水线终止；重新触发 → 通过 → deploy-prod → prod URL 健康。展示截图。

## 10. 拉伸 / 可选

无。

## 11. 守卫

- 不绕过 BookingService.assertCanBook 在 admin 接口直接 create
- 不在仪表盘 KPI 接口写实时聚合 SQL（必须 Redis cache 5min；否则高频 admin 拖垮 DB）
- 不允许 system_param 改值不写 audit_log
- 不修改已入队的 BullMQ delayed job 的 delay（参数变更只影响新 job）
- 不删 violation 记录（即使备注/申诉处理也不删，只追加 notes）
- 不绕过流水线 deploy-prod；prod 必须经审批

## 12. 与下一迭代的交接

**必须遗留：**
- migrations 0015-0017
- shared-types 含 SystemParamRule, DashboardKpiDto, AdminBookingDto, ViolationDto 等
- 完整的 5 个 BullMQ job（reminder-before, reminder-late, auto-cancel, auto-complete + reminder 失败重试）
- a01-a06 全部页面完整可用
- 流水线 yaml + DingTalk webhook + 审批配置
- 覆盖率报告 ≥70% 全仓库

**已知未做项 → I5 入口前置：**
- AI 助手（E7）尚未实现 — I5
- 数据报表导出（US6.4.x）尚未实现 — I5
- 系统公告 / 通知模板维护（US6.6.x）— I5
- 收藏与偏好（US4.6.x）— I5
- 通宵自习室（US3.1.3）— I5
- 资源清单导出（US2.5.2）— I5
- 违约备注/申诉（US6.3.3）— I5
- mini-program 拉伸 — I5/I6（可选）
