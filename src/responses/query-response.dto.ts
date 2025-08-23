import { IsOptional, IsString, IsInt, Min, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryResponseDto {
  @IsOptional()
  @IsString()
  session_id?: string;

  @IsOptional()
  @IsString()
  user_session_id?: string;

  @IsOptional()
  @IsString()
  conversation_id?: string;

  @IsOptional()
  @IsString()
  response_category?: string;

  @IsOptional()
  @IsString()
  response_type?: string;

  @IsOptional()
  @IsString()
  step_in_flow?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_initial_response?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @IsString()
  sort_by?: string = 'created_at';

  @IsOptional()
  @IsString()
  sort_order?: 'asc' | 'desc' = 'desc';
}