# Iteration I5 — AI 助手（规则） + 报表 + 拉伸项

## 0. 元信息

- **时长**：2 周
- **入口前置**：I4 全部 P0 story Done；prod 环境健康；流水线含审批门禁；仓库覆盖率 ≥70%。
- **出口准则**：见 §8（核心：学生端聊天框可处理空座/条件找座/我的预约三类意图；预约/违约导出报表可用；微信小程序最小可用版本（如启动了拉伸目标））。
- **必读共享文档**：`_shared/tech-stack.md` / `_shared/conventions.md` / `_shared/done-definition.md` / `_shared/design-map.md`
- **设计稿入口**：`自习室预约/Fudan Study System.html`（s08 / a06 主导；m00-m07 拉伸触发时使用）
- **数据契约位置**：`packages/shared-types/`
- **本迭代 source-of-truth**：Bucket A E2.5.2（1）+ E3.1.3（1）+ E4.6（2）+ E6.3.3-E6.6（6）+ E7 主体（11）+ E8.5.2（1）+ 拉伸 E4.5.2/E5.2.2（2）

## 1. 迭代目标

**本迭代结束时学生端聊天框可处理三类意图（空座/条件找座/我的预约）；预约和违约导出报表可用；公告与通知模板维护上线；如团队选择 mini-program 拉伸，则微信小程序最小可用版本（含 m05 扫码签到）发布。**

## 2. Story 范围（主线 + 拉伸分开）

### 主线（必做）

| Story ID | P | 标题 | 关联设计稿 |
|---|---|---|---|
| US3.1.3 | P2 | 通宵自习室支持 | a02 |
| US2.5.2 | P2 | 导出资源清单 | a02 / a03 |
| US4.6.1 | P2 | 收藏座位和自习室 | s06 兜底 |
| US4.6.2 | P2 | 保存座位偏好 | s06 兜底 |
| US6.3.3 | P2 | 违约备注或申诉处理 | s10 / a04 |
| US6.4.1 | P1 | 导出预约数据 | a06 |
| US6.4.2 | P1 | 导出违约数据 | a06 |
| US6.4.3 | P2 | 热门座位与闲置分析 | a06 |
| US6.6.1 | P2 | 发布系统公告 | 兜底 |
| US6.6.2 | P2 | 维护通知模板 | 兜底 |
| US7.1.1 | P1 | 学生端聊天入口 | s08 |
| US7.1.2 | P2 | 会话上下文记录 | s08 |
| US7.2.1 | P1 | 解析时间表达 | 无（后端） |
| US7.2.2 | P1 | 解析座位条件实体 | 无 |
| US7.2.3 | P1 | 无法识别时兜底引导 | s08 |
| US7.3.1 | P1 | 查询今天晚上空座 | s08 |
| US7.3.2 | P2 | 空座结果排序 | s08 |
| US7.4.1 | P1 | 查找靠窗座位 | s08 |
| US7.4.2 | P1 | 查找有插座座位 | s08 |
| US7.5.1 | P1 | 查询我今天订了哪里 | s08 |
| US7.5.2 | P2 | 预约相关快捷操作 | s08 |
| US8.5.2 | P0 | 编写演示脚本 | 无 |

**主线故事数：22（1 P0 / 9 P1 / 12 P2）**

### 拉伸（仅团队明确决议启用时执行）

| Story ID | 标题 | 关联设计稿 |
|---|---|---|
| US4.5.2 | 微信小程序学生端适配 | m00-m07 |
| US5.2.2 | 小程序扫码签到 | m05 |

**注**：拉伸项是课程加分（+5%）。在 §10 拉伸节有详细决策框架。如果 I4 收尾时团队 schedule 紧张，拉伸不启动；I5 末再视进度决定 I6 是否补做。

## 3. 关联设计稿

| Artboard | 用于 |
|---|---|
| s08 智能助手 | 全部 E7 主体 |
| a06 数据报表 | US6.4.1 / US6.4.2 / US6.4.3 / US2.5.2 |
| a02 / a03 | US2.5.2 导出按钮 / US3.1.3 通宵开关 |
| s06 卡片样式（兜底）| US4.6.1 / US4.6.2 |
| s10 / a04 | US6.3.3 |
| 兜底 a04 列表 | US6.6.1 / US6.6.2 |
| **拉伸** m00-m07 | US4.5.2 / US5.2.2 |

