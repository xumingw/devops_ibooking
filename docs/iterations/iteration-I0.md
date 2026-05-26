# Iteration I0 — 项目治理与骨架

## 0. 元信息

- **时长**：1 周（建议；按团队节奏调整）
- **起止**：YYYY-MM-DD ~ YYYY-MM-DD（团队填写）
- **入口前置**：无（项目第一阶段）
- **出口准则**：见 §8 迭代级 DoD
- **必读共享文档**：
  - `docs/iterations/_shared/tech-stack.md` — 技术栈与目录布局基线
  - `docs/iterations/_shared/conventions.md` — 命名 / 提交 / 分支规范
  - `docs/iterations/_shared/done-definition.md` — DoD + 测试七字段契约
  - `docs/iterations/_shared/design-map.md` — 关联设计稿映射（I0 不涉及 UI）
- **设计稿入口**：`自习室预约/Fudan Study System.html`（I0 不涉及实现）
- **数据契约位置**：`packages/shared-types/`
- **本迭代 source-of-truth story 详情**：`自习座位预约系统_Story测试描述清单.md` Epic E0 与 E8 部分

## 1. 迭代目标

**本迭代结束时团队应能在本地一键启动前后端工程、在 GitHub 完成代码托管，并冻结需求基线与 DoD 模板。**

## 2. Story 范围

按依赖拓扑排序：

| Story ID | P | 标题 | 关联设计稿 ID |
|---|---|---|---|
| US0.1.1 | P0 | 建立四层级需求树 | 无 |
| US0.1.2 | P0 | 建立迭代计划和完成定义 | 无 |
| US0.4.1 | P0 | 建立代码仓库与分支策略 | 无 |
| US0.4.2 | P0 | 建立团队任务分配机制 | 无 |
| US0.2.1 | P0 | 搭建前后端工程骨架 | 无 |
| US0.2.2 | P0 | 建立数据库迁移机制 | 无 |
| US0.3.1 | P0 | 定义核心领域模型 | 无 |
| US0.3.2 | P0 | 定义接口与错误码规范 | 无 |
| US8.1.2 | P0 | 建立验收标准模板 | 无 |
| US8.4.1 | P0 | GitHub 代码托管 | 无 |

**故事数：10（10 P0 / 0 P1 / 0 P2）**

## 3. 关联设计稿（artboard → story 反查）

I0 全部 story 都不涉及 UI 实现（项目治理与基础架构）。**不允许在本迭代修改 `自习室预约/` 目录。**

## 4. Tasks（按执行顺序，扁平化）

### Block A — 需求与团队治理（US0.1.1 / US0.1.2 / US0.4.1 / US0.4.2 / US8.1.2）

- [ ] **US0.1.1-T01** 定义 Epic、Feature、Story、Task 编号规则
  - 预估工时：2h
  - 依赖任务：无
  - 实施要点：参照 `docs/iterations/_shared/conventions.md` §2 ID 规则；本仓库已采用，无需修改。
  - 验收：`conventions.md` §2 内容完整，含 5 种 ID 命名规则与示例。

- [ ] **US0.1.1-T02** 录入课程要求中的基础业务、RBAC、智能化、DevOps 要求
  - 预估工时：4h
  - 依赖任务：US0.1.1-T01
  - 实施要点：本仓库 Bucket A 已覆盖；做检查：`实践项目要求(周一班).md` 四大块条款逐一对照 Epic E0–E8。
  - 验收：核对清单存在；零未命中条款。

- [ ] **US0.1.1-T03** 建立需求变更记录和版本号规则
  - 预估工时：1h
  - 依赖任务：US0.1.1-T02
  - 实施要点：根 `CHANGELOG.md` 创建；后续 commit 用 `chore(spec):` 前缀。
  - 验收：`CHANGELOG.md` 文件存在含 v0.1 基线条目。

