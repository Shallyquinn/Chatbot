import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateChatStateSessionDto {
  @IsOptional()
  @IsString()
  chat_state?: string;

  @IsOptional()
  @IsDateString()
  last_activity?: string;
}