## 4. Tasks（执行顺序）

### Block A — AI 助手架构基础

- [ ] US7.1.1-T01 apps/web-student/src/pages/Assistant.tsx 套 s08（消息气泡 + 输入框 + 快捷按钮）
- [ ] US7.1.1-T02 POST /api/v1/assistant/chat body={ message, sessionId? } 返回 { reply, intent, entities, results, actions }
- [ ] US7.1.1-T03 空输入禁用 + 错误 Toast + 重试
- [ ] US7.1.2-T01 AiChatSession + AiChatMessage 表 (近 10 轮上下文)
- [ ] US7.1.2-T02 chat 接口接收 sessionId 时拉取上下文 + DELETE 清空会话
- [ ] US7.1.2-T03 上下文场景测试

### Block B — 实体解析（rule-based）

- [ ] US7.2.1-T01 apps/api/src/assistant/time-parser.ts；chrono-node-zh + 自写 regex
- [ ] US7.2.1-T02 parseTimeExpression(text): { date, startHour, endHour, confidence }
- [ ] US7.2.1-T03 单元测试覆盖 20+ 中文表达
- [ ] US7.2.2-T01 keyword-map.ts (靠窗/插座/安静/楼栋同义词集)
- [ ] US7.2.2-T02 parseEntities(text): { tags, room?, floor?, building? }
- [ ] US7.2.2-T03 组合解析测试
- [ ] US7.2.3-T01 fallback-templates.ts (3 个示例问题 + 引导文案)
- [ ] US7.2.3-T02 confidence < 0.5 触发 fallback；记录 unrecognized 文本
- [ ] US7.2.3-T03 s08 兜底回复下方显示 chip 按钮
- [ ] US7.2.3-T04 无法识别测试

### Block C — 意图路由 + 工具调用

- [ ] US7.3.1-T01 IntentRouter + INTENT_QUERY_AVAILABLE_SEATS 处理器
- [ ] US7.3.1-T02 调 BookingService.findAvailableSeats + 取前 5
- [ ] US7.3.1-T03 s08 助手回复内嵌座位卡片 + "立即预约" 按钮跳 s05
- [ ] US7.3.1-T04 示例问法测试
- [ ] US7.3.2-T01 scoring 函数 (同院系+20 / 偏好+10 / 长时段+5)
- [ ] US7.3.2-T02 scoreSeats(seats, preferences, departmentId)
- [ ] US7.3.2-T03 排序权重测试
- [ ] US7.4.1-T01 INTENT_FIND_BY_CONDITION + 调用 availability 接口（filters=parsed）
- [ ] US7.4.1-T02 复用 §3.3.3 接口；时间默认未来 2h
- [ ] US7.4.1-T03 结果卡片显示标签 chips
- [ ] US7.4.1-T04 靠窗查询测试
- [ ] US7.4.2-T01 keyword-map 扩展插座关键词
- [ ] US7.4.2-T02 卡片区分 "固定插座" / "移动导轨"
- [ ] US7.4.2-T03 自然语言查询测试
- [ ] US7.5.1-T01 INTENT_QUERY_MY_BOOKINGS 路由
- [ ] US7.5.1-T02 调用 /bookings/me + time filter
- [ ] US7.5.1-T03 卡片含签到/取消快捷按钮（按状态）
- [ ] US7.5.1-T04 我的预约问法测试
- [ ] US7.5.2-T01 actions 协议 (NAVIGATE / CONFIRM_CANCEL / CHECK_IN)
- [ ] US7.5.2-T02 ActionRenderer 前端
- [ ] US7.5.2-T03 状态对应按钮测试

### Block D — 资源 + 违约 + 公告

