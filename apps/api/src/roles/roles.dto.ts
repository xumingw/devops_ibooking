import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListRolesQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  keyword?: string;
}

export class CreateRoleDto {
  @IsString()
  @MaxLength(128)
  name!: string;

  @IsString()
  @MaxLength(64)
  code!: string;

  @IsArray()
  @ArrayMaxSize(32)
  @IsString({ each: true })
  menuKeys!: string[];
}

export class UpdateRolePermissionsDto {
  @IsArray()
  @ArrayMaxSize(32)
  @IsString({ each: true })
  menuKeys!: string[];
}
