import { PrismaClient } from '@prisma/client';
import { PasswordHasher } from '../src/auth/password-hasher';
import { STUDENT_PERMISSION_CODES } from './seed-permissions';

const prisma = new PrismaClient();
const hasher = new PasswordHasher();

async function main() {
  const cs = await prisma.department.upsert({
    where: { code: 'CS' },
    update: { name: '计算机学院' },
    create: { id: 'dept-cs', code: 'CS', name: '计算机学院' }
  });

  const roles = await Promise.all([
    upsertRole('role-student', 'ROLE_STUDENT', '学生'),
    upsertRole('role-full-admin', 'ROLE_FULL_ADMIN', '超级管理员'),
    upsertRole('role-room-admin', 'ROLE_ROOM_ADMIN', '自习室管理员'),
    upsertRole('role-audit', 'ROLE_AUDIT', '数据审计员')
  ]);

  const permissions = await Promise.all([
    upsertPermission('perm-booking-create', 'booking.create', '创建预约', 'bookings'),
    upsertPermission('perm-booking-read', 'booking.read', '查看预约', 'bookings'),
    upsertPermission('perm-room-read', 'room.read', '查看自习室', 'rooms'),
    upsertPermission('perm-room-write', 'room.write', '维护自习室', 'rooms'),
    upsertPermission('perm-seat-read', 'seat.read', '查看座位', 'seats'),
    upsertPermission('perm-seat-write', 'seat.write', '维护座位', 'seats'),
    upsertPermission('perm-violation-read', 'violation.read', '查看违约', 'violations'),
    upsertPermission('perm-checkin-code-manage', 'checkin_code.manage', '管理动态码', 'qrcode'),
    upsertPermission('perm-user-read', 'user.read', '查看用户', 'users'),
    upsertPermission('perm-role-assign', 'role.assign', '分配角色', 'roles'),
    upsertPermission('perm-param-write', 'param.write', '维护系统参数', 'params'),
    upsertPermission('perm-audit-read', 'audit.read', '查看审计日志', 'audit'),
    upsertPermission('perm-report-read', 'report.read', '查看报表', 'reports')
  ]);

  const [studentRole, fullAdminRole, roomAdminRole, auditRole] = roles;
  const permissionByCode = Object.fromEntries(
    permissions.map((permission) => [permission.code, permission])
  );
  const permissionIds = (codes: readonly string[]) =>
    codes.map((code) => permissionByCode[code].id);

  await linkRolePermissions(studentRole.id, permissionIds(STUDENT_PERMISSION_CODES));
  await linkRolePermissions(fullAdminRole.id, permissions.map((permission) => permission.id));
  await linkRolePermissions(roomAdminRole.id, [
    permissionByCode['room.read'].id,
    permissionByCode['room.write'].id,
    permissionByCode['seat.read'].id,
    permissionByCode['seat.write'].id,
    permissionByCode['checkin_code.manage'].id
  ]);
  await linkRolePermissions(auditRole.id, [
    permissionByCode['booking.read'].id,
    permissionByCode['room.read'].id,
    permissionByCode['violation.read'].id,
    permissionByCode['audit.read'].id,
    permissionByCode['report.read'].id
  ]);

  await upsertUser({
    id: 'user-stu-cse-01',
    studentNo: 'stu_cse_01',
    name: '林晓明',
    email: 'stu_cse_01@fudan.edu.cn',
    password: 'Pass123!',
    departmentId: cs.id,
    status: 'ACTIVE',
    roleIds: [studentRole.id]
  });

  await upsertUser({
    id: 'user-stu-disabled',
    studentNo: 'stu_disabled',
    name: '停用学生',
    email: 'stu_disabled@fudan.edu.cn',
    password: 'Pass123!',
    departmentId: cs.id,
    status: 'DISABLED',
    roleIds: [studentRole.id]
  });

  await upsertUser({
    id: 'user-admin-full',
    studentNo: 'admin_full',
    name: '王建华',
    email: 'admin_full@fudan.edu.cn',
    password: 'Admin123!',
    departmentId: null,
    status: 'ACTIVE',
    roleIds: [fullAdminRole.id]
  });

  await upsertUser({
    id: 'user-room-admin-01',
    studentNo: 'roomAdmin01',
    name: '李思源',
    email: 'roomAdmin01@fudan.edu.cn',
    password: 'Admin123!',
    departmentId: null,
    status: 'ACTIVE',
    roleIds: [roomAdminRole.id]
  });

  await upsertUser({
    id: 'user-audit-01',
    studentNo: 'audit01',
    name: '周明',
    email: 'audit01@fudan.edu.cn',
    password: 'Admin123!',
    departmentId: null,
    status: 'ACTIVE',
    roleIds: [auditRole.id]
  });

  await upsertUser({
    id: 'user-no-perm-01',
    studentNo: 'noPerm01',
    name: '无权限账号',
    email: 'noPerm01@fudan.edu.cn',
    password: 'Admin123!',
    departmentId: null,
    status: 'ACTIVE',
    roleIds: []
  });

  await upsertRoom({
    id: 'room-gm-301',
    name: '经管自习室 301',
    building: '光华楼 A座',
    floor: 3,
    capacity: 48,
    scopeType: 'SCHOOL',
    departmentId: null,
    openHour: 8,
    closeHour: 22,
    overnight: false
  });

  await upsertRoom({
    id: 'room-science-201',
    name: '理工自习室 201',
    building: '理科楼',
    floor: 2,
    capacity: 36,
    scopeType: 'SCHOOL',
    departmentId: null,
    openHour: 7,
    closeHour: 24,
    overnight: false
  });

  await upsertRoom({
    id: 'room-humanities-a',
    name: '文史馆阅览室 A',
    building: '文史馆',
    floor: 1,
    capacity: 72,
    scopeType: 'SCHOOL',
    departmentId: null,
    openHour: 9,
    closeHour: 21,
    overnight: false
  });

  await upsertRoom({
    id: 'room-cs-lab-b',
    name: '计算机学院自习室 B',
    building: '计算机楼',
    floor: 4,
    capacity: 24,
    scopeType: 'DEPARTMENT',
    departmentId: cs.id,
    openHour: 22,
    closeHour: 7,
    overnight: true
  });

  await upsertRoom({
    id: 'room-news-seminar',
    name: '新闻学院研讨室',
    building: '新闻学院楼',
    floor: 4,
    capacity: 20,
    scopeType: 'SCHOOL',
    departmentId: null,
    openHour: 9,
    closeHour: 20,
    overnight: false
  });

  await upsertRoom({
    id: 'room-science-403',
    name: '理工自习室 403',
    building: '逸夫楼',
    floor: 4,
    capacity: 56,
    scopeType: 'SCHOOL',
    departmentId: null,
    openHour: 8,
    closeHour: 23,
    overnight: false
  });

  await upsertRoom({
    id: 'room-library-zone',
    name: '图书馆自习区',
    building: '李兆基图书馆',
    floor: 2,
    capacity: 120,
    scopeType: 'SCHOOL',
    departmentId: null,
    openHour: 8,
    closeHour: 22,
    overnight: false
  });

  await Promise.all([
    upsertSeat({
      id: 'seat-gm-301-c3',
      roomId: 'room-gm-301',
      code: 'C3',
      x: 3,
      y: 3,
      hasPower: true,
      nearWindow: false
    }),
    upsertSeat({
      id: 'seat-science-201-f12',
      roomId: 'room-science-201',
      code: 'F12',
      x: 6,
      y: 2,
      hasPower: true,
      nearWindow: true
    }),
    upsertSeat({
      id: 'seat-humanities-a-a5',
      roomId: 'room-humanities-a',
      code: 'A5',
      x: 1,
      y: 1,
      hasPower: false,
      nearWindow: true
    })
  ]);

  await Promise.all([
    upsertFavorite('favorite-stu-gm-301', 'user-stu-cse-01', 'room-gm-301'),
    upsertFavorite('favorite-stu-science-201', 'user-stu-cse-01', 'room-science-201'),
    upsertFavorite('favorite-stu-humanities-a', 'user-stu-cse-01', 'room-humanities-a')
  ]);
}