- [ ] **US0.1.2-T01** 划分 I0-I6 迭代里程碑
  - 预估工时：2h
  - 依赖任务：US0.1.1-T01
  - 实施要点：本文件目录结构（`docs/iterations/iteration-I0.md` ... `iteration-I6.md`）已是路线图。
  - 验收：7 个 brief 文件存在；Bucket A 全部 story 均带 `迭代:Ix` 标签。

- [ ] **US0.1.2-T02** 为每个 Story 标记 P0/P1/P2 优先级
  - 预估工时：1h
  - 依赖任务：US0.1.2-T01
  - 实施要点：Bucket A 已完成。
  - 验收：grep `优先级:P[012]` 结果数 == 118。

- [ ] **US0.1.2-T03** 定义代码完成、测试完成、演示完成的 DoD
  - 预估工时：1h
  - 依赖任务：US0.1.2-T01
  - 实施要点：见 `docs/iterations/_shared/done-definition.md`。
  - 验收：`done-definition.md` 含 Story 级 + 迭代级 + 测试七字段三段。

- [ ] **US0.4.1-T01** 创建代码仓库和目录结构
  - 预估工时：3h
  - 依赖任务：US0.1.2-T01
  - 实施要点：在本地 `ibooking/` 按 `tech-stack.md` §3 创建空目录树；初始化 `pnpm-workspace.yaml`。
  - 验收：目录结构与 `tech-stack.md` §3 完全一致。

- [ ] **US0.4.1-T02** 定义 main/develop/feature 分支策略
  - 预估工时：1h
  - 依赖任务：US0.4.1-T01
  - 实施要点：`git init`；建立 `main` + `dev` 分支；分支策略写入 `conventions.md` §3.2（已含）。
  - 验收：仓库存在两条分支。

- [ ] **US0.4.1-T03** 定义提交信息和 PR 模板
  - 预估工时：2h
  - 依赖任务：US0.4.1-T02
  - 实施要点：`.github/PULL_REQUEST_TEMPLATE.md` 含「关联 Story」「测试结果」「影响范围」；commitlint 配置 conventional commits。
  - 验收：PR 模板文件存在；commitlint 配置生效。

- [ ] **US0.4.1-T04** 配置基础代码扫描或格式检查
  - 预估工时：3h
  - 依赖任务：US0.4.1-T01
  - 实施要点：根目录 ESLint + Prettier 配置；husky + lint-staged 提交前自动格式化；CI 失败阻塞合并（在 US8.4.2 接入）。
  - 验收：`pnpm lint` 命令存在且能跑。

- [ ] **US0.4.2-T01** 在 GitHub Projects 看板创建需求条目
  - 预估工时：4h
  - 依赖任务：US0.1.1-T02
  - 实施要点：登录 GitHub → 在仓库或组织下创建 GitHub Projects 项目 "ibooking" → 导入 Bucket A 全部 Epic/Feature/Story（可手工或脚本）。
  - 验收：GitHub Projects 看板显示 ≥118 条 Story 条目。

- [ ] **US0.4.2-T02** 为 Story 分配负责人和计划迭代
  - 预估工时：2h
  - 依赖任务：US0.4.2-T01
  - 实施要点：每条 P0 Story 设 `负责人: <name>`；同步回 Bucket A 替换 `负责人: TBD`。
  - 验收：Bucket A 中 P0 Story 的 `负责人:` 字段不再为 `TBD`。

- [ ] **US0.4.2-T03** 建立每日同步和风险记录模板
  - 预估工时：1h
  - 依赖任务：US0.4.2-T01
  - 实施要点：`docs/team/standup-template.md` + `docs/team/risk-log.md`。
  - 验收：两文件存在。

- [ ] **US8.1.2-T01** 编写验收标准模板
  - 预估工时：1h
  - 依赖任务：US0.1.1-T01
  - 实施要点：本仓库 Bucket A 模板已覆盖（用户故事/Story 依赖/验收标准/关联设计稿/关联开发任务/TC-）。
  - 验收：模板已应用到 118 story。

- [ ] **US8.1.2-T02** 把模板应用到本需求清单中的 P0/P1 Story
  - 预估工时：已完成
  - 依赖任务：US8.1.2-T01
  - 实施要点：本次 spec 修订已完成。
  - 验收：grep 验证 `关联设计稿：` 与 `测试目的：` 计数 == 118 / ≥118。

