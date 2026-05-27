# 微信小程序调试说明

本目录是复旦大学自习室预约系统的小程序演示端，面向微信开发者工具调试展示，不用于正式上架。

## 打开方式

1. 用微信开发者工具打开 `miniprogram/` 目录。
2. 本地后端默认地址为 `http://localhost:3000`。
3. 在开发者工具详情中关闭“校验合法域名、web-view 域名、TLS 版本以及 HTTPS 证书”。
4. 使用演示账号登录：`stu_cse_01` / `Pass123!`。

## 后端接入范围

- 已真实接入：`POST /api/v1/auth/student-login`、Bearer token 存储、`GET /api/v1/rooms`、`GET /api/v1/health`。
- 演示兜底：座位占用、预约创建、我的预约、扫码签到和智能助手动作。对应后端接口进入后续迭代后，可替换 `miniprogram/miniprogram/services/*` 中的本地数据。

## 后端准备

学生账号需要 `room.read` 和 `seat.read` 权限才能读取房间列表。更新 seed 后请重新执行：

```bash
pnpm --filter api db:seed
```

如果在真机预览中访问本机后端，请把“我的 → 后端连接”的地址改成电脑的局域网 IP，例如 `http://192.168.1.23:3000`。
