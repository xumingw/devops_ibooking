# 自习座位预约系统 — 需求管理与迭代交付设计 (Spec)

> 设计日期: 2026-04-25
> 目的: 将课程项目"自习座位预约系统"的需求拆分为可被 agent 直接执行的四级文档体系（Epic → Feature → Story → Task），配套迭代路线图、技术栈契约、测试用例规范和验收门槛。
> 状态: 待用户最终审阅 → 通过后进入 writing-plans 阶段 → 然后产出 Bucket A 修订与 Bucket B 7 份迭代 brief。

---

## 0. 前置背景

仓库根目录已经包含：

- `实践项目要求(周一班).md` — 课程原始需求 (基本业务、RBAC、智能化、DevCloud 流程)。
- `devops.md` — DevOps 实践要点（CI/CD、自动化测试、IaC、覆盖率 ≥70% 等门槛）。
- `自习座位预约系统_Story测试描述清单.md`（173 KB / 2622 行）— **已存在的需求清单**：含 8 个 Epic、~42 Feature、约 100 条 Story（写文件时按实际计数为准）、每条 story 的 P0/P1/P2 优先级 + I0–I6 迭代标签 + `关联开发任务` + 操作-Assert 测试用例 + 验收标准 + Story 依赖。
- `自习室预约/` — 设计稿目录（HTML + 6 个 JSX 文件，22 个 artboard：学生 Web s01–s10、管理 a01–a06、手机 m00–m07）。

**用户在 brainstorming 阶段确认的四项关键决策：**

1. **(C) 双轨产物**：保留 173 KB 文档作为 system of record（"Bucket A"，原地修订），新增 `docs/iterations/` 目录作为 agent 执行 brief（"Bucket B"，独立可执行）。
2. **(B) 全 TypeScript 技术栈**：NestJS + Prisma + MySQL + Redis + React + Vite + TypeScript。
3. **(3) 微信小程序为 P2 拉伸目标**：Web-only 优先，I5/I6 视进度启用。
4. **(2) AI 助手分层**：I5 规则引擎核心，I6 通过 `LLM_PROVIDER` 开关可选启用 LLM 解析；LLM 不在信任链上，永远走结构化 intent。

**记忆库 feedback（持续生效）：** 所有测试必须有详细描述，七字段（目的/类型/前置/数据/步骤/断言/后置）缺一不可。详见 `~/.claude/projects/-Users-xmw-Downloads-devops-ibooking/memory/feedback_test_descriptions.md`。

---

## 1. 文件布局（Bucket A + Bucket B）

### 1.1 Bucket A — System of Record（原地修订）

**`自习座位预约系统_Story测试描述清单.md`** 在原文件基础上做以下增量修订：

- 文件顶部新增 "0. 项目概览" 段落：
  - 技术栈白名单（含版本号），引用 §3。
  - 项目骨架目录树，引用 §3。
  - 迭代路线图概览表（I0–I6 主题 / 时长 / 出口准则），引用 §2。
  - Story 级 + 迭代级 Definition of Done 模板，引用 §5.3 / §5.4。
  - ID 规则与命名约定，引用 §5.1。
- 每条 Story 的 `关联开发任务` 由单行分号串改为多行 `- [ ]` 复选框列表，每个 task 含：负责人、预估工时、依赖任务、实施要点、验收。详见 §5.1。
- 每条 Story 新增 `关联设计稿` 字段，指向 `自习室预约/Fudan Study System.html` 中的 artboard ID。详见 §6.1。
- 拉伸 / 可选 story（微信小程序、LLM polish）增加 `范围标记: 拉伸目标` 提示。
- 既有 TC 用例已基本符合七字段格式；个别字段（特别是"测试目的"与"测试数据"）需补全到 §5.2 的最小标准。

### 1.2 Bucket B — Agent 执行 brief（新增）

新增目录 `docs/iterations/`：

