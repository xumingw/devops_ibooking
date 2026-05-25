# 技术栈契约 (frozen)

> 本文件是 agent 执行任何迭代时的强制基线。任何偏离（替换框架、版本、依赖、命名规则、目录布局）都必须先修改本文件并经人工 review。
> 来源: `docs/superpowers/specs/2026-04-25-ibooking-requirements-management-design.md` §3
> 最后更新: 2026-04-25

## 1. 运行时与版本（冻结）

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
| 拉伸（mini-program）| Taro 4 (React 语法) | latest |

## 2. 选型理由（agent 不允许自由替换）

- **Prisma 优先于 TypeORM**：迁移 story 一流，TS 类型自动生成；复杂查询用 `$queryRaw` 兜底。
- **BullMQ + Redis 一体化**：处理 +15min 自动取消、+15min/+10min 提醒推送、每日二维码轮换（唯一队列基础设施，不引入 Quartz / node-schedule）。
- **Ant Design 仅在 web-admin**：表格 / 表单 / 抽屉密集，AntD 节省时间。Primary color 必须设为 `F.navy`。
- **学生端不引入 AntD**：保留 mockup 风格识别度，沿用 inline-style + design-tokens。
- **两个独立 Vite 应用**（web-student / web-admin）：bundle 小、RBAC 菜单逻辑简单、可独立部署。
- **拉伸 Taro 4 (React) 而非微信原生**：可复用 `packages/shared-types` 与 `packages/design-tokens`，比 WXML/WXSS 重写代价低。

## 3. 仓库布局（pnpm workspaces，无 Turbo）

```
ibooking/
├── apps/
│   ├── api/               # NestJS
│   ├── web-student/       # React 学生 PC（响应式覆盖移动端断点）
│   ├── web-admin/         # React 管理 PC
│   └── miniapp/           # 拉伸: Taro 4（仅 I5+ 拉伸触发时创建）
├── packages/
│   ├── shared-types/      # DTO + Zod schema（前后端契约源头）
│   └── design-tokens/     # F + PATHS 从 fudan-tokens.jsx 移植到 TS
├── infra/
│   ├── docker-compose.yml          # 本地：api + mysql + redis + mailhog
│   ├── docker-compose.prod.yml     # CI/CD 目标
│   ├── nginx/                      # 服务静态前端
│   └── github/                     # deploy.sh + GitHub Actions 环境模板
├── .github/
│   └── workflows/                  # GitHub Actions CI/CD workflow yaml
├── docs/iterations/       # Bucket B（本目录）
├── 自习室预约/             # 原始设计稿（agent 只读基线）
├── 自习座位预约系统_Story测试描述清单.md   # Bucket A
└── pnpm-workspace.yaml
```

## 4. 环境变量契约

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
# QR code signing (US5.1.2)
QRCODE_HMAC_SECRET=
```

## 5. 端口（dev）

| 服务 | 端口 |
|---|---|
| API | 3000 |
| web-student | 5173 |
| web-admin | 5174 |
| MySQL | 3306 |
| Redis | 6379 |
| MailHog | 8025 |

## 6. 命名规范

- **数据库表**：`snake_case`（user, role, permission, role_permission, user_role, room, seat, booking, booking_slot, violation, check_in_code, reminder_log, audit_log, system_param, ai_chat_session, ai_chat_message, announcement, notification_template, favorite, refresh_token）。
- **HTTP 路径**：`/api/v1/<resource>`，REST + 复数；分页 `?page&size`；排序 `?sort=field,asc|desc`。
- **DTO**：`PascalCase` + 后缀 `…Dto` / `…ResponseDto`；每个 DTO 必须在 `packages/shared-types` 中有 Zod schema。
- **测试可追溯性**：每个 Jest / Vitest / Playwright 测试文件顶部必须含 `// @story USx.x.x` `// @tc TC-USx.x.x-NN`；构建任务 grep 生成 story 覆盖报告。
- **提交**：Conventional Commits + story id 前缀，例 `feat(US3.4.1): add seat-time uniqueness constraint`。
- **分支**：`feature/<story-id>-<slug>`，PR 至少 1 人 review，合并后删除 feature 分支。

## 7. 守卫（agent 必读）

- 不修改 `自习室预约/` 目录（设计稿是只读基线，唯一例外见 design-map.md §6.3 第 3 条）
- 不在 `packages/shared-types` 之外重复定义 DTO
- 不改 `.env` 模板字段名（可加新字段）
- 不引入 §1 技术栈白名单之外的运行时依赖
- 不引入 §1 设计稿之外的视觉风格
