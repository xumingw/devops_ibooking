import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import {
  AdminDashboard,
  App,
  requestLogin,
  requestRooms,
  resolveApiBaseUrl,
  resolveSessionKind,
  saveAdminRoom
} from '../../src/App';

const repoRoot = resolve(process.cwd(), '../..');

const successfulLoginResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        accessToken: 'access-token',
        expiresAt: '2026-05-25T12:00:00.000Z',
        user: {
          name: '系统管理员',
          departmentName: null
        },
        roles: [{ name: '超级管理员', code: 'ROLE_FULL_ADMIN' }]
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

const successfulRoomsResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: [
        {
          id: 'room-gm-301',
          name: '经管自习室 301',
          building: '光华楼 A座',
          floor: 3,
          capacity: 48,
          scopeType: 'SCHOOL',
          departmentId: null,
          openHour: 8,
          closeHour: 22,
          overnight: false,
          status: 'ACTIVE'
        }
      ]
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

const successfulRoomResponse = () =>
  new Response(
    JSON.stringify({
      code: 'SUCCESS',
      message: 'success',
      data: {
        id: 'room-cs-lab-b',
        name: '计算机学院自习室 B',
        building: '计算机楼',
        floor: 4,
        capacity: 24,
        scopeType: 'DEPARTMENT',
        departmentId: 'dept-cs',
        openHour: 22,
        closeHour: 7,
        overnight: true,
        status: 'ACTIVE'
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );

describe('统一登录页', () => {
  it('渲染复旦品牌统一登录界面', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('复旦大学');
    expect(html).toContain('自习室预约系统');
    expect(html).toContain('智慧空间管理');
    expect(html).toContain('统一登录');
    expect(html).toContain('统一身份认证');
    expect(html).toContain('学工号');
    expect(html).toContain('请输入学工号');
    expect(html).toContain('Admin123!');
    expect(html).not.toContain('管理入口');
    expect(html).not.toContain('学生入口');
    expect(html).not.toContain('管理端登录');
    expect(html).not.toContain('localhost:5173');
    expect(html).not.toContain('I0 工程骨架');
    expect(html).not.toContain('I1 接入认证');
  });

  it('渲染登录成功后的管理仪表盘', () => {
    const html = renderToStaticMarkup(<AdminDashboard adminName="系统管理员" />);

    expect(html).toContain('管理仪表盘');
    expect(html).toContain('系统管理员');
    expect(html).toContain('2026年4月24日 · 实时数据');
    expect(html).toContain('今日预约总数');
    expect(html).toContain('本周座位利用率热力图');
    expect(html).toContain('自习室实时状态');
    expect(html).toContain('最近预约记录');
    expect(html).toContain('导出报告');
    expect(html).toContain('自习室运行概览');
    expect(html).toContain('退出登录');
  });

  it('统一登录会请求配置的 API 地址并提交学工号密码', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulLoginResponse());

    const session = await requestLogin(
      { account: ' admin_full ', password: 'Admin123!' },
      fetcher,
      'http://xmwhzl.love:13000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/auth/login',
      expect.objectContaining({
        body: JSON.stringify({ studentNo: 'admin_full', password: 'Admin123!' }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
      })
    );
    expect(session.user.name).toBe('系统管理员');
    expect(session.accessToken).toBe('access-token');
  });

  it('学生登录会提交 studentNo 字段', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulLoginResponse());

    await requestLogin(
      { account: ' stu_cse_01 ', password: 'Pass123!' },
      fetcher,
      'http://xmwhzl.love:13000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/auth/login',
      expect.objectContaining({
        body: JSON.stringify({ studentNo: 'stu_cse_01', password: 'Pass123!' })
      })
    );
  });

  it('登录成功后按角色分流到学生或管理视图', () => {
    expect(resolveSessionKind([{ name: '超级管理员', code: 'ROLE_FULL_ADMIN' }])).toBe('admin');
    expect(resolveSessionKind([{ name: '学生', code: 'ROLE_STUDENT' }])).toBe('student');
    expect(
      resolveSessionKind([
        { name: '学生', code: 'ROLE_STUDENT' },
        { name: '数据审计员', code: 'ROLE_AUDIT' }
      ])
    ).toBe('admin');
  });

  it('登录失败时透传后端错误信息', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ code: 'UNAUTHORIZED', message: '账号或密码错误' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401
      })
    );

    await expect(
      requestLogin(
        { account: 'admin_full', password: 'wrong-password' },
        fetcher,
        'http://xmwhzl.love:13000'
      )
    ).rejects.toThrow('账号或密码错误');
  });

  it('生产构建缺少 VITE_API_BASE_URL 时不能回退到 localhost', () => {
    expect(() => resolveApiBaseUrl({ PROD: true })).toThrow(
      '生产构建缺少 VITE_API_BASE_URL'
    );
    expect(resolveApiBaseUrl({ PROD: false })).toBe('http://localhost:3000');
    expect(
      resolveApiBaseUrl({
        PROD: true,
        VITE_API_BASE_URL: 'http://xmwhzl.love:13000/'
      })
    ).toBe('http://xmwhzl.love:13000');
  });

  it('自习室列表请求会携带管理员 token', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulRoomsResponse());

    const rooms = await requestRooms('access-token', fetcher, 'http://xmwhzl.love:13000');

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/rooms',
      expect.objectContaining({
        credentials: 'include',
        headers: { Authorization: 'Bearer access-token' },
        method: 'GET'
      })
    );
    expect(rooms[0].name).toBe('经管自习室 301');
  });

  it('新增自习室会提交开放范围和开放时间', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulRoomResponse());

    await saveAdminRoom(
      {
        name: '计算机学院自习室 B',
        building: '计算机楼',
        floor: 4,
        capacity: 24,
        scopeType: 'DEPARTMENT',
        departmentId: 'dept-cs',
        openHour: 22,
        closeHour: 7,
        overnight: true
      },
      { accessToken: 'access-token' },
      fetcher,
      'http://xmwhzl.love:13000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/rooms',
      expect.objectContaining({
        body: JSON.stringify({
          name: '计算机学院自习室 B',
          building: '计算机楼',
          floor: 4,
          capacity: 24,
          scopeType: 'DEPARTMENT',
          departmentId: 'dept-cs',
          openHour: 22,
          closeHour: 7,
          overnight: true
        }),
        credentials: 'include',
        headers: {
          Authorization: 'Bearer access-token',
          'Content-Type': 'application/json'
        },
        method: 'POST'
      })
    );
  });

  it('支持渲染非默认管理菜单模块', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard adminName="系统管理员" initialActive="rooms" />
    );

    expect(html).toContain('自习室管理');
    expect(html).toContain('共 48 个自习室');
    expect(html).toContain('新增自习室');
    expect(html).toContain('资源状态同步');
    expect(html).toContain('搜索自习室名称、楼栋');
    expect(html).toContain('自习室名称');
    expect(html).toContain('R001');
    expect(html).toContain('08:00–22:00');
    expect(html).toContain('编辑');
    expect(html).toContain('平面图');
    expect(html).not.toContain('管理模块');
    expect(html).not.toContain('本周座位利用率热力图');
  });

  it('渲染座位管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard adminName="系统管理员" initialActive="seats" />
    );

    expect(html).toContain('座位管理');
    expect(html).toContain('搜索座位编号、自习室');
    expect(html).toContain('座位编号');
    expect(html).toContain('经管自习室 301');
    expect(html).toContain('带插座');
    expect(html).toContain('靠窗');
    expect(html).toContain('禁用');
    expect(html).toContain('批量维护');
    expect(html).toContain('定位');
    expect(html).not.toContain('管理模块');
  });

  it('渲染平面图编辑器页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard adminName="系统管理员" initialActive="editor" />
    );

    expect(html).toContain('座位平面图编辑器');
    expect(html).toContain('经管自习室 301 · 光华楼 A座 3楼');
    expect(html).toContain('保存布局');
    expect(html).toContain('预览');
    expect(html).toContain('选择');
    expect(html).toContain('添加座位');
    expect(html).toContain('吸附网格');
    expect(html).toContain('入 口');
    expect(html).toContain('C4');
    expect(html).toContain('属性面板');
    expect(html).toContain('应用更改');
    expect(html).not.toContain('管理模块');
  });

  it('渲染开放时间管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard adminName="系统管理员" initialActive="schedule" />
    );

    expect(html).toContain('开放时间管理');
    expect(html).toContain('全校默认时段');
    expect(html).toContain('07:00–22:00');
    expect(html).toContain('整点时段');
    expect(html).toContain('跨天开放');
    expect(html).toContain('特殊日期优先');
    expect(html).toContain('节假日特殊规则');
    expect(html).toContain('考试周延长');
    expect(html).toContain('闭馆维护');
    expect(html).toContain('未配置时回退默认');
    expect(html).toContain('保存开放时间');
    expect(html).not.toContain('管理模块');
  });

  it('渲染预约记录管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard adminName="系统管理员" initialActive="bookings" />
    );

    expect(html).toContain('预约记录管理');
    expect(html).toContain('共 1,247 条记录（今日）');
    expect(html).toContain('代预约');
    expect(html).toContain('导出 Excel');
    expect(html).toContain('学号、姓名、座位编号');
    expect(html).toContain('批量取消');
    expect(html).toContain('预约ID');
    expect(html).toContain('签到时间');
    expect(html).toContain('BK-1893');
    expect(html).toContain('林晓明');
    expect(html).toContain('待签到');
    expect(html).toContain('违约');
    expect(html).toContain('详情');
    expect(html).not.toContain('管理模块');
  });

  it('渲染违约记录管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard adminName="系统管理员" initialActive="violations" />
    );

    expect(html).toContain('违约记录管理');
    expect(html).toContain('今日新增 18 条');
    expect(html).toContain('处理申诉');
    expect(html).toContain('导出违约');
    expect(html).toContain('学生、学号、预约编号');
    expect(html).toContain('未签到');
    expect(html).toContain('超时取消');
    expect(html).toContain('限制中');
    expect(html).toContain('开始后 15 分钟未签到');
    expect(html).toContain('自动取消');
    expect(html).toContain('申诉中');
    expect(html).toContain('追加备注');
    expect(html).toContain('解除限制');
    expect(html).not.toContain('管理模块');
  });

  it('渲染动态码管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard adminName="系统管理员" initialActive="qrcode" />
    );

    expect(html).toContain('动态码管理');
    expect(html).toContain('每间自习室每日更新');
    expect(html).toContain('生成动态码');
    expect(html).toContain('打印签到码');
    expect(html).toContain('自习室、签到码、楼栋');
    expect(html).toContain('今日已生成');
    expect(html).toContain('异常上报');
    expect(html).toContain('平均刷新');
    expect(html).toContain('网页动态码');
    expect(html).toContain('小程序二维码');
    expect(html).toContain('FD-301-7K2');
    expect(html).toContain('60 秒刷新');
    expect(html).toContain('截图复用拦截');
    expect(html).toContain('重新生成');
    expect(html).toContain('查看日志');
    expect(html).toContain('每日 00:00 自动更新');
    expect(html).not.toContain('管理模块');
  });

  it('生产 CI/CD 只构建和部署统一 Web 入口', () => {
    const workflow = readFileSync(resolve(repoRoot, '.github/workflows/ci.yml'), 'utf8');
    const compose = readFileSync(resolve(repoRoot, 'infra/docker-compose.prod.yml'), 'utf8');
    const deploy = readFileSync(resolve(repoRoot, 'infra/github/deploy.sh'), 'utf8');

    expect(workflow).not.toContain('web-student');
    expect(workflow).not.toContain('WEB_STUDENT');
    expect(compose).not.toContain('web-student');
    expect(compose).not.toContain('WEB_STUDENT');
    expect(deploy).not.toContain('web-student');
    expect(deploy).not.toContain('WEB_STUDENT');
  });
});