- [ ] US3.1.3-T01 Room.overnight 字段 + 跨天逻辑
- [ ] US3.1.3-T02 学生端跨天 picker（"次日 01:00"）
- [ ] US3.1.3-T03 跨天预约 + 签到测试
- [ ] US2.5.2-T01 GET /api/v1/seats/export （sheetjs xlsx 流）
- [ ] US2.5.2-T02 a02/a03 导出按钮（沿用筛选条件）
- [ ] US2.5.2-T03 导出文件内容测试
- [ ] US6.3.3-T01 violation.notes JSON[] + POST /api/v1/admin/violations/:id/notes
- [ ] US6.3.3-T02 a04 详情 / s10 申诉抽屉
- [ ] US6.3.3-T03 备注审计测试
- [ ] US6.4.1-T01 GET /api/v1/admin/bookings/export（sheetjs；> 10000 行 BullMQ 异步 + 邮件）
- [ ] US6.4.1-T02 a06 工具栏 + 进度提示
- [ ] US6.4.1-T03 内容校验测试
- [ ] US6.4.2-T01 GET /api/v1/admin/violations/export
- [ ] US6.4.2-T02 violation.export 权限点
- [ ] US6.4.2-T03 权限和内容测试
- [ ] US6.4.3-T01 GET /api/v1/admin/analytics/hot-cold
- [ ] US6.4.3-T02 a06 AntD Charts 报表
- [ ] US6.4.3-T03 docs/architecture/hot-cold-analytics.md
- [ ] US6.6.1-T01 Announcement 表 + CRUD
- [ ] US6.6.1-T02 管理端列表 + Drawer + react-md-editor 预览
- [ ] US6.6.1-T03 s02 首页 banner + s09 通知中心 公告 tab
- [ ] US6.6.1-T04 公告有效期测试
- [ ] US6.6.2-T01 NotificationTemplate 表 + 变量白名单
- [ ] US6.6.2-T02 编辑器 + 预览（示例数据渲染）+ 版本化
- [ ] US6.6.2-T03 模板变量测试

### Block E — 收藏与偏好

- [ ] US4.6.1-T01 Favorite 表 (UNIQUE userId+targetType+targetId) + CRUD
- [ ] US4.6.1-T02 座位/房间卡片 ♡ 图标 + s06 收藏 tab
- [ ] US4.6.1-T03 重复收藏 / 取消测试
- [ ] US4.6.2-T01 user.preferences JSON 字段
- [ ] US4.6.2-T02 偏好设置页 + chip 多选
- [ ] US4.6.2-T03 availability 接口 ?usePreference=true 加权排序
- [ ] US4.6.2-T04 偏好保存测试

### Block F — 演示脚本

- [ ] US8.5.2-T01 docs/demo/phase1-review.md
- [ ] US8.5.2-T02 docs/demo/final-presentation.md（15min storyboard）
- [ ] US8.5.2-T03 异常场景演示数据
- [ ] US8.5.2-T04 彩排 1 次 + 记录问题

### Block G — 拉伸（仅启用时）

- [ ] US4.5.2-T01 apps/miniapp Taro 4 init；wx.login → 后端换 token
- [ ] US4.5.2-T02 tabBar 五项 + 适配 m00-m07 路由
- [ ] US4.5.2-T03 Taro.request 包装 + 统一拦截
- [ ] US4.5.2-T04 主流程测试清单
- [ ] US5.2.2-T01 Taro.scanCode + qrcode payload 验签
- [ ] US5.2.2-T02 后端扩展 check-in 接口接受 qrcodePayload
- [ ] US5.2.2-T03 微信开发者工具 + 真机覆盖测试

## 5. 实现要点（5 个最易翻车 story）

### 5.1 US7.x AI 助手架构（HARDEST 概念上 — 但必须保持简单）

**核心架构（apps/api/src/assistant/）：**

```
                  ┌──────────────────┐
chat request ─→ IntentRouter
                       │
        ┌──────────────┼─────────────┐
        ↓              ↓             ↓
   RuleParser    (LLMParser I6)  Fallback
        │              │             │
        └──────► Intent + Entities  ─┘
                       │
                  ToolCaller
                       │
            ┌──────────┼──────────┐
            ↓          ↓          ↓
     findAvailable  findMy   templates
            └──────────┼──────────┘
                       ↓
               ResponseRenderer
                       │
                       ↓
                   reply + actions
```

