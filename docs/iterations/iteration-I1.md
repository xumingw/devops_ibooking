# Iteration I1 — 账号、RBAC、资源 CRUD

## 0. 元信息

- **时长**：2 周
- **入口前置**：I0 全部 P0 story Done；本地 `pnpm dev` 与 `docker-compose up` 跑通；GitHub 仓库已托管。
- **出口准则**：见 §8
- **必读共享文档**：`_shared/tech-stack.md` · `_shared/conventions.md` · `_shared/done-definition.md` · `_shared/design-map.md`
- **设计稿入口**：`自习室预约/Fudan Study System.html`（s01 / a02 / a03 / a05）
- **数据契约位置**：`packages/shared-types/`
- **本迭代 source-of-truth**：Bucket A E1（11 story）+ E2.1-2.2（5 story）+ E8.4.2（1 story）

## 1. 迭代目标

**本迭代结束时学生与管理员可登录；菜单按角色展示；管理员可维护自习室和座位；GitHub Actions 自动跑构建 + 单元测试。**

## 2. Story 范围

按依赖拓扑排序：

| Story ID | P | 标题 | 关联设计稿 ID |
|---|---|---|---|
| US1.1.1 | P0 | 学生登录 | s01 |
| US1.1.2 | P0 | 管理员登录 | s01（共用入口）|
| US1.1.3 | P1 | 会话刷新与退出 | s01（token 失效弹窗）|
| US1.2.1 | P0 | 学生资料维护 | m07 / s06 兜底 |
| US1.3.1 | P0 | 角色维护 | a05 |
| US1.3.2 | P0 | 权限点维护 | a05 |
| US1.3.3 | P0 | 用户分配角色 | a05 |
| US1.4.1 | P0 | 管理菜单按角色展示 | a05 |
| US1.4.2 | P0 | 后端接口权限校验 | 无（后端） |
| US2.1.1 | P0 | 新增和编辑自习室 | a02 |
| US2.1.2 | P0 | 注销和恢复自习室 | a02 |
| US2.1.3 | P0 | 配置全校/院系开放范围 | a02 |
| US2.2.1 | P0 | 新增和编辑座位 | a03 |
| US2.2.2 | P0 | 注销和恢复座位 | a03 |
| US8.4.2 | P0 | 自动化构建任务 | 无（GitHub）|

**故事数：15（13 P0 / 2 P1 / 0 P2）**

## 3. 关联设计稿（artboard → story）

| Artboard | 用于 |
|---|---|
| s01 登录页 | US1.1.1 / US1.1.2 / US1.1.3 |
| a05 角色权限管理 | US1.3.1 / US1.3.2 / US1.3.3 / US1.4.1 |
| a02 自习室管理 | US2.1.1 / US2.1.2 / US2.1.3 |
| a03 平面图编辑器 | US2.2.1 / US2.2.2 |
| m07（仅参考） | US1.2.1（Web 端套 s06 卡片样式兜底） |

**实施前必须**：通过 HTTP 服务（不是 file://）打开 `自习室预约/Fudan Study System.html`，对照 s01 / a02 / a03 / a05 视觉样式实现 React 组件。

## 4. Tasks（按执行顺序，扁平化；任务详细信息见 Bucket A，本节列依赖序）

### Block A — 数据基础（先于所有业务逻辑）

- [ ] US1.2.1-T01 学生资料表与院系字段（Prisma migration）
- [ ] US1.2.1-T03 学生测试数据 + 院系 seed
- [ ] US1.3.1-T01 角色表与 CRUD 接口（含 4 个种子角色：ROLE_STUDENT / ROLE_ROOM_ADMIN / ROLE_AUDIT / ROLE_FULL_ADMIN）
- [ ] US1.3.2-T01 权限点编码（packages/shared-types/permissions.ts）
- [ ] US1.3.2-T02 权限点初始化脚本（seed permission 表，~20 个权限点）
- [ ] US1.3.3-T01 user-role 关联表与分配接口
- [ ] US1.1.2-T03 管理员账号种子数据（admin_full / roomAdmin01 / audit01 / noPerm01）