```
docs/iterations/
├── README.md                      # 索引 + agent 使用方法
├── _shared/
│   ├── tech-stack.md              # 技术栈契约（§3）
│   ├── done-definition.md         # DoD（§5.3, §5.4）
│   ├── conventions.md             # 命名 / 提交 / 分支 / 测试 ID 规范
│   └── design-map.md              # artboard ↔ story 双向表（§6）
├── iteration-I0.md                # 项目治理与骨架
├── iteration-I1.md                # 账号、RBAC、资源 CRUD
├── iteration-I2.md                # 规则引擎 + 预约核心
├── iteration-I3.md                # 预约闭环 + 签到/违约 + 首次部署
├── iteration-I4.md                # 管理端运营 + 流水线集成
├── iteration-I5.md                # AI 助手（规则） + 报表 + 拉伸项
└── iteration-I6.md                # LLM polish + 最终交付
```

**两个产物之间的更新规则（必须遵守）：**

- Bucket A 是单一事实来源，由人工编辑。
- Bucket B 由 Bucket A 派生（手工或脚本），如 story 内容变更，受影响的 brief 必须同步重写。
- agent 执行迭代时，**只读 Bucket B 的 1 份 brief + `_shared/*.md`**；不允许跳到 Bucket A 找上下文。
- 任何 brief 中缺失的 story 上下文，必须由编辑者复制进 brief 而非以 "见 Bucket A" 代替。

---

## 2. 迭代路线图（I0–I6）

| ID | 主题 | 预估时长 | 主要 Epic | 故事数 (P0/P1/P2) | 退出准则 / 演示 |
|---|---|---|---|---|---|
| **I0** | 项目治理与骨架 | 1 周 | E0, E8（预热） | ~10 (10/0/0) | 前后端工程可本地启动；DevCloud 代码库托管完成；需求树录入并冻结基线；DoD 模板生效 |
| **I1** | 账号、RBAC、资源 CRUD | 2 周 | E1, E2（大半） | ~14 (12/2/0) | 学生/管理员可登录；管理员可维护自习室和座位；菜单按角色展示；构建任务在 DevCloud 自动跑单元测试 |
| **I2** | 规则引擎 + 预约核心 | 2 周 | E3, E4（前半） | ~16 (14/1/1) | 整点 4 小时规则、院系过滤、并发冲突控制全部通过单元/接口测试；学生可在 Web 上提交一个有效预约 |
| **I3** | 预约闭环 + 签到/违约 + 首次部署 | 2 周 | E4（后半）, E5（核心） | ~16 (14/2/0) | 学生从「找座→预约→签到→完成」端到端 Web 流程跑通；15 分钟自动取消 + 违约记录生效；自动部署到 DevCloud 测试环境 |
| **I4** | 管理端运营 + 流水线集成 | 2 周 | E6, E5（尾巴）, E8 | ~17 (10/7/0) | 管理仪表盘、代预约/代取消、违约管理、参数管理上线；DevCloud 流水线含构建+测试+部署+审批；接口自动化覆盖签到与自动取消主链路 |
| **I5** | AI 助手（规则） + 报表 + 拉伸项 | 2 周 | E7（规则部分）, E6.4–6.6, E4.6 | ~14 (0/9/5) | 学生端聊天框可处理空座/条件找座/我的预约三类意图；预约/违约导出报表可用；微信小程序最小可用版本（如启动了拉伸目标） |
| **I6** | LLM 增强 + 最终交付 | 1 周 | E7.6（LLM, 可选）, E8.6 | ~4 (2/0/2) | LLM 开关可一键切换；API/系统文档完整；演示视频 + 课程论文输入材料就绪；最终 Demo 能在 15 分钟内跑完 |

**对齐课程阶段：**

- **第一阶段 Review（第5周）：** 完成 I0–I2，主要架构 + 一半 P0 功能。
- **第二阶段 Review（第12–13周）：** 完成 I3–I4，DevOps 流水线在 DevCloud 上跑通 + P0 业务功能闭环。
- **期末展示：** 完成 I5–I6，智能化 + 拉伸 + 最终演示。