**关键决策：**
- I5 **只做 RuleParser**；LLMParser 接口留位但 I6 才接入。
- 4 个 intent enum: `INTENT_QUERY_AVAILABLE_SEATS / INTENT_FIND_BY_CONDITION / INTENT_QUERY_MY_BOOKINGS / INTENT_FALLBACK`。
- ToolCaller 调用的工具必须在白名单（assistant-tools.ts）：`findAvailableSeats / getMyBookings / cancelMyBooking`（最后一个含二次确认）。**所有调用强制 userId=current**，不允许参数中传 userId。
- ResponseRenderer 输出结构化 actions = [{ type: NAVIGATE | CONFIRM_CANCEL | CHECK_IN, label, params }]，前端 ActionRenderer 渲染。

### 5.2 US7.2.1 中文时间解析（细致）

**关键决策：**
- 使用 `chrono-node` 中文 + 自写映射表兜底：
  ```
  "今天" → today / 8-22
  "今晚" / "今天晚上" → today / 18-22
  "明天" → tomorrow / 8-22
  "明天上午" → tomorrow / 8-12
  "明天下午" → tomorrow / 12-18
  "明天晚上" → tomorrow / 18-22
  "晚上 8 点" / "20:00" → today / 20-22
  "本周日" → 计算 closest Sunday / 8-22
  ```
- confidence 评分：精确小时 1.0 / 时段词 0.8 / 模糊 0.5 / 未识别 0.0。
- < 0.5 触发兜底（提示用户精确时间）。
- 单元测试覆盖 20+ 表达，包括"明天下午两点"、"今晚 8 点之后"、"周日上午"。

### 5.3 US6.4.x 报表导出（异步 + 安全）

**关键决策：**
- 同步 vs 异步分流：行数 ≤10000 同步流式响应；> 10000 入 BullMQ job 生成 → 上传到对象存储（华为 OBS）→ 邮件链接 24h 过期。
- sheetjs `XLSX.write` 流式输出，不占用内存。
- 所有导出 audit_log 必写（含筛选条件 hash）；含 PII 的导出需要 violation.export 权限。
- utf8 BOM 防 Excel 中文乱码：`Buffer.concat([Buffer.from([0xEF, 0xBB, 0xBF]), xlsxBuffer])`。

### 5.4 US6.6.2 通知模板版本化

**关键决策：**
- NotificationTemplate 表含 (id, code, channel, subject, body, version, status: ACTIVE|ARCHIVED)。
- 同 code 多 version：发送时取 status=ACTIVE 最新 version；编辑保存时新建 version + 旧 version 设 ARCHIVED。
- 变量白名单：`{ studentName, roomName, seatCode, startTime, endTime, codeValidUntil, ... }`；模板中含未知变量时 422 拒。
- 预览：用 fixture 数据渲染（如 studentName="张三", roomName="R101"）。
- I3/I4 已发出去的邮件继续用旧 version（reminder_log.templateName + version 字段已记录）；新邮件用新 version。

### 5.5 拉伸 mini-program（如启用）

**关键决策：**
- Taro 4 (React 语法)，复用 `packages/shared-types` 与 `packages/design-tokens`；不重写组件库。
- 仅实现 m00 / m01 / m04 / m05 四屏（登录/首页/我的预约/扫码签到）即可达到 +5% 加分门槛；其余 m02/m03/m06/m07 视进度。
- 后端 `auth/wx-login`：接收 wx.code → 调微信接口换 openid → 关联本地 user → 签 token。
- 扫码签到（US5.2.2）：`Taro.scanCode` 解析 QR payload → 验签 → POST `/bookings/:id/check-in` body={ qrcodePayload }。
- **不发布到正式微信小程序后台**（需要 AppID 与公司主体），仅提交微信开发者工具 + 真机预览二维码作为演示证据。

## 6. 数据/接口契约变更

**Prisma migrations：**
- `0018_ai_chat`: AiChatSession + AiChatMessage
- `0019_announcement`: Announcement
- `0020_notification_template`: NotificationTemplate (versioned)
- `0021_favorite`: Favorite (UNIQUE)
- `0022_user_preferences`: User.preferences JSON 字段
- `0023_violation_notes`: violation.notes JSON[] (I4 已预留 schema，本迭代正式启用)

**新增 REST endpoints（v0.5）：**

