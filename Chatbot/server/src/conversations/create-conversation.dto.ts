import { IsString, IsOptional, IsBoolean, IsArray, IsInt, IsIn } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  @IsOptional()
  session_id?: string;

  @IsString()
  @IsOptional()
  user_session_id?: string;

  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  message_text: string;

  @IsString()
  @IsIn(['bot', 'user'])
  message_type: string;

  @IsOptional()
  @IsString()
  message_source?: string = 'typed';

  @IsOptional()
  @IsString()
  chat_step?: string;

  @IsOptional()
  @IsString()
  widget_name?: string;

  @IsOptional()
  @IsString()
  selected_option?: string;

  @IsOptional()
  @IsInt()
  message_delay_ms?: number;

  @IsOptional()
  @IsBoolean()
  has_widget?: boolean = false;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  widget_options?: string[];

  @IsInt()
  message_sequence_number: number;
}