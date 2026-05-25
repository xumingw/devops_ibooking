export type AuthRoleRecord = {
  id?: string;
  code: string;
  name: string;
};

export type AuthPermissionRecord = {
  id?: string;
  code: string;
  name: string;
  menuKey?: string | null;
};

export type AuthUserRecord = {
  id: string;
  studentNo: string;
  name: string;
  departmentId: string | null;
  departmentName: string | null;
  status: 'ACTIVE' | 'DISABLED';
  passwordHash: string;
  roles: AuthRoleRecord[];
  permissions: AuthPermissionRecord[];
};

export type RefreshTokenRecord = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revoked: boolean;
  user: AuthUserRecord;
};
