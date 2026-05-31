import { STUDENT_PERMISSION_CODES } from '../../../prisma/seed-permissions';

describe('seed permissions', () => {
  it('学生角色只包含学生端预约权限，不继承后台资源读取权限', () => {
    expect(STUDENT_PERMISSION_CODES).toEqual(['booking.create']);
    expect(STUDENT_PERMISSION_CODES).not.toContain('room.read');
    expect(STUDENT_PERMISSION_CODES).not.toContain('seat.read');
  });
});