### Block B — 鉴权与会话

- [ ] US1.1.1-T01 学生登录接口与参数校验
- [ ] US1.1.1-T02 学生身份校验与会话令牌生成（Passport-JWT；access 15m + refresh 7d httpOnly cookie + refresh_token 表）
- [ ] US1.1.2-T01 扩展管理员身份识别逻辑
- [ ] US1.1.3-T01 令牌过期、刷新或重新登录机制
- [ ] US1.1.3-T02 退出按钮和会话过期拦截

### Block C — 鉴权 Guard 与菜单

- [ ] US1.4.2-T01 PermissionsGuard + @RequirePermissions 装饰器
- [ ] US1.4.2-T02 为管理接口绑定权限编码（lint:permissions CI 任务）
- [ ] US1.4.1-T01 当前用户权限查询接口 GET /api/v1/auth/me
- [ ] US1.4.1-T02 web-admin 动态路由 + 菜单过滤（Zustand auth store）

### Block D — 统一登录 UI

- [ ] US1.1.1-T03 apps/web-admin 统一登录页套 s01，提交学工号后按角色分流
- [ ] US1.1.1-T04 登录单元测试 + 接口测试 + Playwright

### Block E — 统一登录与 RBAC UI

- [ ] US1.1.2-T02 apps/web-admin/src/pages/Login.tsx 套 s01；ProtectedRoute 拦截非管理角色
- [ ] US1.1.2-T04 非管理员访问后台拒绝测试
- [ ] US1.3.1-T02 a05 角色 tab：列表 + Drawer 表单
- [ ] US1.3.1-T03 角色唯一性 + 停用规则测试
- [ ] US1.3.2-T03 a05 权限点 Tree 展示
- [ ] US1.3.2-T04 lint:permissions CI 任务（grep controller 是否绑定）
- [ ] US1.3.3-T02 a05 用户角色分配 Drawer
- [ ] US1.3.3-T03 多角色权限合并测试
- [ ] US1.4.1-T03 不同角色菜单截图 + 测试

### Block F — 资源 CRUD（管理员）

- [ ] US1.2.1-T02 学生资料查询接口（含院系筛选）
- [ ] US1.2.1-T04 院系数据校验测试
- [ ] US2.1.1-T01 Room 表与 CRUD 接口
- [ ] US2.1.1-T02 a02 列表 + 编辑 Drawer
- [ ] US2.1.1-T03 字段校验 + 重复名称拒
- [ ] US2.1.1-T04 新增/编辑测试
- [ ] US2.1.2-T01 注销/恢复接口
- [ ] US2.1.2-T02 注销对未来预约影响（I1 仅返回提示，I3 真实处理）
- [ ] US2.1.2-T03 二次确认 + 风险提示
- [ ] US2.1.2-T04 注销后不可预约测试（部分；预约接口在 I2 实现）
- [ ] US2.1.3-T01 Room.scopeType + departmentId 字段
- [ ] US2.1.3-T02 a02 开放范围下拉
- [ ] US2.1.3-T04 院系边界测试数据
- [ ] US2.2.1-T01 Seat 表 + UNIQUE (roomId, code) + CRUD
- [ ] US2.2.1-T02 a03 平面图编辑器（拖拽布局）
- [ ] US2.2.1-T03 唯一性校验
- [ ] US2.2.1-T04 新增/编辑座位测试
- [ ] US2.2.2-T01 座位注销/恢复
- [ ] US2.2.2-T03 a03 注销座位灰色样式 + 二次确认
- [ ] US2.2.2-T04 注销座位不可预约测试

### Block G — CI 接入

