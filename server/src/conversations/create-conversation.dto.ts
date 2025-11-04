import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsInt,
  IsIn,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty({ message: 'session_id is required' })
  @IsUUID('4', { message: 'session_id must be a valid UUID' })
  @IsString()
  session_id: string;

  @IsNotEmpty({ message: 'user_id is required' })
  @IsUUID('4', { message: 'user_id must be a valid UUID' })
  @IsString()
  user_id: string;

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
