import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { AdminDashboard, requestUsers } from '../../../src/App';
import { successfulUsersResponse } from '../helpers/api-responses';

describe('users', () => {
  it('用户列表请求会携带管理员 token 和筛选条件', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulUsersResponse());

    const users = await requestUsers(
      'access-token',
      {
        keyword: '  计算机  ',
        status: 'ACTIVE',
        roleCode: 'ROLE_STUDENT'
      },
      fetcher,
      'http://xmwhzl.love:13000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/users?keyword=%E8%AE%A1%E7%AE%97%E6%9C%BA&status=ACTIVE&roleCode=ROLE_STUDENT',
      expect.objectContaining({
        credentials: 'include',
        headers: { Authorization: 'Bearer access-token' },
        method: 'GET'
      })
    );
    expect(users[0]).toMatchObject({
      studentNo: 'stu_cse_01',
      name: '林晓明',
      departmentName: '计算机学院',
      roles: [{ code: 'ROLE_STUDENT', name: '学生' }]
    });
  });

  it('渲染用户管理页面', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard adminName="系统管理员" initialActive="users" />
    );

    expect(html).toContain('用户管理');
    expect(html).toContain('学生与管理员账号统一维护');
    expect(html).toContain('新增用户');
    expect(html).toContain('导入名单');
    expect(html).toContain('姓名、学号、院系');
    expect(html).toContain('学生账号');
    expect(html).toContain('管理员');
    expect(html).toContain('停用账号');
    expect(html).toContain('账号列表');
    expect(html).toContain('最近更新');
    expect(html).toContain('林晓明');
    expect(html).toContain('22302010001');
    expect(html).toContain('admin_full');
    expect(html).toContain('room_admin_01');
    expect(html).toContain('分配角色');
    expect(html).toContain('重置密码');
    expect(html).toContain('停用');
    expect(html).toContain('启用');
    expect(html).toContain('学工号统一认证同步');
    expect(html).toContain('菜单级权限由角色权限模块控制');
    expect(html).not.toContain('管理模块');
  });
});