- [ ] US8.4.2-T01 GitHub Actions CI 任务串：pnpm install → lint → test → build → docker push
- [ ] US8.4.2-T02 前端构建任务（统一 Web 入口 web-admin dockerfile）
- [ ] US8.4.2-T03 单元测试在构建中执行（失败 exit 1）
- [ ] US8.4.2-T04 镜像 tag = git short SHA + timestamp，GHCR 保留近 30 个

**关于 US8.1.1（迭代:I1-I6 跨迭代 story）：** "用户故事关联测试用例" 是从 I1 起每个迭代都在执行的持续活动 —— 每完成一个 P0 story 就在 GitHub Issues/Projects 关联其 TC 用例并维护通过 / 失败状态。本迭代起每位 owner 自检；CI 任务用 grep `// @story USx.x.x` 自动生成覆盖报告。

**关于本节任务密度：** 本迭代 15 个 story 共约 50 个 task；本节按依赖序列出 task ID 与标题，每个 task 的「实施要点 / 验收」由 Bucket A 中对应 story 同名 task 提供（与 conventions.md §2 ID 规则一一对应）—— agent 实施时按 Bucket A 任务 checklist 执行，不需要在 brief 中重复展开。

## 5. 实现要点（针对 5 个最易翻车 story）

### 5.1 US1.1.x 双 Token 鉴权（HARD — 整个 RBAC 的基础）

**关键决策：**
- access token (JWT) 15min TTL，存放在前端 Zustand 内存（不存 localStorage 防 XSS）。
- refresh token 7day TTL，存放在 httpOnly + Secure + SameSite=Lax cookie；同时在后端 `refresh_token` 表保留 hash + revoked + expiresAt 防止伪造。
- 登出 = 删除 refresh_token 表对应记录 + 客户端清空 Zustand。
- access 过期时前端 axios interceptor 捕获 401 → 自动调 refresh 接口 → 拿到新 access → 重试原请求；refresh 也失败则跳登录。
- 学生和管理员共用同一登录页。前端统一调用 `POST /api/v1/auth/login`，body `{ studentNo, password }`；后端按 `studentNo` 查统一用户表，登录成功后根据 response 中的 `roles` 路由到学生首页或管理后台。`/student-login` 与 `/admin-login` 仅作为旧接口兼容保留。

### 5.2 US1.3.x RBAC 三表设计

**关键决策：**
- `role` 表 (id, code UNIQUE, name, description, status)。
- `permission` 表 (id, code UNIQUE, resource, action, description)。
- `role_permission` 关联表 (roleId, permissionId, PK 联合)。
- `user_role` 关联表 (userId, roleId, PK 联合, assignedAt)。
- `getUserPermissions(userId)` SQL：JOIN user_role + role_permission + permission；结果用 Redis cache key `user:<id>:permissions` TTL 5min；分配/移除角色时 invalidate cache。
- 权限点编码：`<resource>.<action>` 如 `booking.read`、`room.update`、`booking.create_for_others`。

### 5.3 US1.4.x 双层鉴权（前端菜单 + 后端 Guard）

**关键决策：**
- 前端 `web-admin` 路由 meta `{ requirePermissions: ['room.update'] }`；侧边栏 + ProtectedRoute 双重过滤。
- 后端 NestJS Guard `PermissionsGuard` + 装饰器 `@RequirePermissions('room.update')`；不通过抛 `ForbiddenException` 含 code=`RBAC_FORBIDDEN`。
- 前端隐藏只是 UX 优化，**真正的边界在后端 Guard**（学生绕过前端直调接口仍 403）。
- CI 任务 `lint:permissions`：grep 全部 admin controller method 是否绑定装饰器，未绑定 fail。

### 5.4 US2.1.x / US2.2.x 资源 CRUD 模式

