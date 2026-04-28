# I0 数据字典

I0 只冻结核心表结构和关键约束，不实现业务服务。

| 表 | 说明 | 关键约束 |
|---|---|---|
| `user` | 学生、管理员、运维账号统一用户表 | `student_no` 唯一，`email` 唯一 |
| `department` | 院系信息 | `code`、`name` 唯一 |
| `role` | RBAC 角色 | `code` 唯一 |
| `permission` | RBAC 权限与菜单权限 | `code` 唯一 |
| `role_permission` | 角色权限关联 | `(role_id, permission_id)` 复合主键 |
| `user_role` | 用户角色关联 | `(user_id, role_id)` 复合主键 |
| `room` | 自习室 | `name` 唯一，支持院系限制与开放时间 |
| `seat` | 座位 | `(room_id, code)` 唯一，含电源/靠窗标记 |
| `room_schedule` | 特殊日期开放规则 | `(room_id, date)` 唯一 |
| `booking` | 预约主表 | 按用户/座位时间建立查询索引 |
| `booking_slot` | 整点预约冲突锁表 | `(seat_id, slot_start)` 唯一，支撑并发冲突控制 |
| `violation` | 违约记录 | `booking_id` 唯一 |
| `check_in_code` | 每教室每日动态签到码 | `(room_id, valid_at)` 唯一 |
| `reminder_log` | 提醒发送记录 | `(booking_id, type)` 查询索引 |
| `audit_log` | 管理操作审计 | `(actor_id, created_at)` 查询索引 |
| `system_param` | 系统参数 | `key` 唯一 |
