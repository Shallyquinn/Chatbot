export interface ChatbotUserData {
  user_session_id: string; 
  selected_language?: string | null;
  selected_gender?: string | null;
  selected_state?: string | null;
  selected_lga?: string | null;
  selected_age_group?: string | null;
  selected_marital_status?: string | null;
  current_step?: string;
  current_fpm_method?: string | null;
  current_concern_type?: string | null;
  user_intention?: string | null;
  main_menu_option?: string | null;
}