- [ ] **US8.1.2-T03** Review 时检查无验收口径的 Story
  - 预估工时：1h
  - 依赖任务：US8.1.2-T02
  - 实施要点：Review 前自动 grep 校验空 `验收标准：` / 缺 TC 的 story；CI 任务集成此校验。
  - 验收：CI 含此校验且 green。

### Block B — 工程骨架（US0.2.1 / US0.2.2 / US0.3.1 / US0.3.2）

- [ ] **US0.2.1-T01** 创建后端工程
  - 预估工时：4h
  - 依赖任务：US0.4.1-T01
  - 实施要点：`pnpm dlx @nestjs/cli new api --skip-git --package-manager pnpm`；引入 `@nestjs/config`、`@nestjs/swagger`；暴露 `GET /api/v1/health` 返回 `{status, db, redis, ts}`。
  - 验收：`pnpm --filter api dev` 启动成功，curl `localhost:3000/api/v1/health` 返 200。

- [ ] **US0.2.1-T02** 创建统一 Web 入口前端骨架
  - 预估工时：4h
  - 依赖任务：US0.4.1-T01
  - 实施要点：`apps/web-admin` 作为统一 Web 入口，登录后按角色分流到学生首页或管理后台；`apps/web-student` 暂保留为历史骨架和后续学生页面迁移来源。
  - 验收：`pnpm --filter web-admin dev` 跑在 5174，统一登录页可渲染。

- [ ] **US0.2.1-T03** 配置环境变量、开发/测试/生产配置文件
  - 预估工时：2h
  - 依赖任务：US0.2.1-T01
  - 实施要点：按 `tech-stack.md` §4 落 `.env.example`；三套 NODE_ENV (development/test/production)。
  - 验收：`.env.example` 字段与 `tech-stack.md` §4 完全一致。

- [ ] **US0.2.1-T04** 编写本地启动说明
  - 预估工时：1h
  - 依赖任务：US0.2.1-T03
  - 实施要点：根 `README.md` 含「本地启动」段：`docker-compose up -d` → `pnpm install` → `pnpm db:migrate:dev` → `pnpm dev`。
  - 验收：陌生开发者按文档可启动。

- [ ] **US0.2.2-T01** 选型并接入数据库迁移工具
  - 预估工时：2h
  - 依赖任务：US0.2.1-T01
  - 实施要点：`pnpm add -D prisma`；`pnpm add @prisma/client`；`apps/api/prisma/schema.prisma` 占位 User 模型。
  - 验收：`pnpm prisma generate` 成功。

- [ ] **US0.2.2-T02** 创建初始化迁移目录和命名规范
  - 预估工时：1h
  - 依赖任务：US0.2.2-T01
  - 实施要点：`apps/api/prisma/migrations/` 由 `pnpm prisma migrate dev` 自动生成；命名 `<timestamp>_<slug>`。
  - 验收：第一个 migration `0001_init` 生成。

- [ ] **US0.2.2-T03** 准备开发环境数据库连接配置
  - 预估工时：2h
  - 依赖任务：US0.2.2-T01
  - 实施要点：`infra/docker-compose.yml` 含 mysql:8.4-debian + redis:7.2-alpine + mailhog:latest；`DATABASE_URL=mysql://root:root@localhost:3306/ibooking`。
  - 验收：`docker-compose up -d` 后 mysql/redis/mailhog 健康。

- [ ] **US0.2.2-T04** 编写迁移执行说明
  - 预估工时：1h
  - 依赖任务：US0.2.2-T03
  - 实施要点：根 README "数据库迁移" 段：`pnpm --filter api db:migrate:dev`。
  - 验收：文档存在且命令可执行。

- [ ] **US0.3.1-T01** 设计用户、院系、角色、权限表
  - 预估工时：3h
  - 依赖任务：US0.2.2-T02
  - 实施要点：Prisma model User, Department, Role, Permission, RolePermission, UserRole；外键 + 索引 + UNIQUE 约束。
  - 验收：`pnpm prisma migrate dev` 成功创建 6 表。