**两条全局约束：**

1. **依赖序：** P0 story 不能落到比其依赖 story 更早的迭代里；写 brief 时遍历 `Story 依赖` 字段，发现倒置即升迭代。
2. **拉伸目标隔离：** 微信小程序（US4.5.2、US5.2.2 替代）和 LLM polish（US7.6.x）在 brief 中独立成区块，主线 task 不依赖它们。

**故事数分布（基于 Bucket A `迭代:Ix` 标签实际抽样）：**
I0: 9 · I1: 16 · I2: 17 · I3: 19 · I4: 19 · I5: 16 · I6: 4 · 共约 100 条。最终写文件前会再核对一次并修正漂移。

---

## 3. 技术栈契约（写入 `_shared/tech-stack.md`）

### 3.1 运行时与版本（冻结）

| 类目 | 选型 | 版本 |
|---|---|---|
| Runtime | Node.js LTS | 20 |
| 包管理 | pnpm | 9 |
| 语言 | TypeScript | 5.4 |
| 后端框架 | NestJS | 10 |
| ORM | Prisma | 5 |
| 鉴权 | Passport-JWT | latest stable |
| 队列 | BullMQ | latest stable |
| 调度 | @nestjs/schedule | 4 |
| WebSocket | @nestjs/websockets + Socket.io | 10 / 4 |
| API 文档 | @nestjs/swagger → OpenAPI 3 | 7 |
| 校验 | class-validator + class-transformer | 0.14 / 0.5 |
| 邮件 | nodemailer + handlebars | latest |
| 日志 | pino | 9 |
| 前端 | React | 18.3 |
| 构建 | Vite | 5 |
| 路由 | React Router | 6 |
| 服务态 | TanStack Query | 5 |
| 客户态 | Zustand | 4 |
| 表单 | React Hook Form + Zod | 7 / 3 |
| 管理端 UI | Ant Design | 5 |
| 学生端 UI | 自建（沿用 fudan-tokens.jsx 的 F 与 PATHS） | — |
| 测试 | Jest（NestJS）+ supertest + Vitest + RTL + Playwright | latest |
| 数据库 | MySQL | 8.4 (utf8mb4) |
| 缓存/队列存储 | Redis | 7.2 |
| 容器 | Docker Engine | 26+ |
| 编排 | docker-compose | v2 |

### 3.2 选型理由（agent 不允许自由替换）

- **Prisma 优先于 TypeORM**：迁移 story 一流，TS 类型自动生成；复杂查询用 `$queryRaw` 兜底。
- **BullMQ + Redis 一体化**：处理 +15min 自动取消、+15min/+10min 提醒推送、每日二维码轮换（唯一队列基础设施，不引入 Quartz / node-schedule）。
- **Ant Design 仅在 web-admin**：表格 / 表单 / 抽屉密集，AntD 节省时间。Primary color 必须设为 `F.navy`。
- **学生端不引入 AntD**：保留 mockup 风格识别度，沿用 inline-style + design-tokens。
- **两个独立 Vite 应用**（web-student / web-admin）：bundle 小、RBAC 菜单逻辑简单、可独立部署。

### 3.3 仓库布局（pnpm workspaces，无 Turbo）

```
ibooking/
├── apps/
│   ├── api/               # NestJS
│   ├── web-student/       # React 学生 PC（响应式，覆盖移动端断点）
│   ├── web-admin/         # React 管理 PC
│   └── miniapp/           # 拉伸: Taro 4（仅在 I5+ 拉伸触发时创建）
├── packages/
│   ├── shared-types/      # DTO + Zod schema（前后端契约源头）
│   └── design-tokens/     # F + PATHS 从 fudan-tokens.jsx 移植到 TS
├── infra/
│   ├── docker-compose.yml          # 本地：api + mysql + redis + mailhog
│   ├── docker-compose.prod.yml     # CI/CD 目标
│   ├── nginx/                      # 服务静态前端
│   └── devcloud/                   # CodeArts pipeline yaml + 环境模板
├── docs/iterations/       # Bucket B
├── 自习室预约/             # 原始设计稿（agent 只读基线）
├── 自习座位预约系统_Story测试描述清单.md   # Bucket A
└── pnpm-workspace.yaml
```

