export interface ConversationPayload {
  userId?: string;
  session?: string;
  message_text: string;
  message_type: 'user' | 'bot';
  chat_step: string;
  widget_name?: string;
  message_sequence_number: number;
  widget_options?: string[];
  message_delay_ms: number;
  selected_option: string;
}
