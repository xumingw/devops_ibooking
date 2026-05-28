// @story US1.2.1
// @tc TC-US1.2.1-01
// @story US1.3.3
// @tc TC-US1.3.3-01
import { ErrorCode, User } from '@ibooking/shared-types';
import {
  NormalizedUserListFilters,
  UserRepository,
  UsersService
} from '../../../src/users/users.service';

class MemoryUserRepository implements UserRepository {
  lastFilters: NormalizedUserListFilters = {};

  constructor(private readonly users: User[]) {}

  async list(filters: NormalizedUserListFilters): Promise<User[]> {
    this.lastFilters = filters;
    return this.users
      .filter((user) => !filters.status || user.status === filters.status)
      .filter((user) => !filters.departmentId || user.departmentId === filters.departmentId)
      .filter(
        (user) => !filters.roleCode || user.roles?.some((role) => role.code === filters.roleCode)
      )
      .filter((user) => {
        if (!filters.keyword) return true;
        const keyword = filters.keyword.toLowerCase();
        return [user.studentNo, user.name, user.email, user.departmentName]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(keyword));
      })
      .map((user) => ({ ...user, roles: user.roles?.map((role) => ({ ...role })) }));
  }
}

describe('UsersService', () => {
  let repository: MemoryUserRepository;
  let service: UsersService;

  beforeEach(() => {
    repository = new MemoryUserRepository([
      userFixture({
        id: 'user-stu-cse-01',
        studentNo: 'stu_cse_01',
        name: '林晓明',
        email: 'stu_cse_01@fudan.edu.cn',
        departmentId: 'dept-cs',
        departmentName: '计算机学院',
        roles: [{ id: 'role-student', code: 'ROLE_STUDENT', name: '学生' }]
      }),
      userFixture({
        id: 'user-room-admin-01',
        studentNo: 'roomAdmin01',
        name: '李思源',
        email: 'roomAdmin01@fudan.edu.cn',
        departmentId: null,
        departmentName: null,
        roles: [{ id: 'role-room-admin', code: 'ROLE_ROOM_ADMIN', name: '自习室管理员' }]
      }),
      userFixture({
        id: 'user-disabled',
        studentNo: 'stu_disabled',
        name: '停用学生',
        email: 'stu_disabled@fudan.edu.cn',
        departmentId: 'dept-cs',
        departmentName: '计算机学院',
        status: 'DISABLED',
        roles: [{ id: 'role-student', code: 'ROLE_STUDENT', name: '学生' }]
      })
    ]);
    service = new UsersService(repository);
  });

  it('返回用户列表并按学工号排序，供后台用户管理页展示', async () => {
    const users = await service.listUsers();

    expect(users.map((user) => user.studentNo)).toEqual([
      'roomAdmin01',
      'stu_cse_01',
      'stu_disabled'
    ]);
    expect(users[0]).toMatchObject({
      name: '李思源',
      roles: [{ code: 'ROLE_ROOM_ADMIN', name: '自习室管理员' }]
    });
  });

  it('归一化关键词、状态和角色筛选条件后查询用户', async () => {
    const users = await service.listUsers({
      keyword: '  计算机  ',
      status: 'ACTIVE',
      roleCode: ' ROLE_STUDENT '
    });

    expect(repository.lastFilters).toEqual({
      keyword: '计算机',
      status: 'ACTIVE',
      roleCode: 'ROLE_STUDENT'
    });
    expect(users.map((user) => user.studentNo)).toEqual(['stu_cse_01']);
  });

  it('按院系筛选时只返回该院系用户', async () => {
    const users = await service.listUsers({ departmentId: ' dept-cs ' });

    expect(repository.lastFilters).toEqual({ departmentId: 'dept-cs' });
    expect(users.map((user) => user.studentNo)).toEqual(['stu_cse_01', 'stu_disabled']);
  });

  it('拒绝非法用户状态筛选值', async () => {
    await expect(service.listUsers({ status: 'LOCKED' })).rejects.toMatchObject({
      response: expect.objectContaining({ code: ErrorCode.VALIDATION_FAILED })
    });
  });
});

function userFixture(input: {
  id: string;
  studentNo: string;
  name: string;
  email: string;
  departmentId: string | null;
  departmentName: string | null;
  status?: User['status'];
  roles?: NonNullable<User['roles']>;
}): User {
  return {
    id: input.id,
    studentNo: input.studentNo,
    name: input.name,
    email: input.email,
    departmentId: input.departmentId,
    departmentName: input.departmentName,
    status: input.status ?? 'ACTIVE',
    roles: input.roles ?? []
  };
}