### 3.4 环境变量契约

```
# DB & infra
DATABASE_URL, REDIS_URL
# Auth
JWT_SECRET, JWT_EXPIRES_IN=15m, JWT_REFRESH_EXPIRES_IN=7d
# Mail
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
# Business rules（亦由 admin UI / US6.5.1 编辑）
MAX_BOOK_HOURS=4
BOOK_GRANULARITY_MINUTES=60
REMINDER_BEFORE_MINUTES=15
LATE_REMINDER_AFTER_MINUTES=10
AUTO_CANCEL_AFTER_MINUTES=15
ROOM_DEFAULT_OPEN_HOUR=7
ROOM_DEFAULT_CLOSE_HOUR=22
# AI assistant
LLM_PROVIDER=none   # none|openai|deepseek|qwen
LLM_API_KEY=
LLM_MODEL=
# Frontend
VITE_API_BASE_URL=, VITE_WS_URL=
```

### 3.5 端口（dev）

API 3000 · web-student 5173 · web-admin 5174 · MySQL 3306 · Redis 6379 · MailHog 8025。

### 3.6 命名规范

- 数据库表：`snake_case`（user, role, permission, role_permission, user_role, room, seat, booking, violation, check_in_code, reminder_log, audit_log, system_param, ai_chat_session, ai_chat_message）。
- HTTP 路径：`/api/v1/<resource>`，REST + 复数；分页 `?page&size`；排序 `?sort=field,asc|desc`。
- DTO：`PascalCase` + 后缀 `…Dto` / `…ResponseDto`；每个 DTO 必须在 `packages/shared-types` 中有 Zod schema。
- 测试可追溯性：**每个** Jest / Vitest / Playwright 测试文件顶部必须包含 `// @story USx.x.x` `// @tc TC-USx.x.x-NN`；DevCloud 构建任务用 grep 生成 story 覆盖报告。
- 提交：Conventional Commits + story id 前缀，例 `feat(US3.4.1): add seat-time uniqueness constraint`。
- 分支：`feat/<story-id>-<slug>`，PR 至少一人 review。

---

## 4. 迭代 brief 12 段式 Schema

每份 `docs/iterations/iteration-Ix.md` 严格按以下 12 段编写。**核心原则：brief 必须自包含。**

