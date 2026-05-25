import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min
} from 'class-validator';
import { RoomScopeType } from '@ibooking/shared-types';

const ROOM_SCOPE_TYPES: RoomScopeType[] = ['SCHOOL', 'DEPARTMENT'];

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  building!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(99)
  floor!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  capacity!: number;

  @IsOptional()
  @IsIn(ROOM_SCOPE_TYPES)
  scopeType?: RoomScopeType;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  departmentId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(23)
  openHour?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  closeHour?: number;

  @IsOptional()
  @IsBoolean()
  overnight?: boolean;
}

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  building?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(99)
  floor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  capacity?: number;

  @IsOptional()
  @IsIn(ROOM_SCOPE_TYPES)
  scopeType?: RoomScopeType;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  departmentId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(23)
  openHour?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  closeHour?: number;

  @IsOptional()
  @IsBoolean()
  overnight?: boolean;
}
