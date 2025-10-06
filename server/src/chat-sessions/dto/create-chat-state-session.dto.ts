import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateChatStateSessionDto {
  @IsString()
  user_session_id: string;

  @IsString()
  chat_state: string;

  @IsOptional()
  @IsDateString()
  last_activity?: string;
}
