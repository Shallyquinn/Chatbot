import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryConversationDto {
  @IsOptional()
  @IsString()
  session_id?: string;

  @IsOptional()
  @IsString()
  user_session_id?: string;

  @IsOptional()
  @IsString()
  message_type?: string;

  @IsOptional()
  @IsString()
  chat_step?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  limit?: number = 20;
}