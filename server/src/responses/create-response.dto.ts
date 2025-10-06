import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  MaxLength,
} from 'class-validator';

export class CreateResponseDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsUUID()
  session_id?: string;

  @IsOptional()
  @IsUUID()
  conversation_id?: string;

  @IsOptional()
  @IsUUID()
  previous_response_id?: string;

  @IsString()
  @MaxLength(50)
  response_category: string;

  @IsString()
  @MaxLength(50)
  response_type: string;

  @IsOptional()
  @IsString()
  question_asked?: string;

  @IsString()
  user_response: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  response_value?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  widget_used?: string;

  @IsArray()
  @IsString({ each: true })
  available_options: string[];

  @IsOptional()
  @IsString()
  @MaxLength(50)
  step_in_flow?: string;

  @IsOptional()
  @IsBoolean()
  is_initial_response?: boolean;
}
