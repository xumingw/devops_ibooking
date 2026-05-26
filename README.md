# 复旦大学自习室预约系统

本仓库是 DevOps 课程项目的自习室预约系统工程仓库。当前默认运行一个统一 Web 入口：学生和管理员共用同一登录页，通过 `POST /api/v1/auth/login` 提交学工号和密码，登录后根据后端返回的角色与权限进入学生首页或管理后台。

## 本地启动

```bash
pnpm install
docker compose -f infra/docker-compose.yml up -d
pnpm --filter api db:migrate:dev
pnpm --filter api db:seed
pnpm dev
```

启动后访问：

- 统一 Web 入口：http://localhost:5174
- API 健康检查：http://localhost:3000/api/v1/health
- MailHog：http://localhost:8025

`apps/web-student` 目录暂时保留为历史学生端骨架和后续页面迁移来源，但默认本地启动、CI/CD 镜像构建和生产部署都以 `apps/web-admin` 承载统一入口。

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

执行 `pnpm --filter api db:seed` 后可使用：

- 管理员：`admin_full` / `Admin123!`
- 学生：`stu_cse_01` / `Pass123!`