```
# Iteration I<x> — <主题>

## 0. 元信息
- 时长 / 起止 (placeholder) / 入口前置 / 出口准则
- 必读共享文档: tech-stack.md · done-definition.md · conventions.md · design-map.md
- 设计稿入口: 自习室预约/Fudan Study System.html
- 数据契约位置: packages/shared-types

## 1. 迭代目标（一句话）
"本迭代结束时学生应能 X、管理员应能 Y、流水线应能 Z。"

## 2. Story 范围
| Story ID | P | 标题 | Bucket A 行号 | 关联设计稿 ID | 状态 |
按依赖拓扑排序。

## 3. 关联设计稿（artboard → story 反查）
| Artboard ID | 名称 | 用于 Story |

## 4. Tasks（按执行顺序，扁平化）
本迭代所有 story 的 task 摊平为有序 checklist。每个 task：
- [ ] **USx.x.x-T0N** <task 标题>
  - 预估工时 / 依赖任务 / 实施要点 / 验收

## 5. 实现要点（针对本迭代 3–5 个最易翻车 story）
针对关键 story 给出决策、伪代码、选型说明。例：
"I2 F3.4 冲突控制：MySQL (seat_id, slot_start) 唯一索引 + 事务隔离 + Redis 短锁兜底；
不允许使用乐观锁版本字段（粒度太粗，slot 级冲突难表达）。"

## 6. 数据/接口契约变更
- Prisma migrations 文件名清单
- 新增 / 改动的 REST 端点（method · path · 请求体 · 响应体）
- shared-types 新增 DTO / Zod schema

## 7. 测试要求（详见 §5.2 七字段约束 — 必须完整复制 TC 描述进 brief）
- 每条 P0 story 至少 1 单元 + 1 接口测试
- 必须新增的 TC- ID 清单（来自 Bucket A，agent 不重新设计用例，只实现）
- 行覆盖率门槛 ≥70%（line coverage，由 jest --coverage / vitest run --coverage 报告）
- 流水线必须 green 的 e2e 子集

## 8. 迭代级 DoD（§5.4）

## 9. 演示脚本
"1. 主持人在 web-admin 上 X，2. 切到 web-student 输入 Y，3. 看到 Z..."
含截屏点 + 测试账号。

## 10. 拉伸 / 可选
默认不做。

## 11. 守卫（Do-not-touch）
- 不修改 自习室预约/ 目录
- 不在 packages/shared-types 之外重复定义 DTO
- 不改 .env 模板字段名（可加新字段）
- 不引入 §3 技术栈白名单之外的运行时依赖
- 不允许引入 §3 设计稿之外的视觉风格

## 12. 与下一迭代的交接
- 必须遗留产物：migration 文件、OpenAPI snapshot、流水线 yaml
- 已知未做项 → 显式标记到 I(x+1) §0 入口前置
```

**预估 brief 长度：** I0/I6 ~250–350 行，I1/I5 ~450–550 行，I2/I3/I4 ~600–750 行。

---

## 5. Task 扩展模型 + 测试用例描述契约 + DoD

### 5.1 Task 扩展（Bucket A）

**当前形态（待重构）：**

```
- 关联开发任务：US0.2.1-T01 创建后端工程; US0.2.1-T02 创建前端骨架; ...
```

**重构后形态：**

```markdown
- 关联开发任务（共 4 项）：
  - [ ] **US0.2.1-T01** 创建后端工程
    - 负责人: TBD
    - 预估工时: 4h
    - 依赖任务: 无
    - 实施要点: apps/api 用 NestJS 10 init；引入 Prisma 5、ConfigModule；暴露 GET /api/v1/health
    - 验收: 本地 `pnpm --filter api dev` 启动成功；/health 返回 200 且 body.status=UP
```

**ID 规则（冻结）：**

- Epic: `E<n>` · Feature: `F<n.m>` · Story: `US<n.m.k>` · Task: `US<n.m.k>-T<NN>` · Test case: `TC-US<n.m.k>-<NN>`
- Task 计数器 `NN` 两位零填充（T01–T99），故事内不重复且永不复用已释放 ID。
- 新增 task = 计数器递增；删除 task = 标 deprecated，不复用 ID。

### 5.2 测试用例描述契约（不可妥协）

每条测试用例（Bucket A 的 TC- 条目、迭代 brief §7、真实代码里的 Jest/Vitest/Playwright 测试）必须含七字段，缺一不可。**禁止 "见 Bucket A" 之类的指针；重复成本可接受，缺描述不可接受。**

**强制 schema：**

