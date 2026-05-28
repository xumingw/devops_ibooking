import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { UserStatus } from '@ibooking/shared-types';

const USER_STATUSES: UserStatus[] = ['ACTIVE', 'DISABLED'];

export class ListUsersQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  keyword?: string;

  @IsOptional()
  @IsIn(USER_STATUSES)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  departmentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  roleCode?: string;
}