**关键决策：**
- 所有 CRUD 接口：`GET /list (分页)`、`GET /:id`、`POST /`、`PATCH /:id`、`DELETE /:id`（软删 → status=CANCELLED）。
- Drawer 表单用 React Hook Form + Zod；提交前 client-side 校验，后端再校验一遍。
- 唯一约束（room.name / seat.code in room）：DB 级 UNIQUE INDEX；service 层 try/catch P2002 → 抛 409 含 code=`ROOM_NAME_DUPLICATE` / `SEAT_CODE_DUPLICATE`。
- 注销资源对未来预约影响：**I1 仅在 service 层返回受影响 booking 数提示，不真正取消**（因为 booking 模块在 I2 才实现）；I3 时回头补完整级联取消逻辑。

### 5.5 US8.4.2 GitHub Actions CI 任务

**关键决策：**
- workflow yaml 在 `.github/workflows/ci.yml`，包含 jobs/stages: install → lint → test → build → docker push。
- 后端 docker image 用多阶段构建：`builder` 阶段 pnpm install + build → `runner` 阶段 node:20-alpine + dist + node_modules（仅 prod）。
- 前端：build 后产物放 nginx:alpine 静态服务镜像。
- GHCR 镜像地址：`ghcr.io/<owner>/devops_ibooking/api:<sha>`、`ghcr.io/<owner>/devops_ibooking/web-admin:<sha>`（`web-admin` 承载统一 Web 入口）。
- 单元测试失败 → `pnpm test` exit 1 → CI fail → 不 push 镜像。

## 6. 数据/接口契约变更

**Prisma migrations：**
- `0003_user_department`: User, Department, RefreshToken
- `0004_rbac`: Role, Permission, RolePermission, UserRole + 4 角色 + 20 权限点 seed
- `0005_room_seat`: Room (scopeType+departmentId), Seat (UNIQUE(roomId, code))

**新增 REST endpoints（v0.1）：**

| Method | Path | 权限点 | 说明 |
|---|---|---|---|
| POST | /api/v1/auth/login | (none) | 统一登录，body `{ studentNo, password }` |
| POST | /api/v1/auth/student-login | (none) | 旧学生登录兼容接口 |
| POST | /api/v1/auth/admin-login | (none) | 旧管理员登录兼容接口 |
| POST | /api/v1/auth/refresh | (cookie) | 刷新 access token |
| POST | /api/v1/auth/logout | auth | 登出 |
| GET | /api/v1/auth/me | auth | 当前用户 + 权限集 |
| GET | /api/v1/users | user.read | 学生列表（管理员） |
| GET | /api/v1/users/:id | (self or user.read) | 学生详情 |
| GET | /api/v1/users/me | auth | 自己资料 |
| GET/POST/PATCH | /api/v1/roles | role.read/write | 角色 CRUD |
| GET | /api/v1/permissions | role.read | 权限点列表 |
| POST/DELETE | /api/v1/users/:id/roles/:roleId | role.assign | 用户角色分配 |
| GET/POST/PATCH | /api/v1/rooms | room.read/write | 自习室 CRUD |
| PATCH | /api/v1/rooms/:id/status | room.update_status | 注销/恢复自习室 |
| GET/POST/PATCH | /api/v1/rooms/:roomId/seats | seat.read/write | 座位 CRUD |
| PATCH | /api/v1/seats/:id/status | seat.update_status | 注销/恢复座位 |

**shared-types 新增：**
`UserDto`, `RoleDto`, `PermissionDto`, `LoginRequestDto`, `LoginResponseDto`, `RoomDto`, `SeatDto` 含 Zod schema。

## 7. 测试要求（每条 TC 含七字段；本节列出 P0 关键 TC 完整描述，agent 直接实施）

### TC-US1.1.1-01：验证学生登录