```markdown
- [ ] **TC-US3.4.1-01：验证同一座位同一整点不能被两个学生同时预约**
  - **测试目的**：验证 (seat_id, slot_start) 唯一约束在并发提交下生效，防止超卖。
  - **测试类型**：接口自动化 / 并发 / 负向
  - **前置条件**：US3.4.1 实现完成；座位 A001 在 2026-05-01 19:00 时段无预约；学生账号 stu_cse_01 与 stu_mgmt_01 均处于可用状态。
  - **测试数据**：
    - 座位 = A001（房间 R101，全校开放，07:00–22:00）
    - 时段 = 2026-05-01 19:00–20:00
    - 并发学生 = stu_cse_01, stu_mgmt_01
  - **操作步骤**：
    1. 用 stu_cse_01 token 调用 POST /api/v1/bookings，body={seatId:"A001", startAt:"2026-05-01T19:00:00+08:00", endAt:"2026-05-01T20:00:00+08:00"}。
    2. 在第 1 步响应返回前 50ms 内，用 stu_mgmt_01 token 并发调用同一接口、同样的座位与时段。
    3. 等待两个响应。
    4. 查询数据库 booking 表中该座位该时段的记录数。
  - **Assert 断言**：
    - Step 1: `assert response_1.status == 201`
    - Step 2: `assert response_2.status == 409 && response_2.body.code == "BOOKING_SLOT_TAKEN"`
    - Step 3: `assert (response_1, response_2) 中恰好一个 201、一个 409`
    - Step 4: `assert db.booking.count(seat="A001", slot_start="2026-05-01T19:00") == 1`
  - **后置处理**：删除测试期间创建的 booking 记录；释放座位；不影响其他用例。
```

**反模式（自动 reject）：**

- "测试目的：验证冲突。" → 太宽泛，必须说清楚 *谁* 在 *什么场景* 下会冲突、防什么后果。
- "测试数据：随便一个学生。" → 必须给具体账号 ID（与 Bucket A §0.1 公共测试账号对齐）。
- 把 assert 写成 "结果正确" → 必须给具体表达式或预期值。
- 在 brief 里只写 `TC-US3.4.1-01` 让 agent 翻 Bucket A → 必须把完整描述复制进 brief。

**正向 / 负向覆盖要求：**

- 每条 P0 story 至少 1 条正向用例 + 1 条负向 / 边界用例。
- 边界用例必须穷举到具体值（4 小时上限 → 4h 应通过、4h+1min 应拒绝）。
- 并发用例（如 F3.4）必须显式声明并发模型（fixed-time race 或 多请求 stress）。

### 5.3 Story 级 DoD

每条 story 关闭前必须 tick：

- [ ] 所有 task checkbox 全部勾掉
- [ ] 所有 TC 用例都有具体实现（手工或自动）且全部 pass
- [ ] 至少 1 条用例自动化（P0 必须自动化，P1 推荐自动化）
- [ ] 单元测试行覆盖率 ≥70%（对应模块）
- [ ] PR 合入 main 时 commit 含 `feat(USx.x.x):` 前缀
- [ ] 设计稿对照走查通过（关联 artboard 视觉/交互一致）
- [ ] OpenAPI / DB schema 变更已同步到 packages/shared-types
- [ ] 没有引入 §3 白名单之外的依赖
- [ ] CHANGELOG.md 追加一行（按 story id）

### 5.4 迭代级 DoD

- [ ] 全部 P0 story 已 Done（Story 级 DoD 全绿）
- [ ] 流水线：lint / unit / api / build / deploy 五关在 main 自动执行并 green
- [ ] 仓库级测试行覆盖率 ≥70%
- [ ] 演示脚本（brief §9）在干净环境上能完整跑过 1 遍
- [ ] DB schema 在下一迭代不需要破坏性变更（如有，必须列入 §12 交接说明）
- [ ] 已为下迭代准备的产物归档完毕（migration 文件、OpenAPI snapshot、CodeArts pipeline yaml）

---

## 6. 设计稿 ↔ Story 映射（写入 `_shared/design-map.md`）

### 6.1 Artboard → Stories（正向）

**学生 Web 端 (s01–s10):**