| Method | Path | 权限 | 说明 |
|---|---|---|---|
| POST | /api/v1/assistant/chat | auth | 发送助手消息 |
| DELETE | /api/v1/assistant/sessions/:id | auth (owner) | 清空会话 |
| GET | /api/v1/admin/bookings/export | booking.export | 预约导出 |
| GET | /api/v1/admin/violations/export | violation.export | 违约导出 |
| GET | /api/v1/seats/export | seat.read | 资源清单导出 |
| GET | /api/v1/admin/analytics/hot-cold | dashboard.read | 热门/闲置 |
| POST/PATCH/DELETE | /api/v1/admin/announcements | announcement.publish | 公告 CRUD |
| GET/POST/PATCH | /api/v1/admin/notification-templates | template.update | 模板维护 |
| POST/DELETE | /api/v1/favorites | auth | 收藏 |
| PATCH | /api/v1/users/me/preferences | auth (self) | 偏好 |
| POST | /api/v1/admin/violations/:id/notes | violation.update | 违约备注 |
| POST | /api/v1/auth/wx-login (拉伸) | (wx code) | 小程序登录 |

## 7. 测试要求

### TC-US7.3.1-01：验证查询今天晚上空座（课程示例 Q1）

- **测试目的**：验证 AI 助手对最常见的空座查询意图能给出座位列表 + 一键预约——这是课程示例 Q1 "今天晚上还有空座吗" 的核心实现。
- **测试类型**：UI / 接口 / 流程
- **前置条件**：US7.3.1 实现；今晚 R101 有 3 个可用座位。
- **测试数据**：stu_cse_01；时间 = 14:00 当日。
- **操作步骤**：
  1. 打开 s08 智能助手
  2. 发送 "今天晚上还有空座吗"
  3. 等待回复
  4. 检查 chat response.entities
  5. 点击结果中 "立即预约" 按钮
- **Assert 断言**：
  - Step 3: `回复气泡含至少 3 个座位卡片，每张含 房间名 / 座位号 / 时段`
  - Step 4: `entities.date == today; entities.startHour >= 18; entities.endHour <= 22`
  - Step 5: `跳转到 s05 预约确认页 + URL 含 seatId & timeRange`
- **后置处理**：清空 session。

### TC-US7.4.1-01：验证查找靠窗座位（课程示例 Q2）

- **测试目的**：验证助手对课程示例 Q2 "帮我找靠窗的座位" 准确路由到属性筛选并展示带标签的结果。
- **测试类型**：UI / 接口
- **前置条件**：US7.4.1 实现；A002 标签 [WINDOW]，A006 无 WINDOW。
- **测试数据**：stu_cse_01。
- **操作步骤**：
  1. s08 发送 "帮我找靠窗的座位"
  2. 检查回复
  3. 切换到 "找有插座的位置"
  4. 切换到 "靠窗 + 插座"
- **Assert 断言**：
  - Step 2: `entities.tags == [WINDOW]; 返回结果均含 WINDOW 标签`
  - Step 3: `entities.powerType in [FIXED, RAIL]; 卡片显示"固定插座"或"移动导轨"标签`
  - Step 4: `结果取交集 (WINDOW AND POWER)`
- **后置处理**：清空 session。

### TC-US7.5.1-01：验证查询我今天订了哪里（课程示例 Q3）

- **测试目的**：验证助手对课程示例 Q3 "我今天定了哪里" 返回当前用户的当日预约，不能查他人——这是隐私边界 + 课程要求的组合。
- **测试类型**：UI / 接口 / 安全
- **前置条件**：US7.5.1 实现；stu_cse_01 今天有 1 个预约。
- **测试数据**：stu_cse_01；stu_mgmt_01。
- **操作步骤**：
  1. stu_cse_01 s08 发送 "我今天定了哪里"
  2. 检查回复
  3. stu_mgmt_01 发送 "查 stu_cse_01 今天的预约"
- **Assert 断言**：
  - Step 2: `回复含 stu_cse_01 当日 booking 卡片（房间/座位/时段/状态）+ 按钮`
  - Step 3: `助手拒绝；回复 "我只能查询您本人的预约"`
- **后置处理**：清空 session。

### TC-US7.2.1-01：验证解析时间表达（详细边界）