- **测试目的**：验证学生使用合法学号密码可登录并获得 access/refresh 双 token，禁用账号或错误密码被拒，确保身份验证不能绕过 —— 这是后续所有学生功能的入口。
- **测试类型**：UI 功能测试 / 接口断言 / 数据库断言
- **前置条件**：US1.1.1-T02 实现完成；seed 数据含 stu_cse_01 / stu_disabled。
- **测试数据**：合法账号 stu_cse_01（密码 Pass123!），禁用账号 stu_disabled，错误密码 wrong-password。
- **操作步骤**：
  1. POST `/api/v1/auth/login` body={ studentNo:"stu_cse_01", password:"Pass123!" }
  2. 检查响应 + cookie。
  3. POST 同接口 body={ studentNo:"stu_disabled", password:"Pass123!" }
  4. POST 同接口 body={ studentNo:"stu_cse_01", password:"wrong-password" }
  5. 用 step 1 返回的 access token 调 GET `/api/v1/auth/me`。
- **Assert 断言**：
  - Step 2: `assert response.status == 200; assert response.body.data.accessToken != null; assert response 设置 httpOnly cookie refreshToken; assert db.refresh_token 表新增一行 userId=stu_cse_01`
  - Step 3: `assert response.status == 403; assert response.body.code == "USER_DISABLED"; assert db.refresh_token 不变`
  - Step 4: `assert response.status == 401; assert response.body.code == "INVALID_CREDENTIALS"`
  - Step 5: `assert response.body.data.user.studentNo == "stu_cse_01"; assert response.body.data.permissions 包含 "booking.read"`
- **后置处理**：删除测试创建的 refresh_token 记录；清理 Zustand 状态。

### TC-US1.1.2-01：验证管理员登录

- **测试目的**：验证管理员可进入后台、普通学生与无管理权限账号被前后端双重拦截，杜绝越权进入管理界面。
- **测试类型**：UI 功能测试 / 接口断言
- **前置条件**：US1.1.2-T02 实现完成；seed 数据含 admin_full / stu_cse_01 / noPerm01。
- **测试数据**：admin_full（密码 Admin123!）、stu_cse_01、noPerm01。
- **操作步骤**：
  1. POST `/api/v1/auth/login` body={ studentNo:"admin_full", password:"Admin123!" }
  2. 用 token 访问 `http://localhost:5174/admin/dashboard`
  3. 用 stu_cse_01 token 访问 `http://localhost:5174/admin/dashboard`
  4. 用 noPerm01（已登录但无任何 role）token 访问 GET `/api/v1/rooms`
- **Assert 断言**：
  - Step 1: `assert response.status == 200; assert response.body.data.user.roles 含 ROLE_FULL_ADMIN`
  - Step 2: `assert 进入仪表盘页面，菜单全部展示`
  - Step 3: `assert ProtectedRoute 拦截，跳转到 403 兜底页`
  - Step 4: `assert response.status == 403; assert response.body.code == "RBAC_FORBIDDEN"`
- **后置处理**：登出清理 refresh_token。

### TC-US1.3.3-01：验证用户分配角色

- **测试目的**：验证用户-角色多对多生效、权限按并集计算、移除全部角色后立即拒绝管理操作 —— 避免历史授权残留导致权限漂移。
- **测试类型**：功能测试 / 接口断言 / 数据库断言
- **前置条件**：US1.3.3-T01 实现完成；roomAdmin01 / ROLE_ROOM_ADMIN / ROLE_AUDIT 存在。
- **测试数据**：roomAdmin01 user，ROLE_ROOM_ADMIN 含 room.* / seat.*，ROLE_AUDIT 含 booking.read / violation.read。
- **操作步骤**：
  1. admin_full 调 POST `/api/v1/users/{roomAdmin01.id}/roles/{ROLE_ROOM_ADMIN.id}`
  2. 用 roomAdmin01 token 调 GET `/api/v1/auth/me` 检查 permissions
  3. admin_full 再调 POST `/api/v1/users/{roomAdmin01.id}/roles/{ROLE_AUDIT.id}`
  4. 用 roomAdmin01 token 调 GET `/api/v1/violations`
  5. admin_full 调 DELETE `/api/v1/users/{roomAdmin01.id}/roles/{ROLE_ROOM_ADMIN.id}` 与 DELETE `/api/v1/users/{roomAdmin01.id}/roles/{ROLE_AUDIT.id}`
  6. 用 roomAdmin01 token 调 GET `/api/v1/rooms`
