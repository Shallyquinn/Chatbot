export interface UserResponseData {
  response_id?: string;
  user_id?: string;
  session_id?: string;
  conversation_id?: string;
  previous_response_id?: string;
  response_category: string;
  response_type: string;
  question_asked?: string;
  user_response: string;
  response_value?: string;
  widget_used?: string;
  available_options?: string[];
  step_in_flow?: string;
  is_initial_response?: boolean;
  created_at?: Date;
}