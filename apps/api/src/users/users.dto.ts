import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
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

export class CreateUserDto {
  @IsString()
  @MaxLength(128)
  name!: string;

  @IsString()
  @MaxLength(64)
  studentNo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  departmentName?: string;

  @IsString()
  @MaxLength(128)
  roleName!: string;

  @IsOptional()
  @IsIn(USER_STATUSES)
  status?: UserStatus;
}

export class ImportUsersDto {
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  users!: CreateUserDto[];
}

export class AssignUserRoleDto {
  @IsString()
  @MaxLength(128)
  roleName!: string;
}