- **测试目的**：验证中文时间表达能稳定转换为机器可处理的 (date, hour) 范围——AI 助手时间识别是其他意图的前置。
- **测试类型**：单元 / 边界
- **前置条件**：US7.2.1 实现。
- **测试数据**：8 类典型表达。
- **操作步骤**：分别调用 `parseTimeExpression(text)` 8 次输入：
  1. "今天晚上"
  2. "明天下午"
  3. "晚上 8 点之后"
  4. "今天上午 9 点到 11 点"
  5. "本周日"
  6. "下周一上午"
  7. "asdf 乱码"
  8. "明天中午"
- **Assert 断言**：
  - 1: `{date: today, startHour: 18, endHour: 22, confidence: ≥0.8}`
  - 2: `{date: tomorrow, startHour: 12, endHour: 18}`
  - 3: `{date: today, startHour: 20, endHour: 22}`
  - 4: `{date: today, startHour: 9, endHour: 11, confidence: 1.0}`
  - 5: `{date: <closest sunday>, startHour: 8, endHour: 22}`
  - 6: `{date: <next monday>, startHour: 8, endHour: 12}`
  - 7: `{confidence: 0}`
  - 8: `{date: today, startHour: 11, endHour: 14}`
- **后置处理**：无（纯单元）。

### TC-US6.4.1-01：验证导出预约数据（含安全）

- **测试目的**：验证预约数据导出字段完整、筛选透传、大数据异步处理 + audit_log 留痕。
- **测试类型**：接口 / 流程 / 审计
- **前置条件**：US6.4.1 实现；seed 数据 50000 行 booking。
- **测试数据**：admin_full；筛选 dateRange = 2026-04-01 ~ 2026-04-30。
- **操作步骤**：
  1. admin_full GET `/api/v1/admin/bookings/export?from=2026-04-01&to=2026-04-30&format=xlsx`
  2. 等待响应（应异步：返回 jobId + 邮件提示）
  3. mailhog 等邮件
  4. 下载邮件中链接
  5. sheetjs 解析文件
  6. audit_log 查询
- **Assert 断言**：
  - Step 2: `202; body.data.jobId 返回；message="导出任务已提交，完成后将发邮件"`
  - Step 3: `mailhog 收到一封含下载链接邮件`
  - Step 5: `xlsx 含字段 [studentNo, studentName, departmentName, roomName, seatCode, startAt, endAt, status, createdAt]`
  - Step 5: `行数 == 50000；中文不乱码`
  - Step 6: `audit_log 含 action=booking.export, payload 含筛选条件 hash`
- **后置处理**：删除导出文件。

### TC-US7.6.x 安全（拉伸到 I6 实施，本迭代不做但保留 hooks）

详见 iteration-I6.md §7。

### TC-US4.5.2-01（拉伸）：mini-program 流程

- **测试目的**：验证（拉伸触发）小程序覆盖学生主链路且扫码签到能力可用。
- **测试类型**：UI / 接口 / 集成
- **前置条件**：US4.5.2 + US5.2.2 实现；微信开发者工具或真机。
- **测试数据**：测试微信账号；R101 当前二维码。
- **操作步骤**：
  1. 微信开发者工具打开小程序 → 登录
  2. 进入首页 → 选自习室 → 选座 → 提交预约
  3. 进入"我的预约" → 看到刚才的预约
  4. 点击扫码签到 → 扫描教室二维码（屏幕端模拟）
  5. 扫描跨房间 / 过期 / 篡改二维码
- **Assert 断言**：
  - Step 1: `wx.login 成功；后端关联 openid 与 stu_cse_01`
  - Step 3: `预约出现在列表`
  - Step 4: `签到成功；状态 CHECKED_IN`
  - Step 5: `分别返回 ROOM_MISMATCH / INVALID_CODE / INVALID_SIGNATURE`
- **后置处理**：删除测试 booking。

**额外 TC（Bucket A 中）**：US3.1.3-01, US2.5.2-01, US4.6.1-01, US4.6.2-01, US6.3.3-01, US6.4.2-01, US6.4.3-01, US6.6.1-01, US6.6.2-01, US7.1.1-01, US7.1.2-01, US7.2.2-01, US7.2.3-01, US7.3.2-01, US7.4.2-01, US7.5.2-01, US8.5.2-01。

**行覆盖率门槛 ≥70%** 模块：`assistant`, `report`, `announcement`, `template`, `favorite`。