- [ ] **US0.3.1-T02** 设计自习室、座位、座位属性、开放时间表
  - 预估工时：3h
  - 依赖任务：US0.3.1-T01
  - 实施要点：model Room (id, name UNIQUE, building, floor, capacity, departmentId nullable, scopeType: SCHOOL|DEPARTMENT, openHour, closeHour, overnight, status), Seat (id, roomId, code, x, y, attributes JSON, status), RoomSchedule (特殊日期规则)。**不单独建 OpenHour 表（用 Room 字段 + system_param 全局默认）。**
  - 验收：表 + 唯一约束 + 外键完整。

- [ ] **US0.3.1-T03** 设计预约、签到、通知、违约、审计日志表
  - 预估工时：3h
  - 依赖任务：US0.3.1-T01
  - 实施要点：model Booking (id, userId, seatId, roomId, startAt, endAt, status, createdAt) + BookingSlot (bookingId, seatId, slotStart UNIQUE INDEX (seatId, slotStart)) + Violation (id, userId, bookingId UNIQUE, roomId, seatId, reason, occurredAt) + CheckInCode (roomId, code, validAt, expiresAt) + ReminderLog + AuditLog + SystemParam。
  - 验收：表 + UNIQUE INDEX (seatId, slotStart) 在 booking_slot 表生效。

- [ ] **US0.3.1-T04** 输出 ER 图或数据字典
  - 预估工时：2h
  - 依赖任务：US0.3.1-T03
  - 实施要点：用 `prisma-erd-generator` 自动生成 docs/architecture/erd.png；附数据字典说明 docs/architecture/data-dict.md。
  - 验收：两文件存在。

- [ ] **US0.3.2-T01** 定义统一响应体、分页参数和排序参数
  - 预估工时：2h
  - 依赖任务：US0.2.1-T01
  - 实施要点：NestJS GlobalInterceptor 包成 `{ code, message, data, requestId, timestamp }`；分页 `{ items, total, page, size }`；放 `apps/api/src/common/`。
  - 验收：单元测试覆盖 interceptor 各分支。

- [ ] **US0.3.2-T02** 定义业务错误码：冲突、无权限、超时、资源不可用
  - 预估工时：2h
  - 依赖任务：US0.3.2-T01
  - 实施要点：`packages/shared-types/src/error-codes.ts` enum 含 BOOKING_SLOT_TAKEN, USER_TIME_CONFLICT, BOOKING_DURATION_EXCEEDED, BOOKING_NOT_WHOLE_HOUR, CHECK_IN_OUT_OF_WINDOW, INVALID_CODE, ROOM_MISMATCH, NOT_OWNER, RBAC_FORBIDDEN, DEPARTMENT_LIMIT, SEAT_UNAVAILABLE, ROOM_NAME_DUPLICATE, SEAT_CODE_DUPLICATE, PARAM_OUT_OF_RANGE, PARAM_INVALID_RELATION 等。
  - 验收：错误码 enum 完整。

- [ ] **US0.3.2-T03** 整理接口路径命名规范和版本策略
  - 预估工时：1h
  - 依赖任务：US0.3.2-T01
  - 实施要点：`/api/v1/<resource>` REST 复数；版本前缀强制；写到 `conventions.md` §1。
  - 验收：所有 controller 加 `@Controller('api/v1/<resource>')`。

- [ ] **US0.3.2-T04** 生成或维护接口文档模板
  - 预估工时：2h
  - 依赖任务：US0.3.2-T01
  - 实施要点：`@nestjs/swagger` 自动从 controller 装饰器生成 OpenAPI 3 yaml；CI 任务导出 `docs/api/openapi.yaml`。
  - 验收：CI 中 swagger export 任务 green，产物 commit。

### Block C — GitHub 启用（US8.4.1）