async function upsertRole(id: string, code: string, name: string) {
  return prisma.role.upsert({
    where: { code },
    update: { name },
    create: { id, code, name }
  });
}

async function upsertPermission(id: string, code: string, name: string, menuKey: string) {
  return prisma.permission.upsert({
    where: { code },
    update: { name, menuKey },
    create: { id, code, name, menuKey }
  });
}

async function linkRolePermissions(roleId: string, permissionIds: string[]) {
  await prisma.rolePermission.deleteMany({ where: { roleId } });
  await prisma.rolePermission.createMany({
    data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
    skipDuplicates: true
  });
}

async function upsertUser(input: {
  id: string;
  studentNo: string;
  name: string;
  email: string;
  password: string;
  departmentId: string | null;
  status: 'ACTIVE' | 'DISABLED';
  roleIds: string[];
}) {
  const user = await prisma.user.upsert({
    where: { studentNo: input.studentNo },
    update: {
      name: input.name,
      email: input.email,
      passwordHash: hasher.hash(input.password),
      departmentId: input.departmentId,
      status: input.status
    },
    create: {
      id: input.id,
      studentNo: input.studentNo,
      name: input.name,
      email: input.email,
      passwordHash: hasher.hash(input.password),
      departmentId: input.departmentId,
      status: input.status
    }
  });

  await prisma.userRole.deleteMany({ where: { userId: user.id } });
  await prisma.userRole.createMany({
    data: input.roleIds.map((roleId) => ({ userId: user.id, roleId })),
    skipDuplicates: true
  });
}

async function upsertRoom(input: {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  scopeType: 'SCHOOL' | 'DEPARTMENT';
  departmentId: string | null;
  openHour: number;
  closeHour: number;
  overnight: boolean;
}) {
  await prisma.room.upsert({
    where: { name: input.name },
    update: {
      building: input.building,
      floor: input.floor,
      capacity: input.capacity,
      scopeType: input.scopeType,
      departmentId: input.departmentId,
      openHour: input.openHour,
      closeHour: input.closeHour,
      overnight: input.overnight,
      status: 'ACTIVE'
    },
    create: {
      ...input,
      status: 'ACTIVE'
    }
  });
}

async function upsertSeat(input: {
  id: string;
  roomId: string;
  code: string;
  x: number;
  y: number;
  hasPower: boolean;
  nearWindow: boolean;
}) {
  await prisma.seat.upsert({
    where: {
      roomId_code: {
        roomId: input.roomId,
        code: input.code
      }
    },
    update: {
      x: input.x,
      y: input.y,
      hasPower: input.hasPower,
      nearWindow: input.nearWindow,
      status: 'ACTIVE'
    },
    create: {
      ...input,
      status: 'ACTIVE'
    }
  });
}

async function upsertFavorite(id: string, userId: string, roomId: string) {
  await prisma.favorite.upsert({
    where: {
      userId_roomId: {
        userId,
        roomId
      }
    },
    update: {},
    create: {
      id,
      userId,
      roomId
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  });