| Artboard | 画板名 | 主要驱动 Story | 次要 / 共用 |
|---|---|---|---|
| s01 | 登录页 | US1.1.1 学生登录 | US1.1.2 管理员登录, US1.1.3 会话退出 |
| s02 | 首页概览 | US4.1.1 可用自习室列表, US4.1.2 下一场预约 | — |
| s03 | 自习室列表 | US4.1.1, US4.2.1, US4.2.2 | US3.3.2 院系限制过滤（视觉提示）|
| s04 | 选座预约 | US4.2.3 座位状态图, US4.3.1 座位详情 | US3.3.1, US3.3.3, US2.3.1/2 属性图标 |
| s05 | 预约确认 | US4.3.2 提交预约, US4.3.3 成功反馈 | US3.4.3 提交前二次校验, US3.5.1 状态机 |
| s06 | 我的预约 | US4.4.1, US4.4.2, US4.4.3, US4.4.4 | US5.5.1 使用中状态展示 |
| s07 | 签到页 | US5.2.1 Web 编码签到, US5.2.3 时间窗校验 | US5.5.2 提前结束 |
| s08 | 智能助手 | US7.1.1, US7.3.1, US7.4.1, US7.4.2, US7.5.1, US7.5.2 | US7.2.x 实体解析, US7.6.1 LLM 开关 |
| s09 | 通知中心 | US5.3.1, US5.3.2, US5.3.3, US5.4.3 | US6.6.1 系统公告 |
| s10 | 违约记录 | US6.3.2 学生查看个人违约 | US6.3.3 备注/申诉 |

**管理 Web 端 (a01–a06):**

| Artboard | 画板名 | 主要驱动 Story | 次要 / 共用 |
|---|---|---|---|
| a01 | 管理仪表盘 | US6.1.1, US6.1.2 | US6.4.3 热门/闲置（轻量预览）|
| a02 | 自习室管理 | US2.1.1, US2.1.2, US2.1.3 | US3.1.1/2, US2.4.2 |
| a03 | 平面图编辑器 | US2.2.1, US2.2.2, US2.2.3, US2.3.1, US2.3.2, US2.4.1 | US2.5.1 批量导入 |
| a04 | 预约记录 | US6.2.1, US6.2.2, US6.2.3, US6.3.1 | US1.5.1 高风险操作日志 |
| a05 | 角色权限管理 | US1.3.1, US1.3.2, US1.3.3, US1.4.1 | US1.4.2 接口鉴权（功能验证页）|
| a06 | 数据报表 | US6.4.1, US6.4.2, US6.4.3 | US2.5.2 资源清单导出 |

**手机端 (m00–m07) — 全部 `范围:拉伸`，仅 I5/I6 stretch 触发时启用：**

| Artboard | 画板名 | 主要驱动 Story |
|---|---|---|
| m00 | 登录页 | US1.1.1（小程序变体）|
| m01 | 首页 | US4.1.1（小程序变体）|
| m02 | 选座页 | US4.2.3（小程序变体）|
| m03 | 快速筛选 | US4.2.2（小程序变体）|
| m04 | 我的预约 | US4.4.1, US4.4.2（小程序变体）|
| m05 | 扫码签到 | **US5.2.2 小程序扫码签到**（mini-program 核心价值）|
| m06 | 智能助手 | US7.1.1（小程序变体）|
| m07 | 我的页面 | US1.2.1 学生资料维护, US6.3.2 个人违约入口 |

### 6.2 无 Artboard 的 Story（需补 wireframe 或套模板）

