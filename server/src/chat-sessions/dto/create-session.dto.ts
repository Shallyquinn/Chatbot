import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateChatSessionDto {
  @IsOptional() @IsString() user_session_id?: string;
  @IsOptional() @IsUUID() user_id?: string;
  @IsOptional() @IsDateString() session_start_time?: string;
  @IsOptional() @IsDateString() session_end_time?: string | null;
  @IsOptional() @IsInt() total_messages_count?: number;
  @IsOptional() @IsInt() session_duration_minutes?: number | null;
  @IsOptional() @IsBoolean() session_completed?: boolean;
  @IsOptional() @IsString() session_outcome?: string | null;
  @IsOptional() @IsString() final_step_reached?: string | null;
  @IsOptional() @IsString() user_agent?: string | null;
  @IsOptional() @IsString() ip_address?: string | null;
  @IsOptional() @IsString() device_type?: string | null;
}
