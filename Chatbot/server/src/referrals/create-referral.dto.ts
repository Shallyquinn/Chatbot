// create-referral.dto.ts
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateReferralDto {
  @IsOptional() @IsString() user_id?: string;
  @IsOptional() @IsString() session_id?: string;
  @IsOptional() @IsString() clinic_id?: string;

  @IsOptional() @IsString() referral_reason?: string;
  @IsOptional() @IsString() user_concern?: string;
  @IsOptional() @IsString() recommended_service?: string;

  @IsOptional() @IsBoolean() user_contacted_clinic?: boolean;
  @IsOptional() @IsBoolean() user_visited_clinic?: boolean;
  @IsOptional() @IsBoolean() follow_up_needed?: boolean;
  @IsOptional() @IsBoolean() follow_up_completed?: boolean;

  @IsOptional() @IsString() follow_up_notes?: string;
}
