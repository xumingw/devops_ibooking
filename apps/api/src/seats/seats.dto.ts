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
import { ResourceStatus } from '@ibooking/shared-types';

const RESOURCE_STATUSES: ResourceStatus[] = ['ACTIVE', 'INACTIVE'];

export class ListSeatsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(191)
  roomId?: string;
}

export class CreateSeatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  code!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  x!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  y!: number;

  @IsOptional()
  @IsBoolean()
  hasPower?: boolean;

  @IsOptional()
  @IsBoolean()
  nearWindow?: boolean;

  @IsOptional()
  @IsBoolean()
  quietZone?: boolean;

  @IsOptional()
  @IsIn(RESOURCE_STATUSES)
  status?: ResourceStatus;
}

export class UpdateSeatDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  roomId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  code?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  x?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  y?: number;

  @IsOptional()
  @IsBoolean()
  hasPower?: boolean;

  @IsOptional()
  @IsBoolean()
  nearWindow?: boolean;

  @IsOptional()
  @IsBoolean()
  quietZone?: boolean;

  @IsOptional()
  @IsIn(RESOURCE_STATUSES)
  status?: ResourceStatus;
}
