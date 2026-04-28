# Definition of Done

> 来源: `docs/superpowers/specs/2026-04-25-ibooking-requirements-management-design.md` §5.3 / §5.4 / §5.2
> 应用范围: Bucket A 每条 story 的关闭准则 + Bucket B 每个迭代的退出准则。

## Story 级 DoD（每条 story 关闭前必须 tick）

- [ ] 所有 task checkbox 全部勾掉
- [ ] 所有 TC 用例都有具体实现（手工或自动）且全部 pass
- [ ] 至少 1 条用例自动化（P0 必须自动化，P1 推荐自动化）
- [ ] 单元测试行覆盖率 ≥70%（对应模块）
- [ ] PR 合入 main 时 commit 含 `feat(USx.x.x):` 前缀
- [ ] 设计稿对照走查通过（关联 artboard 视觉/交互一致）
- [ ] OpenAPI / DB schema 变更已同步到 `packages/shared-types`
- [ ] 没有引入 `tech-stack.md` 白名单之外的依赖
- [ ] CHANGELOG.md 追加一行（按 story id）

## 迭代级 DoD

- [ ] 全部 P0 story 已 Done（Story 级 DoD 全绿）
- [ ] 流水线：lint / unit / api / build / deploy 五关在 main 自动执行并 green
- [ ] 仓库级测试行覆盖率 ≥70%
- [ ] 演示脚本（brief §9）在干净环境上能完整跑过 1 遍
- [ ] DB schema 在下一迭代不需要破坏性变更（如有，必须列入 brief §12 交接说明）
- [ ] 已为下迭代准备的产物归档完毕（migration 文件、OpenAPI snapshot、CodeArts pipeline yaml）

## 测试用例描述七字段契约（hard rule，不可妥协）

每条测试用例（Bucket A 的 TC- 条目、迭代 brief §7、真实代码里的 Jest/Vitest/Playwright 测试）必须含以下七字段，缺一不可。**禁止 "见 Bucket A" 之类的指针；重复成本可接受，缺描述不可接受。**

### 七字段最小集

1. **测试目的**（一句话说清楚为什么写这条用例）
2. **测试类型**（单元 / 接口 / E2E / 流程验收 / 负向 / 并发）
3. **前置条件**（依赖的 story、需要预置的数据）
4. **测试数据**（具体到账号、座位号、时间值——禁止 "随便一个学生"）
5. **操作步骤**（编号步骤，每步一行）
6. **Assert 断言**（每步对应一个 assert，写出预期值或断言表达式）
7. **后置处理**（数据回滚、状态清理）

### 示例（合规）

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
    1. 用 stu_cse_01 token 调用 POST /api/v1/bookings, body={seatId:"A001", startAt:"2026-05-01T19:00:00+08:00", endAt:"2026-05-01T20:00:00+08:00"}.
    2. 在第 1 步响应返回前 50ms 内，用 stu_mgmt_01 token 并发调用同一接口、同样的座位与时段。
    3. 等待两个响应。
    4. 查询数据库 booking_slot 表中该座位该时段的记录数。
  - **Assert 断言**：
    - Step 1: `assert response_1.status == 201`
    - Step 2: `assert response_2.status == 409 && response_2.body.code == "BOOKING_SLOT_TAKEN"`
    - Step 3: `assert (response_1, response_2) 中恰好一个 201、一个 409`
    - Step 4: `assert db.booking_slot.count(seat="A001", slot_start="2026-05-01T19:00") == 1`
  - **后置处理**：删除测试期间创建的 booking 记录；释放座位；不影响其他用例。
```

### 反模式（自动 reject）

- "测试目的：验证冲突。" → 太宽泛，必须说清楚 *谁* 在 *什么场景* 下会冲突、防什么后果。
- "测试数据：随便一个学生。" → 必须给具体账号 ID（与 Bucket A §0.x.1 公共测试账号对齐）。
- 把 assert 写成 "结果正确" → 必须给具体表达式或预期值。
- 在 brief 里只写 `TC-US3.4.1-01` 让 agent 翻 Bucket A → 必须把完整描述复制进 brief。
- 对 P0 story 只有 1 条正向用例 → 必须再加 1 条负向 / 边界用例。

### 正向 / 负向覆盖要求

- 每条 P0 story 至少 1 条正向用例 + 1 条负向 / 边界用例。
- 边界用例必须穷举到具体值（4 小时上限 → 4h 应通过、4h+1min 应拒绝）。
- 并发用例（如 F3.4）必须显式声明并发模型（fixed-time race 或 多请求 stress）。