- [ ] **US8.4.1-T01** 注册并创建 GitHub Projects 项目
  - 预估工时：1h
  - 依赖任务：无
  - 实施要点：组长在 GitHub 仓库或组织下创建 Projects 项目 "ibooking"；将团队成员加入仓库并赋予 Write/Maintain 权限。
  - 验收：所有团队成员可登录看到项目。

- [ ] **US8.4.1-T02** 创建代码仓库并邀请成员
  - 预估工时：1h
  - 依赖任务：US8.4.1-T01, US0.4.1-T02
  - 实施要点：GitHub Repository 新建 `ibooking` 仓库；推送本地 monorepo；邀请成员；保护 main 分支。
  - 验收：所有成员可 clone 与 push 到 dev/feature 分支。

- [ ] **US8.4.1-T03** 配置分支保护或合并规范
  - 预估工时：1h
  - 依赖任务：US8.4.1-T02
  - 实施要点：main 分支保护：不允许直推；PR 至少 1 reviewer + CI 全绿才能合并；webhook 触发 build。
  - 验收：尝试直推 main 被拒；PR 流程能通过。

## 5. 实现要点（针对 3 个最易翻车 story）

### 5.1 US0.2.1 前后端工程骨架

**关键决策：**
- pnpm workspaces 而非 npm/yarn — 依赖共享 + 速度。
- NestJS init: `pnpm dlx @nestjs/cli new api --skip-git --package-manager pnpm` —— `--skip-git` 因为我们已有外层 git。
- 两个 web app 独立 Vite，**不**用 monorepo SPA：第一是因为 RBAC 边界清晰（学生 / 管理员），第二是部署灵活，第三是 bundle 不互相污染。
- 共享 `packages/design-tokens`：从 `自习室预约/fudan-tokens.jsx` 提取 F 对象与 PATHS 到 TS，导出 named exports；学生端必须用，管理端可用。

### 5.2 US0.2.2 数据库迁移

**关键决策：**
- Prisma Migrate 优先于手写 SQL：迁移文件由 schema 自动生成，避免人为错误。
- `apps/api/prisma/schema.prisma` 在 I0 仅含 User 占位（避免在 I0 把 12+ 表都设计完，否则 I1-I3 难以增量调整）。
- `apps/api/prisma/migrations/` 必须 commit；CI / 部署不会 `prisma migrate dev` 而用 `prisma migrate deploy`。
- DB 名 `ibooking`，charset utf8mb4 / utf8mb4_unicode_ci。

### 5.3 US8.4.1 GitHub 代码托管

**关键决策：**
- 在 GitHub Repository 创建后立即推 main + dev 两条分支；main 直接保护。
- 分支保护策略：main 仅允许 PR 合入；PR 需 ≥ 1 reviewer + CI green。
- webhook 触发：push 到 dev / 任何 PR → 触发 CI build（在 I1 接入）。
- 成员权限：普通成员默认 Write；组长或维护者使用 Maintain/Admin。

## 6. 数据/接口契约变更

- **Prisma migrations**：
  - `0001_init`: User 占位表
  - `0002_full_schema`: 全部核心表（User/Department/Role/Permission/RolePermission/UserRole/Room/Seat/RoomSchedule/Booking/BookingSlot/Violation/CheckInCode/ReminderLog/AuditLog/SystemParam）
- **新增端点**：`GET /api/v1/health` 返回 `{status: "UP", db: "UP"|"DOWN", redis: "UP"|"DOWN", timestamp}`。
- **shared-types**：定义全部 entity 接口与 Zod schema（占位，I1+ 填充字段约束）。

## 7. 测试要求（每条 TC 必须带七字段；本节 TC 描述完整复制自 Bucket A，agent 直接实现，不重新设计用例）

### TC-US0.2.1-01：验证搭建前后端工程骨架