- **Assert 断言**：
  - Step 1: `assert response.status == 200; assert db.user_role 表新增一行`
  - Step 2: `assert permissions 包含 "room.update" "seat.update"; 不包含 "violation.read"`
  - Step 3: `assert 200; permissions 现包含两角色权限并集`
  - Step 4: `assert response.status == 200`
  - Step 5: `assert 200; db.user_role 中无对应记录`
  - Step 6: `assert response.status == 403; assert response.body.code == "RBAC_FORBIDDEN"`
- **后置处理**：恢复 roomAdmin01 默认角色（避免影响其他测试）。

### TC-US2.1.1-01：验证新增和编辑自习室

- **测试目的**：验证管理员可维护自习室核心元数据、唯一约束 + 字段校验生效 —— 这是后续所有座位、预约、查询所有功能的资源基础。
- **测试类型**：功能测试 / 接口断言 / 数据库断言
- **前置条件**：US2.1.1-T03 实现完成；admin_full 已登录。
- **测试数据**：合法 R_TEST { name:"R_TEST", building:"主楼", floor:3, capacity:50, scopeType:"SCHOOL", openHour:7, closeHour:22 }；非法 capacity=-5；重复名称。
- **操作步骤**：
  1. POST `/api/v1/rooms` body=R_TEST
  2. PATCH `/api/v1/rooms/{R_TEST.id}` body={ capacity: 60, openHour: 8 }
  3. POST `/api/v1/rooms` body={ ...R_TEST, name:"R_TEST" }（重复）
  4. POST body={ ...R_TEST, capacity:-5 }
- **Assert 断言**：
  - Step 1: `assert response.status == 201; assert response.body.data.id 存在; assert db.room 出现 R_TEST`
  - Step 2: `assert response.status == 200; assert db.room.capacity == 60`
  - Step 3: `assert response.status == 409; assert response.body.code == "ROOM_NAME_DUPLICATE"`
  - Step 4: `assert response.status == 400; assert response.body.message 含 "capacity 必须 ≥ 0"`
- **后置处理**：DELETE R_TEST。

### TC-US2.2.1-01：验证新增和编辑座位

- **测试目的**：验证座位 CRUD + 编号唯一约束（限定在同一自习室内）—— 避免编号冲突导致后续预约定位错误。
- **测试类型**：功能测试 / 接口断言 / 数据库断言
- **前置条件**：US2.2.1-T03 实现完成；R101 已存在。
- **测试数据**：A_TEST { code:"A_TEST", roomId:R101.id, x:100, y:100, attributes:{} }；R102 与 A_TEST 同 code 不同 room。
- **操作步骤**：
  1. POST `/api/v1/rooms/{R101.id}/seats` body=A_TEST
  2. PATCH `/api/v1/seats/{A_TEST.id}` body={ x: 200, y: 200 }
  3. POST `/api/v1/rooms/{R101.id}/seats` body={ ...A_TEST }（同 room 重复）
  4. POST `/api/v1/rooms/{R102.id}/seats` body={ code: "A_TEST", x:50, y:50 }
- **Assert 断言**：
  - Step 1: `assert response.status == 201; db.seat 含一行`
  - Step 2: `assert response.status == 200; db.seat.x == 200`
  - Step 3: `assert response.status == 409; assert code == "SEAT_CODE_DUPLICATE"`
  - Step 4: `assert response.status == 201; 不同 room 同 code 允许`
- **后置处理**：DELETE 测试座位。

