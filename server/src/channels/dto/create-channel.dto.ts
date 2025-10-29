import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsInt,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { ChannelType } from '@prisma/client';

export class CreateChannelDto {
  @IsString()
  name!: string;

  @IsEnum(ChannelType)
  type!: ChannelType;

  @IsString()
  color!: string;

  @IsString()
  icon!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  autoAssignment?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxWaitTime?: number;

  @IsOptional()
  @IsString()
  operatingStart?: string;

  @IsOptional()
  @IsString()
  operatingEnd?: string;

  @IsOptional()
  @IsObject()
  platformConfig?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