- **测试目的**：验证团队任意成员从零拉取代码后，通过文档说明的命令即可在本地启动前后端工程并通过健康检查 —— 这是后续所有迭代的开发前提。
- **测试类型**：流程验收 / 文档检查 / 流水线检查
- **前置条件**：已完成并通过依赖 Story：US0.1.2；本地安装 Node.js 20、pnpm 9、Docker Desktop。
- **测试数据**：仓库 SHA = HEAD；本地启动命令清单。
- **操作步骤**：
  1. 在干净目录 clone 仓库。
  2. 执行 `pnpm install`。
  3. 执行 `docker-compose -f infra/docker-compose.yml up -d`。
  4. 执行 `pnpm --filter api db:migrate:dev`。
  5. 执行 `pnpm dev`（启动 API 与统一 Web 入口）。
  6. 浏览器访问 http://localhost:5174。
  7. curl http://localhost:3000/api/v1/health。
- **Assert 断言**：
  - Step 5: `assert API 与统一 Web 入口均启动成功且无致命报错`
  - Step 6: `assert http_status == 200 且页面可渲染（统一登录页）`
  - Step 7: `assert response.status == 200 && response.body.code == "SUCCESS" && response.body.data.status == "UP"`
- **后置处理**：`pnpm dev` 进程 Ctrl+C；`docker-compose down` 清理容器（保留 volume 以便下次秒启）。

### TC-US0.2.2-01：验证建立数据库迁移机制

- **测试目的**：验证 Prisma Migrate 在空数据库 / 已迁移数据库 / 重复执行场景下行为正确，迁移历史可追踪 —— 防止多人开发数据库结构不一致。
- **测试类型**：流程验收 / 文档检查 / 流水线检查
- **前置条件**：已完成并通过依赖 Story：US0.2.1；docker-compose 已启动 mysql。
- **测试数据**：空数据库、已执行过迁移的数据库、`_prisma_migrations` 表。
- **操作步骤**：
  1. drop database ibooking; create database ibooking。
  2. 执行 `pnpm --filter api db:migrate:dev`。
  3. 再次执行同一命令。
  4. 查询 `SELECT * FROM _prisma_migrations`。
  5. 故意改 schema.prisma 引入语法错误并执行 migrate dev。
- **Assert 断言**：
  - Step 2: `assert 命令退出码 == 0；assert 0001_init 与 0002_full_schema migrations 都被应用`
  - Step 3: `assert 命令幂等不重复 apply migration`
  - Step 4: `assert _prisma_migrations 表含每个 migration 的 (id, applied_at, success)`
  - Step 5: `assert 迁移失败时报错明确不影响已成功 migration`
- **后置处理**：修复 schema.prisma 错误；再次运行 migrate dev 恢复正常状态。

### TC-US0.3.1-01：验证定义核心领域模型

- **测试目的**：验证核心领域模型完整覆盖用户、院系、角色、权限、自习室、座位、预约、签到、违约、通知、审计实体，关键字段、外键、状态枚举完整 —— 这是后续所有业务实现的数据基础。
- **测试类型**：流程验收 / 文档检查 / 流水线检查
- **前置条件**：已完成并通过依赖 Story：US0.2.2。
- **测试数据**：ER 图 docs/architecture/erd.png + schema.prisma + 数据字典 docs/architecture/data-dict.md。
- **操作步骤**：
  1. 打开 schema.prisma 检查 model 数量。
  2. 抽样检查 Booking / Seat / Room / User / Violation 关键字段。
  3. 从一条 booking 记录尝试关联到 user, seat, room。
  4. 检查状态枚举定义。
- **Assert 断言**：
  - Step 1: `assert model 数量 ≥ 12（前述列表）`
  - Step 2: `assert 每个核心 model 有 id (PK), createdAt, updatedAt, status 枚举（如适用）`
  - Step 3: `assert 外键关系定义完整，prisma 类型推断正常`
  - Step 4: `assert BookingStatus enum 含 PENDING_CHECKIN / CHECKED_IN / COMPLETED / CANCELLED_BY_USER / CANCELLED_AUTO_NO_CHECKIN / CANCELLED_BY_ADMIN`
- **后置处理**：无（仅文档与 schema 检查，不产生数据）。

### TC-US0.3.2-01：验证定义接口与错误码规范

