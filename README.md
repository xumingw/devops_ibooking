# 复旦大学自习室预约系统

本仓库是 DevOps 课程项目的 I0 工程骨架。当前阶段只交付可运行的前后端基础设施、共享契约、数据库迁移与 CI 模板，不实现登录、预约、签到等业务功能。

## 本地启动

```bash
pnpm install
docker compose -f infra/docker-compose.yml up -d
pnpm --filter api db:migrate:dev
pnpm dev
```

启动后访问：

- 学生端：http://localhost:5173
- 管理端：http://localhost:5174
- API 健康检查：http://localhost:3000/api/v1/health
- MailHog：http://localhost:8025

## 数据库迁移

```bash
pnpm --filter api db:migrate:dev
pnpm --filter api prisma:generate
```

I0 已提交 `0001_init` 与 `0002_full_schema` 两个迁移目录，后续迭代只追加迁移，不直接修改已提交迁移。

## 常用命令

```bash
pnpm lint
pnpm test
pnpm build
pnpm openapi:export
```

## GitHub 协作

- `main` 分支应开启保护：禁止直推，PR 至少 1 人 review，CI 全绿后合并。
- `dev` 是日常集成分支，所有 `feature/<story-id>-<slug>` 分支通过 PR 合入 `dev`，合并后删除 feature 分支。
- `main` 是发布分支，只允许 `dev -> main` 的发布 PR。
- Story 和测试用例在 GitHub Projects / GitHub Issues 中跟踪。
- CI/CD 使用 `.github/workflows/ci.yml`，详细规则见 `docs/deployment/github-actions.md`。

## 演示账号

I0 不包含登录功能。演示账号会在 I1 的认证与 RBAC 迭代中通过种子数据提供。
