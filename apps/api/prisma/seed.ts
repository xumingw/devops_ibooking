import { PrismaClient } from '@prisma/client';
import { PasswordHasher } from '../src/auth/password-hasher';

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
    upsertPermission('perm-room-read', 'room.read', '查看自习室', 'rooms'),
    upsertPermission('perm-room-write', 'room.write', '维护自习室', 'rooms'),
    upsertPermission('perm-seat-write', 'seat.write', '维护座位', 'seats'),
    upsertPermission('perm-report-read', 'report.read', '查看报表', 'reports')
  ]);

  const [studentRole, fullAdminRole, roomAdminRole, auditRole] = roles;
  const [bookingCreate, roomRead, roomWrite, seatWrite, reportRead] = permissions;

  await linkRolePermissions(studentRole.id, [bookingCreate.id]);
  await linkRolePermissions(fullAdminRole.id, permissions.map((permission) => permission.id));
  await linkRolePermissions(roomAdminRole.id, [roomRead.id, roomWrite.id, seatWrite.id]);
  await linkRolePermissions(auditRole.id, [roomRead.id, reportRead.id]);

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

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  });