- **测试目的**：验证所有接口遵守统一响应 / 分页 / 错误码规范 —— 防止前后端联调出现"每个接口要写一套适配"的浪费。
- **测试类型**：流程验收 / 文档检查 / 流水线检查
- **前置条件**：已完成并通过依赖 Story：US0.3.1。
- **测试数据**：health 接口；故意构造的非法请求。
- **操作步骤**：
  1. curl `GET /api/v1/health`，检查响应结构。
  2. curl `GET /api/v1/non-existent` 触发 404。
  3. POST 一个未来要存在的接口（mock）触发参数校验错误。
  4. 检查 OpenAPI yaml 自动导出。
- **Assert 断言**：
  - Step 1: `assert response.body 含 { code: "SUCCESS", message, data: { status: "UP", db, redis, ts }, requestId, timestamp }`
  - Step 2: `assert response.body.code == "RESOURCE_NOT_FOUND"`
  - Step 3: `assert response.body.code 来自 error-codes.ts enum；assert message 能定位具体字段`
  - Step 4: `assert docs/api/openapi.yaml 存在且 schema 含 BookingDto 等占位类型`
- **后置处理**：无。

### TC-US8.4.1-01：验证 GitHub 代码托管

- **测试目的**：验证代码仓库托管在 GitHub + 分支保护 + PR 评审流程生效 —— 这是课程"代码仓库管理"评分点。
- **测试类型**：流程验收 / 文档检查 / 流水线检查
- **前置条件**：US0.4.1 已完成；GitHub Projects 项目已创建。
- **测试数据**：管理员账号、普通成员账号、PR 模板、main 分支保护规则。
- **操作步骤**：
  1. 普通成员账号尝试直推 main 分支。
  2. 普通成员创建 feature 分支推送并发起 PR。
  3. 团队成员评审 PR 并合并。
  4. 检查 audit_log（GitHub 操作记录）。
- **Assert 断言**：
  - Step 1: `assert 直推被拒，返回 "Branch is protected"`
  - Step 2: `assert PR 创建成功；assert PR 模板含「关联 Story」字段`
  - Step 3: `assert 合入 main 成功后 commit 历史可查；assert PR 关闭`
  - Step 4: `assert 操作记录含分支保护拒绝事件、PR 创建事件、合并事件`
- **后置处理**：删除测试 feature 分支。

### TC-US8.1.2-01：验证建立验收标准模板

- **测试目的**：验证团队 story 写法统一、Review 时能据此判断通过 / 失败 —— 避免"验收标准不清导致 review 反复扯皮"。
- **测试类型**：流程验收 / 文档检查 / 流水线检查
- **前置条件**：Bucket A 已修订完毕。
- **测试数据**：Bucket A 全文。
- **操作步骤**：
  1. `grep -c "^- \[ \] \*\*US" 自习座位预约系统_Story测试描述清单.md`。
  2. `grep -c "关联设计稿：" 自习座位预约系统_Story测试描述清单.md`。
  3. `grep -c "测试目的：" 自习座位预约系统_Story测试描述清单.md`。
  4. `grep -c "范围标记：拉伸目标" 自习座位预约系统_Story测试描述清单.md`。
- **Assert 断言**：
  - Step 1: `assert 输出 == 118`
  - Step 2: `assert 输出 == 118`
  - Step 3: `assert 输出 == 118`
  - Step 4: `assert 输出 == 4`（US4.5.2, US5.2.2, US7.6.1, US7.6.2）
- **后置处理**：无。

**TC 不在本节列出但在 Bucket A 必须实现的：** TC-US0.1.1-01, TC-US0.1.2-01, TC-US0.4.1-01, TC-US0.4.2-01, TC-US0.2.2-01（部分覆盖 US0.2.2 之外细节）。每条同样有完整七字段，agent 实施时读 Bucket A 内对应 TC- 条目。

**行覆盖率门槛**：I0 是基础设施迭代，**首迭代豁免 70% 全局门槛**；但 health endpoint 必须有单元测试 + 接口测试。

## 8. 迭代级 DoD（见 `_shared/done-definition.md` 通用 DoD + 本迭代专属补充）

