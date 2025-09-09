import { IsString, IsOptional, IsUUID, IsBoolean, IsArray } from 'class-validator';

export class CreateFpmInteractionDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsUUID()
  session_id?: string;

  @IsOptional()
  @IsString()
  fpm_flow_type?: string;

  @IsOptional()
  @IsString()
  current_fpm_method?: string;

  @IsOptional()
  @IsString()
  interested_fpm_method?: string;

  @IsOptional()
  @IsString()
  fpm_duration_preference?: string;

  @IsOptional()
  @IsString()
  contraception_type?: string;

  @IsOptional()
  @IsString()
  emergency_product?: string;

  @IsOptional()
  @IsString()
  prevention_duration?: string;

  @IsOptional()
  @IsString()
  selected_method?: string;

  @IsOptional()
  @IsString()
  satisfaction_level?: string;

  @IsOptional()
  @IsString()
  switch_reason?: string;

  @IsOptional()
  @IsString()
  stop_reason?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  important_factors?: string[];

  @IsOptional()
  @IsString()
  kids_in_future?: string;

  @IsOptional()
  @IsString()
  timing_preference?: string;

  @IsOptional()
  @IsString()
  menstrual_flow_preference?: string;

  @IsOptional()
  @IsString()
  provided_information?: string;

  @IsOptional()
  @IsString()
  next_action?: string;

  @IsOptional()
  @IsBoolean()
  clinic_referral_needed?: boolean;

  @IsOptional()
  @IsBoolean()
  human_agent_requested?: boolean;
}