**额外 TC（在 Bucket A 中含完整七字段，agent 实施时按其执行）：**
TC-US1.1.1-01 / TC-US1.1.2-01（已上） / TC-US1.1.3-01 / TC-US1.2.1-01 / TC-US1.3.1-01 / TC-US1.3.2-01 / TC-US1.3.3-01（已上） / TC-US1.4.1-01 / TC-US1.4.2-01 / TC-US2.1.1-01（已上） / TC-US2.1.2-01 / TC-US2.1.3-01 / TC-US2.2.1-01（已上） / TC-US2.2.2-01 / TC-US8.4.2-01。

**行覆盖率门槛 ≥70%** 模块：`auth`、`rbac`、`user`、`role`、`permission`、`room`、`seat`。

## 8. 迭代级 DoD

通用 DoD（必须全 tick）：

- [ ] 全部 P0 story Done（13 条）
- [ ] CI lint + unit + build + image-push 五关在 main 自动 green
- [ ] 模块行覆盖率 ≥70%（auth/rbac/room/seat）
- [ ] §9 演示脚本在干净环境跑通
- [ ] DB schema 在 I2 不需要破坏性变更
- [ ] OpenAPI snapshot v0.1 commit 到 docs/api/

本迭代专属：

- [ ] 4 类账号（admin_full / roomAdmin01 / audit01 / stu_cse_01）登录后菜单差异符合预期
- [ ] `lint:permissions` CI 任务 green（admin controllers 全部含 @RequirePermissions）

## 9. 演示脚本（10 分钟）

1. **学生登录与首页（2min）**：用 stu_cse_01 在统一 Web 入口登录；展示登录态保存、access token 自动刷新（用 dev 工具改 token 过期时间触发 refresh）。
2. **管理员登录与菜单差异（3min）**：分别用 admin_full / roomAdmin01 / audit01 在统一 Web 入口登录；切换三个账号展示侧边栏菜单差异（admin_full 全部、roomAdmin01 仅资源管理、audit01 仅预约/违约 — 此时虽未实现仍需菜单显示）。
3. **角色权限管理（2min）**：admin_full 进入 a05 → 创建测试角色 → 给 audit01 加 ROLE_AUDIT → audit01 重新登录看到新菜单。
4. **资源 CRUD（2min）**：admin_full 进入 a02 创建 R_TEST → 进入 a03 在 R_TEST 中创建 A_TEST → 注销 A_TEST 看到灰色样式。
5. **越权防护（1min）**：用 audit01 token（DevTools 复制）curl POST `/api/v1/rooms` → 显示 403 RBAC_FORBIDDEN。
6. **GitHub Actions CI（1min）**：展示 main push 触发自动构建截图，单元测试 green，docker image 入 GHCR。

## 10. 拉伸 / 可选

无。

## 11. 守卫（Do-not-touch）

- 不修改 `自习室预约/` 目录
- 不在 `packages/shared-types` 之外定义 DTO
- 不实现预约 / 签到 / 违约相关功能（I2+ 范围）
- 不将历史 `apps/web-student` 重新作为默认入口或生产部署目标
- 不绕过 PermissionsGuard 直接公开管理接口
- 不存 access token 到 localStorage（XSS 风险；用内存）

## 12. 与下一迭代的交接

**必须遗留：**
- migrations 0003-0005 commit
- packages/shared-types 含 User/Role/Permission/Room/Seat 完整 DTO + Zod schema
- 4 角色 + 20 权限点 seed 已在 DB
- 4 类测试账号 seed 已在 DB
- 统一 Web 入口路由保护框架就绪
- CI 流水线含 build + lint + unit
- `OpenAPI v0.1` 快照在 docs/api/openapi-v0.1.yaml

**已知未做项 → I2 入口前置：**
- 预约创建接口尚未实现（I2 起）
- 资源注销对未来预约的级联处理尚未实现（占位提示，I3 完善）
- E2E test 未启用（I2 接入 Playwright 主流程）
