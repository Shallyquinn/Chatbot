export interface FpmInteraction{
  user_id?: string;

  session_id?: string;

  fpm_flow_type?: string;

  current_fpm_method?: string;

  interested_fpm_method?: string;

  fpm_duration_preference?: string;

  contraception_type?: string;

  emergency_product?: string;

  prevention_duration?: string;

  selected_method?: string;

  satisfaction_level?: string;

  switch_reason?: string;

  stop_reason?: string;

  important_factors?: string[];

  kids_in_future?: string;

  timing_preference?: string;

  menstrual_flow_preference?: string;

  provided_information?: string;

  next_action?: string;

  clinic_referral_needed?: boolean;

  human_agent_requested?: boolean;
}