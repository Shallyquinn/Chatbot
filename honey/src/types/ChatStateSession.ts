export interface ChatStateSession {
  session_id: string;
  user_session_id: string;
  chat_state: string;
  last_activity: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface SessionSaveRequest {
  user_session_id: string;
  chat_state: string;
  last_activity: string;
}

export interface SessionLoadResponse {
  chat_state: string;
  last_activity: string;
}
