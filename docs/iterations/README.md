# 迭代执行 brief 索引

> 本目录是 agent 执行各迭代时的输入。与之配对的人工跟踪文档是仓库根目录的 `自习座位预约系统_Story测试描述清单.md`（Bucket A）。
> 本目录由 `docs/superpowers/specs/2026-04-25-ibooking-requirements-management-design.md` 中 §1 文件布局定义。

## Agent 阅读顺序（每个迭代独立）

执行迭代 Ix 前必读（按顺序）：

1. `_shared/tech-stack.md` — 技术栈与目录布局基线（不可偏离）
2. `_shared/conventions.md` — 命名 / 提交 / 分支 / 测试 ID 规范
3. `_shared/design-map.md` — 关联设计稿映射（含兜底约定）
4. `_shared/done-definition.md` — Story 级 + 迭代级 DoD + 测试七字段契约
5. `iteration-Ix.md` — 当前迭代 brief（自包含，含完整 task 清单 / 实现要点 / 关键 TC 七字段描述 / 演示脚本）
6. （仅参考）`自习室预约/Fudan Study System.html` — 通过 HTTP server 打开（非 file://），对照 artboard

## 禁止行为（agent 必读）

- **跳到 Bucket A 找上下文**：brief 应自包含；如发现缺，先补 brief 再开工。
- **修改 `自习室预约/` 目录**：设计稿是只读基线；唯一例外是 design-map.md §6.3 第 3 条（新建画板）—— I3 允许新建教室大屏画板（`room-display.jsx`），I6 拉伸启用时允许新建 AI 配置画板（`ai-config.jsx`）。
- **引入 `_shared/tech-stack.md` 白名单之外的运行时依赖**：新依赖需 PR review 决议。
- **在 `packages/shared-types` 之外重复定义 DTO**：前后端契约修改先动 shared-types。
- **绕过 `_shared/done-definition.md` §测试七字段契约**：缺任一字段的 TC 拒绝合并。

## 迭代清单

| ID | 文件 | 主题 | 时长 | 入口前置 | 故事数（P0/P1/P2） |
|---|---|---|---|---|---|
| I0 | iteration-I0.md | 项目治理与骨架 | 1 周 | 无 | 10 (10/0/0) |
| I1 | iteration-I1.md | 账号、RBAC、资源 CRUD | 2 周 | I0 全部 P0 done | 15 (13/2/0) |
| I2 | iteration-I2.md | 规则引擎 + 预约核心 | 2 周 | I1 全部 P0 done | 21 (17/3/1) |
| I3 | iteration-I3.md | 预约闭环 + 签到/违约 + 首次部署 | 2 周 | I2 全部 P0 done | 22 (17/5/0) |
| I4 | iteration-I4.md | 管理端运营 + 流水线集成 | 2 周 | I3 全部 P0 done | 21 (10/10/1) |
| I5 | iteration-I5.md | AI 助手（规则）+ 报表 + 拉伸 | 2 周 | I4 全部 P0 done | 22 (1/9/12) |
| I6 | iteration-I6.md | LLM polish + 最终交付 | 1 周 | I5 主线 done | 4 (2/0/2) |

**总故事数：** 详见 Bucket A 实际数 = 118 story；上表 Σ ≈ 115（部分 story 跨多迭代如 US8.1.1、US8.2.x，仅在最早出现的迭代列入）。

## 关键里程碑对齐课程阶段

- **第一阶段 Review（第 5 周）：** 完成 I0–I2，主要架构 + 一半 P0 功能。
- **第二阶段 Review（第 12–13 周）：** 完成 I3–I4，DevOps 流水线在 GitHub 上跑通 + P0 业务功能闭环。
- **期末展示：** 完成 I5–I6，智能化 + 拉伸 + 最终演示。

## 共享文档

- [tech-stack.md](_shared/tech-stack.md) — 7 节：运行时版本、选型理由、仓库布局、env、端口、命名、守卫。
- [conventions.md](_shared/conventions.md) — 7 节：命名、ID 规则、提交分支、测试可追溯、代码风格、文件组织、架构守卫。
- [done-definition.md](_shared/done-definition.md) — Story 级 DoD + 迭代级 DoD + **测试七字段契约（hard rule）**。
- [design-map.md](_shared/design-map.md) — Artboard ↔ Story 双向映射 + 无 mockup 兜底约定 + 守卫强化。

## Bucket A ↔ Bucket B 一致性维护

如果 Bucket A（`自习座位预约系统_Story测试描述清单.md`）的某条 story 内容变更，对应迭代的 brief §4 / §7 必须同步更新。

**当前 Bucket A 修订版本：** 2026-04-25 v1（首次扩展 + 100 故事任务 checklist + 测试目的 + 关联设计稿 + 4 拉伸标记）。

**当前 Bucket B 创建版本：** 2026-04-25 v1（首次完整生成）。

## 拉伸（stretch）规则

两类拉伸目标，agent 在执行 I5 / I6 时按以下规则处理：

1. **微信小程序适配**（US4.5.2 + US5.2.2）—— I5 拉伸；启用前提见 iteration-I5.md §10。如未启用，I6 不再做。
2. **LLM 增强**（US7.6.1 + US7.6.2）—— I6 拉伸；启用前提：团队同意 + 有 API key 预算。如未启用，I6 退化为纯文档 + 交付迭代。

两个拉伸都**不影响 P0 主线交付**，可独立决策。
