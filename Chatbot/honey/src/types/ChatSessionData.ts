export interface ChatSessionData {
  session_id: string;
  user_id?: string;
  user_session_id: string;
  
  // Metadata
  session_start_time: Date;
  session_end_time?: Date;
  total_messages_count: number;
  session_duration_minutes?: number;
  
  // Outcome
  session_completed: boolean;
  session_outcome?: string;
  final_step_reached?: string;
  
  // Device info
  user_agent?: string;
  ip_address?: string;
  device_type?: string;
  
  created_at: Date;
}