通用 DoD（复制自 done-definition.md，本迭代必须 tick）：

- [ ] 全部 P0 story 已 Done（Story 级 DoD 全绿）
- [ ] 流水线：lint / unit / api / build / deploy 五关在 main 自动执行并 green —— **I0 仅需 lint + unit；其余在 I1-I3 接入**
- [ ] 仓库级测试行覆盖率 ≥70% —— **I0 豁免**
- [ ] 演示脚本（§9）在干净环境上能完整跑过 1 遍
- [ ] DB schema 在下一迭代不需要破坏性变更
- [ ] 已为下迭代准备的产物归档完毕

本迭代专属：

- [ ] 首次 CI 在 GitHub 上 green（lint + 占位 build）
- [ ] Bucket A 中 P0 Story 的 `负责人:` 已填实名

## 9. 演示脚本（用于 Phase 1 第一阶段 Review 的预演）

**主持人：组长 / 任一成员**
**时长：5 分钟**

1. 主持人在干净本地环境（VM 或新克隆目录）执行 `docker-compose -f infra/docker-compose.yml up -d && pnpm install && pnpm --filter api db:migrate:dev && pnpm dev`。
2. 浏览器打开两个标签：
   - `http://localhost:5174` （统一登录页骨架）
   - `http://localhost:3000/api/v1/health` （后端健康检查 200）
3. 切换到 GitHub 仓库主页：
   - 显示 main 分支受保护的截图
   - 显示首次 build 任务 green 的截图
4. 切换到 Bucket A 文档：
   - 滚动 §0 项目概览，强调 §0.0.3 迭代路线图与 §0.0.6 测试七字段契约
   - 抽样展示 1 条 P0 story 的完整结构（任务 checklist + 关联设计稿 + TC 七字段）
5. 切换到 GitHub Projects 看板：展示 118 条 story 已录入并按 P0/P1/P2 分组。

**讲解要点**：本迭代不交付业务功能，但已为后续 6 个迭代铺好骨架；任意成员可在 30min 内完成本地启动；流水线已经触发 CI；需求基线已冻结。

## 10. 拉伸 / 可选

无。本迭代主线全部为 P0。

## 11. 守卫（Do-not-touch）

- 不修改 `自习室预约/` 目录（设计稿是只读基线，本迭代不涉及 UI）
- 不在 `packages/shared-types` 之外重复定义 DTO
- 不改 `.env` 模板字段名（可加新字段；新增字段必须更新 `_shared/tech-stack.md` §4）
- 不引入 `_shared/tech-stack.md` §1 技术栈白名单之外的运行时依赖
- 不在本迭代实现任何业务功能（如登录、预约逻辑等 — 那是 I1+ 范围）
- 不引入 AntD 到学生端（学生端必须保持 mockup 视觉风格）

## 12. 与下一迭代的交接

**必须遗留的产物**（I1 入口前置依赖这些）：

- `apps/api/prisma/schema.prisma` 含 12+ 占位表
- `apps/api/prisma/migrations/0001_init` 与 `0002_full_schema` 已 commit
- `packages/shared-types/` 含全部 entity 占位接口 + Zod schema
- `packages/design-tokens/` 含 F + PATHS（从 fudan-tokens.jsx 移植）
- `infra/docker-compose.yml` 启动 mysql + redis + mailhog
- `.github/workflows/ci.yml` 模板（占位，I1 接入构建）
- `apps/api/src/common/` 含全局响应 interceptor + ErrorCodes enum
- `docs/api/openapi.yaml` 自动导出（I0 仅含 health endpoint）
- GitHub 仓库 + 分支保护 + 首次 CI green

**已知未做项 → 显式标记到 I1 §0 入口前置**：

- 业务模块全部未实现（auth, rbac, room, seat, booking, ...）— I1+ 实现
- CI 仅含 lint + 占位 build，未含 unit/e2e/deploy — I1 接入构建测试，I3 接入部署
- 测试覆盖率为 0 — I1 起按模块爬升到 ≥70%
