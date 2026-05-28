import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListRolesQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  keyword?: string;
}
