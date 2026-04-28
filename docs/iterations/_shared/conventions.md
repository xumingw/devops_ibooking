# 编码与协作规范

> 来源: `docs/superpowers/specs/2026-04-25-ibooking-requirements-management-design.md` §3.6 + §5.1

## 1. 命名规范（与 tech-stack.md §6 一致，此处再强调一次）

- **数据库表**：`snake_case`（user, role, permission, role_permission, user_role, room, seat, booking, booking_slot, violation, check_in_code, reminder_log, audit_log, system_param, ai_chat_session, ai_chat_message, announcement, notification_template, favorite, refresh_token）。
- **HTTP 路径**：`/api/v1/<resource>`，REST + 复数；分页 `?page&size`；排序 `?sort=field,asc|desc`。
- **DTO**：`PascalCase` + 后缀 `…Dto` / `…ResponseDto`；每个 DTO 必须在 `packages/shared-types` 中有 Zod schema。
- **错误码**：`SCREAMING_SNAKE_CASE` enum，例 `BOOKING_SLOT_TAKEN`、`CHECK_IN_OUT_OF_WINDOW`、`RBAC_FORBIDDEN`、`USER_TIME_CONFLICT`、`PARAM_INVALID_RANGE`；定义在 `packages/shared-types/src/error-codes.ts`。
- **权限点编码**：`<resource>.<action>`，例 `booking.read`、`booking.create_for_others`、`room.update`、`system_param.update`、`violation.export`。

## 2. ID 规则（需求/任务/测试，冻结 — agents 不允许自由发明）

- Epic: `E<n>` （e.g. `E3`）
- Feature: `F<n.m>` （e.g. `F3.4`）
- Story: `US<n.m.k>` （e.g. `US3.4.1`）
- Task: `US<n.m.k>-T<NN>` （NN 为两位零填充，e.g. `US3.4.1-T02`）
- Test case: `TC-US<n.m.k>-<NN>` （e.g. `TC-US3.4.1-01`）
- Iteration: `I<n>` （I0–I6）

**Task 计数器规则：**
- T01–T99 范围内两位零填充，故事内不重复且永不复用已释放 ID。
- 新增 task = 计数器递增；删除 task = 标 deprecated，不复用 ID。

## 3. 提交与分支

### 3.1 提交格式

Conventional Commits + story id 前缀：

- 格式：`<type>(<story-id>): <subject>`
- 示例：`feat(US3.4.1): add seat-time uniqueness constraint`
- 类型：`feat` / `fix` / `docs` / `refactor` / `test` / `chore` / `build` / `ci`
- subject 用现在式动词；不以句号结尾；首字母小写（命令式）。
- body 可选；breaking change 用 `!`：`feat(US3.4.1)!: ...`。

### 3.2 分支命名

- 格式：`feat/<story-id>-<slug>`
- 示例：`feat/US3.4.1-seat-time-unique`
- 主分支：`main`（受保护，不允许直推）+ `dev`（集成分支）。

### 3.3 PR 流程

- 关联 story id（PR 描述中 `Closes US3.4.1`）→ 至少 1 reviewer → CI 全绿（lint / unit / api / build）→ squash merge 到 dev → release 时 dev → main。
- PR 描述模板（见 `.github/PULL_REQUEST_TEMPLATE.md`）含：
  - 关联 Story
  - 测试结果（覆盖率截图 + 关键 TC- ID 通过情况）
  - 影响范围
  - 部署注意事项

## 4. 测试可追溯性

每个 Jest / Vitest / Playwright 测试文件顶部必须含：

```typescript
// @story USx.x.x
// @tc TC-USx.x.x-NN
```

DevCloud 构建任务用 grep 生成 story 覆盖报告（USx.x.x → 测试文件清单）。

测试函数 `describe` / `it` 名字必须含中文用例描述（与 TC 标题一致），不仅是英文方法名：

```typescript
// ✅ 推荐
describe('US3.4.1 学生预约冲突校验', () => {
  it('TC-US3.4.1-01: 同一座位同一整点不能被两个学生同时预约', async () => {});
});

// ❌ 不推荐
describe('BookingService', () => {
  it('should reject conflict', async () => {});
});
```

## 5. 代码风格

- ESLint + Prettier 强制，CI 失败阻塞合并。
- 不允许 `any` 类型（除非明确 `// eslint-disable-next-line` 含理由）。
- 不允许散落字符串错误码 / 权限点（必须用 `error-codes.ts` / `permissions.ts` 中的 enum）。
- 不允许 `console.log`（用 pino logger）。
- import 顺序：node 内置 → 三方 → `@/` 别名 → 相对路径，组间空行（eslint-plugin-import 自动管理）。

## 6. 文件组织（unit clarity）

- 每个文件应单一职责且 ≤300 行；超出请拆分。
- `service.ts` 业务逻辑；`controller.ts` HTTP；`dto.ts` 校验；`__tests__/` 测试同目录。
- `apps/api/src/<module>/<module>.module.ts` 是 NestJS 模块入口，不放业务代码。

## 7. 架构守卫

- 不修改 `自习室预约/` 目录（设计稿是只读基线，唯一例外见 `design-map.md` §6.3 第 3 条）。
- 不在 `packages/shared-types` 之外重复定义 DTO；前后端契约修改先动 shared-types 再改实现。
- 不改 `.env` 模板字段名（可加新字段）；新增字段必须更新 `tech-stack.md` §4。
- 不引入 `tech-stack.md` §1 白名单之外的运行时依赖；新依赖需 PR review 决议。
- 不引入 `tech-stack.md` §1 设计稿之外的视觉风格；学生端必须复用 `packages/design-tokens` 的 F 与 PATHS。