- E0 全部（项目治理）— 不需要 UI。
- US1.1.3 会话刷新 — 后端逻辑为主（在 s01 token 失效弹窗里体现）。
- US1.2.1 学生资料维护 — 仅 m07 出现，Web 端缺；**需要补低保真 wireframe**。
- US1.2.2 用户状态管理 — 管理端无对应画板；放进 a05 的 "用户列表" tab。
- US1.4.2 后端接口权限校验 — 后端逻辑，无 UI。
- US1.5.1 高风险操作日志 — 管理端无对应画板；新建 "审计日志" 页（沿用 a04 风格）。
- US2.5.1 / US2.5.2 批量导入/导出 — 沿用 a02/a03 上的导入按钮 + 标准 AntD upload 抽屉。
- US3.1.1/2/3, US3.2.1/2/3 系统参数与开放时间 — 由 US6.5.1 参数管理页承载（**需要补 wireframe**）。
- US3.3.x, US3.4.x, US3.5.x 规则引擎 — 全后端，无 UI。
- US5.1.1 / US5.1.2 / US5.1.3 教室动态编码与屏幕展示 — 教室大屏画板缺；**需要补 wireframe**（1080p 全屏二维码 + 数字编码页）。
- US5.4.1 / US5.4.2 自动取消与违约记录后端 — 后端逻辑（结果在 s10、a04 体现）。
- US6.5.x 系统参数管理 — **需要补 wireframe**（管理端）。
- US6.6.x 公告与通知模板 — **需要补 wireframe**（管理端）。
- US7.2.x 实体解析 — 后端逻辑（s08 中体现解析后回复气泡）。
- US7.6.x LLM 接入 — 仅一个开关，由 a06 风格的 "AI 配置" 页承载（**补 wireframe**）。
- E8 全部 — 不需要 UI。

### 6.3 兜底约定

无 mockup 的 story 在被排进 brief §3 时，必须先满足以下任一：

1. **使用 default-style 模板**：管理端默认套 a04（预约记录）的列表 + 抽屉表单结构；学生端默认套 s06（我的预约）的卡片列表结构。
2. **brief §5 实现要点里画 ASCII wireframe**：低保真 7 行内字段排布（标题/工具栏/表格列/筛选/操作）。
3. **新建 artboard**：如 story 视觉新颖（如教室大屏 US5.1.3），先在 `自习室预约/` 下加新 .jsx 文件 + HTML 挂上画板，再开始实现。**这是改设计稿的唯一合法理由。**

### 6.4 守卫强化

- 每条迭代 brief §11 守卫块必含："不允许引入 §3 设计稿之外的视觉风格。所有非 wireframe 落地必须复用 packages/design-tokens 的 F 颜色与 PATHS 图标。"
- web-admin 因为用 AntD 5，允许 AntD 默认主题但 primary color 必须设为 `F.navy`。

---

## 7. 交付清单（spec 通过后将产出的工件）

按以下顺序生产：

1. **Bucket A 修订**（`自习座位预约系统_Story测试描述清单.md`）
   - 顶部新增 "0. 项目概览" 段。
   - 全部约 100 条 story（实际计数以文件为准）的 `关联开发任务` 由单行扩展为 `- [ ]` 列表，每个 task 五字段。
   - 全部 story 增加 `关联设计稿` 字段。
   - 拉伸 story 增加 `范围标记` 提示。
   - 既有 TC 用例补全到七字段。
2. **Bucket B 共享文档**（`docs/iterations/_shared/`）
   - `tech-stack.md`：§3 全文。
   - `done-definition.md`：§5.3 + §5.4。
   - `conventions.md`：§3.6 + 提交 / 分支 / 测试 ID 规范。
   - `design-map.md`：§6 全文。
3. **Bucket B 7 份迭代 brief**（`docs/iterations/iteration-I0.md` … `iteration-I6.md`）
   - 严格按 §4 的 12 段 schema 写。
   - 每份 brief 中 §7 测试要求段必须把当迭代要新增的 TC 完整七字段复制进来，禁止只写 ID。
4. **Bucket B 索引**（`docs/iterations/README.md`）
   - 列出 7 份 brief、`_shared/*.md` 阅读顺序、agent 接入指引。

---

## 8. 验收（spec 自身）

本 spec 通过的判据：

- [ ] 用户审阅 spec 文件本身并明确 OK。
- [ ] 用户对 §2 迭代时长与课程阶段对齐无异议（或给出修正）。
- [ ] 用户对 §3 技术栈版本号无异议（或给出修正）。
- [ ] 用户对 §5.2 测试七字段契约无异议（这是 hard rule）。

通过后立即调用 `superpowers:writing-plans` 把 §7 交付清单转化为可执行实施计划。