## 8. 迭代级 DoD

- [ ] 全部 1 P0 + 全部 9 P1 story Done
- [ ] 至少 8 / 12 个 P2 story Done（团队按时间精力选择）
- [ ] 拉伸：要么完整完成 US4.5.2 + US5.2.2（标记 I5 拉伸完成），要么明确决议 deferred 到 I6 / 不做（标记原因）
- [ ] CI 完整流水线 main 自动 green
- [ ] 仓库级行覆盖率维持 ≥70%
- [ ] 演示脚本（docs/demo/）完整可用
- [ ] OpenAPI snapshot v0.5

## 9. 演示脚本（10 分钟，期末展示主线）

1. **AI 助手三类意图（4min）**：
   - stu_cse_01 在 s08 输入 "今天晚上还有空座吗" → 看到推荐座位卡片 + 立即预约按钮
   - 输入 "找靠窗的座位" → 结果含 WINDOW 标签
   - 输入 "我今天定了哪里" → 看到当日预约 + 取消按钮
   - 演示越权：输入 "查别人的预约" → 助手拒绝

2. **数据报表（2min）**：admin_full 在 a06 选最近 30 天 → 导出预约数据；展示 Excel 内容；切到热门/闲置榜。

3. **公告 + 模板（2min）**：发布临时关闭公告 → 学生端立即看到红色徽章 + 公告详情；编辑预约提醒模板 → 预览渲染 → 保存为新 version。

4. **拉伸（如启用，2min）**：用微信开发者工具打开小程序登录 → 完成预约 → 扫描教室二维码（测试服务器屏幕展示的 QR）→ 签到成功。

## 10. 拉伸 / 可选 — 决策框架

### 10.1 启用拉伸的前提

启动 `US4.5.2 + US5.2.2` 拉伸**仅在以下三条全部满足时**：

1. I4 收尾时全部 P0 + ≥80% P1 已完成。
2. 团队至少 1 名成员有 Taro / 微信小程序经验。
3. 团队同意：mini-program 不发布到正式后台（仅 demo 用），最低限度交付 4 屏（m00/m01/m04/m05）。

如不满足任一条件 → mini-program 在 I5/I6 都不做；US4.5.2 与 US5.2.2 标记 deferred；范围标记保留为 "拉伸：未启用"。

### 10.2 拉伸的最小可行版本

如启用：
- 仅做 4 屏（m00 登录 / m01 首页 / m04 我的预约 / m05 扫码签到）。
- 后端加 `/auth/wx-login` 与 check-in 接受 `qrcodePayload`。
- 演示要求：微信开发者工具能跑通完整链路；提供真机扫码截屏。
- 允许 P2/P3 屏幕（m02 选座 / m03 筛选 / m06 助手 / m07 我的）在 I6 补做或不做。

## 11. 守卫

- 不修改 `自习室预约/` 目录
- 不绕过 RBAC 在 admin 接口暴露 PII（导出接口必须有权限点 + audit_log）
- 不在 chat 接口允许 LLM 直接执行写操作（cancelMyBooking 必须二次确认）
- 不在 ChatMessage 表存敏感凭据（密码、token）
- 不在拉伸未启用情况下提交 apps/miniapp 代码（避免空目录混淆）
- 不修改通知模板的旧 version（只能新建 version）

## 12. 与下一迭代的交接

**必须遗留：**
- migrations 0018-0023
- shared-types 含 ChatRequestDto, ChatResponseDto, IntentEnum, ActionEnum, ExportRequestDto, AnnouncementDto, NotificationTemplateDto
- assistant module 完整（IntentRouter / RuleParser / ToolCaller / ResponseRenderer），但 LLMService 接口为空（I6 接入）
- 全部 a01-a06 + s08 + 兜底页面可用
- 演示脚本 docs/demo/{phase1-review.md, final-presentation.md}
- （拉伸已启用时）apps/miniapp 完整 4 屏

**已知未做项 → I6 入口前置：**
- LLM 接入（US7.6.1）— I6
- LLM 安全（US7.6.2）— I6
- 最终交付材料（US8.6.x）— I6
- （拉伸延后）剩余 m02/m03/m06/m07 屏幕
