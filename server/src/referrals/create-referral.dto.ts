// create-referral.dto.ts
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

export class CreateReferralDto {
  @IsNotEmpty({ message: 'user_id is required' })
  @IsUUID('4', { message: 'user_id must be a valid UUID' })
  user_id: string;

  @IsNotEmpty({ message: 'session_id is required' })
  @IsUUID('4', { message: 'session_id must be a valid UUID' })
  session_id: string;

  @IsNotEmpty({ message: 'clinic_id is required' })
  @IsUUID('4', { message: 'clinic_id must be a valid UUID' })
  clinic_id: string;

  @IsOptional() @IsString() referral_reason?: string;
  @IsOptional() @IsString() user_concern?: string;
  @IsOptional() @IsString() recommended_service?: string;

  @IsOptional() @IsBoolean() user_contacted_clinic?: boolean;
  @IsOptional() @IsBoolean() user_visited_clinic?: boolean;
  @IsOptional() @IsBoolean() follow_up_needed?: boolean;
  @IsOptional() @IsBoolean() follow_up_completed?: boolean;

  @IsOptional() @IsString() follow_up_notes?: string;
}
