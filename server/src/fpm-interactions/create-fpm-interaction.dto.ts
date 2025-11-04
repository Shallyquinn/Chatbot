import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class CreateFpmInteractionDto {
  @IsNotEmpty({ message: 'user_id is required' })
  @IsUUID('4', { message: 'user_id must be a valid UUID' })
  user_id: string;

  @IsNotEmpty({ message: 'session_id is required' })
  @IsUUID('4', { message: 'session_id must be a valid UUID' })
  session_id: string;

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

  // Phase 4.2: Extended FPM tracking fields
  @IsOptional()
  @IsString()
  user_session_id?: string;

  @IsOptional()
  @IsString()
  main_menu_option?: string;

  @IsOptional()
  @IsString()
  fpm_concern_type?: string;

  @IsOptional()
  @IsString()
  pregnancy_trial?: string;

  @IsOptional()
  @IsString()
  iud_removal_duration?: string;

  @IsOptional()
  @IsString()
  implant_removal_duration?: string;

  @IsOptional()
  @IsString()
  injection_stop_period?: string;

  @IsOptional()
  @IsString()
  dailypills_stop_period?: string;

  @IsOptional()
  @IsString()
  contraception_choice?: string;

  @IsOptional()
  @IsString()
  improve_intimacy_choice?: string;

  @IsOptional()
  @IsString()
  other_method_choices?: string;

  @IsOptional()
  @IsString()
  side_effects?: string;

  @IsOptional()
  @IsString()
  switch_method?: string;

  @IsOptional()
  @IsString()
  prevention_choice?: string;

  @IsOptional()
  @IsString()
  emergency_prevention_choice?: string;

  @IsOptional()
  @IsString()
  gel_lubricant_choice?: string;

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
